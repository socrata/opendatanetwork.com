const _ = require('lodash');
const moment = require('moment');
const numeral = require('numeral');
const Request = require('../../controllers/request');
const Sources = require('../../src/data/data-sources.js');
const Constants = require('../../controllers/constants');
const Place = require('./place');
const Search = require('./search');

class Dataset {
  static datasets(requestParams) {
    return new Promise((resolve, reject) => {
      const hasRegions = requestParams.regions.length > 0;
      const limit = 10;
      const page = requestParams.page || 0;
      const offset = page * limit;
      const timeout = hasRegions ? Constants.TIMEOUT_MS : Constants.TIMEOUT_MS * 10;

      Search.searchDatasetsURL(requestParams, limit, offset).then(url => {
        Request.getJSON(url, timeout).then(results => {
          annotateData(results);
          annotateParams(results, requestParams);

          resolve(results);
        }, error => resolve({results: []}));
      }, error => resolve({results: []}));
    });
  }

  static searchDatasetURL(requestParams, limit, offset) {

    return new Promise((resolve, reject) => {

      const params = {
        app_token: Constants.APP_TOKEN
      };

      if (requestParams.regions)
        params.entity_id = requestParams.regions.map(region => region.id).join(',');

      if (requestParams.metric)
        params.dataset_id = requestParams.metric;

      if (limit)
        params.limit = limit;

      if (offset)
        params.offset = offset;

      resolve(Request.buildURL(Constants.SEARCH_DATASET_URL, params));
    });
  }

  static _query(requestParams) {
    return new Promise((resolve, reject) => {
      const q = requestParams.q;
      const vector = requestParams.vector || 'population';
      const regions = requestParams.regions || [];

      if (q && q !== '') {
        resolve({q});
      } else if (regions.length > 0 && Sources.has(vector)) {
        Place.stateNames().then(stateNames => {
          const searchTerms = Sources.get(vector).searchTerms
            .map(term => _.contains(term, ' ') ? `"${term}"` : term);

          const regionNames = regions.map(region => {
            const name = region.name;
            const type = region.type;

            if (type === 'place' || type === 'county') {
              const regionName = name.split(', ')[0];
              const stateAbbr = name.split(', ')[1];
              const stateName = stateNames[stateAbbr] || '';
              return `${_alphanumeric(regionName)} AND ("${stateAbbr}" OR "${stateName}")`;
            } else if (type === 'msa') {
              const words = name.split(' ');
              return `"${_alphanumeric(words.slice(0, words.length - 3).join(' '))}"`;
            } else {
              return `"${_alphanumeric(name)}"`;
            }
          }).map(constraint => `(${constraint})`);

          const allTerms = [searchTerms, regionNames, requestParams.tags];
          const query = allTerms
            .filter(terms => terms.length > 0)
            .map(terms => `(${terms.join(' OR ')})`)
            .join(' AND ');

          resolve({q_internal: query});
        }, reject);
      } else {
        resolve({q: ''});
      }
    });
  }



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

function annotateData(data) {
  data.resultSetSizeString = numeral(data.resultSetSize).format('0,0');

  data.results.forEach(function (result) {
    result.classification.categoryGlyphString = getCategoryGlyphString(result);
    result.resource.updatedAtString = moment(result.resource.updatedAt).format('D MMM YYYY');

    if (result.resource.description.length > 300) {
      result.resource.description = result.resource.description.substring(0, 300);

      const lastIndex = result.resource.description.lastIndexOf(' ');
      result.resource.description = result.resource.description.substring(0, lastIndex) + ' ... ';
    }
  });
}

function annotateParams(data, params) {
  params.totalPages = Math.ceil(data.resultSetSize / 10);
}

//TODO: Extract to common or service
function getCategoryGlyphString(result) {
  if ((result.classification === null) ||
    (result.classification.categories === null) ||
    (result.classification.categories.length === 0)) {

    return 'fa-database';
  }

  switch (result.classification.categories[0].toLowerCase()) {
    case 'health':
      return 'fa-heart';
    case 'transportation':
      return 'fa-car';
    case 'finance':
      return 'fa-money';
    case 'social services':
      return 'fa-child';
    case 'environment':
      return 'fa-leaf';
    case 'public safety':
      return 'fa-shield';
    case 'housing and development':
      return 'fa-building';
    case 'infrastructure':
      return 'fa-road';
    case 'education':
      return 'fa-graduation-cap';
    case 'recreation':
      return 'fa-ticket';
    default:
      return 'fa-database';
  }
}

/**
 * Replaces all non-alphanumeric characters with spaces.
 */
function _alphanumeric(string) {
  return string.replace(/[^a-zA-Z0-9]/g, ' ');
}

module.exports = Dataset;