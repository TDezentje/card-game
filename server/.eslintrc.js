const path = require('path');
const config = require('../.eslintrc.base.js');

config.parserOptions.project = path.resolve(__dirname, './tsconfig.json'),

module.exports = config;