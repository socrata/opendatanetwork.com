'use strict';

const _ = require('lodash');
const moment = require('moment');
const numeral = require('numeral');
const Request = require('../lib/request');
const FileCache = require('../lib/fileCache');
const GlobalConfig = require('../../src/config');

class Place {
    static regions(ids) {
        const params = {'$where': `id in(${ids.map(id => `'${id}'`).join(',')})`};
        const url = Request.buildURL(GlobalConfig.datasets.roster_url, params);
        return Request.getJSON(url);
    }

    static locations() {
        return FileCache.get('../data/locations.json');
    }

    static stateNames() {
        return FileCache.get('../data/state-names.json');
    }
}

module.exports = Place;
