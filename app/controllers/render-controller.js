'use strict';

const API = require('./api');
const Data = require('./data');
const Relatives = require('./relatives');
const Constants = require('./constants');
const Request = require('./request');
const Navigate = require('./navigate');
const Questions = require('./questions');

const MapDescription = require('../src/maps/description');
const MapSources = require('../src/data/map-sources');
const SrcConstants = require('../src/constants');
const DatasetConfig = require('../src/dataset-config');

const EntityFormatter = require('../lib/entity-formatter');

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
                categories: EntityFormatter.asArray(query.categories),
                domains: EntityFormatter.asArray(query.domains),
                group: req.params.group || '',
                limit: defaultSearchResultCount,
                metric: req.params.metric || '',
                offset: (page - 1) * defaultSearchResultCount,
                only: 'datasets',
                page: page,
                q: query.q || '',
                regions: [],
                resetRegions: false,
                tags: EntityFormatter.asArray(query.tags),
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
                        Data.getDataAvailability(params.regions).then(data => {
                            params.dataAvailability = data;
                            resolve(params);
                        });
                    }
                }, reject);
            } else {
                resolve(params);
            }
        });
    }
}
module.exports = RenderController;
