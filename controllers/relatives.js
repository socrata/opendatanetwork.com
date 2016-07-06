'use strict';

const _ = require('lodash');
const Constants = require('./constants');
const Request = require('./request');

class Relatives {

    static peers(region) {
        return new Promise((resolve, reject) => {
            const url = Request.buildURL(Constants.RELATED_PEER_URL, {
                entity_id: region.id,
                limit: Constants.N_RELATIVES * 4
            });

            Request.getJSON(url).then(json => resolve(json), reject);
        });
    }

    static parents(region) {

        return new Promise((resolve, reject) => {
            const url = Request.buildURL(Constants.RELATED_PARENT_URL, {
                entity_id: region.id,
                limit: Constants.N_RELATIVES * 4
            });

            Request.getJSON(url).then(json => resolve(json), reject);
        });
    }

    static children(region) {

        return new Promise((resolve, reject) => {
            const url = Request.buildURL(Constants.RELATED_CHILD_URL, {
                entity_id: region.id,
                limit: Constants.N_RELATIVES * 4
            });

            Request.getJSON(url).then(json => resolve(json), reject);
        });
    }

    static siblings(region) {
        return new Promise((resolve, reject) => {
            const url = Request.buildURL(Constants.RELATED_SIBLING_URL, {
                entity_id: region.id,
                limit: Constants.N_RELATIVES * 4
            });

            Request.getJSON(url).then(json => resolve(json), reject);
        });
    }
}

module.exports = Relatives;
