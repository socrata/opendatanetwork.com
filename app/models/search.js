'use strict';

const _ = require('lodash');
const moment = require('moment');
const numeral = require('numeral');
const Request = require('../lib/request');
const Constants = require('../lib/constants');
const Place = require('./place');
const Sources = require('../../src/data/data-sources.js');
const GlobalConstants = require('../../src/constants');

class Search {
  static searchResultsRegions(q) {
    const params = { '$q': q, '$order': 'population desc', '$limit': 6 };
    const url = Request.buildURL(Constants.SEARCH_RESULTS_REGIONS_URL, params);
    return Request.getJSON(url);
  }

  static searchDataset(requestParams) {

    return new Promise((resolve, reject) => {

      const hasRegions = requestParams.regions.length > 0;
      const limit = 10;
      const page = requestParams.page || 0;
      const offset = page * limit;
      const timeout = hasRegions ? Constants.TIMEOUT_MS : Constants.TIMEOUT_MS * 10;

      Search._searchDatasetURL(requestParams, limit, offset).then(url => {

        Request.getJSON(url, timeout).then(results => {

          annotateSearchDatasetResults(results);
          resolve(results);

        }, error => resolve({results: []}));
      }, error => resolve({results: []}));
    });
  }

  static searchDatasetsURL(requestParams, limit, offset) {
    return new Promise((resolve, reject) => {
      Search._query(requestParams).then(queryParams => {
        const categories = requestParams.categories || [];
        const domains = requestParams.domains || [];
        const tags = requestParams.tags || [];
        const params = _.extend({domains, tags}, queryParams);
        if (limit) params.limit = limit;
        if (offset) params.offset = offset;

        if (categories.length > 0) {
          params.q = (params.q.length > 0) ?
            `${params.q} ${categories.join(' ')}` :
            categories.join(' ');
        }

        resolve(Request.buildURL(Constants.CATALOG_URL, params));
      }, reject);
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

  static _searchDatasetURL(requestParams, limit, offset) {
    return new Promise((resolve, reject) => {
      const params = {
        app_token: GlobalConstants.APP_TOKEN
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

function annotateSearchDatasetResults(data) {

  data.resultSetSizeString = numeral(data.datasets.length).format('0,0');

  data.datasets.forEach(dataset => {

    dataset.categoryGlyphString = getCategoryGlyphForSearchDataset(dataset);
    dataset.updatedAtString = moment(dataset.updated_at).format('D MMM YYYY');

    if (dataset.description.length > 300) {
      dataset.description = dataset.description.substring(0, 300);

      const lastIndex = dataset.description.lastIndexOf(' ');
      dataset.description = dataset.description.substring(0, lastIndex) + ' ... ';
    }
  });
}

function getCategoryGlyphForSearchDataset(dataset) {

  if ((dataset.categories === null) || (dataset.categories.length == 0))
    return 'fa-database';

  switch (dataset.categories[0].toLowerCase()) {

    case 'health': return 'fa-heart';
    case 'transportation': return 'fa-car';
    case 'finance': return 'fa-money';
    case 'social services': return 'fa-child';
    case 'environment': return 'fa-leaf';
    case 'public safety': return 'fa-shield';
    case 'housing and development': return 'fa-building';
    case 'infrastructure': return 'fa-road';
    case 'education': return 'fa-graduation-cap';
    case 'recreation': return 'fa-ticket';
    default: return 'fa-database';
  }
}

module.exports = Search;
