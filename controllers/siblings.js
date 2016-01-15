'use strict';

const request = require('request-promise');
const _ = require('lodash');
const NodeCache = require('node-cache');

const siblingCache = new NodeCache({stdTTL: 0});

const URL = 'https://odn.data.socrata.com/resource/iv2c-wasz.json';


class Siblings {
    static getParents(region) {
        return new Promise((resolve, reject) => {
            const url = buildURL(URL, {
                child_id: region.id,
                '$order': 'parent_population DESC'
            });

            request(url)
                .then(body => resolve(parseParents(body)))
                .catch(error => {
                    console.log('error');
                    reject(error);
                });
        });
    }

    static getSiblings(region, n) {
        return new Promise((resolve, reject) => {
            Siblings.getParents(region).then(parents => {
                if (parents.length === 0) {
                    console.log('no parents for ${region.name}');
                    resolve([]);
                } else {
                    const url = buildURL(URL, {
                        parent_id: parents[0].id,
                        child_type: region.type,
                        '$order': 'child_population DESC',
                        '$limit': n
                    });

                    request(url)
                        .then(body => resolve([parents[0], parseChildren(body)]))
                        .catch(error => {
                            console.log('error');
                            reject(error);
                        });
                }
            }).catch(error => {
                console.log('error getting parents');
                console.log(error.stack);
                reject(error);
            });
        });
    }

    static fromParams(params) {
        return new Promise((resolve, reject) => {
            if (params.regions.length === 0) {
                console.log('no regions');
                resolve([]);
            } else {
                Siblings.getSiblings(params.regions[0], 5)
                    .then(siblings => resolve(siblings))
                    .catch(error => {
                        console.log('error getting siblings');
                        console.log(error);
                        console.log(error.stack);
                        resolve([]);
                    });
            }
        });
    }
}

function buildURL(path, params) {
    const pairs = _.map(_.keys(params), key => `${key}=${params[key]}`);
    return `${path}${path[path.length - 1] == '?' ? '' : '?'}${pairs.join('&')}`;
}

function parseParents(body) {
    return JSON.parse(body).map(parseParent);
}

function parseParent(json) {
    return {
        id: json.parent_id,
        name: json.parent_name,
        type: json.parent_type
    };
}

function parseChildren(body) {
    return JSON.parse(body).map(parseChild);
}

function parseChild(json) {
    return {
        id: json.child_id,
        name: json.child_name,
        type: json.child_type
    };
}

module.exports = Siblings;
