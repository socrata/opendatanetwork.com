'use strict';

const API = require('./api');
const Relatives = require('./relatives');
const Constants = require('./constants');
const Request = require('./request');
const Navigate = require('./navigate');

const ForecastDescriptions = require('../src/forecast-descriptions');
const MapDescription = require('../src/maps/description');
const MapSources = require('../src/data/map-sources');
const Sources = require('../src/data/data-sources');
const SrcConstants = require('../src/constants');

const cookie = require('cookie');
const _ = require('lodash');
const htmlencode = require('htmlencode').htmlEncode;
const moment = require('moment');
const numeral = require('numeral');
const path = require('path');
const defaultMetaSummary = 'Find the data you need to power your business, app, or analysis from across the open data ecosystem.';

const defaultSearchResultCount = 10;
const quickLinksCount = 15;
const refineByCount = 5;

class RenderController {
    static categories(req, res) {
        API.categories().then(categories => {
            res.send(JSON.stringify(categories));
        });
    }

    static dataset(req, res) {
        const domain = req.params.domain;
        const id = req.params.id;

        // We can have a dataset that exists on the old backend or the new backend.  Unfortunately all the "sample values"
        // exist in the cachedContents nodes of the old backend dataset JSON.  Also we want the "view top 100" link to use the
        // new dataset.
        //
        const originalDatasetPromise = API.datasetSummary(domain, id);
        const datasetMigrationsPromise = API.datasetMigrations(domain, id);
        const promises = Promise.all([originalDatasetPromise, datasetMigrationsPromise]);

        promises.then(data => {
            const originalDataset = data[0];
            const migrations = data[1];

            var nbeId = null;
            var obeId = null;

            if (migrations.error) {
                if (originalDataset.newBackend)
                    nbeId = originalDataset.id;
                else
                    obeId = originalDataset.id;
            }
            else {
                nbeId = originalDataset.newBackend ? originalDataset.id : migrations.nbeId;
                obeId = originalDataset.newBackend ? migrations.obeId : originalDataset.id;
            }

            // Remaining promises
            //
            const schemasPromise = API.standardSchemas(id);
            const paramsPromise = RenderController._parameters(req, res);
            const categoriesPromise = API.categories(quickLinksCount);
            const domainsPromise = API.domains(quickLinksCount);
            const locationsPromise = API.locations();

            var rg = [schemasPromise, paramsPromise, categoriesPromise, domainsPromise, locationsPromise];

            // If we have a new backend dataset, fetch the old backend dataset to get cachedContents "sample values".
            //
            if ((originalDataset.newBackend) && obeId) {
                rg.push(API.datasetSummary(domain, obeId)); // old dataset
            }

            // Execute remaining promises
            //
            const allPromise = Promise.all(rg);

            allPromise.then(data => {

                try {
                    var oldDataset;

                    // If we add promises above, we need to keep these indices correct.
                    //
                    if (data.length == 6)
                        oldDataset = data[5];
                    else if (!originalDataset.newBackend)
                        oldDataset = originalDataset;
                    else
                        oldDataset = null;

                    const schemas = data[0].map(schema => {

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

                    const params = data[1];
                    const originalColumns = _.filter(originalDataset.columns, isNotComputedField);

                    if (oldDataset) {

                        const oldColumns = _.filter(oldDataset.columns, isNotComputedField);

                        // If the original columns do not have cacheContents, get the cached contents of the matching
                        // field name from the old dataset and attach it to the original column.
                        //
                        originalColumns.forEach(originalColumn => {

                            if (!originalColumn.cachedContents) {

                                var rg = _.filter(oldColumns, o => originalColumn.fieldName == o.fieldName);

                                if (rg.length > 0)
                                    originalColumn.cachedContents = rg[0].cachedContents;
                            }
                        });
                    }

                    const columnsWithDescriptions = _.filter(originalColumns, column => !_.isEmpty(column.description));
                    const hasDescriptions = (columnsWithDescriptions.length > 0);

                    const columnsWithSampleValues = _.filter(originalColumns, column => {
                        return column.cachedContents && column.cachedContents.top;
                    });
                    const hasSampleValues = (columnsWithSampleValues.length > 0);

                    const templateParams = {
                        params,
                        schemas,
                        searchPath : '/search',
                        title : originalDataset.name,
                        dataset : {
                            domain,
                            id,
                            descriptionHtml : htmlencode(originalDataset.description).replace('\n', '<br>'),
                            name : originalDataset.name,
                            tags : originalDataset.tags || [],
                            columns : originalColumns,
                            hasDescriptions,
                            hasSampleValues,
                            nbeId,
                            updatedAtString : moment(new Date(originalDataset.viewLastModified * 1000)).format('D MMM YYYY')
                        },
                        debugInfo : {
                            id,
                            nbeId,
                            obeId,
                            newBackend : originalDataset.newBackend,
                            migrationsError : migrations.error,
                        },
                        quickLinks : {
                            categories : data[2],
                            domains : data[3].results,
                            ref : 'dp',
                            regions : data[4].slice(0, quickLinksCount),
                        },
                        css : [
                            '/styles/dataset.css'
                        ],
                        scripts : [
                            '/lib/third-party/jquery.dotdotdot.min.js',
                            '/lib/third-party/lodash.min.js',
                            '/lib/third-party/d3.min.js',
                            '/lib/third-party/d3.promise.min.js',
                            '/lib/third-party/js.cookie-2.1.1.min.js',
                            '/lib/dataset.min.js'
                        ]
                    };

                    res.render('dataset.ejs', templateParams);
                } catch (error) {
                    RenderController.error(req, res)(error);
                }
            }, RenderController.error(req, res, 404, 'Dataset not found'));
        }, RenderController.error(req, res, 404, 'Dataset not found'));
    }

    static home(req, res) {
        const categoriesPromise = API.categories();
        const domainsPromise = API.domains(quickLinksCount);
        const locationsPromise = API.locations();
        const paramsPromise = RenderController._parameters(req, res);
        const allPromise = Promise.all([categoriesPromise, locationsPromise, paramsPromise, domainsPromise]);

        allPromise.then(data => {
            try {
                const categories = data[0];
                const locations = data[1];
                const params = data[2];

                const templateParams = {
                    categories,
                    locations,
                    params,
                    searchPath : '/search',
                    title : 'Open Data Network',
                    metaSummary : defaultMetaSummary,
                    quickLinks : {
                        categories : categories.slice(0, quickLinksCount),
                        domains : data[3].results,
                        ref : 'hp',
                        regions : locations.slice(0, quickLinksCount),
                    },
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
                        '/lib/third-party/d3.min.js',
                        '/lib/third-party/d3.promise.min.js',
                        '/lib/third-party/js.cookie-2.1.1.min.js',
                        '/lib/third-party/lodash.min.js',
                        '/lib/home.min.js'
                    ]
                };

                res.render('home.ejs', templateParams);
            } catch (error) {
                RenderController.error(req, res)(error);
            }
        }, RenderController.error(req, res));
    }

    static join(req, res) {
        res.locals.css = 'join.css';
        res.locals.title = 'Join the Open Data Network.';
        res.render('join.ejs');
    }

    static joinComplete(req, res) {
        res.locals.css = 'join-complete.css';
        res.locals.title = 'Thanks for joining the Open Data Network.';
        res.render('join-complete.ejs');
    }

    static search(req, res) {
        RenderController._parameters(req, res).then(params => {
            try {
                RenderController._search(req, res, params);
            } catch (error) {
                RenderController.error(req, res)(error);
            }
        }, RenderController.error(req, res));
    }

    static searchWithVector(req, res) {
        const vector = req.params.vector;

        function toDefaultVector() {
            const vector = Sources.defaultVector().vector;
            res.redirect(req.url.split('/').slice(0, 4).concat([vector]).join('/'));
        }

        if (vector === '' || Sources.has(vector)) {
            RenderController._parameters(req, res).then(params => {
                const regions = params.regions;

                if (!Sources.supportsVector(vector, regions)) {
                    toDefaultVector();
                } else {
                    try {
                        RenderController._search(req, res, params);
                    } catch (error) {
                        RenderController.error(req, res)(error);
                    }
                }
            }, RenderController.error(req, res));
        } else {
            toDefaultVector();
        }
    }

    static _search(req, res, params) {
        if (params.regions.length > 0) {
            RenderController._regions(req, res, params);
        } else {
            const categoriesPromise = API.categories(quickLinksCount);
            const tagsPromise = API.tags();
            const domainsPromise = API.domains(quickLinksCount);
            const datasetsPromise = API.datasets(params);
            const searchPromise = API.searchDatasetsURL(params);
            const locationsPromise = API.locations();
            const searchResultsRegionsPromise = API.searchResultsRegions(params.q);
            const allPromises = [categoriesPromise, tagsPromise,
                                 domainsPromise, datasetsPromise,
                                 searchPromise, locationsPromise,
                                 searchResultsRegionsPromise];
            const allPromise = Promise.all(allPromises);

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
                        searchPath: req.path,
                        title: searchPageTitle(params),
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
                            categories : data[0],
                            domains : data[2].results,
                            ref : 'sp',
                            regions : data[5].slice(0, quickLinksCount),
                        };

                        templateParams.refineBy = {
                            categories : data[0].slice(0, refineByCount),
                            domains : data[2].results.slice(0, refineByCount),
                        };
                    }

                    // If only one region result and no search results, just redirect to the region page.
                    //
                    if ((templateParams.searchResultsRegions.length == 1) &&
                        (templateParams.searchResults.results) &&
                        (templateParams.searchResults.results.length == 0)) {

                        const region = templateParams.searchResultsRegions[0];
                        const segment = this.regionToUrlSegment(region.name);

                        res.redirect(302, `/region/${region.id}/${segment}`);
                        return;
                    }

                    res.render('search.ejs', templateParams);
                } catch (error) {
                    RenderController.error(req, res)(error);
                }
            }, RenderController.error(req, res));
        }
    }

    static regionToUrlSegment(name) {
        return name.replace(/ /g, '_').replace(/\//g, '_').replace(/,/g, '');
    }

    static _regions(req, res, params) {
        const uids = params.regions.map(region => region.id);
        const vector = ((params.vector || '') === '') ? 'population' : params.vector;

        function forRegion(regionPromise, filterInvalid) {
            return new Promise(resolve => {
                if (params.regions.length === 0) {
                    resolve([]);
                } else {
                    regionPromise(params.regions[0]).then(result => {
                        if (!result) {
                            resolve([]);
                        } else {
                            if (filterInvalid) {
                                const source = Sources.source(vector);
                                Sources.validRegions(source, result).then(validRegions => {
                                    resolve(validRegions);
                                }, error => {
                                    console.error(error);
                                    resolve(result);
                                });
                            } else {
                                resolve(result);
                            }
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

        const _source = Sources.source(vector);
        const source = _.extend({}, _source, {
            datasetURL: (_source.datalensFXF ?
                `https://${_source.domain}/view/${_source.datalensFXF}` :
                `https://${_source.domain}/dataset/${_source.fxf}`),
            apiURL: `https://dev.socrata.com/foundry/${_source.domain}/${_source.fxf}`
        });

        const forecastDescriptions = new ForecastDescriptions(source);
        const forecastDescriptionsPromise = forecastDescriptions.getPromise(params.regions);

        const peersPromise = forRegion(Relatives.peers, true);
        const siblingsPromise = forRegion(Relatives.siblings);
        const childrenPromise = forRegion(Relatives.children);
        const categoriesPromise = API.categories(quickLinksCount);
        const tagsPromise = API.tags();
        const domainsPromise = API.domains(quickLinksCount);
        const datasetsPromise = API.datasets(params);
        const descriptionPromise = MapDescription.summarizeFromParams(params);
        const searchPromise = API.searchDatasetsURL(params);
        const locationsPromise = API.locations();
        const sourcesPromise = Sources.sourcesPromiseFromParams(params);
        const allPromises = [peersPromise, siblingsPromise, childrenPromise,
                             categoriesPromise, tagsPromise, domainsPromise,
                             datasetsPromise, descriptionPromise, searchPromise,
                             locationsPromise, forecastDescriptionsPromise,
                             sourcesPromise];


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

        const allPromise = awaitPromises(allPromises);

        allPromise.then(data => {
            try {
                const groups = Sources.groups(params.regions).slice(0).map(group => {
                    return _.extend({}, group, {
                        selected: _.contains(group.datasets.map(dataset => dataset.vector), vector),
                        datasets: Sources.sources(group, params.regions)
                    });
                });
                const group = Sources.group(vector);

                const sources = data[11].map(source => {
                    return _.extend({}, source, {
                        url: Navigate.url({
                            regions: params.regions,
                            vector: source.vector
                        })
                    });
                });

                const mapSource = MapSources[vector] || {};

                const metrics = mapSource.variables || [];
                const metric = _.find(metrics, metric => metric.metric === params.metric) || metrics[0] || {};

                const years = metric.years || [];
                const year = _.find(years, year => parseFloat(year) === parseFloat(params.year)) || years[0] || 2016;

                const templateParams = {
                    params,
                    vector,
                    sources,
                    source,
                    groups,
                    group,
                    year,
                    metric,
                    metrics,
                    years,
                    hasRegions: params.regions.length > 0,
                    regionNames: wordJoin(params.regions.map(region => region.name), 'or'),
                    searchPath: req.path,
                    title: searchPageTitle(params, source, metric),
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

                    templateParams.forecastDescriptions = data[10];

                    const cookieObject = cookie.parse(req.headers.cookie);
                    templateParams.refinePopupCollapsed = !!cookieObject.refinePopupCollapsed;
                }

                res.render('search.ejs', templateParams);
            } catch (error) {
                RenderController.error(req, res)(error);
            }
        }, RenderController.error(req, res));
    }

    static searchResults(req, res) {
        RenderController._parameters(req, res).then(params => {
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
                        RenderController.error(req, res)(error);
                    }
                }
            }, RenderController.error(req, res));
        }, RenderController.error(req, res));
    }

    static error(req, res, statusCode, title) {
        statusCode = statusCode || 500;
        title = title || 'Internal server error';

        return (error) => {
            const type = statusCode < 500 ? 'client' : 'server';
            const stack = error && error.stack ? `\n${error.stack}` : '';
            console.error(`at=error status=${statusCode} type=${type} path="${req.path}" ${stack}`);
            res.status(statusCode);
            res.render('error.ejs', {statusCode, title});
        };
    }

    static _parameters(req, res) {
        return new Promise((resolve, reject) => {
            const query = req.query;
            const page = isNaN(query.page) ? 0 : parseInt(query.page);

            const params = {
                categories: asArray(query.categories),
                domains: asArray(query.domains),
                group: req.params.group || '',
                limit: defaultSearchResultCount,
                metric: req.params.metric || '',
                offset: (page - 1) * defaultSearchResultCount,
                only: 'datasets',
                page: page,
                q: query.q || '',
                regions: [],
                resetRegions: false,
                tags: asArray(query.tags),
                vector: req.params.vector || '',
                year: req.params.year || '',
                debug: query.debug && query.debug == 'true'
            };

            if (req.params.regionIds && req.params.regionIds !== '') {
                const regionIds = req.params.regionIds.split('-');

                API.regions(regionIds).then(regions => {
                    const regionsById = _.object(regions.map(region => [region.id, region]));
                    params.regions = regionIds
                        .filter(id => id in regionsById)
                        .map(id => regionsById[id]);

                    if (params.regions.length === 0) {
                        RenderController.error(req, res, 404, `Region${regionIds.length > 1 ? 's' : ''} not found: ${regionIds.join(', ')}`)();
                    } else {
                        resolve(params);
                    }
                }, reject);
            } else {
                resolve(params);
            }
        });
    }
}

function asArray(parameter) {
    if (Array.isArray(parameter)) return parameter;
    if (parameter && parameter.length > 0) return [parameter];
    return [];
}

function searchPageTitle(params, source, metric) {
    const categories = params.categories.map(capitalize);
    const tags = params.tags.map(capitalize);
    const dataTypes = _.flatten((metric && metric.name ? [metric.name] : []).concat(categories, tags));
    const dataDescription = dataTypes.length > 0 ? wordJoin(dataTypes) : 'Data';

    const locationDescription = params.regions.length > 0 ?
        `for ${wordJoin(params.regions.map(region => region.name))}` : '';

    if (source && source.name.length > 0)
        return `${dataDescription} ${locationDescription} - ${source.name} on the Open Data Network`;
    else if (dataDescription)
        return `${dataDescription} on the Open Data Network`;
    else
        return `Open Data Network`;
}

function capitalize(string) {
    return string.replace(/(?:^|\s)\S/g, start => start.toUpperCase());
}

function wordJoin(list, separator) {
    if (list.length === 0) return '';
    if (list.length === 1) return list[0];
    separator = separator || 'and';
    return `${list.slice(0, list.length - 1).join(', ')} ${separator} ${list[list.length - 1]}`;
}

function isNotComputedField(column) {
    return !column.fieldName.match(':@computed_');
}

module.exports = RenderController;
