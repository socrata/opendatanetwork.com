'use strict';

const _ = require('lodash');
const NodeCache = require('node-cache');
const request = require('request-promise');

const Constants = require('./constants');

const cache = new NodeCache({sdtTTL: 0});

class Request {
    static getJSON(url, timeoutMS) {
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

        timeoutMS = timeoutMS || Constants.TIMEOUT_MS;
        const timeoutPromise = Request.timeout(timeoutMS);

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

    static timeout(milliseconds) {
        return new Promise(resolve => {
            setTimeout(resolve, milliseconds);
        });
    }

    static buildURL(path, params) {
        const pairs = _.map(_.keys(params), key => `${key}=${params[key]}`);
        return `${path}${path[path.length - 1] == '?' ? '' : '?'}${pairs.join('&')}`;
    }
}

module.exports = Request;
