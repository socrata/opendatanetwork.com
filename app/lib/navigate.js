'use strict';

const _ = require('lodash');
const querystring = require('querystring');

class Navigate {
    constructor(entityIDs, variableID, query) {
        this.entityIDs = entityIDs || [];
        this.variableID = variableID || 'demographics';
        this.query = query || {};
    }

    to(entity) {
        return new Navigate([entity.id], this.variableID, this.query);
    }

    add(entity) {
        if (_.includes(this.entityIDs, entity.id)) return this;
        return new Navigate([entity.id].concat(this.entityIDs), this.variableID, this.query);
    }

    remove(entity) {
        const entities = this.entityIDs.filter(id => id !== entity.id);
        return new Navigate(entities, this.variableID, this.query);
    }

    topic(topicID) {
        return this.variable(topicID);
    }

    dataset(datasetID) {
        return this.variable(datasetID);
    }

    variable(variableID) {
        return new Navigate(this.entityIDs, variableID, {});
    }

    constraint(name, value) {
        return new Navigate(this.entityIDs, this.variableID, _.extend({[name]: value}, this.query));
    }

    url() {
        const path = `/entity/${this.entityIDs.join('-')}/${this.variableID}`;
        const query = querystring.stringify(this.query);
        return `${path}?${query}`;
    }
}

module.exports = Navigate;

