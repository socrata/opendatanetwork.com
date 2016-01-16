'use strict';

const _ = require('lodash');
const moment = require('moment');
const numeral = require('numeral');

const Synonyms = require('./synonyms');
const Request = require('./request');
const Constants = require('./constants');
const CategoryController = require('./category-controller');
const TagController = require('./tag-controller');

const categoryController = new CategoryController();
const tagController = new TagController();

const SYNONYMS = Synonyms.fromFile(Constants.SYNONYMS_FILE);

class API {
    static datasets(requestParams) {
        return new Promise((resolve, reject) => {
            const url = API.searchDatasetsURL(requestParams);
            console.log(url);
            return Request.getJSON(url).then(results => {
                annotateData(results);
                annotateParams(results, requestParams);

                resolve(results);
            }, reject);
        });
    }

    static searchDatasetsURL(requestParams) {
        const querySynonyms = SYNONYMS.get(requestParams.q);
        const vectorSynonyms = SYNONYMS.get(requestParams.vector.replace(/_/g, ' '));
        const synonyms = _.unique(_.flatten([querySynonyms, vectorSynonyms]));

        const regionNames = requestParams.regions.map(region => {
            const name = region.name;
            const type = region.type;

            if (type === 'place' || type === 'county') {
                return name.split(', ')[0];
            } else if (type === 'msa') {
                const words = name.split(' ');
                return words.slice(0, words.length - 3);
            } else {
                return name;
            }
        }).map(name => `'${name}'`);

        const allTerms = [synonyms, regionNames, requestParams.tags];
        const query = allTerms
            .filter(terms => terms.length > 0)
            .map(terms => `(${terms.join(' OR ')})`)
            .join(' AND ');

        const categories = requestParams.categories || [];
        const domains = requestParams.domains || [];
        const tags = requestParams.tags || [];

        const params = {categories, domains, tags, q_internal: query};
        if (limit) params.limit = limit;
        return Request.buildURL(Constants.CATALOG_URL, params);
    }

    static categories(n) {
        return new Promise((resolve, reject) => {
            Request.getJSON(`${Constants.CATALOG_URL}/categories`).then(response => {
                if (n) response.results = response.results.slice(0, n);
                categoryController.attachCategoryMetadata(response, response => {
                    resolve(response.results);
                });
            }, error => resolve([]));
        });
    }

    static tags(n) {
        return new Promise((resolve, reject) => {
            Request.getJSON(`${Constants.CATALOG_URL}/tags`).then(response => {
                if (n) response.results = response.results.slice(0, n);
                tagController.attachTagMetadata(response, resolve);
            }, error => { return {results: []}; });
        });
    }

    static domains(n) {
        return new Promise((resolve, reject) => {
            Request.getJSON(`${Constants.CATALOG_URL}/domains`).then(response => {
                if (n) response.results = response.results.slice(0, n);
                resolve(response);
            }, error => { return {results: []}; });
        });
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

module.exports = API;
