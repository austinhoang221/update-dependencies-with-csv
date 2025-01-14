const fs = require('fs');
const { exec } = require('child_process');
const csv = require('csv-parser');
const { promisify } = require('util');
const execAsync = promisify(exec);
const maxRetries = 3; // Maximum number of retries
const retryDelay = 1000; // Delay between retries in milliseconds
const csvFilePath = 'VMBackup-need-upgrade-2024-08-01.csv'; // Specify the path to your CSV file
const projectDirectory = '../modern-allure-ui'; // Specify the path to your project file

async function execWithRetryAsync(command, key, retries = maxRetries) {
    try {
        const { stdout, stderr } = await execAsync(command);
        console.log("Done: " + key);
        if (stderr) {
            console.error("Error: " + stderr);
        }
        return stdout;
    } catch (error) {
        if (retries > 0) {
            console.log(`Retry ${maxRetries - retries + 1}/${maxRetries} for command: ${command}`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return execWithRetryAsync(command, key, retries - 1);
        } else {
            throw error;
        }
    }
}

function readCsvFile(filePath) {
    const dependenciesMap = new Map();
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                const name = row["NPM Package Name"];
                const version = row["Latest Version"];
                if (name && !dependenciesMap.has(name)) {
                    dependenciesMap.set(name, version);
                }
            })
            .on('end', () => {
                resolve(dependenciesMap);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

readCsvFile(csvFilePath)
    .then(async (dependenciesMap) => {
        try {
            const packageJson = JSON.parse(fs.readFileSync(projectDirectory + "/package.json", 'utf8'));
            // Extract dependencies
            const dependencies = packageJson.dependencies || {};
            const devDependencies = packageJson.devDependencies || {};
            const dependencyNames = Object.keys(dependencies);
            const devDependenciesNames = Object.keys(devDependencies);
            const promises = [];
            for (const [key, value] of dependenciesMap) {
                if ((dependencyNames.includes(key) || devDependenciesNames.includes(key)) && value) {
                    const upgradeCommand = `cd ${projectDirectory} && yarn upgrade ${key}@${value}`;
                    console.info(`Start upgrading: ${key} to ${value}`);
                    promises.push(await execWithRetryAsync(upgradeCommand, key));
                }
            }
            Promise.all(promises)
                .then(results => {
                    console.log('All upgrades completed successfully 🚀');
                })
                .catch(error => {
                    console.error('Error during upgrade:', error);
                });

        } catch (err) {
            console.error('Error reading package.json:', err.message);
            return [];
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });