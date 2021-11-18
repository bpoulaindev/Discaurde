const fs = require('fs');

const rawdata = fs.readFileSync('./config/config.json');
const conf = JSON.parse(rawdata);
module.exports = conf;
