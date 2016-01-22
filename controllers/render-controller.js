'use strict';

const API = require('./api');
const ApiController = require('./api-controller');
const CategoryController = require('./category-controller');
const MetricsController = require('./metrics-controller');
const TagController = require('./tag-controller');
const Sources = require('./sources');
const Relatives = require('./relatives');
const Constants = require('./constants');
const Request = require('./request');

const _ = require('lodash');
const htmlencode = require('htmlencode');
const moment = require('moment');
const numeral = require('numeral');
const path = require('path');

const apiController = new ApiController();
const categoryController = new CategoryController();
const metricsController = new MetricsController();
const sources = Sources.getSources();
const tagController = new TagController();

const defaultSearchResultCount = 10;

module.exports = RenderController;

function RenderController() {
}

// Categories json
//
RenderController.prototype.renderCategoriesJson = function(req, res) {
    API.categories().then(categories => {
        res.send(JSON.stringify(categories));
    });
};

// Dataset
//
RenderController.prototype.renderDatasetPage = function(req, res) {
    const domain = req.params.domain;
    const id = req.params.id;

    const datasetPromise = API.datasetSummary(domain, id);
    const schemasPromise = API.standardSchemas(id);
    const allPromise = Promise.all([datasetPromise, schemasPromise]);

    allPromise.then(data => {
        const dataset = data[0];
        const schemas = data[1].map(schema => {
            const uid = schema.url.match(/(\w{4}-\w{4})$/)[1];
            const query = Request.buildURL(`https://${domain}/resource/${id}.json?`, schema.query);

            return _.extend(schema, {
                uid,
                query,
                standard: schema.standardIds[0],
                required_columns: schema.columns,
                opt_columns: schema.optColumns,
                direct_map: schema.query.length === 0
            });
        });

        RenderController.prototype.getSearchParameters(req, function(params) {
            const templateParams = {
                params,
                schemas,
                searchPath : '/search',
                title : dataset.name,
                dataset : {
                    domain,
                    id,
                    descriptionHtml : htmlEncode(dataset.description).replace('\n', '<br>'),
                    name : dataset.name,
                    tags : dataset.tags || [],
                    columns : dataset.columns,
                    updatedAtString : moment(new Date(dataset.viewLastModified * 1000)).format('D MMM YYYY')
                },
                css : [
                    '/styles/dataset.css'
                ],
                scripts : [
                    '//cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/leaflet.js',
                    '/lib/third-party/colorbrewer.min.js',
                    '/lib/third-party/d3.min.js',
                    '/lib/third-party/d3.promise.min.js',
                    '/lib/third-party/lodash.min.js',
                    '/lib/search.min.js',
                ]
            };

            res.render('dataset.ejs', templateParams);
        });
    }, error => {
        renderErrorPage(req, res, 404, 'Dataset not found');
    });
};


RenderController.prototype.renderHomePage = function(req, res) {
    const categoriesPromise = API.categories();
    const locationsPromise = API.locations();
    const allPromise = Promise.all([categoriesPromise, locationsPromise]);

    allPromise.then(data => {
        const categories = data[0];
        const locations = data[1];

        RenderController.prototype.getSearchParameters(req, params => {
            const templateParams = {
                categories,
                locations,
                params,
                searchPath : '/search',
                title : 'Open Data Network',
                css : [
                    '//cdn.jsdelivr.net/jquery.slick/1.5.0/slick.css',
                    '/styles/home.css',
                    '/styles/main.css'
                ],
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
                ]
            };

            res.render('home.ejs', templateParams);
        });
    }, error => {
        console.log(error);
        renderErrorPage(req, res);
    });
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
        API.tableData(params.vector, params.regions).then(tableData => {
            _renderSearchPage(req, res, params, tableData);
        }, error => {
            renderErrorPage(req, res, 503, error);
        });
    });
};

// Search with vector
//
RenderController.prototype.renderSearchWithVectorPage = function(req, res) {

    if ((req.params.vector === '') ||
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

            API.tableData(params.vector, params.regions).then(tableData => {
                _renderSearchPage(req, res, params, tableData);
            }, error => {
                renderErrorPage(req, res, 503, error);
            });
        });
    }
    else {

        console.log('Unknown req.params.vector: {0} url: {1}'.format(req.params.vector, req.url));
        renderErrorPage(req, res);
    }
};

// Search results
//
RenderController.prototype.renderSearchResults = function(req, res) {

    RenderController.prototype.getSearchParameters(req, function(params) {
        apiController.searchDatasets(params, function(searchResults) {

            if (searchResults.results.length === 0) {

                res.status(204);
                res.end();
                return;
            }

            res.render(
                (params.regions.length === 0) ? '_search-results-regular.ejs' : '_search-results-compact.ejs',
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
function _renderSearchPage(req, res, params, tableData) {

    function forRegion(regionPromise) {
        return new Promise(resolve => {
            if (params.regions.length === 0) {
                resolve([]);
            } else {
                regionPromise(params.regions[0]).then(result => {
                    if (!result) {
                        resolve([]);
                    } else {
                        resolve(result);
                    }
                }, error => {
                    resolve([]);
                });
            }
        });
    }

    const uids = params.regions.map(region => region.id);
    const names = params.regions.map(region => region.name);

    function processRegions(regions) {
        return regions.filter(region => {
            return !_.contains(uids, region.id);
        }).slice(0, Constants.N_RELATIVES).map(region => {
            const encode = name => name.replace(/,/g, '').replace(/ /g, '_');
            const navigateURL = `/region/${region.id}/${encode(region.name)}`;

            const uidString = uids.concat(region.id).join('-');
            const nameString = names.concat(region.name).map(encode).join('-');
            const addURL = `/region/${uidString}/${nameString}/${params.vector}`;

            return _.extend({}, region, {addURL, navigateURL});
        });
    }

    const peersPromise = forRegion(Relatives.peers);
    const siblingsPromise = forRegion(Relatives.siblings);
    const childrenPromise = forRegion(Relatives.children);
    const categoriesPromise = API.categories(5);
    const tagsPromise = API.tags();
    const domainsPromise = API.domains(5);
    const datasetsPromise = API.datasets(params);
    const allPromises = [peersPromise, siblingsPromise, childrenPromise,
                         categoriesPromise, tagsPromise, domainsPromise,
                         datasetsPromise];
    const allPromise = Promise.all(allPromises);

    const searchDatasetsURL = API.searchDatasetsURL(params);

    allPromise.then(data => {
        const templateParams = {
            params,
            searchDatasetsURL,
            mapSummary : metricsController.getMapSummary(params, tableData),
            mapSummaryLinks : metricsController.getMapSummaryLinks(params),
            mapVariables : metricsController.getMapVariables(params),
            searchPath : req.path,
            sources : sources.forRegions(params.regions),
            tableData : tableData || {},
            title : getSearchPageTitle(params),
            css : [
                '/styles/third-party/leaflet.min.css',
                '/styles/search.css',
                '/styles/maps.css',
                '/styles/main.css'
            ],
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
            ]
        };

        if (data && data.length == allPromises.length) {
            if (data[0].length > 0) {
                templateParams.peers = processRegions(data[0]);
            }

            if (data[1].length == 2 && data[1][1].length > 0) {
                templateParams.parentRegion = processRegions([data[1][0]])[0];
                templateParams.siblings = processRegions(data[1][1]);
            }

            if (data[2].length > 0) {
                templateParams.allChildren =
                    data[2].map(children => processRegions(children));
            }

            if (data[3].length > 0) {
                templateParams.categories = data[3];
                templateParams.currentCategory =
                    categoryController.getCurrentCategory(params, data[3]);
            }

            if (data[4].results.length > 0) {
                templateParams.currentTag =
                    tagController.getCurrentTag(params, data[4]);
            }

            templateParams.domainResults = data[5];
            templateParams.searchResults = data[6];
        }

        res.render('search.ejs', templateParams);
    }, error => {
        console.log(error);
        renderErrorPage(req, res);
    });
}

RenderController.prototype.getSearchParameters = function(req, completionHandler) {

    var query = req.query;
    var categories = getNormalizedArrayFromQueryParameter(query.categories);
    var domains = getNormalizedArrayFromQueryParameter(query.domains);
    var tags = getNormalizedArrayFromQueryParameter(query.tags);
    var page = isNaN(query.page) ? 1 : parseInt(query.page);

    var params = {
        categories : categories,
        domains : domains,
        limit : defaultSearchResultCount,
        metric : req.params.metric || '',
        offset : (page - 1) * defaultSearchResultCount,
        only : 'datasets',
        page : page,
        q : query.q || '',
        regions : [],
        resetRegions : false,
        tags : tags,
        vector : req.params.vector || '',
        year : req.params.year || ''
    };

    // Region ids are in the URL path segment, not a query parameter
    //
    if (!(req.params.regionIds) || (req.params.regionIds.length === 0)) {

        if (completionHandler) completionHandler(params);
        return;
    }

    var regionIds = req.params.regionIds.split2('-');

    apiController.getAutoSuggestedRegions(regionIds, function(results) {

        if (results.length > 0) {

            var orderedRegions = [];

            for (var i in regionIds) {

                var region = getRegionFromResultsById(results, regionIds[i]);

                if (region !== null)
                    orderedRegions.push(region);
            }

            params.regions = orderedRegions;
        }

        if (completionHandler) completionHandler(params);
    });
};

// Private functions
//
function waitForPromises(promises, successHandler, errorHandler) {

    Promise.all(promises)
        .then(data => successHandler(data))
        .catch(error => {

            console.error(error);
            errorHandler();
        });
}

function getSearchPageTitle(params) {

    var rg = [];

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
}

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

function getNormalizedArrayFromQueryParameter(o) {

    if (Array.isArray(o))
        return o;

    if (o && o.length > 0)
        return [o];

    return [];
}

function htmlEncode(s) {

    return s ? htmlencode.htmlEncode(s) : '';
}

function renderErrorPage(req, res, statusCode, message) {
    statusCode = statusCode || 503;
    message = message || 'Internal server error';

    res.status(statusCode);
    res.render('error.ejs', {statusCode, message});
}

// Extensions
//
String.prototype.capitalize = function() {

    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

String.prototype.split2 = function(s) {

    var rg = this.split(s);

    if ((rg.length == 1) && (rg[0] === ''))
        return [];

    return rg;
};
