'use strict';

const _ = require('lodash');
const GlobalConstants = require("../src/constants");
const Querystring = require('querystring');
const Request = require('./request');
const Navigate = require('./navigate');


class ConstraintOptions {
    constructor(name, options, selected) {
        this.name = name;
        this.options = options;
        this.selected = selected;
    }
}

class Data {
    static getDataAvailability(regions) {
        const url = Request.buildURL(GlobalConstants.DATA_AVAILABILITY_URL, {
            app_token: GlobalConstants.APP_TOKEN,
            entity_id: regions.map(region => region.id).join(','),
        });

        return Request.getJSON(url);
    }

    static addConstraintURLs(params, query, constraintData) {
        constraintData.forEach(constraint => {
            constraint.options = constraint.options.map(option => {
                return {
                    name: option,
                    url: Navigate.url(params, _.extend({}, query, {[constraint.name]: option}))
                };
            });
        });

        return constraintData;
    }

    static addVariableURLs(params, query, variables) {
        return _.values(variables).map(variable => {
            return _.extend(variable, {
                url: Navigate.url(_.extend({}, params, {metric: variable.id}), query)
            });
        });
    }

    static getConstraints(entities, variable, constraints, fixed, results) {
        fixed = fixed || {};
        results = results || [];

        const constraint = _.first(constraints);
        return Data.constraints(entities, variable, constraint, fixed).then(options => {
            const selected = (constraint in fixed && _.includes(options, fixed[constraint])) ?
                fixed[constraint] : _.first(options);
            fixed[constraint] = selected;

            results.push({
                name: constraint,
                options,
                selected
            });

            if (constraints.length === 1)
                return Promise.resolve(results);
            return Data.getConstraints(entities, variable, _.tail(constraints), fixed, results);
        });
    }

    static constraints(entities, variable, constraint, fixed) {
        const path = GlobalConstants.DATA_CONSTRAINT_URL.format(variable.id);
        const params = _.extend({
            constraint,
            app_token: GlobalConstants.APP_TOKEN,
            entity_id: entities.map(_.property('id')).join(',')
        }, _.omit(fixed, constraint) || {});
        const url = Request.buildURL(path, params);
        return Request.getJSON(url)
            .then(json => json.permutations.map(_.property('constraint_value')));
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

        return url;
    }
}

module.exports = Data;
