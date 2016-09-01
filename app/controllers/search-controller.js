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
const MapSources = require('../../src/data/map-sources');
const MapDescription = require('../../src/maps/description');
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

    static _regions(req, res, params) {
        const uids = params.regions.map(region => region.id);
        const vector = ((params.vector || '') === '') ? 'population' : params.vector;

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

        function processRegions(regions) {
            return regions.filter(region => {
                return !_.contains(uids, region.id);
            }).slice(0, ControllerConstants.N_RELATIVES).map(region => {
                const navigateURL = Navigate.url(_.extend({}, params, {regions: [region]}));
                const addURL = Navigate.url(_.extend({}, params, {regions: params.regions.concat([region])}));
                return _.extend({}, region, {addURL, navigateURL});
            });
        }

        function getDataset(data, vector) {
            for (var topicKey in data.topics) {
                var topic = data.topics[topicKey];
                if (topic.datasets[vector])
                    return topic.datasets[vector];
            }
            return null;
        }

        // Topics (demographics, economy, education... top-level tabs)
        //
        const topics = _.toArray(params.dataAvailability.topics).sort((a, b) => {
            return a.name.localeCompare(b.name);
        });

        topics.forEach(topic => {
            topic.selected = !_.isUndefined(topic.datasets[vector]);
        });

        const selectedTopics = _.filter(topics, topic => topic.selected);
        const topic = (selectedTopics.length > 0) ? selectedTopics[0] : topics[0];

        // Datasets (cost of living, gdp, consumption... first dropdown)
        //
        const datasets = _.toArray(topic.datasets).sort((a, b) => {
            return a.name.localeCompare(b.name);
        });

        datasets.forEach(dataset => {
            dataset.navigateUrl = Navigate.url({
                regions: params.regions,
                vector: dataset.id.split('.')[1],
            });
        });

        // Promises
        //
        const peersPromise = forRegion(Relatives.peers);
        const siblingsPromise = forRegion(Relatives.siblings);
        const childrenPromise = forRegion(Relatives.children);
        const categoriesPromise = Category.categories(quickLinksCount);
        const tagsPromise = Tag.tags();
        const domainsPromise = Category.domains(quickLinksCount);
        const searchDatasetPromise = Search.searchDataset(params);
        const descriptionPromise = MapDescription.summarizeFromParams(params);
        const searchPromise = Search.searchDatasetsURL(params);
        const locationsPromise = Place.locations();
        const questionsPromise = Questions.getQuestionsForRegionsAndDataAvailibility(params.regions, params.dataAvailability);
        const parentsPromise = forRegion(Relatives.parents);
        const allPromises = [peersPromise, siblingsPromise, childrenPromise,
            categoriesPromise, tagsPromise, domainsPromise,
            searchDatasetPromise, descriptionPromise, searchPromise,
            locationsPromise, questionsPromise, parentsPromise];

        const allPromise = awaitPromises(allPromises);

        allPromise.then(data => {
            try {
                const mapSource = MapSources[vector] || {};

                const metrics = mapSource.variables || [];
                const metric = _.find(metrics, metric => metric.metric === params.metric) || metrics[0] || {};

                const dataset = DatasetHelper.getDataset(params.dataAvailability, vector);
                const datasetConfig = DatasetConfig[dataset.id];

                const variablesArray = _.values(dataset.variables);
                const variable = DatasetHelper.getVariableByIdOrDefault(variablesArray, params.metric); // metric is variable id
                const constraintName = dataset.constraints[0];

                const constraints = dataset.constraints;
                const fixed = _.pick(req.query, constraints);
                Data.getConstraints(params.regions, variable, constraints, fixed).then(constraintData => {
                    params.constraints = _.object(constraintData.map(constraint => {
                        return [constraint.name, constraint.selected];
                    }));

                    constraintData = Data.addConstraintURLs(params, req.query, constraintData);
                    const variables = Data.addVariableURLs(params, req.query, dataset.variables);
                    const constraint = _.first(constraintData);

                    const templateParams = {
                        GlobalConstants,
                        topics,
                        topic,
                        datasets,
                        dataset,
                        datasetConfig,
                        variable,
                        variables,
                        constraint,
                        constraintData,
                        params,
                        metric,
                        query: req.query,
                        hasRegions: params.regions.length > 0,
                        regionNames: EntityFormatter.wordJoin(params.regions.map(region => region.name), 'or'),
                        title: EntityFormatter.searchPageTitle(params, dataset, metric),
                        css: [
                            '/styles/third-party/leaflet.min.css',
                            '/styles/third-party/leaflet-markercluster.min.css',
                            '/styles/third-party/leaflet-markercluster-default.min.css',
                            '/styles/search.css',
                            '/styles/maps.css',
                            '/styles/main.css'
                        ],
                        scripts: [
                            '//cdnjs.cloudflare.com/ajax/libs/numeral.js/1.4.5/numeral.min.js',
                            '//www.google.com/jsapi?autoload={"modules":[{"name":"visualization","version":"1","packages":["corechart", "table"]}]}',
                            '//cdn.socket.io/socket.io-1.4.5.js',
                            '/lib/third-party/leaflet/leaflet.min.js',
                            '/lib/third-party/leaflet/leaflet-omnivore.min.js',
                            '/lib/third-party/leaflet/leaflet-markercluster.min.js',
                            '/lib/third-party/colorbrewer.min.js',
                            '/lib/third-party/d3.min.js',
                            '/lib/third-party/d3.promise.min.js',
                            '/lib/third-party/js.cookie-2.1.1.min.js',
                            '/lib/third-party/leaflet-omnivore.min.js',
                            '/lib/third-party/lodash.min.js',
                            '/lib/search.min.js'
                        ]
                    };

                    if (data && (data.length == allPromises.length)) {

                        const peersResponse = data[0];
                        if (peersResponse && peersResponse.relatives && (peersResponse.relatives.length > 0)) {
                            templateParams.peers = processRegions(peersResponse.relatives[0].entities);
                        }

                        const siblingsResponse = data[1];
                        if (siblingsResponse && siblingsResponse.relatives && (siblingsResponse.relatives.length > 0)) {
                            templateParams.siblings = processRegions(siblingsResponse.relatives[0].entities);
                        }

                        const parentsResponse = data[11];
                        if (parentsResponse && parentsResponse.relatives && (parentsResponse.relatives.length > 0)) {
                            templateParams.parentRegion = processRegions(parentsResponse.relatives[0].entities)[0];
                        }

                        const childrenResponse = data[2];
                        if (childrenResponse && childrenResponse.relatives) {
                            childrenResponse.relatives.forEach(relative => {
                                relative.entities = processRegions(relative.entities);
                            });

                            templateParams.allChildren = childrenResponse;
                        }

                        if (data[3].length > 0) {
                            templateParams.categories = data[3];
                            templateParams.currentCategory = Category.currentCategory(params, data[3]);
                        }

                        if (data[4].length > 0) {
                            templateParams.currentTag = Tag.currentTag(params, data[4]);
                        }

                        templateParams.searchResults = data[6];
                        templateParams.mapSummary = data[7][0];
                        templateParams.metaSummary = data[7][1];
                        templateParams.mapVariables = MapDescription.variablesFromParams(params);
                        templateParams.searchDatasetsURL = data[8];

                        templateParams.quickLinks = {
                            categories : data[3],
                            domains : data[5].results,
                            ref : 'rp',
                            regions : data[9].slice(0, quickLinksCount),
                        };

                        templateParams.refinePopupCollapsed = (req.query.question === '1') || (req.cookies.refinePopupCollapsed === '1');

                        templateParams.questions = data[10];
                    }

                    res.render('search.ejs', templateParams);

                }, ErrorHandler.error(req, res));

            } catch (error) {
                ErrorHandler.error(req, res)(error);
            }
        }, ErrorHandler.error(req, res));
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
