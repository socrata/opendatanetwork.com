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
    var GlobalConfig = require('../config');
    var EntityNavigate = require('../navigate/entity');
}

class ODNClient {
    /**
     * url - base url including protocol and port with no path
     *  e.g. https://api.opendatanetwork.com or http://localhost:3001
     */
    constructor(url, appToken) {
        this.baseURL = url;
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
        return getJSON(this.url('entity/v1', {entity_id: entityID})).then(response => {
            const entities = response.entities;
            if (entities.length !== 1) {
                const error = new Error(`entity not found with id: '${entityID}'`);
                error.statusCode = 404;
                return Promise.reject(error);
            }

           return Promise.resolve(entities[0]);
        });
    }

    entitiesByType(entityType) {
        return getJSON(this.url('entity/v1', {entity_type: entityType}))
            .then(response => Promise.resolve(response.entities));
    }

    /**
     * Get entities related to the given entity.
     *
     * Relation must be one of parent, child, sibling, or peer.
     */
    related(entityID, relation, limit, variableID) {
        return getJSON(this.relatedURL.apply(this, arguments))
            .then(response => Promise.resolve({[relation]: response.relatives}));
    }

    relatedURL(entityID, relation, limit, variableID) {
        return this.url(`entity/v1/${relation}`, {
            limit,
            entity_id: entityID,
            variable_id: variableID
        });
    }

    /**
     * Get available data for the given entities.
     */
    availableData(entityIDs) {
        return getJSON(this.availableDataURL.apply(this, arguments))
            .then(response => Promise.resolve(response.topics));
    }

    availableDataURL(entityIDs) {
        return this.url('data/v1/availability', forEntities(entityIDs));
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
        return getJSON(this.constraintsURL.apply(this, arguments)).then(response => {
            return response.permutations.map(_.property('constraint_value'));
        });
    }

    constraintsURL(entityIDs, variableID, constraint, fixed) {
        return this.url(`data/v1/constraint/${variableID}`, _.extend({
            constraint
        }, forEntities(entityIDs), _.omit(fixed, constraint)));
    }

    /**
     * Get values for the given variable and entities.
     */
    values(entityIDs, variableID, constraints, describe, forecast, format) {
        return getJSON(this.valuesURL.apply(this, arguments));
    }

    valuesURL(entityIDs, variableID, constraints, describe, forecast, format) {
        constraints = constraints || {};

        return this.url('data/v1/values', _.extend({
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
        return getJSON(this.searchDatasetsURL.apply(this, arguments))
            .then(response => Promise.resolve(response.datasets));
    }


    searchDatasetsURL(entityIDs, datasetID, limit, offset) {
        return this.searchURL('search/v1/dataset', entityIDs, datasetID, limit, offset);
    }

    /**
     * Search for questions relating to the given query.
     */
    searchQuestions(query, limit, offset) {
        if (_.isEmpty(query)) return Promise.resolve([]);

        return getJSON(this.searchQuestionsURL.apply(this, arguments)).then(response => {
            return Promise.resolve(response.questions);
        });
    }

    searchQuestionsURL(query, limit, offset) {
        return this.url('search/v1/question', {
            query,
            limit,
            offset
        });
    }

    /**
     * Search for entities with the given name.
     */
    searchEntities(name) {
        return getJSON(this.searchEntitiesURL.apply(this, arguments))
            .then(response => Promise.resolve(response.entities));
    }

    searchEntitiesURL(name) {
        return this.url('entity/v1', {entity_name: name});
    }

    newMap(entityIDs, variableID, constraints) {
        return getJSON(this.newMapURL.apply(this, arguments));
    }

    newMapURL(entityIDs, variableID, constraints) {
        return this.url('data/v1/map/new', _.assign({
            variable: variableID,
        }, forEntities(entityIDs), constraints));
    }

    suggest(type, query, limit, params) {
        if (query === '') return Promise.resolve([]);

        return getJSON(this.suggestURL.apply(this, arguments)).then(response => {
            return Promise.resolve(response.options);
        });
    }

    suggestURL(type, query, limit, params) {
        limit = limit || 10;
        params = params || {};

        return this.url(`suggest/v1/${type}`, _.extend({
            query,
            limit
        }, params));
    }

    url(relativePath, clientParams) {
        const path = `${this.baseURL}/${relativePath}`;
        const params = _.extend({app_token: this.appToken}, clientParams);
        return buildURL(path, params);
    }

    searchURL(path, entityIDs, datasetID, limit, offset) {
        limit = limit || 10;
        offset = offset || 0;

        const params = _.extend({
            limit,
            offset,
            dataset_id: datasetID
        }, forEntities(entityIDs));

        return this.url(path, params);
    }
}

function forEntities(entityIDs) {
    return {entity_id: entityIDs.join(',')};
}

var odn = new ODNClient(GlobalConfig.odn_api.base, GlobalConfig.app_token);

if (typeof module !== 'undefined') module.exports = odn;

