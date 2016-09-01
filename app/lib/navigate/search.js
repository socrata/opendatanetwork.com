'use strict';

/**
 * Navigate to search pages.
 */

const _ = require('lodash');
const querystring = require('querystring');

const Request = require('../request');

class Navigate {
    constructor(query, categories, domains, tags) {
        this.query = query || '';
        this.categories = categories || [];
        this.domains = domains || [];
        this.tags = tags || [];
    }

    query(query) {
        return new Navigate(query);
    }

    addCategory(category) {
        return new Navigate(this.query, [category].concat(this.categories), this.domains, this.tags);
    }

    removeCategory(category) {
        const categories = this.categories.filter(id => id !== category);
        return new Navigate(this.query, categories, this.domains, this.tags);
    }

    category(category) {
        return new Navigate(null, [category]);
    }

    addDomain(domain) {
        return new Navigate(this.query, this.categories, [domain].concat(this.domains), this.tags);
    }

    removeDomain(domain) {
        const domains = this.domains.filter(id => id !== domain);
        return new Navigate(this.query, this.categories, domains, this.tags);
    }

    domain(domain) {
        return new Navigate(null, null, [domain]);
    }

    addTag(tag) {
        return new Navigate(this.query, this.categories, this.domains, [tag].concat(this.tags));
    }

    removeTag(tag) {
        const domains = this.tags.filter(id => id !== tag);
        return new Navigate(this.query, this.categories, this.domains, tags);
    }

    tag(tag) {
        return new Navigate(null, null, null, [tag]);
    }

    url() {
        const path = '/search';
        const query = {
            q: this.query,
            categories: this.categories,
            domains: this.domains,
            tags: this.tags
        };

        return Request.buildURL(path, query);
    }
}

module.exports = Navigate;

