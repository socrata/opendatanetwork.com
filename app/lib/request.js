'use strict';

const _ = require('lodash');
const request = require('request-promise');
const querystring = require('querystring');
const memjs = require('memjs');
const crypto = require('crypto');

const Exception = require('./exception');
const GlobalConfig = require('../../src/config');
const Cache = require('./cache');
const cache = new Cache(null, { expires: GlobalConfig.cache_options.expires });
const buildURL = require('../../src/odn-client/build-url');

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

    static get(optionsOrURL, timeout) {
        const options = _.isString(optionsOrURL) ? {url: optionsOrURL} : optionsOrURL;
        const url = _.isString(optionsOrURL) ? optionsOrURL : optionsOrURL.url;
        const key = Request.key(url);

        return cache.get(key).catch(error => {
            return Request.timeout(request(options), timeout).then(value => {
                cache.set(key, value);
                return Promise.resolve(value);
            }).catch(error => {
                const exception = new Exception(`error fetching ${url}`, error.statusCode || 500);
                exception.error = error;
                return Promise.reject(exception);
            });
        });
    }

    static getJSON(optionsOrURL, timeout) {
        return Request.get(optionsOrURL, timeout).then(value => {
            return Promise.resolve(JSON.parse(value.toString()));
        });
    }

    static timeout(promise, milliseconds) {
        return Promise.race([Request._timeout(milliseconds), promise]);
    }

    static _timeout(milliseconds) {
        milliseconds = milliseconds || GlobalConfig.timeout_ms;

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(Exception.timeout('request timed out'));
            }, milliseconds);
        });
    }

    static buildURL(path, params) {
        return buildURL(path, params);
    }
}

module.exports = Request;
