const _ = require('lodash');
const moment = require('moment');
const numeral = require('numeral');
const Request = require('../controllers/request');
const FileCache = require('../lib/fileCache');
const Constants = require('../controllers/constants');

class Category {

  static catalog(path, n, defaultResponse) {
    defaultResponse = defaultResponse || {results: []};

    return new Promise((resolve, reject) => {
      Request.getJSON(`${Constants.CATALOG_URL}/${path}`).then(response => {
        if (response) {
          if (n) response.results = response.results.slice(0, n);
          resolve(response);
        } else {
          resolve(defaultResponse);
        }
      }, error => resolve(defaultResponse));
    });
  }

  static categories(n) {
    return new Promise((resolve, reject) => {
      Category.catalog('categories', n).then(response => {
        Category.categoryMetadata().then(metadata => {
          const categories = response.results.map(result => {
            result.metadata = metadata[result.category] || Constants.DEFAULT_METADATA;
            return result;
          });

          resolve(categories);
        }, reject);
      }, reject);
    });
  }

  static currentCategory(params, categories) {
    if (params.q !== '' || params.categories.length != 1) return null;
    return _.find(categories, category => category.category === params.categories[0].toLowerCase());
  }

  static domains(n) {
    const defaultResponse = { results: [] };
    return new Promise((resolve, reject) => {
      Request.getJSON(`${Constants.CATALOG_URL}/domains`).then(response => {
        if (response) {

          // Filter out domains without datasets
          //
          const filteredResults = [];
          for (var i in response.results) {
            var result = response.results[i];
            if (result.count > 0) filteredResults.push(result);
          }
          response.results = filteredResults;

          if (n) response.results = response.results.slice(0, n);
          resolve(response);
        } else {
          resolve(defaultResponse);
        }
      }, error => resolve(defaultResponse));
    });
  }

  static categoryMetadata() {
    return FileCache.get('data/category-metadata.json');
  }

}

module.exports = Category;