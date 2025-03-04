'use strict';

const yaml = require('js-yaml');
const fs = require('fs');
const request = require('sync-request');
const deepmerge = require('deepmerge');

// Yes, I know this is all synchronous, but it also only happens at startup time
var loadConfig = function() {
  var config = yaml.load(fs.readFileSync(__dirname + '/../config.yml', 'utf8'));

  // Fetch our override config if we've got it
  if(process.env.CONFIG_URL) {
    var res = request('GET', process.env.CONFIG_URL);
    if(res.statusCode === 200) {
      var override = JSON.parse(res.getBody('utf8'));
      config = deepmerge.all([config, override]);
    }
  }
  
  // Enable reCAPTCHA in staging and production environments
  const nodeEnv = process.env.NODE_ENV || 'development';
  if (nodeEnv === 'production' || nodeEnv === 'staging') {
    config.recaptcha.enabled = true;
  }
  
  // Override with environment variables if provided
  if (process.env.RECAPTCHA_SITE_KEY) {
    config.recaptcha.site_key = process.env.RECAPTCHA_SITE_KEY;
  }
  
  if (process.env.RECAPTCHA_SECRET_KEY) {
    config.recaptcha.secret_key = process.env.RECAPTCHA_SECRET_KEY;
  }
  
  if (process.env.RECAPTCHA_SCORE_THRESHOLD) {
    config.recaptcha.score_threshold = parseFloat(process.env.RECAPTCHA_SCORE_THRESHOLD);
  }
  
  if (process.env.RECAPTCHA_ENABLED) {
    config.recaptcha.enabled = process.env.RECAPTCHA_ENABLED === 'true';
  }

  return config;
};

const GlobalConfig = loadConfig();

/**
 * Makes this accessible inside of server side executed controllers stuff
 */
if (typeof module !== 'undefined') module.exports = GlobalConfig;
