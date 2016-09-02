
/**
 * Simple client for the Cetera catalog API.
 */

const Constants = require('./constants');
const Request = require('./request');

const _ = require('lodash');

class CeteraClient {
    constructor(categories, domains, tags) {
        this.categories = categories;
        this.domains = domains;
        this.tags = tags;
    }

    datasetsURL(query, tags, limit, offset) {
        return Request.buildURL(Constants.CATALOG_URL, {
            q: query,
            categories: this.categories,
            domains: this.domains,
            tags: this.tags,
            offset: offset || 0,
            limit: limit || 10,
            only: 'datasets'
        });
    }

    datasets(query, tags, limit, offset) {
        return Request.getJSON(this.datasetsURL(query, tags, limit, offset)).then(response => {
            return Promise.resolve(response.results.map(getDataset));
        });
    }
}

function getDataset(result) {
    const resource = result.resource;
    const fxf = resource.nbe_fxf || resource.id;
    const domain = result.metadata.domain;

    return _.assign(_.pick(resource, ['name', 'description', 'attribution']), {
        fxf,
        domain,
        classification: result.classification,
        domain_url: `http://${domain}`,
        dataset_url: result.permalink,
        dev_docs_url: `https://dev.socrata.com/foundry/${domain}/${fxf}`,
        updated_at: resource.updatedAt,
        created_at: resource.createdAt,
        categories: result.classification.categories
    });
}

module.exports = CeteraClient;

