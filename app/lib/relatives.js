'use strict';

const _ = require('lodash');

const GlobalConfig = require('../../src/config');
const Request = require('./request');

class Relatives {

    static peers(region) {
        return new Promise((resolve, reject) => {
            const url = Request.buildURL(GlobalConfig.odn_api.base
              + GlobalConfig.odn_api.related_peer_endpoint, {
                app_token: GlobalConfig.app_token,
                entity_id: region.id,
                limit: GlobalConfig.n_relatives * 4
            });

            Request.getJSON(url).then(json => resolve(json), reject);
        });
    }

    static parents(region) {

        return new Promise((resolve, reject) => {
            const url = Request.buildURL(GlobalConfig.odn_api.base
              + GlobalConfig.odn_api.related_parent_endpoint, {
                app_token: GlobalConfig.app_token,
                entity_id: region.id,
                limit: GlobalConfig.n_relatives * 4
            });

            Request.getJSON(url).then(json => resolve(json), reject);
        });
    }

    static children(region) {

        return new Promise((resolve, reject) => {
            const url = Request.buildURL(GlobalConfig.odn_api.base
              + GlobalConfig.odn_api.related_child_endpoint, {
                app_token: GlobalConfig.app_token,
                entity_id: region.id,
                limit: GlobalConfig.n_relatives * 4
            });

            Request.getJSON(url).then(json => resolve(json), reject);
        });
    }

    static siblings(region) {
        return new Promise((resolve, reject) => {
            const url = Request.buildURL(GlobalConfig.odn_api.base + GlobalConfig.odn_api.related_sibling_endpoint, {
                app_token: GlobalConfig.app_token,
                entity_id: region.id,
                limit: GlobalConfig.n_relatives * 4
            });

            Request.getJSON(url).then(json => resolve(json), reject);
        });
    }
}

module.exports = Relatives;
