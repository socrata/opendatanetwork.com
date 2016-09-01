'use strict';

const _ = require('lodash');

const Autosuggest = require('./autosuggest');
const GlobalConstants = require("../../src/constants");
const ControllerConstants = require('./constants');
const Data = require('./data');
const Request = require('./request');

const ODNClient = require('./odn-client');

// TODO: What is this for? Used anywhere?
// const autosuggest = new Autosuggest({
//   name: 'Questions',
//   image: 'fa-question-circle',
//   domain: 'odn.data.socrata.com',
//   fxf: '234x-8y9w',
//   column: 'question',
//   encoded: ['regionName', 'regionID', 'regionPopulation',
//     'vector', 'source', 'variable', 'metric', 'index'],
//   sort: option => {
//     const population = parseFloat(option.regionPopulation);
//     const index = parseFloat(option.index);
//     return -(population - index);
//   },
//   max: 100,
//   shown: 100
// });

class Questions {
    static getQuestionsForSearchTerm(term, dataAvailability) {
        return new Promise((resolve, reject) => {
            ODNClient.searchEntities(term).then(regions => {
                if (regions.length === 0) {
                    resolve([]);
                    return;
                }

                // Use the first region returned for the questions
                //
                Data.getDataAvailability([regions[0]]).then(dataAvailability => {
                    Questions.getQuestionsForRegionsAndDataAvailibility([regions[0]], dataAvailability).then(response => {
                        resolve(response);
                    });
                });
            }, reject);
        });
    }

    static getQuestionsForRegions(regions) {
        return new Promise((resolve, reject) => {
            Data.getDataAvailability(regions).then(dataAvailability => {
                Questions.getQuestionsForRegionsAndDataAvailibility(regions, dataAvailability).then(response => {
                    resolve(response);
                });
            }, reject);
        });
    }

    // TODO: if we can restructure the URLs to remove the vector component and only use variable IDs, we can
    // remove this call to get dataAvailability.
    //
    static getQuestionsForRegionsAndDataAvailibility(regions, dataAvailability) {
        return new Promise((resolve, reject) => {
            const url = Request.buildURL(ControllerConstants.SEARCH_QUESTION_URL, {
                app_token: GlobalConstants.APP_TOKEN,
                entity_id: regions.map(region => region.id).join(','),
                limit: 15
            });

            Request.getJSON(url).then(response => {

                const questions = [];

                response.questions.forEach(question => {

                    const segments = question.variable_id.split('.');
                    segments.pop();

                    const datasetId = segments.join('.');
                    const vector = getVectorForDatasetId(dataAvailability, datasetId);

                    if (!vector || (vector.length == 0))
                        return;

                    const returnedQuestion = _.extend({}, question, {
                        numRegions: regions.length,
                        url: path([
                                'region',
                                regions.map(region => region.id).join('-'),
                                regions.map(region => region.name).join('-'),
                                vector,
                                question.variable_id]) + '?question=1'
                    });

                    questions.push(returnedQuestion);
                });

                resolve(questions);
            },  reject);
        });
    }
}

function getVectorForDatasetId(dataAvailability, datasetId) {

    for (var topicKey in dataAvailability.topics) {

        var topic = dataAvailability.topics[topicKey];

        for (var datasetKey in topic.datasets) {

            var dataset = topic.datasets[datasetKey];
            if (dataset.id == datasetId)
                return dataset.name.toLowerCase();
        }
    }
}

function urlEscape(string) {
    return string
        .replace(/,/g, '')
        .replace(/[ \/]/g, '_');
}

function path(elements) {
    return `/${elements.map(urlEscape).join('/')}`;
}

module.exports = Questions;

