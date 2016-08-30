'use strict';

const _ = require('lodash');
const GlobalConstants = require("../src/constants"); 
const ControllerConstants = require('./constants');
const Request = require('./request');

class Relatives {

    static peers(region) {
        return new Promise((resolve, reject) => {
            const url = Request.buildURL(ControllerConstants.RELATED_PEER_URL, {
                app_token: GlobalConstants.APP_TOKEN,
                entity_id: region.id,
                limit: ControllerConstants.N_RELATIVES * 4
            });

            Request.getJSON(url).then(json => resolve(json), reject);
        });
    }

    static parents(region) {

        return new Promise((resolve, reject) => {
            const url = Request.buildURL(ControllerConstants.RELATED_PARENT_URL, {
                app_token: GlobalConstants.APP_TOKEN,
                entity_id: region.id,
                limit: ControllerConstants.N_RELATIVES * 4
            });

            Request.getJSON(url).then(json => resolve(json), reject);
        });
    }

    static children(region) {

        return new Promise((resolve, reject) => {
            const url = Request.buildURL(ControllerConstants.RELATED_CHILD_URL, {
                app_token: GlobalConstants.APP_TOKEN,
                entity_id: region.id,
                limit: ControllerConstants.N_RELATIVES * 4
            });

            Request.getJSON(url).then(json => resolve(json), reject);
        });
    }

    static siblings(region) {
        return new Promise((resolve, reject) => {
            const url = Request.buildURL(ControllerConstants.RELATED_SIBLING_URL, {
                app_token: GlobalConstants.APP_TOKEN,
                entity_id: region.id,
                limit: ControllerConstants.N_RELATIVES * 4
            });

            Request.getJSON(url).then(json => resolve(json), reject);
        });
    }
}

module.exports = Relatives;
