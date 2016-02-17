'use strict';

const _ = require('lodash');
const request = require('request-promise');
const querystring = require('querystring');
const memjs = require('memjs');
const Constants = require('./constants.js');

const cache = memjs.Client.create(null, Constants.CACHE_OPTIONS);

class Request {
    static get(url) {
        if (!cache) return request(url);

        return new Promise((resolve, reject) => {
            cache.get(url, (error, value) => {
                if (value) {
                    resolve(value);
                } else {
                    Request.timeout(request(url)).then(body => {
                        resolve(body);
                        if (error) {
                            console.error(`failed to get key "${url}"`);
                            console.error(error);
                        } else {
                            cache.set(url, body, error => {
                                if (error) {
                                    console.error(`failed to set key "${url}"`);
                                    console.error(error);
                                }
                            });
                        }
                    }, reject);
                }
            });
        });
    }

    static getJSON(url) {
        return new Promise((resolve, reject) => {
            Request.get(url).then(value => {
                resolve(JSON.parse(value.toString()));
            }, reject);
        });
    }

    static timeout(promise, milliseconds) {
        return new Promise((resolve, reject) => {
            Promise.race([Request._timeout(milliseconds), promise]).then(resolve, reject);
        });
    }

    static _timeout(milliseconds) {
        milliseconds = milliseconds || Constants.TIMEOUT_MS;

        return new Promise((resolve, reject) => {
            setTimeout(reject, milliseconds);
        });
    }

    static buildURL(path, params) {
        const validParams = _.omit(params, param => param == []);
        const paramString = querystring.stringify(validParams);
        return `${path}${path[path.length - 1] == '?' ? '' : '?'}${paramString}`;
    }
}

module.exports = Request;
