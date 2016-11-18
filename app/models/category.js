'use strict';

const _ = require('lodash');
const moment = require('moment');
const numeral = require('numeral');
const Request = require('../lib/request');
const FileCache = require('../lib/fileCache');
const GlobalConfig = require('../../src/config');

class Category {
    static catalog(path, n, defaultResponse) {
        defaultResponse = defaultResponse || {results: []};

        return new Promise((resolve, reject) => {
            Request.getJSON(`${GlobalConfig.catalog.api}/${path}`).then(response => {
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
                        result.metadata = metadata[result.category] || GlobalConfig.catalog.default_metadata;
                        return result;
                    });

                    resolve(categories);
                }, reject);
            }, reject);
        });
    }

    static domains(n) {
        const defaultResponse = { results: [] };
        return new Promise((resolve, reject) => {
            Request.getJSON(`${GlobalConfig.catalog.api}/domains`).then(response => {
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
        return FileCache.get('../data/category-metadata.json');
    }

}

module.exports = Category;
