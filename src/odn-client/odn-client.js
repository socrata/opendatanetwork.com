'use strict';

/**
 * Client for the ODN Backend API.
 *
 * API documentation available here: http://docs.odn.apiary.io/
 */

if (typeof require !== 'undefined') {
    var _ = require('lodash');
    var buildURL = require('./build-url');
    var getJSON = require('./get-json');
    var Constants = require('../constants');
}

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
        return Promise.all(entityIDs.map(entityID => this.entity(entityID)));
    }

    /**
     * Find an entity from its ID.
     */
    entity(entityID) {
        return this.get('entity/v1', {entity_id: entityID}).then(response => {
            const entities = response.entities;
            if (entities.length !== 1)
                return Promise.reject(new Error(`entity not found with id: '${entityID}'`));
           return Promise.resolve(entities[0]);
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
     * Get values for the given variable and entities.
     */
    values(entityIDs, variableID, constraints, describe, forecast, format) {
        constraints = constraints || {};

        return this.get('data/v1/values', _.extend({
            describe,
            forecast,
            format,
            variable: variableID
        }, forEntities(entityIDs), constraints));
    }

    /**
     * Search for datasets relating to the given entities and dataset.
     */
    searchDatasets(entityIDs, datasetID, limit, offset) {
        return this.search('search/v1/dataset', entityIDs, datasetID, limit, offset)
            .then(response => Promise.resolve(response.datasets));
    }

    /**
     * Search for questions relating to the given entities and dataset.
     */
    searchQuestions(entityIDs, datasetID, limit, offset) {
        return this.search('search/v1/question', entityIDs, datasetID, limit, offset)
            .then(response => Promise.resolve(response.questions));
    }

    /**
     * Search for entities with the given name.
     */
    searchEntities(name) {
        return this.get('entity/v1', {entity_name: name})
            .then(response => Promise.resolve(response.entities));
    }

    get(relativePath, clientParams) {
        const path = `${this.url}/${relativePath}`;
        const params = _.extend({app_token: this.appToken}, clientParams);
        const url = buildURL(path, params);
        return getJSON(url);
    }

    search(path, entityIDs, datasetID, limit, offset) {
        limit = limit || 10;
        offset = offset || 0;

        const params = _.extend({
            limit,
            offset,
            dataset_id: datasetID
        }, forEntities(entityIDs));

        return this.get(path, params);
    }
}

function forEntities(entityIDs) {
    return {entity_id: entityIDs.join(',')};
}

if (typeof module !== 'undefined')
    module.exports = new ODNClient(Constants.ODN_API_BASE_URL, Constants.APP_TOKEN);

