
/**
 * Controller for pages that display data about entities.
 */

const _ = require('lodash');

const EntityFormatter = require('../lib/entity-formatter');
const ODNClient = require('../../src/odn-client/odn-client');
const GlobalConstants = require('../../src/constants');
const DatasetConfig = require('../../src/dataset-config');
const Navigate = require('../../src/navigate/entity');

const Exception = require('../lib/exception');
const notFound = Exception.notFound;
const invalid = Exception.invalidParam;

module.exports = (request, response) => {
    const errorHandler = Exception.getHandler(request, response);

    // TODO what if no entityIDs
    const entityIDs = getEntityIDs(request);
    const variableID = getVariableID(request);

    Promise.all([
        ODNClient.entities(entityIDs),
        ODNClient.availableData(entityIDs),
        getRelated(entityIDs[0])
    ]).then(([entities, availableData, related]) => {
        getVariable(availableData, variableID).then(([topic, dataset, variable]) => {
            const fixed = getFixedConstraints(request, dataset);

            Promise.all([
                ODNClient.searchDatasets(entityIDs, dataset.id),
                ODNClient.searchQuestions(entityIDs, dataset.id),
                getConstraintMenus(entityIDs, variable.id, dataset.constraints, fixed),
                EntityFormatter.entityPageTitle(entities, dataset, variable),
            ]).then(([datasets, questions, constraintMenus, title]) => {
                const constraints = getConstraints(constraintMenus);

                getDescription(entityIDs, variable.id, constraints).then(description => {
                    const templateData = {
                        _,
                        page: 'entity',
                        GlobalConstants,
                        title,
                        questions,
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
                        topics: _.values(availableData),
                        navigate: new Navigate(entities, variableID, _.clone(request.query)),
                        chartConfig: DatasetConfig[dataset.id],
                        css: [
                            '/styles/third-party/leaflet.min.css',
                            '/styles/third-party/leaflet-markercluster.min.css',
                            '/styles/third-party/leaflet-markercluster-default.min.css',
                            '/styles/search.css',
                            '/styles/maps.css',
                            '/styles/main.css'
                        ],
                        scripts: [
                            '//cdnjs.cloudflare.com/ajax/libs/numeral.js/1.4.5/numeral.min.js',
                            '//www.google.com/jsapi?autoload={"modules":[{"name":"visualization","version":"1","packages":["corechart", "table"]}]}',
                            '//cdn.socket.io/socket.io-1.4.5.js',
                            '/lib/third-party/leaflet/leaflet.min.js',
                            '/lib/third-party/leaflet/leaflet-omnivore.min.js',
                            '/lib/third-party/leaflet/leaflet-markercluster.min.js',
                            '/lib/third-party/colorbrewer.min.js',
                            '/lib/third-party/d3.min.js',
                            '/lib/third-party/d3.promise.min.js',
                            '/lib/third-party/js.cookie-2.1.1.min.js',
                            '/lib/third-party/leaflet-omnivore.min.js',
                            '/lib/third-party/lodash.min.js',
                            '/lib/entity.min.js'
                        ]
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

function getFixedConstraints(request, dataset) {
    return _.pick(request.query, dataset.constraints);
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
    if (_.isUndefined(name))
        return Promise.resolve(_.first(_.values(nodes)));
    if (name in nodes)
        return Promise.resolve(nodes[name]);
    return Promise.reject(notFound(`variable not found: ${name}`));
}

function getConstraintMenus(entityIDs, variableID, constraints, fixed, results) {
    fixed = fixed || {};
    results = results || [];

    const constraint = _.first(constraints);
    return ODNClient.constraints(entityIDs, variableID, constraint, fixed).then(options => {
        const selected = (constraint in fixed && _.includes(options, fixed[constraint])) ?
            fixed[constraint] : _.first(options);
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

function getRelated(entityID) {
    const promises = ['parent', 'child', 'sibling', 'peer']
        .map(relation => ODNClient.related(entityID, relation, GlobalConstants.PEER_REGIONS));

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

function getTitle(entities, dataset, variable) {
    return 'ODN';
}

