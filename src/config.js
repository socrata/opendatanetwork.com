'use strict';

const yaml = require('js-yaml');
const fs = require('fs');

// TODO: Cache config
// TODO: Allow config overrides
const GlobalConfig = yaml.safeLoad(fs.readFileSync(__dirname + '/../config.yml', 'utf8'));

/**
 * Makes this accessible inside of server side executed controllers stuff
 */
if (typeof module !== 'undefined') module.exports = GlobalConfig;
