const _ = require('lodash');
const moment = require('moment');
const numeral = require('numeral');
const Dataset = require('./dataset');
const Request = require('../../controllers/request');
const Constants = require('../../controllers/constants');

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

      Dataset.searchDatasetURL(requestParams, limit, offset).then(url => {

        Request.getJSON(url, timeout).then(results => {

          annotateSearchDatasetResults(results);
          resolve(results);

        }, error => resolve({results: []}));
      }, error => resolve({results: []}));
    });
  }

  static searchDatasetsURL(requestParams, limit, offset) {
    return new Promise((resolve, reject) => {
      Dataset._query(requestParams).then(queryParams => {
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

//TODO: Extract to common or service
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