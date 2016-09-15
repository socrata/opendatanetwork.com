'use strict';

/**
 * Navigate to entity pages.
 */

if (typeof require !== 'undefined') {
    var _ = require('lodash');
    var buildURL = require('../odn-client/build-url');
}

class EntityNavigate {
    constructor(entities, variableID, query) {
        this.entities = entities || [];
        this.entityIDs = this.entities
            .map(_.property('id'));
        this.entityNames = this.entities
            .map(_.property('name'))
            .filter(_.negate(_.isEmpty));
        this.variableID = variableID;
        this.query = query || {};
    }

    to(entity) {
        return new EntityNavigate([entity], this.variableID, this.query);
    }

    add(entity) {
        if (_.includes(this.entityIDs, entity.id)) return this;
        return new EntityNavigate([entity].concat(this.entities), this.variableID, this.query);
    }

    remove(entity) {
        const entities = this.entities.filter(other => other.id !== entity.id);
        return new EntityNavigate(entities, this.variableID, this.query);
    }

    clearVariable() {
        return new EntityNavigate(this.entities);
    }

    topic(topicID) {
        return this.variable(topicID);
    }

    dataset(datasetID) {
        return this.variable(datasetID);
    }

    variable(variableID) {
        return new EntityNavigate(this.entities, variableID, {});
    }

    constraint(name, value) {
        return new EntityNavigate(this.entities, this.variableID,
            _.extend(_.omit(this.query, 'ref'), {[name]: clean(value).toLowerCase()}));
    }

    ref(ref) {
        return new EntityNavigate(this.entities, this.variableID,
            _.extend({}, this.query, {ref}));
    }

    url() {
        const path = buildPath(['/entity', this.getIDs(), this.getNames(), this.variableID]);
        return buildURL(path, this.query);
    }

    regionURL(vector, metric) {
        return buildPath(['/region', this.getIDs(), this.getNames(), vector, metric]);
    }

    getIDs() {
        return this.entityIDs.join('-');
    }

    getNames() {
        return this.entityNames.map(clean).join('-');
    }
}

function clean(string) {
    if (_.isEmpty(string)) return '';

    return string
        .replace(/[\s-\/]/g, '_')
        .replace(/_+/g, '_')
        .replace(/\W/g, '');
}

function buildPath(parts) {
    return parts
        .filter(_.negate(_.isEmpty))
        .join('/');
}

if (typeof module !== 'undefined') module.exports = EntityNavigate;

