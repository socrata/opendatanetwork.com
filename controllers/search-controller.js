var CacheController = require('./cache-controller');

var moment = require('moment');
var numeral = require('numeral');
var request = require('request');

var baseUrl = 'http://api.us.socrata.com/api/catalog/v1';
var cacheController = new CacheController();
var categoriesUrl = baseUrl + '/categories';
var defaultFilterCount = 10;
var defaultSearchResultCount = 20;
var domainsUrl = baseUrl + '/domains'; 
var maxDescriptionLength = 300;
var searchUrl = baseUrl;
var tagsUrl = baseUrl + '/tags';
var userAgent = 'www.opendatanetwork.com';

module.exports = SearchController;

function SearchController() {
}

// Public methods
//
SearchController.prototype.getCategories = function(count, successHandler, errorHandler) {

    getFromCacheOrApi(
        categoriesUrl, 
        function(results) {

            truncateResults(count, results);
            if (successHandler) successHandler(results); 
        },
        errorHandler);
};

SearchController.prototype.getDomains = function(count, successHandler, errorHandler) {

    getFromCacheOrApi(
        domainsUrl, 
        function(results) { 

            truncateResults(count, results);
            if (successHandler) successHandler(results); 
        },
        errorHandler);
};

SearchController.prototype.getTags = function(count, successHandler, errorHandler) {

    getFromCacheOrApi(
        tagsUrl, 
        function(results) { 

            truncateResults(count, results);
            if (successHandler) successHandler(results); 
        },
        errorHandler);
};

SearchController.prototype.search = function(params, successHandler, errorHandler) {

    getFromApi(
        getUrlFromSearchParameters(params),
        function(results) {

            annotateData(results);
            annotateParams(results, params);

            if (successHandler)
                successHandler(results);
        },
        errorHandler);
};

SearchController.prototype.getSearchParameters = function(query) {

    var categories = getNormalizedArrayFromDelimitedString(query.categories);
    var domains = getNormalizedArrayFromDelimitedString(query.domains);
    var tags = getNormalizedArrayFromDelimitedString(query.tags);
    var page = isNaN(query.page) ? 1 : parseInt(query.page);
    var ec = getExpandedFiltersSetting(query.ec);
    var ed = getExpandedFiltersSetting(query.ed);
    var et = getExpandedFiltersSetting(query.et);

    return {
        only : 'datasets',
        q : query.q || '',
        page : page,
        offset : (page - 1) * defaultSearchResultCount,
        limit : defaultSearchResultCount,        
        categories : categories,
        domains : domains,
        tags : tags,
        ec : ec,
        ed : ed,
        et : et,
    };
};

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

function getExpandedFiltersSetting(queryValue) {
    
    return isNaN(queryValue) ? false : (parseInt(queryValue) == 1);
}

function getNormalizedArrayFromDelimitedString(s) {

    if (s == null) 
        return [];

    var parts = s.split(',');

    if ((parts.length == 1) && (parts[0] == ''))
        parts = [];

    for (var i in parts) {
        parts[i] = parts[i].toLowerCase();
    }

    return parts;
}

function getUrlFromSearchParameters(params) {

    var url = searchUrl +
        '?offset=' + params.offset +
        '&only=' + params.only +
        '&limit=' + params.limit;

    if ((params.q != null) && (params.q.length > 0))
        url += '&q=' + encodeURIComponent(params.q);

    if (params.categories.length > 0)
        url += '&categories=' + encodeURIComponent(params.categories.join(','));

    if (params.domains.length > 0)
        url += '&domains=' + encodeURIComponent(params.domains.join(','));

    if (params.tags.length > 0)
        url += '&tags=' + encodeURIComponent(params.tags.join(','));

    if (params.ec)
        url += '&ec=1';

    if (params.ed)
        url += '&ed=1';

    if (params.et)
        url += '&et=1';

    return url;
}

function getFromApi(url, successHandler, errorHandler) {

    request(
        {
            url: url, 
            headers: { 'User-Agent' : userAgent }
        }, 
        function(err, resp) {

            console.log('Get from api: ' + url);

            if (err) {

                console.log('Could not connect to Socrata');

                if (errorHandler) errorHandler();
                return;
            }

            if (resp.statusCode != 200) {

                console.log('Response: ' + resp.statusCode + ' ' + resp.body);

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
