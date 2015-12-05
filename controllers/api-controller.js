'use strict';

var CacheController = require('./cache-controller');
const Constants = require('./constants');
const Synonyms = require('./synonyms');

var moment = require('moment');
var numeral = require('numeral');
var request = require('request');
var _ = require('lodash');
var querystring = require('querystring');

var baseCatalogUrl = 'http://api.us.socrata.com/api/catalog/v1';
var cacheController = new CacheController();
var categoriesUrl = baseCatalogUrl + '/categories';
var datasetSummaryUrl = 'https://{0}/api/views/{1}.json';
var defaultSearchResultCount = 10;
var domainsUrl = baseCatalogUrl + '/domains';
var maxDescriptionLength = 300;
var rosterUrl = 'https://odn.data.socrata.com/resource/bdeb-mf9k/?$where={0}';
var searchUrl = baseCatalogUrl;
var userAgent = 'www.opendatanetwork.com';
var athenaUrl = 'https://socrata-athena.herokuapp.com/schema/v1/applied/';

const SYNONYMS = Synonyms.fromFile(Constants.SYNONYMS_FILE);

module.exports = ApiController;

function ApiController() {
}

// Public methods
//
ApiController.prototype.getDatasetSummary = function(domain, id, successHandler, errorHandler) {

    var url = datasetSummaryUrl.format(domain, id);
    getFromApi(url, successHandler, errorHandler);
}

ApiController.prototype.searchDatasets = function(params, successHandler, errorHandler) {

    ApiController.prototype.getSearchDatasetsUrl(params, function(url) {

        getFromApi(
            url,
            function(results) {

                annotateData(results);
                annotateParams(results, params);

                if (successHandler)
                    successHandler(results);
            },
            errorHandler);
    });
}

ApiController.prototype.getAutoSuggestedRegions = function(regionIds, successHandler, errorHandler) {

    const pairs = regionIds.map(regionId => 'id=\'' + regionId + '\'');
    const url = rosterUrl.format(pairs.join(' OR '));

    getFromApi(url, successHandler, errorHandler);
}

ApiController.prototype.getCategories = function(count, successHandler, errorHandler) {

    getFromCacheOrApi(
        categoriesUrl,
        function(results) {

            truncateResults(count, results);
            if (successHandler) successHandler(results);
        },
        errorHandler);
};

ApiController.prototype.getCategoriesAll = function(successHandler, errorHandler) {

    this.getCategories(null, successHandler, errorHandler);
};

ApiController.prototype.getDomains = function(count, successHandler, errorHandler) {

    getFromCacheOrApi(
        domainsUrl,
        function(results) {

            truncateResults(count, results);
            if (successHandler) successHandler(results);
        },
        errorHandler);
};

ApiController.prototype.getSearchDatasetsUrl = function(requestParams, completionHandler) {
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
    }).map(name => `"${name}"`);

    const allTerms = [synonyms, regionNames, requestParams.standards];
    const query = allTerms
        .filter(terms => terms.length > 0)
        .map(terms => `(${terms.join(' OR ')})`)
        .join(' AND ');

    const categories = requestParams.categories || [];
    const domains = requestParams.domains || [];
    const allParams = _.extend({}, requestParams, {
        categories: categories.join(','),
        domains: domains.join(','),
        q_internal: query,
    });
    const params = _.omit(allParams, value => value === '' || value === []);

    const url = `${Constants.CATALOG_URL}?${querystring.stringify(params)}`;
    completionHandler(url);
};

ApiController.prototype.getStandardSchemas = function(domain, id, successHandler, errorHandler) {
    getFromApi(athenaUrl + id, successHandler, errorHandler);
}

// Private functions
//
function annotateData(data) {

    // resultSetSizeString
    //
    data.resultSetSizeString = numeral(data.resultSetSize).format('0,0');

    data.results.forEach(function(result) {

        // categoryGlyphString, updatedAtString
        //
        result.classification.categoryGlyphString = getCategoryGlyphString(result);
        result.resource.updatedAtString = moment(result.resource.updatedAt).format('D MMM YYYY');

        // Truncate description
        //
        if (result.resource.description.length > maxDescriptionLength) {

            result.resource.description = result.resource.description.substring(0, maxDescriptionLength);

            var lastIndex = result.resource.description.lastIndexOf(" ");
            result.resource.description = result.resource.description.substring(0, lastIndex) + " ... ";
        }
    });
}

function annotateParams(data, params) {

    params.totalPages = Math.ceil(data.resultSetSize / defaultSearchResultCount);
}

function getCategoryGlyphString(result) {

    if ((result.classification == null) ||
        (result.classification.categories == null) ||
        (result.classification.categories.length == 0)) {

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

function getFromApi(url, successHandler, errorHandler) {
    request(
        {
            url: url,
            headers: { 'User-Agent' : userAgent }
        },
        function(err, resp) {

            if (err) {
                if (errorHandler) errorHandler();
                return;
            }

            if (resp.statusCode != 200) {
                if (errorHandler) errorHandler();
                return;
            }

            if (successHandler) {

                var results = JSON.parse(resp.body);
                successHandler(results);
            }
        });
};

function getFromCacheOrApi(url, successHandler, errorHandler) {

    cacheController.get(url, function(results) {

        if (results != undefined) {

            // Found in cache
            //
            if (successHandler) successHandler(results);
            return;
        }

        // Not in cache so get from the API
        //
        getFromApi(
            url,
            function(results) { cacheController.set(url, results, successHandler); },
            errorHandler);
    });
}

function truncateResults(count, results) {

    if ((count != null) && (count >= 0)) {

        if (results.results.length > count)
            results.results.length = count;
    }
}

// Extensions
//
String.prototype.format = function() {

    var args = arguments;

    return this.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
};

String.prototype.split2 = function(s) {

    var rg = this.split(s);

    if ((rg.length == 1) && (rg[0] == ''))
        return [];

    return rg;
};
