'use strict';

const _ = require('lodash');

const Autosuggest = require('./autosuggest');

const autosuggest = new Autosuggest({
    name: 'Questions',
    image: 'fa-question-circle',
    domain: 'odn.data.socrata.com',
    fxf: '234x-8y9w',
    column: 'question',
    encoded: ['regionName', 'regionID', 'regionPopulation',
              'vector', 'source', 'variable', 'metric', 'index'],
    sort: option => {
        const population = parseFloat(option.regionPopulation);
        const index = parseFloat(option.index);
        return -(population - index);
    },
    max: 100,
    shown: 100
});

class Questions {
    static get(term) {
        return Questions._extend(autosuggest.search(term));
    }

    static forRegions(regions) {
        return new Promise((resolve, reject) => {
            autosuggest.get({
                '$where': `regionid in(${regions.map(region => `'${region.id}'`).join(',')})`,
                '$order': 'variableindex ASC'
            }).then(questions => {
                questions = _.groupBy(questions, question => question.vector + question.metric);
                questions = _.values(questions);
                questions = questions.map(questionGroup => {
                    const question = questionGroup[0];

                    return _.extend({}, question, {
                        numRegions: questionGroup.length,
                        url: path(['region',
                            questionGroup.map(_.property('regionID')).join('-'),
                            questionGroup.map(_.property('regionName')).join('-'),
                            question.vector, question.metric]) + '?question=1',
                        regionName: englishJoin(questionGroup.map(_.property('regionName')))
                    });
                });
                questions = questions.slice(0, 15);

                resolve(questions);
            }, reject);
        });
    }

    /**
     * Adds url field to each question.
     */
    static _extend(promise) {
        return new Promise((resolve, reject) => {
            promise.then(questions => {
                questions = questions.map(question => _.extend({}, question, {
                    url: path(['region', question.regionID, question.regionName,
                            question.vector, question.metric]) + '?question=1',
                    numRegions: 1
                }));

                resolve(questions);
            }, reject);
        });
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

function englishJoin(elements) {
    if (elements.length === 0) {
        return '';
    } else if (elements.length === 1) {
        return elements[0];
    } else if (elements.length === 2) {
        return elements.join(' and ');
    } else {
        return englishJoin([elements.slice(0, 2).join(', ')].concat(elements.slice(2)));
    }
}

module.exports = Questions;

