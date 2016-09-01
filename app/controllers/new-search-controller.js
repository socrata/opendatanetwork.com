
/**
 * Controller for keyword search results page.
 */

const _ = require('lodash');

const ODNClient = require('../lib/odn-client');
const CeteraClient = require('../lib/cetera-client');
const Exception = require('../lib/exception');
const Navigate = require('../lib/navigate');

const Category = require('../models/category');
const Place = require('../models/place');
const Tag = require('../models/tag');

module.exports = (request, response) => {
    const errorHandler = Exception.getHandler(request, response);

    const query = request.query.q || '';
    const categories = request.query.categories || [];
    const domains = request.query.domains || [];
    const tags = request.query.tags || [];

    const cetera = new CeteraClient(categories, domains, tags);

    // TODO questions
    Promise.all([
        ODNClient.searchEntities(query),
        cetera.datasets(categories, domains, tags),
        Category.categories(),
        Category.domains(),
        Tag.tags()
    ]).then(([entities, datasets, allCategories, allDomains, allTags]) => {
        const templateData = {
            page: 'search',
            query,
            categories,
            domains,
            tags,
            entities,
            datasets,
            navigate: new Navigate(),
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
                '//cdnjs.cloudflare.com/ajax/libs/numeral.js/1.4.5/numeral.min.js',
                '/lib/third-party/d3.min.js',
                '/lib/third-party/d3.promise.min.js',
                '/lib/third-party/js.cookie-2.1.1.min.js',
                '/lib/third-party/lodash.min.js',
                '/lib/search.min.js'
            ]
        };

        // response.json(templateData);

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
        return category.category === params.categories[0].toLowerCase()
    });
}

function currentTag(tags, allTags) {
    if (tags.length !== 1) return null;
    return _.find(allTags, tag => tag.tag === params.tags[0].toLowerCase());
}

