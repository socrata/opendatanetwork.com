var _ = require('underscore');

var ApiController = require('./api-controller');
var CategoryController = require('./category-controller');
var TagController = require('./tag-controller');
var Sources = require('./sources');

var _ = require('lodash');
var htmlencode = require('htmlencode');
var path = require('path');
var moment = require('moment');

var apiController = new ApiController();
var categoryController = new CategoryController();
var sources = Sources.getSources();
var tagController = new TagController();

var defaultSearchResultCount = 10;

module.exports = RenderController;

function RenderController() {
}

// Public methods
//
// Categories json
//
RenderController.prototype.renderCategoriesJson = function(req, res) {

    apiController.getCategoriesAll(function(allCategoryResults) {

        categoryController.attachCategoryMetadata(allCategoryResults, function(allCategoryResults) {

            res.send(JSON.stringify(allCategoryResults));
        });
    });
};

// Dataset
//
RenderController.prototype.renderDatasetPage = function(req, res) {

    apiController.getDatasetSummary(
        req.params.domain,
        req.params.id,
        function(dataset) {
          apiController.getStandardSchemas(
              req.params.domain,
              req.params.id,
              function(schemas) {
                  // Hilarious bug fix. When nothing matches, it returns "[]" instead of an actual empty array
                  if(schemas.applied_schemas == "[]") {
                    schemas.applied_schemas = [];
                  }

                  var mapped_schemas = _.map(schemas.applied_schemas, function(sch, idx) {
                    var uid = sch.url.match(/(\w{4}-\w{4})$/)[1]
                    var query = _.collect(sch.query, function(v,k) { return k + "=" + v; }).join("&");
                    return {
                      name: sch.name,
                      description: sch.description,
                      uid: uid,
                      query: 'https://' + req.params.domain + '/resource/' + uid +
                        '?' + query,
                      standard: sch.standardIds[0],
                      required_columns: sch.columns,
                      opt_columns: sch.optColumns,
                      direct_map: (query.length == 0)
                    }
                  });

                  RenderController.prototype.getSearchParameters(req, function(params) {

                      res.render(
                          'dataset.ejs',
                          {
                              css : [
                                  '/styles/dataset.css'
                              ],
                              dataset: {
                                  descriptionHtml : htmlEncode(dataset.description).replace('\n', '<br>'),
                                  domain : req.params.domain,
                                  id : req.params.id,
                                  name : dataset.name,
                                  tags : dataset.tags || [],
                                  columns : dataset.columns,
                                  updatedAtString : moment(new Date(dataset.viewLastModified * 1000)).format('D MMM YYYY')
                              },
                              schemas: mapped_schemas,
                              params : params,
                              scripts : [
                                  '//cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/leaflet.js',
                                  '/lib/third-party/colorbrewer.min.js',
                                  '/lib/third-party/d3.min.js',
                                  '/lib/third-party/d3.promise.min.js',
                                  '/lib/third-party/lodash.min.js',
                                  '/lib/search.min.js',
                              ],
                              searchPath : '/search',
                              title : 'Find the data you need to power your business, app, or analysis from across the open data ecosystem.'
                          }
                      ); // render
                  },
                  function() { renderErrorPage(req, res); }); // getSearchParameters
            }); // getStandardSchemas
      }); // getdatasetsummary
};

// Home
//
RenderController.prototype.renderHomePage = function(req, res) {

    apiController.getCategoriesAll(function(allCategoryResults) {

        categoryController.attachCategoryMetadata(allCategoryResults, function(allCategoryResults) {

            // Get params
            //
            RenderController.prototype.getSearchParameters(req, function(params) {

                // Render page
                //
                res.render(
                    'home.ejs',
                    {
                        allCategoryResults : allCategoryResults,
                        css : [
                            '//cdn.jsdelivr.net/jquery.slick/1.5.0/slick.css',
                            '/styles/home.css',
                            '/styles/main.css'
                        ],
                        params : params,
                        scripts : [
                            '//cdn.jsdelivr.net/jquery.slick/1.5.0/slick.min.js',
                            {
                                'url' : '//fast.wistia.net/static/popover-v1.js',
                                'charset' : 'ISO-8859-1'
                            },
                            '/lib/third-party/browser-polyfill.min.js',
                            '/lib/third-party/d3.min.js',
                            '/lib/third-party/d3.promise.min.js',
                            '/lib/third-party/lodash.min.js',
                            '/lib/home.min.js'
                        ],
                        searchPath : '/search',
                        title : 'Find the data you need to power your business, app, or analysis from across the open data ecosystem.'
                    });
             });
        });
    }, function() { renderErrorPage(req, res); });
};

// Join
//
RenderController.prototype.renderJoinOpenDataNetwork = function(req, res) {

    res.locals.css = 'join.css';
    res.locals.title = 'Join the Open Data Network.';
    res.render('join.ejs');
};

// Join complete
//
RenderController.prototype.renderJoinOpenDataNetworkComplete = function(req, res) {

    res.locals.css = 'join-complete.css';
    res.locals.title = 'Thanks for joining the Open Data Network.';
    res.render('join-complete.ejs');
};

// Search
//
RenderController.prototype.renderSearchPage = function(req, res) {

    RenderController.prototype.getSearchParameters(req, function(params) {

        _renderSearchPage(req, res, params);
    });
};

// Search with vector
//
RenderController.prototype.renderSearchWithVectorPage = function(req, res) {

    if ((req.params.vector == '') ||
        (req.params.vector == 'population') ||
        (req.params.vector == 'earnings') ||
        (req.params.vector == 'education') ||
        (req.params.vector == 'occupations') ||
        (req.params.vector == 'gdp') ||
        (req.params.vector == 'health') ||
        (req.params.vector == 'cost_of_living')) {

        RenderController.prototype.getSearchParameters(req, function(params) {

            // If the vector is unsupported, just redirect to the root
            //
            if (!_.includes(sources.forRegions(params.regions), req.params.vector)) {

                res.redirect(301, '/');
                return;
            }

            _renderSearchPage(req, res, params);
        });
    }
    else {

        renderErrorPage(req, res);
    }
};

// Search results
//
RenderController.prototype.renderSearchResults = function(req, res) {

    RenderController.prototype.getSearchParameters(req, function(params) {

        apiController.searchDatasets(params, function(searchResults) {

            if (searchResults.results.length == 0) {

                res.status(204);
                res.end();
                return;
            }

            res.render(
                (params.regions.length == 0) ? '_search-results-regular.ejs' : '_search-results-compact.ejs',
                {
                    css : [],
                    scripts : [],
                    params : params,
                    searchResults : searchResults,
                });
        });
    });
};

// Private functions
//
function _renderSearchPage(req, res, params) {

    apiController.getSearchDatasetsUrl(params, function(searchDatasetsUrl) {

        apiController.getCategories(5, function(categoryResults) {

            categoryController.attachCategoryMetadata(categoryResults, function(categoryResults) {

                // Get the current category
                //
                var currentCategory = categoryController.getCurrentCategory(params, categoryResults);

                // Get all tags
                //
                apiController.getTagsAll(function(allTagResults) {
    
                    tagController.attachTagMetadata(allTagResults, function(tagResults) {

                        // Get the current tag
                        //
                        var currentTag = tagController.getCurrentTag(params, allTagResults);

                        apiController.getDomains(5, function(domainResults) {
        
                            apiController.searchDatasets(
                                params,
                                function(results) {
        
                                    res.render(
                                        'search.ejs',
                                        {
                                            categoryResults : categoryResults,
                                            css : [
                                                '/styles/third-party/leaflet.min.css',
                                                '/styles/search.css',
                                                '/styles/maps.css',
                                                '/styles/main.css'
                                            ],
                                            currentCategory : currentCategory,
                                            currentTag : currentTag,
                                            domainResults : domainResults,
                                            params : params,
                                            scripts : [
                                                '//cdnjs.cloudflare.com/ajax/libs/numeral.js/1.4.5/numeral.min.js',
                                                '//www.google.com/jsapi?autoload={\'modules\':[{\'name\':\'visualization\',\'version\':\'1\',\'packages\':[\'corechart\']}]}',
                                                '/lib/third-party/leaflet/leaflet.min.js',
                                                '/lib/third-party/leaflet/leaflet-omnivore.min.js',
                                                '/lib/third-party/browser-polyfill.min.js',
                                                '/lib/third-party/colorbrewer.min.js',
                                                '/lib/third-party/d3.min.js',
                                                '/lib/third-party/d3.promise.min.js',
                                                '/lib/third-party/leaflet-omnivore.min.js',
                                                '/lib/third-party/lodash.min.js',
                                                '/lib/search.min.js'
                                            ],
                                            searchDatasetsUrl : searchDatasetsUrl,
                                            searchPath : req.path,
                                            searchResults : results,
                                            sources : sources.forRegions(params.regions),
                                            title : getSearchPageTitle(params)
                                        });
                                },
                                function() {
        
                                    renderErrorPage(req, res);
                                });
                        });
                    });
                });
            });
        });
    });
};

RenderController.prototype.getSearchParameters = function(req, completionHandler) {

    var query = req.query;
    var categories = getNormalizedArrayFromDelimitedString(query.categories);
    var domains = getNormalizedArrayFromDelimitedString(query.domains);
    var tags = getNormalizedArrayFromDelimitedString(query.tags);
    var page = isNaN(query.page) ? 1 : parseInt(query.page);

    var params = {

        categories : categories,
        domains : domains,
        limit : defaultSearchResultCount,
        offset : (page - 1) * defaultSearchResultCount,
        only : 'datasets',
        page : page,
        q : query.q || '',
        regions : [],
        resetRegions : false,
        tags : tags,
        vector : req.params.vector || '',
    };

    // Debug
    //
    if (query.debug != null) params.debug = 1;

    // Region ids are in the URL path segment, not a query parameter
    //
    if ((req.params.regionIds == null) || (req.params.regionIds.length == 0)) {

        if (completionHandler) completionHandler(params);
        return;
    }

    var regionIds = req.params.regionIds.split2('-');

    apiController.getAutoSuggestedRegions(regionIds, function(results) {

        if (results.length > 0) {

            var orderedRegions = [];

            for (var i in regionIds) {

                var region = getRegionFromResultsById(results, regionIds[i]);

                if (region != null)
                    orderedRegions.push(region);
            }

            params.regions = orderedRegions;
        }

        if (completionHandler) completionHandler(params);
    });
};

function getSearchPageTitle(params) {

    var rg = []

    switch (params.vector) {

        case 'population': rg.push('Population'); break;
        case 'earnings': rg.push('Earnings'); break;
        case 'education': rg.push('Education'); break;
        case 'occupations': rg.push('Occupations'); break;
        case 'gdp': rg.push('Economic'); break;
        case 'health': rg.push('Health'); break;
        case 'cost_of_living': rg.push('Cost of Living'); break;
        default: rg.push('Population'); break;
    }

    var categories = params.categories.map(function(category) { return category.capitalize(); });
    rg = rg.concat(categories);

    var tags = params.tags.map(function(standard) { return standard.toUpperCase(); });
    rg = rg.concat(tags);

    var s = englishJoin(rg);
    s += ' Data';

    if (params.regions.length > 0) {

        s += ' for ';
        var regionNames = params.regions.map(function(region) { return region.name; });
        s += englishJoin(regionNames);
    }

    s += ' on the Open Data Network';

    return s;
};

function englishJoin(list) {

    var s = '';

    for (var i = 0; i < list.length; i++) {

        if (i > 0)
            s += (i == list.length - 1) ? ' and ' : ', ';

        s += list[i];
    }

    return s;
}

function getRegionFromResultsById(results, regionId) {

    for (var i in results) {

        var result = results[i];

        if (regionId == result.id) {

            return {
                id : result.id,
                name : result.name,
                type : result.type
            };
        }
    }

    return null;
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
};

function htmlEncode(s) {

    return s ? htmlencode.htmlEncode(s) : '';
}

function renderErrorPage(req, res) {

    res.status(503);
    res.sendFile(path.resolve(__dirname + '/../views/static/error.html'));
};

// Extensions
//
String.prototype.capitalize = function() {

    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
}

String.prototype.split2 = function(s) {

    var rg = this.split(s);

    if ((rg.length == 1) && (rg[0] == ''))
        return [];

    return rg;
};
