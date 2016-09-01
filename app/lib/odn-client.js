'use strict';

/**
 * Client for the ODN Backend API.
 *
 * API documentation available here: http://docs.odn.apiary.io/
 */

const _ = require('lodash');

const Constants = require('../../src/constants');
const Request = require('./request');

class ODNClient {
    /**
     * url - base url including protocol and port with no path
     *  e.g. https://api.opendatanetwork.com or http://localhost:3001
     */
    constructor(url, appToken) {
        this.url = url;
        this.appToken = appToken;
    }

    /**
     * Get a list of entities given a list of entity IDs.
     */
    entities(entityIDs) {
        return this.get('entity/v1', forEntities(entityIDs)).then(response => {
            const entities = response.entities;
            if (entities.length !== entityIDs.length)
                return Promise.reject(`entities not found: ${entityIDs.join(', ')}`);
           return Promise.resolve(entities);
        });
    }

    /**
     * Get available data for the given entities.
     */
    availableData(entityIDs) {
        return this.get('data/v1/availability', forEntities(entityIDs))
            .then(response => Promise.resolve(response.topics));
    }

    /**
     * Get available constraint options.
     *  - entityIDs: list of entity IDs
     *  - variableID: full variable ID e.g. demographics.population.count
     *  - constraint: name of the target constraint e.g. year
     *  - fixed: mapping of fixed constraints e.g. {year: 2013}
     *
     * Returns: list of constraint options e.g. ['2010', '2011']
     */
    constraints(entityIDs, variableID, constraint, fixed) {
        return this.get(`data/v1/constraint/${variableID}`, _.extend({
            constraint
        }, forEntities(entityIDs), _.omit(fixed, constraint))).then(response => {
            return response.permutations.map(_.property('constraint_value'));
        });
    }

    /**
     * Get entities related to the given entity.
     *
     * Relation must be one of parent, child, sibling, or peer.
     */
    related(entityID, relation) {
        return this.get(`entity/v1/${relation}`, {entity_id: entityID})
            .then(response => Promise.resolve({[relation]: response.relatives}));
    }

    values(entityIDs, variableID, constraints, describe, forecast, format) {
        constraints = constraints || {};
        console.log(describe);

        return this.get('data/v1/values', _.extend({
            describe,
            forecast,
            format,
            variable: variableID
        }, forEntities(entityIDs), constraints));
    }

    get(relativePath, clientParams) {
        const path = `${this.url}/${relativePath}`;
        const params = _.extend({app_token: this.appToken}, clientParams);
        const url = Request.buildURL(path, params);
        console.log(url);
        return Request.getJSON(url);
    }
}

function forEntities(entityIDs) {
    return {entity_id: entityIDs.join(',')};
}

module.exports = new ODNClient(Constants.ODN_API_BASE_URL, Constants.APP_TOKEN);

