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

class Questions {
    static get(term) {
        return new Promise((resolve, reject) => {
            autosuggest.search(term).then(questions => {
                questions.forEach(question => {
                    question.url = path(['region', question.regionID, question.regionName,
                            question.source, question.metric]) + '?question=1';
                    question.text = `What is the ${question.variable} of ${question.regionName}?`;
                });

                resolve(questions);
            }, reject);
        });
    }

    static getForRegion(region) {
        return Questions.get(_simpleRegionName(region));
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

/* Generates a simplifed name for a region for autocompletion.
 *
 * e.g. Seattle Metro Area (WA) -> Seattle
 *      Seattle, WA -> Seattle
 *      King County, WA -> King County
 *      98122 ZIP Code -> 98122
 *      Washington -> Washington
 */
function _simpleRegionName(region) {
    const name = region.name;
    const type = region.type;

    if (type === 'zip_code') {
        return name.split(' ')[0];
    } else if (type === 'place' || type === 'county') {
        return name.split(',')[0];
    } else if (type === 'msa') {
        const words = name.split(' ');
        return words.slice(0, words.length - 3).join(' ');
    } else {
        return name;
    }
}

module.exports = Questions;

