'use strict';

/**
 * Controller for rendering partial search result pages for use with
 * infinite scroll on the keyword search page (/search).
 */

const _ = require('lodash');

const SearchRequestParser = require('./search-request-parser');
const CeteraClient = require('../lib/cetera-client');
const Exception = require('../lib/exception');

module.exports = (request, response) => {
    const errorHandler = Exception.getHandler(request, response);

    const requestParser = new SearchRequestParser(request);
    const query = requestParser.getQuery();
    const categories = requestParser.getCategories();
    const domains = requestParser.getDomains();
    const tags = requestParser.getTags();
    const offset = requestParser.getOffset();
    const limit = requestParser.getLimit();

    const cetera = new CeteraClient(query, categories, domains, tags);

    cetera.datasets(limit, offset).then(results => {
        const datasets = results.datasets;
        if (_.isEmpty(datasets)) return response.status(204).send();
        response.render('_search-results-items.ejs', {datasets});
    }).catch(errorHandler);
};

