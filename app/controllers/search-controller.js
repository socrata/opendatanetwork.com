'use strict';

const _ = require('lodash');
const htmlencode = require('htmlencode').htmlEncode;
const moment = require('moment');
const numeral = require('numeral');

const Questions = require('../lib/questions');
const Data = require('../lib/data');
const Navigate = require('../lib/navigate');
const ControllerConstants = require('../lib/constants');
const Relatives = require('../lib/relatives');
const EntityFormatter = require('../lib/entity-formatter');
const SearchHelper = require('../lib/search-helper');
const DatasetHelper = require('../lib/dataset-helper');
const DataHelper = require('../lib/data-helper');
const ParamsHelper = require('../lib/params-helper');
const ErrorHandler = require('../lib/error-handler');

const Category = require('../models/category');
const Place = require('../models/place');
const Search = require('../models/search');
const Tag = require('../models/tag');

const GlobalConstants = require('../../src/constants');
const DatasetConfig = require('../../src/dataset-config');

//TODO: Same var in dataset/home controller. Extract it out.
const quickLinksCount = 15;
//TODO: Same var in home controller as well.
const defaultMetaSummary = 'Find the data you need to power your business, app, or analysis from across the open data ecosystem.';
const refineByCount = 5;

class SearchController {
    static search(req, res) {
        ParamsHelper.parameters(req, res).then(params => {
            try {
                SearchController._search(req, res, params);
            } catch (error) {
                ErrorHandler.error(req, res)(error);
            }
        }, ErrorHandler.error(req, res));
    }

    static searchResults(req, res) {
        ParamsHelper.parameters(req, res).then(params => {
            Search.datasets(params).then(searchResults => {
                if (searchResults.results.length === 0) {
                    res.status(204);
                    res.end();
                } else {
                    try {
                        const templateParams = {
                            params,
                            searchResults,
                            css: [],
                            scripts: []
                        };

                        res.render('_search-results-items.ejs', templateParams);
                    } catch (error) {
                        ErrorHandler.error(req, res)(error);
                    }
                }
            }, ErrorHandler.error(req, res));
        }, ErrorHandler.error(req, res));
    }

    static searchWithVector(req, res) {
        const vector = req.params.vector;

        function toDefaultVector() {
            const defaultVector = 'population';
            const url = req.url.split('/').slice(0, 4).concat([defaultVector]).join('/');
            res.redirect(url);
        }

        function containsDataset(data, vector) {
            for (var topicKey in data.topics) {
                var topic = data.topics[topicKey];
                if (topic.datasets[vector])
                    return true;
            }
            return false;
        }

        ParamsHelper.parameters(req, res).then(params => {

            if ((vector === '') || !containsDataset(params.dataAvailability, vector)) {
                toDefaultVector();
                return;
            }

            try {
                SearchController.search(req, res, params);
            } catch (error) {
                ErrorHandler.error(req, res)(error);
            }
        }, ErrorHandler.error(req, res));
    }

    static _search(req, res, params) {
        if (params.regions.length > 0) {
            SearchController._regions(req, res, params);
        } else {
            const categoriesPromise = Category.categories();
            const tagsPromise = Tag.tags();
            const domainsPromise = Category.domains();
            const datasetsPromise = Search.datasets(params);
            const searchPromise = Search.searchDatasetsURL(params);
            const locationsPromise = Place.locations();
            const searchResultsRegionsPromise = Search.searchResultsRegions(params.q);
            const questionsPromise = Questions.getQuestionsForSearchTerm(params.q, params.dataAvailability);

            const allPromises = [categoriesPromise, tagsPromise, domainsPromise,
                datasetsPromise, searchPromise, locationsPromise,
                searchResultsRegionsPromise, questionsPromise];

            const allPromise = awaitPromises(allPromises);

            allPromise.then(data => {
                try {
                    var searchResultsRegions;

                    if (params.q == '') {
                        searchResultsRegions = [];
                    } else {
                        searchResultsRegions = data[6];
                        searchResultsRegions.forEach(region => {
                            region.regionType = GlobalConstants.REGION_NAMES[region.type] || '';
                        });
                    }

                    const templateParams = {
                      GlobalConstants,
                        params,
                        hasRegions: params.regions.length > 0,
                        title: EntityFormatter.searchPageTitle(params),
                        metaSummary : defaultMetaSummary,
                        searchResultsRegions : searchResultsRegions,
                        query: req.query,
                        css: [
                            '/styles/search.css',
                            '/styles/main.css'
                        ],
                        scripts: [
                            '//cdnjs.cloudflare.com/ajax/libs/numeral.js/1.4.5/numeral.min.js',
                            '//www.google.com/jsapi?autoload={"modules":[{"name":"visualization","version":"1","packages":["corechart", "table"]}]}',
                            '//cdn.socket.io/socket.io-1.4.5.js',
                            '/lib/third-party/leaflet/leaflet.min.js',
                            '/lib/third-party/leaflet/leaflet-omnivore.min.js',
                            '/lib/third-party/colorbrewer.min.js',
                            '/lib/third-party/d3.min.js',
                            '/lib/third-party/d3.promise.min.js',
                            '/lib/third-party/js.cookie-2.1.1.min.js',
                            '/lib/third-party/leaflet-omnivore.min.js',
                            '/lib/third-party/lodash.min.js',
                            '/lib/search.min.js'
                        ]
                    };

                    if (data && data.length == allPromises.length) {
                        templateParams.currentCategory = Category.currentCategory(params, data[0]);
                        templateParams.currentTag = Tag.currentTag(params, data[1]);
                        templateParams.searchResults = data[3];
                        templateParams.searchDatasetsURL = data[4];

                        templateParams.quickLinks = {
                            categories : data[0].slice(0, quickLinksCount),
                            domains : data[2].results.slice(0, quickLinksCount),
                            ref : 'sp',
                            regions : data[5].slice(0, quickLinksCount),
                        };

                        templateParams.refineBy = {
                            categories : data[0].slice(0, refineByCount),
                            domains : data[2].results.slice(0, refineByCount),
                        };

                        templateParams.refineByMobile = {
                            categories : data[0],
                            domains : data[2].results,
                        };

                        templateParams.questions = data[7];
                    }

                    // If only one region result and no search results, just redirect to the region page.
                    //
                    if ((templateParams.searchResultsRegions.length == 1) &&
                        (templateParams.searchResults.results) &&
                        (templateParams.searchResults.results.length == 0)) {

                        const region = templateParams.searchResultsRegions[0];
                        const segment = SearchHelper.regionToUrlSegment(region.name);

                        res.redirect(302, `/region/${region.id}/${segment}`);
                        return;
                    }

                    if (typeof req.cookies.refinePopupCollapsed === 'undefined')
                        templateParams.refinePopupCollapsed = true;
                    else
                        templateParams.refinePopupCollapsed = (req.cookies.refinePopupCollapsed === '1');

                    res.render('search.ejs', templateParams);
                } catch (error) {
                    ErrorHandler.error(req, res)(error);
                }
            }, ErrorHandler.error(req, res));
        }
    }
}

/**
 * Like Promise.all but with more verbose error handling for debugging.
 */
function awaitPromises(promises, timeoutMS) {
    timeoutMS = timeoutMS || 5000;

    return new Promise((resolve, reject) => {
        let resolved = 0;
        let unresolved = _.range(0, promises.length);
        let results = new Array(promises.length);

        promises.forEach((promise, index) => {
            promise.then(result => {
                results[index] = result;
                unresolved = _.without(unresolved, index);
                resolved++;
                if (resolved === promises.length) resolve(results);
            }, error => {
                console.log(error);
                console.log(index);
            });
        });

        setTimeout(() => {
            if (resolved != promises.length) {
                console.log(`awaiting promises timeout after ${timeoutMS}ms`);
                console.log(`resolved ${resolved} of ${promises.length} promises`);
                console.log(`failed to resolve promises at indexes ${unresolved.join(', ')}`);
                reject();
            }
        }, timeoutMS);
    });
}

module.exports = SearchController;
