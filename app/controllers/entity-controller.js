
/**
 * Controller for pages that display data about entities.
 */

const _ = require('lodash');

const ODNClient = require('../lib/odn-client');

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

            getConstraints(entityIDs, variableID, dataset.constraints, fixed).then(constraintData => {
                getDescription(entityIDs, variableID, constraintData).then(description => {
                    response.json({related, entities, topic, dataset, variable, constraintData, description});
                    console.log(description);
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
        return Promise.reject(`invalid variable id: '${fullVariableID}'`);

    const [topicID, datasetID, variableID] = idParts;
    if (!(topicID in availableData))
        return Promise.reject(`topic not found: '${topicID}'`);
    const topic = availableData[topicID];

    if (!(datasetID in topic.datasets))
        return Promise.reject(`no '${datasetID}' dataset found in '${topicID}'`);
    const dataset = topic.datasets[datasetID];

    if (!(variableID in dataset.variables))
        return Promise.reject(`no '${variableID}' variable found in '${topicID}.${datasetID}'`);
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
    return request.params.entityIDs.split(',');
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

