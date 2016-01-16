'use strict';

const _ = require('lodash');

const Synonyms = require('./synonyms');
const Request = require('./request');
const Constants = require('./constants');

const SYNONYMS = Synonyms.fromFile(Constants.SYNONYMS_FILE);

class API {
    static searchDatasetsURL(requestParams) {
        const querySynonyms = SYNONYMS.get(requestParams.q);
        const vectorSynonyms = SYNONYMS.get(requestParams.vector.replace(/_/g, ' '));
        const synonyms = _.unique(_.flatten([querySynonyms, vectorSynonyms]));

        const regionNames = requestParams.regions.map(region => {
            const name = region.name;
            const type = region.type;

            if (type === 'place' || type === 'county') {
                return name.split(', ')[0];
            } else if (type === 'msa') {
                const words = name.split(' ');
                return words.slice(0, words.length - 3);
            } else {
                return name;
            }
        }).map(name => `"${name}"`);

        const allTerms = [synonyms, regionNames, requestParams.tags];
        const query = allTerms
            .filter(terms => terms.length > 0)
            .map(terms => `(${terms.join(' OR ')})`)
            .join(' AND ');

        const categories = requestParams.categories || [];
        const domains = requestParams.domains || [];
        const tags = requestParams.tags || [];

        const params = {categories, domains, tags, q_internal: query};
        return Request.buildURL(Constants.CATALOG_URL, params);
    }
}

module.exports = API;
