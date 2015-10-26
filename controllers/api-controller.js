var CacheController = require('./cache-controller');

var moment = require('moment');
var numeral = require('numeral');
var request = require('request');

var baseCatalogUrl = 'http://api.us.socrata.com/api/catalog/v1';
var baseFederalDemoUrl = 'https://federal.demo.socrata.com/resource/7g2b-8brv';

var autoCompleteNameUrl = baseFederalDemoUrl + '/?autocomplete_name=';
var cacheController = new CacheController();
var categoriesUrl = baseCatalogUrl + '/categories';
var defaultFilterCount = 10;
var defaultSearchResultCount = 60;
var domainsUrl = baseCatalogUrl + '/domains'; 
var maxDescriptionLength = 300;
var searchUrl = baseCatalogUrl;
var tagsUrl = baseCatalogUrl + '/tags';
var userAgent = 'www.opendatanetwork.com';

module.exports = ApiController;

function ApiController() {
}

// Public methods
//
ApiController.prototype.getDatasetsForRegions = function(params, successHandler, errorHandler) {

    getFromApi(
        getSearchUrlFromParametersV4(params),
        function(results) {

            annotateData(results);
            annotateParams(results, params);

            if (successHandler)
                successHandler(results);
        },
        errorHandler);
}

ApiController.prototype.getAutoCompleteName = function(names, successHandler, errorHandler) {

    //$where=autocomplete_name='Seattle%20city%20Washington' OR autocomplete_name='Portland%20city%20Oregon'

    var url = baseFederalDemoUrl + '?$where=';
    var pairs = names.map(function(name) { return "autocomplete_name='" + encodeURIComponent(name) + "'"; });

    url += pairs.join(' OR ');

    console.log(url);

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

ApiController.prototype.getSearchParameters = function(query) {

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
        regions : [],
        tags : tags,
        ec : ec,
        ed : ed,
        et : et,
    };
};

ApiController.prototype.getSearchParametersV4 = function(req, completionHandler) {

    var query = req.query;
    var categories = getNormalizedArrayFromDelimitedString(query.categories);
    var domains = getNormalizedArrayFromDelimitedString(query.domains);
    var tags = getNormalizedArrayFromDelimitedString(query.tags);
    var page = isNaN(query.page) ? 1 : parseInt(query.page);
    var ec = getExpandedFiltersSetting(query.ec);
    var ed = getExpandedFiltersSetting(query.ed);
    var et = getExpandedFiltersSetting(query.et);

    var params = {

        categories : categories,
        domains : domains,
        limit : defaultSearchResultCount,
        offset : (page - 1) * defaultSearchResultCount,
        only : 'datasets',
        page : page,
        q : query.q || '',
        regions: [],
        tags : tags,
        ec : ec,
        ed : ed,
        et : et,
    };

    // Regions are in the URL path segment, not a query parameter
    //
    if ((req.params.region == null) || (req.params.region.length == 0)) {

        if (completionHandler) completionHandler(params);
        return;
    }

    var parts = req.params.region.split2('_vs_');
    var regions = parts.map(function(region) { return region.replace(/_/g, ' ') });

    ApiController.prototype.getAutoCompleteName(regions, function(results) {

        if (results.length > 0) {

            params.regions = results.map(function(result) {
                return { id : result.id, name : result.name };
            });
        }

        console.log(JSON.stringify(params));

        if (completionHandler) completionHandler(params);
    });
}

ApiController.prototype.getTags = function(count, successHandler, errorHandler) {

    getFromCacheOrApi(
        tagsUrl, 
        function(results) { 

            truncateResults(count, results);
            if (successHandler) successHandler(results); 
        },
        errorHandler);
};

ApiController.prototype.getTagsAll = function(successHandler, errorHandler) {

    this.getTags(null, successHandler, errorHandler);
};

ApiController.prototype.search = function(params, successHandler, errorHandler) {

    getFromApi(
        getSearchUrlFromParameters(params),
        function(results) {

            annotateData(results);
            annotateParams(results, params);

            if (successHandler)
                successHandler(results);
        },
        errorHandler);
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

function getSearchUrlFromParameters(params) {

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

function getSearchUrlFromParametersV4(params) {

    var url = searchUrl +
        '?offset=' + params.offset +
        '&only=' + params.only +
        '&limit=' + params.limit;

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

    if (((params.q != null) && (params.q.length > 0)) || (params.regions.length > 0)) {

        url += '&q=';

        if ((params.q != null) && (params.q.length > 0)) {

            url += encodeURIComponent(params.q);
        }
        else {

            if (params.regions.length > 0) {

                // TODO: Ideally we would pass the regions as separate parameters.  Marc says this is coming.
                //
                var regions = params.regions.map(function(region) { return region.name; });
                url += encodeURIComponent(regions.join(', '));
            }
        }
    }

    return url;
}

function getFromApi(url, successHandler, errorHandler) {

    console.log(url);

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

// Extensions
//
String.prototype.split2 = function(s) {

    var rg = this.split(s);

    if ((rg.length == 1) && (rg[0] == ''))
        return [];

    return rg;
};
