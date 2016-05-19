'use strict';

const Autosuggest = require('./autosuggest');

const autosuggest = new Autosuggest({
    name: 'Questions',
    image: 'fa-question-circle',
    domain: 'odn.data.socrata.com',
    fxf: 'd6be-a5xs',
    column: 'question',
    encoded: ['regionName', 'regionID', 'regionPopulation',
              'source', 'variable', 'metric', 'index'],
    sort: option => {
        const population = parseFloat(option.regionPopulation);
        const index = parseFloat(option.index);
        return -(population - index);
    }
});

function urlEscape(string) {
    return string
        .replace(/,/g, '')
        .replace(/[ \/]/g, '_');
}

function path(elements) {
    return `/${elements.map(urlEscape).join('/')}`;
}

class Questions {
    static get(term) {
        return new Promise((resolve, reject) => {
            autosuggest.search(term).then(questions => {
                questions.forEach(question => {
                    question.url = path(['region', question.regionID, question.regionName,
                            question.source, question.metric]) + '?question=1';
                    question.text = `What is the ${question.variable} of ${question.regionName}`;
                });

                resolve(questions);
            }, reject);
        });
    }
}

module.exports = Questions;

