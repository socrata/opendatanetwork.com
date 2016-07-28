'use strict';

const _ = require('lodash');
const Constants = require('./constants');
const Request = require('./request');

class Data {

    static availability(regions) {
        return new Promise((resolve, reject) => {
            const url = Request.buildURL(Constants.DATA_AVAILABILITY_URL, {
                app_token: Constants.APP_TOKEN,
                entity_id: regions.map(region => region.id).join(','),
            });

            Request.getJSON(url).then(json => resolve(json), reject);
        });
    }

    static constraint(variable, regions, constraint) {
        return new Promise((resolve, reject) => {
            const url = Request.buildURL(Constants.DATA_AVAILABILITY_URL.format(variable), {
                app_token: Constants.APP_TOKEN,
                entity_id: regions.map(region => region.id).join(','),
                constraint: constraint,
            });

            Request.getJSON(url).then(json => resolve(json), reject);
        });
    }
}

module.exports = Data;
