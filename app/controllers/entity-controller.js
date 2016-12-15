
/**
 * Controller for pages that display data about entities.
 */

const _ = require('lodash');

const EntityFormatter = require('../lib/entity-formatter');
const ODNClient = require('../../src/odn-client/odn-client');
const GlobalConfig = require('../../src/config');
const DatasetConfig = require('../../src/config').variables;
const Navigate = require('../../src/navigate/entity');

const Exception = require('../lib/exception');
const notFound = Exception.notFound;
const invalid = Exception.invalidParam;

const css = [
    '/styles/search.css',
    '/styles/main.css'
];

const asyncCSS = [
    '/styles/third-party/leaflet.min.css',
    '/styles/maps.css'
];

const scripts = [
    '//www.gstatic.com/charts/loader.js',
    '//cdn.socket.io/socket.io-1.4.5.js',
    '/lib/third-party/leaflet/leaflet.min.js',
    '/lib/third-party/colorbrewer.min.js',
    '/lib/third-party/d3.min.js',
    '/lib/third-party/d3.promise.min.js',
    '/lib/third-party/lodash.min.js',
    '/lib/entity.min.js'
];

module.exports = (request, response) => {
    const errorHandler = Exception.getHandler(request, response);

    const entityIDs = getEntityIDs(request);
    const variableID = getVariableID(request);

    Promise.all([
        ODNClient.entities(entityIDs),
        ODNClient.availableData(entityIDs)
    ]).then(([entities, availableData]) => {
        if (_.isEmpty(availableData)) return noDataForEntities(entities);

        getVariable(availableData, variableID).then(([topic, dataset, variable]) => {
            const fixed = getFixedConstraints(request, dataset);

            getConstraintMenus(entityIDs, variable.id, dataset.constraints, fixed).then(constraintMenus => {
                const constraints = getConstraints(constraintMenus);
                // x-return-url and x-return-description will already be set in the cookies from middleware
                const query = _.extend({}, _.omit(request.query, 'x-return-url', 'x-return-description'), constraints);
                const url = new Navigate(entities, variable.id, query).url();

                if (url !== request.url) return response.redirect(307, url);

                Promise.all([
                    getRelated(entities[0].id, variable.id),
                    ODNClient.searchDatasets(entityIDs, dataset.id),
                    EntityFormatter.entityPageTitle(entities, dataset, variable),
                    getDescription(entityIDs, variable.id, constraints)
                ]).then(([related, datasets, title, description]) => {
                    const templateData = {
                        _,
                        page: 'entity',
                        css,
                        asyncCSS,
                        scripts,
                        GlobalConfig,
                        title,
                        datasets,
                        related,
                        entities,
                        topic,
                        dataset,
                        variable,
                        constraints,
                        constraintMenus,
                        description,
                        fixedConstraints: fixed,
                        showRefineMenu: showRefineMenu(request),
                        topics: _.values(availableData),
                        navigate: new Navigate(entities, variableID, _.clone(request.query)),
                        questions: generateQuestions(availableData, dataset, variable),
                        chartConfig: getChartConfig(dataset),
                    };

                    response.render('entity.ejs', templateData, (error, html) => {
                        if (error) {
                            console.error(error);
                            response.status(500).json(error);
                        } else {
                            response.send(html);
                        }
                    });
                }).catch(errorHandler);
            }).catch(errorHandler);
        }).catch(errorHandler);
    }).catch(errorHandler);
};

function getChartConfig(dataset) {
    if (!(dataset.id in DatasetConfig)) return null;

    const config = DatasetConfig[dataset.id];

    config.charts.forEach(chart => {
        chart.id = chart.id.replace(/[\._]/g, '-');
        chart.dataset_id = dataset.id;
    });

    return config;
}

function getFixedConstraints(request, dataset) {
    return _.pick(request.query, dataset.constraints);
}

function noDataForEntities(entities) {
    return Promise.reject(notFound(`no data found for ${entities.map(_.property('name')).join(' or ')}`));
}

function getVariable(availableData, fullVariableID) {
    const idParts = _.isEmpty(fullVariableID) ? [] : fullVariableID.split('.');
    if (idParts.length > 3)
        return Promise.reject(invalid(`invalid variable id: '${fullVariableID}'`));
    const [topicID, datasetID, variableID] = idParts;

    return getNode(availableData, topicID).then(topic => {
        return getNode(topic.datasets, datasetID).then(dataset => {
            return getNode(dataset.variables, variableID).then(variable => {
                return Promise.resolve([topic, dataset, variable]);
            });
        });
    });
}

function getNode(nodes, name) {
    if (_.isEmpty(nodes))
        return Promise.reject(notFound(`no data available`));
    if (_.isUndefined(name))
        return Promise.resolve(_.first(_.values(nodes)));
    if (name in nodes)
        return Promise.resolve(nodes[name]);
    return Promise.reject(notFound(`variable not found: ${name}`));
}

function getConstraintMenus(entityIDs, variableID, constraints, fixed, results) {
    results = results || [];
    fixed = fixed || {};
    const constraint = _.first(constraints);
    const parents = results.map(_.property('name')).concat([constraint]);
    const fixedParents = _.pick(fixed, parents);

    return ODNClient.constraints(entityIDs, variableID, constraint, fixedParents).then(options => {
        const defaultOption = _.first(options);
        const selected = constraint in fixed ?
            _.find(options, option => clean(option) === clean(fixed[constraint])) || defaultOption:
            defaultOption;
        fixed[constraint] = selected;

        results.push({
            name: constraint,
            options,
            selected
        });

        if (constraints.length === 1)
            return Promise.resolve(results);
        return getConstraintMenus(entityIDs, variableID, _.tail(constraints), fixed, results);
    });
}

function getConstraints(constraintMenus) {
    return _(constraintMenus)
        .map(constraint => [constraint.name, constraint.selected])
        .object()
        .value();
}

function clean(string) {
    if (_.isEmpty(string)) return '';

    return string
        .replace(/[\s-\/]/g, '_')
        .replace(/_+/g, '_')
        .replace(/\W/g, '')
        .toLowerCase();
}



function getRelated(entityID, variableID) {
    const limit = GlobalConfig.related_entity_count;
    const promises = ['parent', 'child', 'sibling', 'peer'].map(relation => {
        // Only constrain related entities to those with data for
        // the current variable with entities of the same type.
        const onlyWithData = relation === 'sibling' || relation === 'peer';
        const variable = onlyWithData ? variableID : null;
        return ODNClient.related(entityID, relation, limit, variable);
    });

    return Promise.all(promises)
        .then(result => Promise.resolve(_.merge.apply(_, result)));
}

function getEntityIDs(request) {
    return request.params.entityIDs.split('-');
}

function getVariableID(request) {
    return request.params.variableID;
}

function getDescription(entityIDs, variableID, constraints) {
    return ODNClient.values(entityIDs, variableID, constraints, true)
        .then(response => Promise.resolve(response.description));
}

/**
 * Generate a list of variables for which we have data. These variables
 * are used to formulate questions.
 *
 * The current variable is not included.
 *
 * Variables from the current dataset are listed first.
 * Subsequent variables are ordered by their index within their parent
 * dataset so that questions range many datasets.
 */
function generateQuestions(topics, dataset, variable) {
    const datasetVariables = _(dataset.variables)
        .values()
        .filter(other => other.id !== variable.id)
        .value();

    const otherVariables = _(topics)
        .values()
        .map(_.property('datasets'))
        .map(_.values)
        .flatten()
        .filter(other => other.id !== dataset.id)
        .map(dataset => {
            return _.values(dataset.variables)
                .map((variable, index) => _.assign(variable, {index}));
        })
        .flatten()
        .sortBy('index')
        .value();

    return datasetVariables.concat(otherVariables)
        .slice(0, GlobalConfig.question_count);
}

/**
 * Refine popup on mobile should be open when navigating from search page.
 */
function showRefineMenu(request) {
    const ref = request.query.ref;
    return !_.isEmpty(ref) && (ref === 'search-entity' || ref === 'suggest-entity');
}

