'use strict';

const yaml = require('js-yaml');
const fs = require('fs');
const request = require('sync-request');
const deepmerge = require('deepmerge');

// Yes, I know this is all synchronous, but it also only happens at startup time
var loadConfig = function() {
  var config = yaml.safeLoad(fs.readFileSync(__dirname + '/../config.yml', 'utf8'));

  // Fetch our override config if we've got it
  if(process.env.CONFIG_URL) {
    var res = request('GET', process.env.CONFIG_URL);
    if(res.statusCode === 200) {
      var override = JSON.parse(res.getBody('utf8'));
      config = deepmerge.all([config, override]);
    }
  }

  return config;
};

const GlobalConfig = loadConfig();

/**
 * Makes this accessible inside of server side executed controllers stuff
 */
if (typeof module !== 'undefined') module.exports = GlobalConfig;
