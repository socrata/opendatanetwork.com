'use strict';
const API = require('./api');
const Questions = require('../../controllers/questions');
const Data = require('../../controllers/data');
const Navigate = require('../../controllers/navigate');
const Constants = require('../../controllers/constants');
const Relatives = require('../../controllers/relatives');

const SrcConstants = require('../src/constants');
const MapSources = require('../src/data/map-sources');
const MapDescription = require('../src/maps/description');

const EntityFormatter = require('../lib/entity-formatter');
const SearchHelper = require('../lib/search-helper');
const DatasetHelper = require('../lib/dataset-helper');
const DataHelper = require('../lib/data-helper');
const ParamsHelper = require('../lib/params-helper');
const PagesController = require('./pages-controller');

const DatasetConfig = require('../src/dataset-config');
const quickLinksCount = 15;
const refineByCount = 5;

const defaultMetaSummary = 'Find the data you need to power your business, app, or analysis from across the open data ecosystem.';
const _ = require('lodash');
const htmlencode = require('htmlencode').htmlEncode;
const moment = require('moment');
const numeral = require('numeral');

class SearchController {
    static search(req, res) {
        ParamsHelper.parameters(req, res).then(params => {
            try {
                SearchController._search(req, res, params);
            } catch (error) {
                PagesController.error(req, res)(error);
            }
        }, PagesController.error(req, res));
    }

    static searchResults(req, res) {
        ParamsHelper.parameters(req, res).then(params => {
            API.datasets(params).then(searchResults => {
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
                        PagesController.error(req, res)(error);
                    }
                }
            }, PagesController.error(req, res));
        }, PagesController.error(req, res));
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
                RenderController._search(req, res, params);
            } catch (error) {
                PagesController.error(req, res)(error);
            }
        }, PagesController.error(req, res));
    }

    static _search(req, res, params) {
        if (params.regions.length > 0) {
            SearchController._regions(req, res, params);
        } else {
            const categoriesPromise = API.categories();
            const tagsPromise = API.tags();
            const domainsPromise = API.domains();
            const datasetsPromise = API.datasets(params);
            const searchPromise = API.searchDatasetsURL(params);
            const locationsPromise = API.locations();
            const searchResultsRegionsPromise = API.searchResultsRegions(params.q);
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
                    }
                    else {
                        searchResultsRegions = data[6];
                        searchResultsRegions.forEach(region => {
                            region.regionType = SrcConstants.REGION_NAMES[region.type] || '';
                        });
                    }

                    const templateParams = {
                        params,
                        hasRegions: params.regions.length > 0,
                        title: EntityFormatter.searchPageTitle(params),
                        metaSummary : defaultMetaSummary,
                        searchResultsRegions : searchResultsRegions,
                        css: [
                            '/styles/search.css',
                            '/styles/main.css'
                        ],
                        scripts: [
                            '//cdnjs.cloudflare.com/ajax/libs/numeral.js/1.4.5/numeral.min.js',
                            '//www.google.com/jsapi?autoload={"modules":[{"name":"visualization","version":"1","packages":["corechart", "table"]}]}',
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
                        templateParams.currentCategory = API.currentCategory(params, data[0]);
                        templateParams.currentTag = API.currentTag(params, data[1]);
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
                    PagesController.error(req, res)(error);
                }
            }, PagesController.error(req, res));
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
            }).slice(0, Constants.N_RELATIVES).map(region => {
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
        const categoriesPromise = API.categories(quickLinksCount);
        const tagsPromise = API.tags();
        const domainsPromise = API.domains(quickLinksCount);
        const searchDatasetPromise = API.searchDataset(params);
        const descriptionPromise = MapDescription.summarizeFromParams(params);
        const searchPromise = API.searchDatasetsURL(params);
        const locationsPromise = API.locations();
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

                // Get the constraints
                //
                Data.getDataConstraint(params.regions, variable, constraintName).then(dataConstraints => {

                    dataConstraints.permutations = _.sortByOrder(dataConstraints.permutations, ['constraint_value'], ['desc']);

                    const constraint = DataHelper.getConstraintByValueOrDefault(dataConstraints.permutations, params.year);

                    const templateParams = {
                        topics,
                        topic,
                        datasets,
                        dataset,
                        datasetConfig,
                        variable,
                        constraint,
                        params,
                        metric,
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
                            templateParams.currentCategory = API.currentCategory(params, data[3]);
                        }

                        if (data[4].length > 0) {
                            templateParams.currentTag = API.currentTag(params, data[4]);
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

                }, PagesController.error(req, res));

            } catch (error) {
                PagesController.error(req, res)(error);
            }
        }, PagesController.error(req, res));
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
