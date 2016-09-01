'use strict';

/**
 * Navigate to search pages.
 */

if (typeof require !== 'undefined') {
    var _ = require('lodash');
    var buildURL = require('../odn-client/build-url');
}

class SearchNavigate {
    constructor(query, categories, domains, tags) {
        this.query = query || '';
        this.categories = categories || [];
        this.domains = domains || [];
        this.tags = tags || [];
    }

    query(query) {
        return new SearchNavigate(query);
    }

    addCategory(category) {
        return new SearchNavigate(this.query, [category].concat(this.categories), this.domains, this.tags);
    }

    removeCategory(category) {
        const categories = this.categories.filter(id => id !== category);
        return new SearchNavigate(this.query, categories, this.domains, this.tags);
    }

    category(category) {
        return new SearchNavigate(null, [category]);
    }

    addDomain(domain) {
        return new SearchNavigate(this.query, this.categories, [domain].concat(this.domains), this.tags);
    }

    removeDomain(domain) {
        const domains = this.domains.filter(id => id !== domain);
        return new SearchNavigate(this.query, this.categories, domains, this.tags);
    }

    domain(domain) {
        return new SearchNavigate(null, null, [domain]);
    }

    addTag(tag) {
        return new SearchNavigate(this.query, this.categories, this.domains, [tag].concat(this.tags));
    }

    removeTag(tag) {
        const domains = this.tags.filter(id => id !== tag);
        return new SearchNavigate(this.query, this.categories, this.domains, this.tags);
    }

    tag(tag) {
        return new SearchNavigate(null, null, null, [tag]);
    }

    url() {
        const path = '/search';
        const query = {
            q: this.query,
            categories: this.categories,
            domains: this.domains,
            tags: this.tags
        };

        return buildURL(path, query);
    }
}

if (typeof module !== 'undefined') module.exports = SearchNavigate;

