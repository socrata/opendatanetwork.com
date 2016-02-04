'use strict';

const API = require('./api');
const ApiController = require('./api-controller');
const CategoryController = require('./category-controller');
const TagController = require('./tag-controller');
const Relatives = require('./relatives');
const Constants = require('./constants');
const Request = require('./request');
const Navigate = require('./navigate');

const MapDescription = require('../src/maps/description');
const Sources = require('../src/data/data-sources');

const _ = require('lodash');
const htmlencode = require('htmlencode').htmlEncode;
const moment = require('moment');
const numeral = require('numeral');
const path = require('path');

const apiController = new ApiController();
const categoryController = new CategoryController();
const tagController = new TagController();

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

        const datasetPromise = API.datasetSummary(domain, id);
        const schemasPromise = API.standardSchemas(id);
        const paramsPromise = RenderController._parameters(req, res);
        const allPromise = Promise.all([datasetPromise, schemasPromise, paramsPromise]);

        allPromise.then(data => {
            try {
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
                const params = data[2];

                const templateParams = {
                    params,
                    schemas,
                    searchPath : '/search',
                    title : dataset.name,
                    dataset : {
                        domain,
                        id,
                        descriptionHtml : htmlencode(dataset.description).replace('\n', '<br>'),
                        name : dataset.name,
                        tags : dataset.tags || [],
                        columns : dataset.columns,
                        updatedAtString : moment(new Date(dataset.viewLastModified * 1000)).format('D MMM YYYY')
                    },
                    css : [
                        '/styles/dataset.css'
                    ],
                    scripts : [
                        '/lib/third-party/lodash.min.js',
                        '/lib/third-party/d3.min.js',
                        '/lib/dataset.min.js'
                    ]
                };

                res.render('dataset.ejs', templateParams);
            } catch (error) {
                RenderController.error(req, res)(error);
            }
        }, RenderController.error(req, res, 404, 'Dataset not found'));
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
        });
    }

    static searchWithVector(req, res) {
        const vector = req.params.vector;

        if (vector === '' || Sources.has(vector)) {
            RenderController._parameters(req, res).then(params => {
                const regions = params.regions;

                if (!Sources.supportsVector(vector, regions)) {
                    // TODO make this work if data available for one region but not both
                    RenderController.error(req, res, 404, `"${vector}" data not available for ${regions[0].name}`)();
                } else {
                    try {
                        RenderController._search(req, res, params);
                    } catch (error) {
                        RenderController.error(req, res)(error);
                    }
                }
            });
        } else {
            RenderController.error(req, res, 404, `Vector "${vector}" not found`)();
        }
    }

    static _search(req, res, params) {
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
                const navigateURL = Navigate.region(region);
                const addURL = (new Navigate(params)).add(region);
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
        const tableDataPromise = API.tableData(params.vector, params.regions);
        const summaryPromise = MapDescription.summarizeFromParams(params);
        const allPromises = [peersPromise, siblingsPromise, childrenPromise,
                             categoriesPromise, tagsPromise, domainsPromise,
                             datasetsPromise, tableDataPromise, summaryPromise];
        const allPromise = Promise.all(allPromises);

        const searchDatasetsURL = API.searchDatasetsURL(params);

        allPromise.then(data => {
            try {
                const sources = Sources.forRegions(params.regions);
                const source = params.vector === '' ?
                    Sources.get('population') :
                    Sources.get(params.vector);

                const templateParams = {
                    params,
                    searchDatasetsURL,
                    sources,
                    source,
                    searchPath : req.path,
                    title : searchPageTitle(params),
                    css : [
                        '/styles/third-party/leaflet.min.css',
                        '/styles/search.css',
                        '/styles/maps.css',
                        '/styles/main.css'
                    ],
                    scripts : [
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
                        templateParams.currentCategory =
                            categoryController.getCurrentCategory(params, data[3]);
                    }

                    if (data[4].results.length > 0) {
                        templateParams.currentTag =
                            tagController.getCurrentTag(params, data[4]);
                    }

                    templateParams.domainResults = data[5];
                    templateParams.searchResults = data[6];

                    templateParams.tableData = data[7] || {};

                    templateParams.mapSummary = data[8];
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
                if (searchResults.length === 0) {
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

                        const template = params.regions.length === 0 ?
                            '_search-results-regular.ejs' :
                            '_search-results-compact.ejs';

                        res.render(template, templateParams);
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
            const page = isNaN(query.page) ? 1 : parseInt(query.page);

            const params = {
                categories: asArray(query.categories),
                domains: asArray(query.domains),
                tags: asArray(query.tags),
                limit: defaultSearchResultCount,
                metric: req.params.metric || '',
                offset: (page - 1) * defaultSearchResultCount,
                only: 'datasets',
                page: page,
                q: query.q || '',
                regions: [],
                resetRegions: false,
                vector: req.params.vector || '',
                year: req.params.year || ''
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
                });
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

function searchPageTitle(params) {
    const vector = capitalize(params.vector.replace(/_/g, ' '));
    const categories = params.categories.map(capitalize);
    const tags = params.tags.map(capitalize);
    const dataTypes = _.flatten([[vector], categories, tags]);
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

module.exports = RenderController;
