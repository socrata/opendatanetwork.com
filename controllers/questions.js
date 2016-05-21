'use strict';

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
    shown: 15
});

class Questions {
    static get(term) {
        return Questions._extend(autosuggest.search(term));
    }

    static forRegion(region) {
        return Questions._extend(autosuggest.get({
            'regionid': region.id,
            '$order': 'variableindex DESC'
        }));
    }

    /**
     * Adds url field to each question.
     */
    static _extend(promise) {
        return new Promise((resolve, reject) => {
            promise.then(questions => {
                questions.forEach(question => {
                    question.url = path(['region', question.regionID, question.regionName,
                            question.vector, question.metric]) + '?question=1';
                });

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

module.exports = Questions;

