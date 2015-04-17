var _moment = require('moment');
var _numeral = require('numeral');
var _queryString = require('querystring');
var _request = require('request');
var _searchUrl = 'http://api.us.socrata.com/api/catalog/v1?';

module.exports = SearchController;

function SearchController() {
};

// Public methods
//
SearchController.prototype.getSearchParameters = function(query) {

    var categories = getNormalizedArrayFromDelimitedString(query.categories);
    var domains = getNormalizedArrayFromDelimitedString(query.domains);

    return {
        only : 'datasets',
        q : query.q || '',
        offset : query.offset || 0,
        limit : query.limit || 10,        
        categories : categories,
        domains : domains,
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

            var json = JSON.parse(resp.body);

            annotateResults(json);
            
            if (completionHandler) 
                completionHandler(json);
        });
}

// Private functions
//
function annotateResults(o) {

    // resultSetSizeString
    //
    o.resultSetSizeString = _numeral(o.resultSetSize).format('0,0'), 

    // categoryGlyphString, updatedAtString
    //
    o.results.forEach(function(result) {

        result.classification.categoryGlyphString = getCategoryGlyphString(result);
        result.resource.updatedAtString = _moment(result.updatedAt).format('D MMM YYYY');
    });
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

    var url = _searchUrl + _queryString.stringify(params);
    console.log(url);

    return url;
}
