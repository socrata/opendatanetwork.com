'use strict';

const _ = require('lodash');
const moment = require('moment');
const numeral = require('numeral');
const fs = require('fs');

const Request = require('./request');
const Constants = require('./constants');
const Sources = require('../src/data/data-sources.js');

const _fileCache = {};

class FileCache {
    static get(path) {
        return new Promise((resolve, reject) => {
            if (path in _fileCache) {
                resolve(_fileCache[path]);
            } else {
                fs.readFile(`${__dirname}/../${path}`, (error, data) => {
                    if (error) {
                        reject(error);
                    } else {
                        const json = JSON.parse(data);
                        _fileCache[path] = json;
                        resolve(json);
                    }
                });
            }
        });
    }
}

class API {
    static regions(ids) {
        const params = {'$where': `id in(${ids.map(id => `'${id}'`).join(',')})`};
        const url = Request.buildURL(Constants.ROSTER_URL, params);
        return Request.getJSON(url);
    }

    static searchResultsRegions(q) {
        const params = { '$q': q, '$order': 'population desc', '$limit': 6 };
        const url = Request.buildURL(Constants.SEARCH_RESULTS_REGIONS_URL, params);
        return Request.getJSON(url);
    }

    static datasets(requestParams) {
        return new Promise((resolve, reject) => {
            const hasRegions = requestParams.regions.length > 0;
            const limit = 10;
            const page = requestParams.page || 0;
            const offset = page * limit;
            const timeout = hasRegions ? Constants.TIMEOUT_MS : Constants.TIMEOUT_MS * 10;

            API.searchDatasetsURL(requestParams, limit, offset).then(url => {
                Request.getJSON(url, timeout).then(results => {
                    annotateData(results);
                    annotateParams(results, requestParams);

                    resolve(results);
                }, error => resolve({results: []}));
            }, error => resolve({results: []}));
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
                API.stateNames().then(stateNames => {
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

    static searchDatasetsURL(requestParams, limit, offset) {
        return new Promise((resolve, reject) => {
            API._query(requestParams).then(queryParams => {
                const categories = requestParams.categories || [];
                const domains = requestParams.domains || [];
                const tags = requestParams.tags || [];
                const params = _.extend({categories, domains, tags}, queryParams);
                if (limit) params.limit = limit;
                if (offset) params.offset = offset;
                resolve(Request.buildURL(Constants.CATALOG_URL, params));
            }, reject);
        });
    }

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
            API.catalog('categories', n).then(response => {
                API.categoryMetadata().then(metadata => {
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
        return _.find(categories, category => category.category ===  params.categories[0].toLowerCase());
    }

    static tags(n) {
        return new Promise((resolve, reject) => {
            API.catalog('tags', n).then(response => {
                API.tagMetadata().then(metadata => {
                    const tags = response.results.map(result => {
                        result.metadata = metadata[result.tag] || Constants.DEFAULT_METADATA;
                        return result;
                    });

                    resolve(tags);
                }, reject);
            }, reject);
        });
    }

    static currentTag(params, tags) {
        if (params.tags.length != 1) return null;
        return _.find(tags, tag => tag.tag === params.tags[0].toLowerCase());
    }

    static domains(n) {
        return API.catalog('domains', n);
    }

    static datasetSummary(domain, fxf) {
        return Request.getJSON(Constants.DATASET_SUMMARY_URL.format(domain, fxf), 1000);
    }

    static datasetMigrations(domain, fxf) {
        return Request.getJSON({
            uri: Constants.DATASET_MIGRATIONS_URL.format(domain, fxf),
            simple: false
        }, 1000);
    }

    static standardSchemas(fxf) {
        return new Promise((resolve, reject) => {
            Request.getJSON(Constants.ATHENA_URL.format(fxf)).then(json => {
                if (json.applied_schemas === '[]') json.applied_schemas = [];
                resolve(json.applied_schemas);
            });
        });
    }

    static locations() {
        return FileCache.get('data/locations.json');
    }

    static tagMetadata() {
        return FileCache.get('data/tag-metadata.json');
    }

    static categoryMetadata() {
        return FileCache.get('data/category-metadata.json');
    }

    static stateNames() {
        return FileCache.get('data/state-names.json');
    }
}

function annotateData(data) {
    data.resultSetSizeString = numeral(data.resultSetSize).format('0,0');

    data.results.forEach(function(result) {
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

function getCategoryGlyphString(result) {
    if ((result.classification === null) ||
        (result.classification.categories === null) ||
        (result.classification.categories.length === 0)) {

        return 'fa-database';
    }

    switch (result.classification.categories[0].toLowerCase()) {
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

String.prototype.format = function() {
    var args = arguments;

    return this.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
};

/**
 * Replaces all non-alphanumeric characters with spaces.
 */
function _alphanumeric(string) {
    return string.replace(/[^a-zA-Z0-9]/g, ' ');
}

module.exports = API;
