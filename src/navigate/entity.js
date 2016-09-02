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
        this.entityIDs = this.entities.map(_.property('id'));
        this.entityNames = this.entities.map(_.property('name'));
        this.variableID = variableID || 'demographics';
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
        return new EntityNavigate(this.entities, this.variableID, _.extend({}, this.query, {[name]: value}));
    }

    url() {
        const ids = this.entityIDs.join('-');
        const names = this.entityNames.map(clean).join('-');
        const path = `/entity/${ids}/${names}/${this.variableID}`;
        return buildURL(path, this.query);
    }
}

function clean(string) {
    return string
        .replace(/[\s-\/]/g, '_')
        .replace(/\W/g, '');
}

if (typeof module !== 'undefined') module.exports = EntityNavigate;

