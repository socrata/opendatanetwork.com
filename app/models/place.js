const _ = require('lodash');
const moment = require('moment');
const numeral = require('numeral');
const Request = require('../lib/request');
const FileCache = require('../lib/fileCache');
const Constants = require('../lib/constants');

class Place {
  static regions(ids) {
    const params = {'$where': `id in(${ids.map(id => `'${id}'`).join(',')})`};
    const url = Request.buildURL(Constants.ROSTER_URL, params);
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