'use strict';

/**
 * Helper functions for parsing requests.
 */

const _ = require('lodash');

class SearchRequestParser {
    constructor(request) {
        this.request = request;
    }

    getQuery() {
        return this.request.query.q || '';
    }

    getCategories() {
        return asList(this.request.query.categories);
    }

    getDomains() {
        return asList(this.request.query.domains);
    }

    getTags() {
        return asList(this.request.query.tags);
    }

    getOffset() {
        return this.request.query.offset || 0;
    }

    getLimit() {
        return this.request.query.limit || 10;
    }
}

function asList(value) {
    if (_.isNull(value) || _.isUndefined(value)) return [];
    if (_.isArray(value)) return value;
    return [value];
}

module.exports = SearchRequestParser;

