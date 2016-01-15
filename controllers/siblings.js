'use strict';

const request = require('request-promise');
const _ = require('lodash');
const NodeCache = require('node-cache');
const Constants = require('./constants');

class Siblings {
    static peers(region) {
        return new Promise((resolve, reject) => {
            const url = buildURL(`${Constants.PEERS_URL}/${region.id}`, {
                n: Constants.N_PEERS * 2
            });

            getJSON(url).then(json => {
                resolve(json.peers);
            }, error => { reject(error); });
        });
    }

    static parents(region) {
        return new Promise((resolve, reject) => {
            const url = buildURL(Constants.RELATIVES_URL, {
                child_id: region.id,
                '$order': 'parent_population DESC'
            });

            getJSON(url).then(json => {
                resolve(json.map(parseParent));
            }, error => { reject(error); });
        });
    }

    static siblings(region) {
        return new Promise((resolve, reject) => {
            Siblings.parents(region).then(parents => {
                if (parents.length === 0) {
                    resolve([]);
                } else {
                    const url = buildURL(Constants.RELATIVES_URL, {
                        parent_id: parents[0].id,
                        child_type: region.type,
                        '$order': 'child_population DESC',
                        '$limit': Constants.N_RELATIVES
                    });

                    getJSON(url).then(json => {
                        resolve([parents[0], json.map(parseChild)]);
                    }, error => { reject(error); });
                }
            }, error => { reject(error); });
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
                }, error => { reject(error); });
            } else {
                resolve(value);
            }
        });
    });

    return new Promise((resolve, reject) => {
        Promise.race([timeoutPromise, jsonPromise]).then(result => {
            if (!result) {
                console.warn(`request to ${url} timed out after ${timeoutMS}ms`);
            }

            result = result || [];
            resolve(result);
        }, error => { reject(error); });
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

module.exports = Siblings;
