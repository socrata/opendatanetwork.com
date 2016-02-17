'use strict';

const _ = require('lodash');
const NodeCache = require('node-cache');
const request = require('request-promise');
const querystring = require('querystring');
const fs = require('fs');
const memjs = require('memjs');


try {
    var cache = memjs.Client.create('localhost:11211');
} catch (error) {
    console.log('error creating cache');
}

class Request {
    static get(url) {
        return new Promise((resolve, reject) => {
            cache.get(url, (error, value) => {
                if (error) {
                    reject(error);
                } else if (value) {
                    resolve(value);
                } else {
                    request(url).then(body => {
                        resolve(body);
                        cache.set(url, body, error => {
                            console.error(`failed to set key "${url}"`);
                            console.error(error.stack);
                        });
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

    static getJSONLocal(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(`${__dirname}/../${path}`, (fileError, body) => {
                if (fileError) {
                    reject(fileError);
                } else {
                    const json = JSON.parse(body);
                    resolve(json);
                }
            });
        });
    }

    static timeout(milliseconds) {
        return new Promise(resolve => {
            setTimeout(resolve, milliseconds);
        });
    }

    static buildURL(path, params) {
        const validParams = _.omit(params, param => param == []);
        const paramString = querystring.stringify(validParams);
        return `${path}${path[path.length - 1] == '?' ? '' : '?'}${paramString}`;
    }
}

module.exports = Request;
