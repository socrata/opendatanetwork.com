'use strict';

const request = require('request-promise');
const _ = require('lodash');
const NodeCache = require('node-cache');
const Constants = require('./constants');

class Relatives {
    static peers(region) {
        return new Promise((resolve, reject) => {
            const url = buildURL(`${Constants.PEERS_URL}/${region.id}`, {
                n: Constants.N_PEERS * 2
            });

            getJSON(url).then(json => resolve(json.peers), reject);
        });
    }

    static parents(region) {
        return new Promise((resolve, reject) => {
            const url = buildURL(Constants.RELATIVES_URL, {
                child_id: region.id,
                '$order': 'parent_population DESC'
            });

            getJSON(url).then(json => resolve(json.map(parseParent)), reject);
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

            const url = buildURL(Constants.RELATIVES_URL, params);
            getJSON(url).then(json => resolve(json.map(parseChild)), reject);
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
                    const url = buildURL(Constants.RELATIVES_URL, {
                        parent_id: parents[0].id,
                        child_type: region.type,
                        '$order': 'child_population DESC',
                        '$limit': Constants.N_RELATIVES * 2
                    });

                    getJSON(url).then(json => {
                        resolve([parents[0], json.map(parseChild)]);
                    }, reject);
                }
            }, reject);
        });
    }
}

const cache = new NodeCache({sdtTTL: 0});

function getJSON(url, timeoutMS) {
    timeoutMS = timeoutMS || Constants.TIMEOUT_MS;
    const timeoutPromise = timeout(timeoutMS);

    const jsonPromise = new Promise((resolve, reject) => {
        cache.get(url, (error, value) => {
            if (value === undefined) {
                request(url).then(body => {
                    const json = JSON.parse(body);
                    cache.set(url, json);
                    resolve(json);
                }, reject);
            } else {
                resolve(value);
            }
        });
    });

    return new Promise((resolve, reject) => {
        Promise.race([timeoutPromise, jsonPromise]).then(result => {
            if (!result) {
                console.warn(`request to ${url} timed out after ${timeoutMS}ms`);
                resolve([]);
            } else {
                resolve(result);
            }
        }, reject);
    });
}

function timeout(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

function buildURL(path, params) {
    const pairs = _.map(_.keys(params), key => `${key}=${params[key]}`);
    return `${path}${path[path.length - 1] == '?' ? '' : '?'}${pairs.join('&')}`;
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
