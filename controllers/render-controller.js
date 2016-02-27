'use strict';

const API = require('./api');
const Relatives = require('./relatives');
const Constants = require('./constants');
const Request = require('./request');
const Navigate = require('./navigate');

const MapDescription = require('../src/maps/description');
const MapSources = require('../src/data/map-sources');
const Sources = require('../src/data/data-sources');

const _ = require('lodash');
const htmlencode = require('htmlencode').htmlEncode;
const moment = require('moment');
const numeral = require('numeral');
const path = require('path');
const defaultMetaSummary = 'Find the data you need to power your business, app, or analysis from across the open data ecosystem.';

const defaultSearchResultCount = 10;

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

            const schemasPromise = API.standardSchemas(id);
            const paramsPromise = RenderController._parameters(req, res);

            var rg = [schemasPromise, paramsPromise];

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

                    if (data.length == 3)
                        oldDataset = data[2];
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
                        css : [
                            '/styles/dataset.css'
                        ],
                        scripts : [
                            '/lib/third-party/jquery.dotdotdot.min.js',
                            '/lib/third-party/lodash.min.js',
                            '/lib/third-party/d3.min.js',
                            '/lib/third-party/d3.promise.min.js',
                            '/lib/dataset.min.js'
                        ]
                    };

                    res.render('dataset.ejs', templateParams);
                } catch (error) {
                    RenderController.error(req, res)(error);
                }
            }, RenderController.error(req, res, 404, 'Dataset not found'));
        });
    }

    static home(req, res) {
        const categoriesPromise = API.categories();
        const locationsPromise = API.locations();
        const paramsPromise = RenderController._parameters(req, res);
        const allPromise = Promise.all([categoriesPromise, locationsPromise, paramsPromise]);

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

        if (vector === '' || Sources.has(vector)) {
            RenderController._parameters(req, res).then(params => {
                const regions = params.regions;

                if (!Sources.supportsVector(vector, regions)) {
                    RenderController.error(req, res, 404, `"${vector}" data not available for ${regions.map(region => region.name).join(' and ')}`)();
                } else {
                    try {
                        RenderController._search(req, res, params);
                    } catch (error) {
                        RenderController.error(req, res)(error);
                    }
                }
            }, RenderController.error(req, res));
        } else {
            RenderController.error(req, res, 404, `Vector "${vector}" not found`)();
        }
    }

    static _search(req, res, params) {
        if (params.regions.length > 0) {
            RenderController._regions(req, res, params);
        } else {
            const categoriesPromise = API.categories(5);
            const tagsPromise = API.tags();
            const domainsPromise = API.domains(5);
            const datasetsPromise = API.datasets(params);
            const searchPromise = API.searchDatasetsURL(params);
            const allPromises = [categoriesPromise, tagsPromise,
                                 domainsPromise, datasetsPromise,
                                 searchPromise];
            const allPromise = Promise.all(allPromises);

            allPromise.then(data => {
                try {
                    const templateParams = {
                        params,
                        hasRegions: params.regions.length > 0,
                        searchPath: req.path,
                        title: searchPageTitle(params),
                        metaSummary : defaultMetaSummary,
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
                            '/lib/third-party/leaflet-omnivore.min.js',
                            '/lib/third-party/lodash.min.js',
                            '/lib/search.min.js'
                        ]
                    };

                    if (data && data.length == allPromises.length) {
                        templateParams.categories = data[0];
                        templateParams.currentCategory = API.currentCategory(params, data[0]);
                        templateParams.currentTag = API.currentTag(params, data[1]);
                        templateParams.domainResults = data[2];
                        templateParams.searchResults = data[3];
                        templateParams.searchDatasetsURL = data[4];
                    }

                    res.render('search.ejs', templateParams);
                } catch (error) {
                    RenderController.error(req, res)(error);
                }
            }, RenderController.error(req, res));
        }
    }

    static _regions(req, res, params) {
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

        function processRegions(regions) {
            return regions.filter(region => {
                return !_.contains(uids, region.id);
            }).slice(0, Constants.N_RELATIVES).map(region => {
                const navigateURL = Navigate.region(region);
                const addURL = Navigate.url(_.extend({}, params, {regions: params.regions.concat([region])}));
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
        const descriptionPromise = MapDescription.summarizeFromParams(params);
        const searchPromise = API.searchDatasetsURL(params);
        const allPromises = [peersPromise, siblingsPromise, childrenPromise,
                             categoriesPromise, tagsPromise, domainsPromise,
                             datasetsPromise, descriptionPromise, searchPromise];
        const allPromise = Promise.all(allPromises);

        allPromise.then(data => {
            try {
                const vector = ((params.vector || '') === '') ? 'population' : params.vector;

                const groups = Sources.groups(params.regions).slice(0).map(group => {
                    return _.extend({}, group, {
                        selected: _.contains(group.datasets.map(dataset => dataset.vector), vector),
                        datasets: Sources.sources(group, params.regions)
                    });
                });
                const group = Sources.group(vector);

                const sources = Sources.sources(group, params.regions);
                const source = _.extend({}, Sources.source(vector), {
                    datasetURL: (vector.datalensFXF ?
                        `https://${vector.domain}/view/${vector.datalensFXF}` :
                        `https://${vector.domain}/dataset/${vector.fxf}`),
                    apiURL: `https://dev.socrata.com/foundry/${vector.domain}/${vector.fxf}`
                });

                const mapSource = MapSources[vector];

                const metrics = mapSource.variables;
                const metric = _.find(metrics, metric => metric.column === params.metric) || 'population';

                const years = metric.years;
                const year = _.find(years, year => parseFloat(year) === parseFloat(params.year)) || '2013';

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
                    title: searchPageTitle(params, source),
                    css: [
                        '/styles/third-party/leaflet.min.css',
                        '/styles/search.css',
                        '/styles/maps.css',
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

                    templateParams.domainResults = data[5];
                    templateParams.searchResults = data[6];

                    templateParams.mapSummary = data[7][0];
                    templateParams.metaSummary = data[7][1];
                    templateParams.mapVariables = MapDescription.variablesFromParams(params);

                    templateParams.searchDatasetsURL = data[8];
                }

                if (templateParams.mapSummary === '') {
                    params.vector = 'population';
                    RenderController._regions(req, res, params);
                } else {
                    res.render('search.ejs', templateParams);
                }
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

                        res.render('_search-results-regular.ejs', templateParams);
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

function searchPageTitle(params, dataset) {
    const categories = params.categories.map(capitalize);
    const tags = params.tags.map(capitalize);
    const dataTypes = _.flatten((dataset ? [dataset.name] : []).concat(categories, tags));
    const dataDescription = wordJoin(dataTypes);

    const locationDescription = params.regions.length > 0 ?
        ` for ${wordJoin(params.regions.map(region => region.name))}` : '';

    return `${dataDescription} Data${locationDescription} on the Open Data Network`;
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
