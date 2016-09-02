'use strict';

if (typeof require !== 'undefined') {
    var _ = require('lodash');
    var querystring = require('querystring');
}

function buildURL(path, params) {
    const validParams = _.omit(params, invalid);
    const paramString = stringify(validParams);
    return `${path}${path[path.length - 1] === '?' ? '' : '?'}${paramString}`;
}

function stringify(params) {
    if (typeof querystring !== 'undefined')
        return querystring.stringify(params);
    if (typeof $ !== 'undefined')
        return $.param(params, true);
    throw new Error('no stringify function available in buildURL');
}

function invalid(param) {
    return (_.isNull(param) ||
            _.isNaN(param) ||
            _.isUndefined(param) ||
            ((_.isArray(param) || _.isString(param)) && _.isEmpty(param)));
}

if (typeof module !== 'undefined') module.exports = buildURL;

