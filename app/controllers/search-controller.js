
/**
 * Controller for keyword search results page.
 */

const _ = require('lodash');

const SearchRequestParser = require('./search-request-parser');
const CeteraClient = require('../lib/cetera-client');
const Exception = require('../lib/exception');
const ODNClient = require('../../src/odn-client/odn-client');
const EntityNavigate = require('../../src/navigate/entity');
const SearchNavigate = require('../../src/navigate/search');
const GlobalConfig = require('../../src/config');

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

    const cetera = new CeteraClient(query, categories, domains, tags);

    // TODO questions
    Promise.all([
        getEntities(query),
        cetera.datasets(),
        Category.categories(),
        Category.domains(),
        Tag.tags(),
        ODNClient.searchQuestions(query)
    ]).then(([entities, ceteraResponse, allCategories, allDomains, allTags, questions]) => {
        const templateData = {
            GlobalConfig,
            page: 'search',
            query,
            categories,
            allCategories,
            domains,
            allDomains: allDomains.results,
            tags,
            entities,
            questions,
            datasets: ceteraResponse.datasets,
            datasetCount: ceteraResponse.size,
            ceteraURL: cetera.datasetsURL(),
            navigate: new EntityNavigate(),
            searchNavigate: new SearchNavigate(query, categories, domains, tags),
            title: 'Data on the Open Data Network',
            currentCategory: currentCategory(categories, allCategories),
            currentTag: currentTag(tags, allTags),
            refineBy: getRefineBy(allCategories, allDomains),
            refineByMobile: getRefineByMobile(allCategories, allDomains),
            refinePopupCollapsed: getRefinePopupCollapsed(request),
            css: [
                '/styles/search.css',
                '/styles/main.css'
            ],
            scripts: [
                '/lib/third-party/d3.min.js',
                '/lib/third-party/d3.promise.min.js',
                '/lib/third-party/lodash.min.js',
                '/lib/third-party/colorbrewer.min.js',
                '/lib/search.min.js'
            ]
        };

        response.render('search.ejs', templateData, (error, html) => {
            if (error) {
                console.error(error);
                response.status(500).json(error);
            } else {
                response.send(html);
            }
        });
    }).catch(errorHandler);
};

function getEntities(query) {
    if (query === '') return Promise.resolve([]);
    return ODNClient.searchEntities(query)
        .then(entities => Promise.resolve(entities.slice(0, 6)));
}

// TODO refactor out somewhere
const refineByCount = 5;

function getRefineBy(categories, domains) {
    return {
        categories : categories.slice(0, refineByCount),
        domains : domains.results.slice(0, refineByCount),
    };
}

function getRefineByMobile(categories, domains) {
    return {
        categories,
        domains: domains.results
    };
}

function getRefinePopupCollapsed(request) {
    return _.isUndefined(request.cookies.refinePopupCollapsed) ? true :
        request.cookies.refinePopupCollapsed;
}

function getQuery(request) {
    return request.query.q;
}

function currentCategory(categories, allCategories) {
    if (categories.length !== 1) return null;
    return _.find(allCategories, category => {
        return category.category === categories[0].toLowerCase();
    });
}

function currentTag(tags, allTags) {
    if (tags.length !== 1) return null;
    return _.find(allTags, tag => tag.tag === tags[0].toLowerCase());
}

