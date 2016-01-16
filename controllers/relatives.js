'use strict';

const _ = require('lodash');

const Constants = require('./constants');
const Request = require('./request');

class Relatives {
    static peers(region) {
        return new Promise((resolve, reject) => {
            const url = Request.buildURL(`${Constants.PEERS_URL}/${region.id}`, {
                n: Constants.N_PEERS * 2
            });

            Request.getJSON(url).then(json => resolve(json.peers), reject);
        });
    }

    static parents(region) {
        return new Promise((resolve, reject) => {
            const url = Request.buildURL(Constants.RELATIVES_URL, {
                child_id: region.id,
                '$order': 'parent_population DESC'
            });

            Request.getJSON(url).then(json => resolve(json.map(parseParent)), reject);
        });
    }

    static _children(region, childType) {
        return new Promise((resolve, reject) => {
            const params = {
                parent_id: region.id,
                '$order': 'child_population DESC',
                '$limit': Constants.N_RELATIVES
            };

            if (childType) params.child_type = childType;

            const url = Request.buildURL(Constants.RELATIVES_URL, params);
            Request.getJSON(url).then(json => resolve(json.map(parseChild)), reject);
        });
    }

    static children(region) {
        return new Promise((resolve, reject) => {
            if (_.contains(['msa', 'place', 'county'], region.type)) {
                resolve([]);
            } else if (region.type === 'state') {
                const places = Relatives._children(region, 'place');
                const counties = Relatives._children(region, 'county');
                const metros = Relatives._children(region, 'msa');

                Promise.all([places, counties, metros])
                    .then(children => resolve(children), reject);
            } else {
                Relatives._children(region)
                    .then(children => resolve([children]), reject);
            }
        });
    }

    static siblings(region) {
        return new Promise((resolve, reject) => {
            Relatives.parents(region).then(parents => {
                if (parents.length === 0) {
                    resolve([]);
                } else {
                    const url = Request.buildURL(Constants.RELATIVES_URL, {
                        parent_id: parents[0].id,
                        child_type: region.type,
                        '$order': 'child_population DESC',
                        '$limit': Constants.N_RELATIVES * 2
                    });

                    Request.getJSON(url).then(json => {
                        resolve([parents[0], json.map(parseChild)]);
                    }, reject);
                }
            }, reject);
        });
    }
}

function parseParent(json) {
    return {
        id: json.parent_id,
        name: json.parent_name,
        type: json.parent_type
    };
}

function parseChild(json) {
    return {
        id: json.child_id,
        name: json.child_name,
        type: json.child_type
    };
}

module.exports = Relatives;
