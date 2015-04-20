var _moment = require('moment');
var _numeral = require('numeral');
var _request = require('request');

var _searchUrl = 'http://api.us.socrata.com/api/catalog/v1';
var _limit = 10;

module.exports = SearchController;

function SearchController() {
};

// Public methods
//
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

SearchController.prototype.search = function(params, completionHandler) {

    var options = {
        url: getUrlFromSearchParameters(params),
        headers: { 'User-Agent' : 'www.opendatanetwork.com' }
    };

    _request(
        options, 
        function(err, resp, html) {

            if (err) {
             
                console.log('Could not connect to Socrata');

                if (completionHandler)
                    completionHandler(null);

                return;
            }

            if (resp.statusCode != 200) {

                console.log(resp.body);

                if (completionHandler)
                    completionHandler(null);

                return;
            }

            var data = JSON.parse(resp.body);

            annotateData(data);
            annotateParams(data, params);
            
            if (completionHandler) 
                completionHandler(data);
        });
}

// Private functions
//
function annotateData(data) {

    // resultSetSizeString
    //
    data.resultSetSizeString = _numeral(data.resultSetSize).format('0,0'), 

    // categoryGlyphString, updatedAtString
    //
    data.results.forEach(function(result) {

        result.classification.categoryGlyphString = getCategoryGlyphString(result);
        result.resource.updatedAtString = _moment(result.updatedAt).format('D MMM YYYY');
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

    for (var i in parts) {
        parts[i] = parts[i]; // TODO: lowercase this tomorrow afternoon
    }

    return parts;
}

function getUrlFromSearchParameters(params) {

    var url = _searchUrl + 
        '?q=' + encodeURIComponent(params.q) +
        '&offset=' + params.offset + 
        '&limit=' + params.limit;

    if (params.categories.length > 0)
        url += '&categories=' + encodeURIComponent(params.categories.join(','));

    if (params.domains.length > 0)
        url += '&domains=' + encodeURIComponent(params.domains.join(','));

    if (params.tags.length > 0)
        url += '&tags=' + encodeURIComponent(params.tags.join(','));

    console.log(url);

    return url;
}

