'use strict';

const _ = require('lodash');
const moment = require('moment');
const numeral = require('numeral');
const Request = require('../lib/request');
const GlobalConfig = require('../../src/config');

class Dataset {
    static datasetSummary(domain, fxf) {
        return Request.getJSON(GlobalConfig.catalog.dataset_summary_url.format(domain, fxf), 1000);
    }

    static datasetMigrations(domain, fxf) {
        return Request.getJSON(GlobalConfig.catalog.dataset_migrations_url.format(domain, fxf), 1000);
    }
}

module.exports = Dataset;
