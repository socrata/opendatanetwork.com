'use strict';

/**
 * Controller for rendering partial search result pages for use with
 * infinite scroll.
 */

const _ = require('lodash');

const SearchRequestParser = require('./search-request-parser');
const CeteraClient = require('../lib/cetera-client');
const Exception = require('../lib/exception');
const ODNClient = require('../../src/odn-client/odn-client');
const EntityNavigate = require('../../src/navigate/entity');
const SearchNavigate = require('../../src/navigate/search');
const Constants = require('../../src/constants');

const Category = require('../models/category');
const Place = require('../models/place');
const Tag = require('../models/tag');

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

    cetera.datasets(limit, offset).then(datasets => {
        response.render('_search-results-items.ejs', {datasets});
    }).catch(errorHandler);
};

