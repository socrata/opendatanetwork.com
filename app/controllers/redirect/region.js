
/**
 * Redirect links from pre-backend to new URL format.
 *  - https://github.com/socrata/opendatanetwork.com/issues/480
 */

const _ = require('lodash');
const fs = require('fs-promise');

const EntityNavigate = require('../../../src/navigate/entity');

const data = Promise.all([
    readJSON(pathTo('topic-to-vector.json')).then(getVectorToTopicPromise),
    readJSON(pathTo('topics.json')),
    readJSON(pathTo('datasets.json')),
    readJSON(pathTo('variables.json')),
    readJSON(pathTo('variable-to-constraint.json'))
]);

module.exports = (request, response) => {
    data.then(([
        vectorToTopic,
        topicChanges,
        datasetChanges,
        variableChanges,
        variableToConstraint
    ]) => {
        const metric = request.params.metric;
        const vector = request.params.vector;
        const oldTopic = vectorToTopic[vector];

        const topic = _.get(topicChanges, oldTopic, oldTopic);
        const dataset = _.get(datasetChanges, [oldTopic, vector], vector);
        let variable = _.get(variableChanges, [oldTopic, vector, metric], metric);

        let constraints = {};
        if ('year' in request.params) constraints.year = request.params.year;
        const toConstraint = _.get(variableToConstraint, [oldTopic, vector]);
        if (toConstraint) constraints[toConstraint.constraint] = variable;
        if (toConstraint) variable = toConstraint.variable;

        const variableID = [topic, dataset, variable].filter(_.negate(_.isEmpty)).join('.');
        const entityIDs = (request.params.regionIDs || '').split('-');
        const entityNames = (request.params.regionNames || '').split('-');
        const entities = _.zip(entityIDs, entityNames)
            .map(pair => _.object(['id', 'name'], pair))
            .filter(entity => !_.isEmpty(entity.id));

        const url = new EntityNavigate(entities, variableID, constraints).url();

        response.redirect(301, url);
    }).catch(error => {
        console.log(error);
    });
};

function getVectorToTopicPromise(topicToVector) {
    return Promise.resolve(getVectorToTopic(topicToVector));
}

function getVectorToTopic(topicToVector) {
    return _(topicToVector)
        .pairs()
        .map(([topic, vectors]) => vectors.map(vector => [vector, topic]))
        .flatten()
        .object()
        .value();
}

function readJSON(fsReadFileArguments) {
    return fs.readFile.apply(this, arguments).then(JSON.parse);
}

function pathTo(fileName) {
    return `app/controllers/redirect/${fileName}`;
}

