'use strict';

const request = require('request-promise');
const _ = require('lodash');
const NodeCache = require('node-cache');

const siblingCache = new NodeCache({stdTTL: 0});
const parentCache = new NodeCache({stdTTL: 0});

const URL = 'https://odn.data.socrata.com/resource/iv2c-wasz.json';

const cache = new NodeCache({sdtTTL: 0});



class Siblings {
    static getParents(region) {
        return new Promise((resolve, reject) => {
            const url = buildURL(URL, {
                child_id: region.id,
                '$order': 'parent_population DESC'
            });

            getJSON(url).then(json => {
                resolve(json.map(parseParent));
            }, error => { reject(error); });
        });
    }

    static getSiblings(region, n) {
        return new Promise((resolve, reject) => {
            Siblings.getParents(region).then(parents => {
                if (parents.length === 0) {
                    resolve([]);
                } else {
                    const url = buildURL(URL, {
                        parent_id: parents[0].id,
                        child_type: region.type,
                        '$order': 'child_population DESC',
                        '$limit': n
                    });

                    getJSON(url).then(json => {
                        resolve([parents[0], json.map(parseChildren)]);
                    }, error => { reject(error); });
                }
            }, error => { reject(error); });
        });
    }

    static fromParams(params) {
        return new Promise((resolve, reject) => {
            if (params.regions.length === 0) {
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

function getJSON(url) {
    console.log(url);
    return new Promise((resolve, reject) => {
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
