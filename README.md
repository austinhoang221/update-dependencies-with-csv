## Update dependencies with CSV file
## About The Project
This application will help you automatically update dependencies with the desired version based on a CSV file. Please be sure to be useful when you want to upgrade your packages but do not want to use the latest version.
### Built With
This project was bootstrapped with NodeJS.
## Getting Started
### Prerequisites
You need to install NodeJs to use this project [https://nodejs.org/en](https://nodejs.org/en)
You need to have a CSV file with 2 columns:
* "NPM Package Name" for every dependencies you want to upgrade
* "Latest Version" for your desired version
### Installation
1. Clone the repo
   ```sh
   git clone https://github.com/austinhoang221/update-dependencies-with-csv
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Update these file path variables
```js
const csvFilePath = ''; // Specify the path to your CSV file
const packageFilePath = ''; // Specify the path to your package.json file
const projectDirectory = ''; // Specify the path to your project file
```
4. Navigate to the project path and run
  ```sh
   node update-packages.js
   ```
And you ready to go 🚀
