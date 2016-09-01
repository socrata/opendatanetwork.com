
/**
 * Controller for pages that display data about entities.
 */

const _ = require('lodash');

const ODNClient = require('../lib/odn-client');
const EntityFormatter = require('../lib/entity-formatter');
const GlobalConstants = require('../../src/constants');
const DatasetConfig = require('../../src/dataset-config');

const Exception = require('../lib/exception');
const notFound = Exception.notFound;
const invalid = Exception.invalidParam;

// TODO move this to another file
const querystring = require('querystring');

class Navigate {
    constructor(entityIDs, variableID, query) {
        this.entityIDs = entityIDs;
        this.variableID = variableID;
        this.query = query || {};
    }

    to(entity) {
        return new Navigate([entity.id], this.variableID, this.query);
    }

    add(entity) {
        if (_.includes(this.entityIDs, entity.id)) return this;
        return new Navigate([entity.id].concat(this.entityIDs), this.variableID, this.query);
    }

    remove(entity) {
        const entities = this.entityIDs.filter(id => id !== entity.id);
        return new Navigate(entities, this.variableID, this.query);
    }

    topic(topicID) {
        return this.variable(topicID);
    }

    dataset(datasetID) {
        return this.variable(datasetID);
    }

    variable(variableID) {
        return new Navigate(this.entityIDs, variableID, this.query);
    }

    url() {
        const path = `/entity/${this.entityIDs.join('-')}/${this.variableID}`;
        const query = querystring.stringify(this.query);
        return `${path}?${query}`;
    }

    static fromRequest(request) {
        const entityIDs = getEntityIDs(request);
        const variableID = getVariableID(request);
        const query = _.clone(request.query);
        return new Navigate(entityIDs, variableID, query);
    }
}

module.exports = (request, response) => {
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
                getConstraints(entityIDs, variableID, dataset.constraints, fixed),
                EntityFormatter.entityPageTitle(entities, dataset, variable),
            ]).then(([datasets, questions, constraints, title]) => {
                getDescription(entityIDs, variableID, constraints).then(description => {
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
                        description,
                        topics: _.values(availableData),
                        navigate: Navigate.fromRequest(request),
                        datasetConfig: DatasetConfig[dataset.id],
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
                }).catch(error => {
                    console.log(error);
                    response.json({error});
                });
            }).catch(error => {
                console.log(error);
                response.json({error});
            });
        }).catch(error => {
            console.log(error);
            response.json({error});
        });
    }).catch(error => {
        console.log(error);
        response.json({error});
    });
};

function getFixedConstraints(request, dataset) {
    return _.pick(request.query, dataset.constraints);
}

function getVariable(availableData, fullVariableID) {
    const idParts = fullVariableID.split('.');
    if (idParts.length !== 3)
        return Promise.reject(invalid(`invalid variable id: '${fullVariableID}'`));

    const [topicID, datasetID, variableID] = idParts;
    if (!(topicID in availableData))
        return Promise.reject(notFound(`topic not found: '${topicID}'`));
    const topic = availableData[topicID];

    if (!(datasetID in topic.datasets))
        return Promise.reject(notFound(`no '${datasetID}' dataset found in '${topicID}'`));
    const dataset = topic.datasets[datasetID];

    if (!(variableID in dataset.variables))
        return Promise.reject(notFound(`no '${variableID}' variable found in '${topicID}.${datasetID}'`));
    const variable = dataset.variables[variableID];

    return Promise.resolve([topic, dataset, variable]);
}

function getConstraints(entityIDs, variableID, constraints, fixed, results) {
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
        return getConstraints(entityIDs, variableID, _.tail(constraints), fixed, results);
    });
}

function getRelated(entityID) {
    const promises = ['parent', 'child', 'sibling', 'peer']
        .map(relation => ODNClient.related(entityID, relation));

    return Promise.all(promises)
        .then(result => Promise.resolve(_.merge.apply(_, result)));
}

function getEntityIDs(request) {
    return request.params.entityIDs.split('-');
}

function getVariableID(request) {
    return request.params.variableID;
}

function getDescription(entityIDs, variableID, constraintData) {
    const constraints = _(constraintData)
        .map(constraint => [constraint.name, constraint.selected])
        .object()
        .value();

    return ODNClient.values(entityIDs, variableID, constraints, true)
        .then(response => Promise.resolve(response.description));
}

function getTitle(entities, dataset, variable) {
    return 'ODN';
}

