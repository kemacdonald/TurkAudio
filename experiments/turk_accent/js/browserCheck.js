// Tiny module te get browser information
const { detect } = require('detect-browser');
const browser = detect();
module.exports = browser;
