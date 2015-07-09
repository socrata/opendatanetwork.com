var NodeCache = require('node-cache');
var _moment = require('moment');
var _numeral = require('numeral');
var _request = require('request');

var _baseUrl = 'http://api.us.socrata.com/api/catalog/v1';
var _categoriesUrl = _baseUrl + '/categories';
var _domainsUrl = _baseUrl + '/domains';
var _limit = 10;
var _nodeCache = new NodeCache();
var _searchUrl = _baseUrl;
var _tagsUrl = _baseUrl + '/tags';
var _ttl = 60 * 60; // seconds
var _userAgent = 'www.opendatanetwork.com';

module.exports = SearchController;

function SearchController() {
}

// Public methods
//
SearchController.prototype.getCategories = function(count, completionHandler) {

    getFromCacheOrApi(_categoriesUrl, function(results) {

        truncateResults(count, results, completionHandler);
    });
};

SearchController.prototype.getDomains = function(count, completionHandler) {

    getFromCacheOrApi(_domainsUrl, function(results) {

        truncateResults(count, results, completionHandler);
    });
};

SearchController.prototype.getTags = function(count, completionHandler) {

    getFromCacheOrApi(_tagsUrl, function(results) {

        truncateResults(count, results, completionHandler);
    });
};

SearchController.prototype.search = function(params, completionHandler) {

    getFromApi(
        getUrlFromSearchParameters(params), 
        function(results) {

            annotateData(results);
            annotateParams(results, params);

            if (completionHandler)
                completionHandler(results);
        });
};

SearchController.prototype.getSearchParameters = function(query) {

    var categories = getNormalizedArrayFromDelimitedString(query.categories);
    var domains = getNormalizedArrayFromDelimitedString(query.domains);
    var tags = getNormalizedArrayFromDelimitedString(query.tags);
    var page = isNaN(query.page) ? 1 : parseInt(query.page);

    return {
        only : 'datasets',
        q : query.q || '',
        page : page,
        offset : (page - 1) * _limit,
        limit : _limit,        
        categories : categories,
        domains : domains,
        tags : tags,
    };
};

// Private functions
//
function annotateData(data) {

    // resultSetSizeString
    //
    data.resultSetSizeString = _numeral(data.resultSetSize).format('0,0');

    // categoryGlyphString, updatedAtString
    //
    data.results.forEach(function(result) {

        result.classification.categoryGlyphString = getCategoryGlyphString(result);
        result.resource.updatedAtString = _moment(result.resource.updatedAt).format('D MMM YYYY');
    });
}

function annotateParams(data, params) {

    params.totalPages = Math.ceil(data.resultSetSize / _limit);
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

function getNormalizedArrayFromDelimitedString(s) {

    if (s == null) 
        return [];

    var parts = s.split(',');

    if ((parts.length == 1) && (parts[0] == ''))
        parts = [];

    for (var i in parts) {
        parts[i] = parts[i]; // TODO: lowercase this tomorrow afternoon
    }

    return parts;
}

function getUrlFromSearchParameters(params) {

    var url = _searchUrl +
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

    return url;
}

function getFromApi(url, completionHandler) {

    _request(
        {
            url: url, 
            headers: { 'User-Agent' : _userAgent }
        }, 
        function(err, resp) {

            if (err) {

                console.log('Could not connect to Socrata');

                if (completionHandler) completionHandler();
                return;
            }

            if (resp.statusCode != 200) {

                console.log(resp.body);

                if (completionHandler) completionHandler();
                return;
            }

            console.log('Get from api: ' + url);

            if (completionHandler) {

                var results = JSON.parse(resp.body);
                completionHandler(results);
            }
        });
};

function getFromCacheOrApi(url, completionHandler) {

    _nodeCache.get(url, function(err, results) {

        if (err) {

            if (completionHandler) completionHandler();
            return;
        }

        if (results != undefined) {

            console.log('Get from cache: ' + url);

            if (completionHandler) completionHandler(results);
            return;
        }

        getFromApi(url, function(results) {

            _nodeCache.set(url, results, _ttl, function(err, success) {

                if (err || !success) {

                    if (completionHandler) completionHandler();
                    return;
                }

                if (completionHandler) completionHandler(results);
            });
        });
    });
}

function truncateResults(count, results, completionHandler) {

        if (results.results.length > count)
            results.results.length = count;

        if (completionHandler)
            completionHandler(results)
}
