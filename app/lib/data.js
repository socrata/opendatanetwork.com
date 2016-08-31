'use strict';

const _ = require('lodash');
const Querystring = require('querystring');

const Request = require('./request');
const Constants = require('./constants');
const GlobalConstants = require("../../src/constants");

class Data {

    static getDataAvailability(regions) {

        return new Promise((resolve, reject) => {

            const url = Request.buildURL(GlobalConstants.DATA_AVAILABILITY_URL, {
                app_token: GlobalConstants.APP_TOKEN,
                entity_id: regions.map(region => region.id).join(','),
            });

            Request.getJSON(url).then(json => resolve(json), reject);
        });
    }

    static getDataConstraint(regions, variable, constraint) {

        return new Promise((resolve, reject) => {

            const url = Request.buildURL(GlobalConstants.DATA_CONSTRAINT_URL.format(variable.id), {
                app_token: GlobalConstants.APP_TOKEN,
                entity_id: regions.map(region => region.id).join(','),
                constraint: constraint
            });

            Request.getJSON(url).then(json => resolve(json), reject);
        });
    }

    static getDataValues(regions, variable, constraint, forecast) {

       return new Promise((resolve, reject) => {

            const params = {
                app_token: GlobalConstants.APP_TOKEN,
                entity_id: regions.map(region => region.id).join(','),
                variable: variable
            };

            if (constraint)
                _.extend(params, constraint);

            if (forecast)
                params.forecast = forecast;

            const url = Data.buildUrl(GlobalConstants.DATA_VALUES_URL, params);
            Request.getJSON(url).then(json => resolve(json), reject);
        });
    }

    static buildUrl(path, params) {

        const validParams = _.omit(params, param => param == []);
        const paramString = Querystring.stringify(validParams);
        const url = `${path}${path[path.length - 1] == '?' ? '' : '?'}${paramString}`;

        console.log(url);
        
        return url;
    }
}

module.exports = Data;
