'use strict';

const _ = require('lodash');

const EntityFormatter = require('./entity-formatter');
const ErrorHandler = require('./error-handler');
const Data = require('./data');

const Place = require('../models/place');

// TODO: Should be extracted to constants
const defaultSearchResultCount = 10;

class ParamsHelper {
    static parameters(req, res) {

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

                Place.regions(regionIds).then(regions => {
                    const regionsById = _.object(regions.map(region => [region.id, region]));
                    params.regions = regionIds
                        .filter(id => id in regionsById)
                        .map(id => regionsById[id]);

                    if (params.regions.length === 0) {
                        ErrorHandler.error(req, res, 404, `Region${regionIds.length > 1 ? 's' : ''} not found: ${regionIds.join(', ')}`)();
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

module.exports = ParamsHelper;
