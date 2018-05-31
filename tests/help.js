const fs = require('fs');
const path = require('path');

exports.readFile = (location) => fs.readFileSync(path.join(__dirname, location)).toString();
