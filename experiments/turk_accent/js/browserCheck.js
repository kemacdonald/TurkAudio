// // MODULE THAT EXPORTS CLIENT'S BROWSER CONFIGURATION
const { detect } = require('detect-browser');
const browser = detect();
module.exports = browser;
