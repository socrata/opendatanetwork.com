'use strict';

const _ = require('lodash');
const request = require('request-promise');
const querystring = require('querystring');
const memjs = require('memjs');
const crypto = require('crypto');
const ControllerConstants = require('./constants.js');

const cache = memjs.Client.create(null, ControllerConstants.CACHE_OPTIONS);
const timersEnabled = false;

class Request {
    /**
     * Generates a cache key for the given URL.
     * To get around the 250 character memcache key size limit,
     * a base64 encoded SHA512 hash is used for urls exceding 250 characters.
     */
    static key(url) {
        if (url.length <= 250) return url;
        return crypto.createHash('sha512').update(url).digest('base64');
    }

    static get(url, timeout) {

        if (timersEnabled)
            var start = new Date();

        return new Promise((resolve, reject) => {
            if (!cache) {
                console.log('WARNING: no cache found');

                Request.timeout(request({
                        url: url,
                        headers: { 'User-Agent' : ControllerConstants.USER_AGENT }
                    }), timeout).then(body => {
                        resolve(body);
                    }, reject);
            } else {
                const key = Request.key(_.isString(url) ? url : url.uri);

                cache.get(key, (error, value) => {
                    if (value) {

                        if (timersEnabled)
                            console.log('Request (cache hit): ' + (new Date() - start) + 'ms URL: ' + url);

                        resolve(value);
                    } else {
                        Request.timeout(request({
                                url: url,
                                headers: { 'User-Agent' : ControllerConstants.USER_AGENT }
                        }), timeout).then(body => {

                            if (timersEnabled)
                                console.log('Request (cache miss): ' + (new Date() - start) + 'ms URL: ' + url);

                            resolve(body);
                            if (!error) cache.set(key, body);
                        }, reject);
                    }
                });
            }
        });
    }

    static getJSON(url, timeout) {
        return new Promise((resolve, reject) => {
            Request.get(url, timeout).then(value => {
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
        milliseconds = milliseconds || ControllerConstants.TIMEOUT_MS;

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
