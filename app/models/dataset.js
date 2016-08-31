const _ = require('lodash');
const moment = require('moment');
const numeral = require('numeral');
const Request = require('../lib/request');
const Constants = require('../lib/constants');

class Dataset {
  static datasetSummary(domain, fxf) {
    return Request.getJSON(Constants.DATASET_SUMMARY_URL.format(domain, fxf), 1000);
  }

  static datasetMigrations(domain, fxf) {
    return Request.getJSON(Constants.DATASET_MIGRATIONS_URL.format(domain, fxf), 1000);
  }

  static standardSchemas(fxf) {
    return new Promise((resolve, reject) => {
      Request.getJSON(Constants.ATHENA_URL.format(fxf)).then(json => {
        if (json.applied_schemas === '[]') json.applied_schemas = [];
        resolve(json.applied_schemas);
      });
    });
  }

}

module.exports = Dataset;
