'use strict';

/**
 * Controller for rendering partial search result pages for use with
 * infinite scroll on entity pages (/entity).
 */

const _ = require('lodash');

const SearchRequestParser = require('./search-request-parser');
const ODNClient = require('../../src/odn-client/odn-client');
const Exception = require('../lib/exception');

module.exports = (request, response) => {
    const errorHandler = Exception.getHandler(request, response);

    const requestParser = new SearchRequestParser(request);

    const offset = requestParser.getOffset();
    const limit = requestParser.getLimit();
    const entityIDs = request.query.entity_id.split('-');
    const datasetID = request.query.dataset_id;

    ODNClient.searchDatasets(entityIDs, datasetID, limit, offset).then(datasets => {
        if (_.isEmpty(datasets)) return response.status(204).send();
        response.render('_search-dataset-items.ejs', {datasets});
    }).catch(errorHandler);
};

