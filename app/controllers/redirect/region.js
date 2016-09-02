
/**
 * Redirect links from pre-backend to new URL format.
 *  - https://github.com/socrata/opendatanetwork.com/issues/480
 */

const _ = require('lodash');
const fs = require('fs-promise');

const EntityNavigate = require('../../../src/navigate/entity');

const topicToVectorPromise = readJSON(pathTo('topic-to-vector.json'));
const vectorToTopicPromise = topicToVectorPromise.then(getVectorToTopicPromise);

const topicChangesPromise = readJSON(pathTo('topics.json'));
const datasetChangesPromise = readJSON(pathTo('datasets.json'));
const variableChangesPromise = readJSON(pathTo('variables.json'));

module.exports = (request, response) => {
    Promise.all([
        topicChangesPromise,
        datasetChangesPromise,
        variableChangesPromise,
        vectorToTopicPromise
    ]).then(([
        topicChanges,
        datasetChanges,
        variableChanges,
        vectorToTopic
    ]) => {
        const metric = request.params.metric;
        const vector = request.params.vector;
        const oldTopic = vectorToTopic[vector];

        const topic = _.get(topicChanges, oldTopic, oldTopic);
        const dataset = _.get(datasetChanges, [oldTopic, vector], vector);
        const variable = _.get(variableChanges, [oldTopic, vector, metric], metric);

        const variableID = [topic, dataset, variable].filter(_.negate(_.isEmpty)).join('.');
        const entityIDs = request.params.regionIDs.split('-');
        const entityNames = request.params.regionNames.split('-');
        const entities = _.zip(entityIDs, entityNames)
            .map(pair => _.object(['id', 'name'], pair))
            .filter(entity => !_.isEmpty(entity.id));
        const constraints = 'year' in request.params ? {year: request.params.year} : {};

        const url = new EntityNavigate(entities, variableID, constraints).url();

        response.redirect(300, url);
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

