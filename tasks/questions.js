'use strict';

/* Generating questions for the ODN to answer.
 *
 * Region -> topic -> subtopic
 *
 * What is the high school graduation rate for Seattle?
 * What is the population of Seattle?
 * How do the populations of Seattle and Puyallup compare?
 *
 */

const _ = require('lodash');
const fs = require('fs');

const Request = require('../controllers/request.js');
const MAP_SOURCES = require('../src/data/map-sources.js');
const Sources = require('../src/data/data-sources.js');
const Stopwords = require('../src/autosuggest/stopwords.js');

const REGIONS = JSON.parse(fs.readFileSync('tasks/roster.json'));

function main() {
    const fd = fs.openSync('tasks/questions.csv', 'w');

    try {
        fs.writeSync(fd, 'question,source,variable,variableIndex,regionID,regionType,regionName,regionPopulation\n');

        _.values(MAP_SOURCES)
            .filter(source => source.questions)
            .forEach(mapSource => {
            console.log(`generating questions for ${mapSource.name}...`);
            const counter = new Counter(n => `wrote ${n} questions for ${mapSource.name}`);

            new QuestionSource(mapSource)
                .questions(REGIONS)
                .forEach(question => {
                    const fields = [
                        question.encoded,
                        question.source.vector,
                        question.variable.metric,
                        question.index,
                        question.region.id,
                        question.region.type,
                        question.region.name,
                        question.region.population
                    ];

                    const row = fields.map(field => `"${field}"`).join(',');
                    fs.writeSync(fd, `${row}\n`);

                    counter.increment();
                });

            counter.log();
        });
    } catch (error) {
        _error(error);
    } finally {
        fs.closeSync(fd);
    }
}

class Question {
    /* source - data source from data-sources.js
     * variable - map variable from map-sources.js
     * region - must include population
     * index - index of the map variable (used for sorting default variable first)
     */
    constructor(source, variable, region, index) {
        this.source = source;
        this.variable = variable;
        this.region = region;
        this.index = index;

        this.text = this._text();
        this.encoded = this._encoded();
    }

    /* Generates a question string.
     *
     * To get around the word ordering limitations of autosuggest,
     * we have to generate all the possible permutations of a question
     * to make sure that we can match on any part of the question.
     *
     * Since taking all possible permutations of the region name
     * with each word in the variable name would be costly,
     * we use a few optimizations.
     *
     * First, we only use the important words in the variable name.
     * All words in stopwords.json are excluded. These are not general
     * stopwords - they are selected specifically for this purpose.
     *
     * Next, we simplify region names so that state suffixes do not
     * restrict matches. For example, "Seattle Metro Area (WA)" becomes
     * "Seattle" and "King County, WA" becomes "King County".
     *
     * Then, we take all the permutations of the important words in the
     * variable name and the simplified region name.
     * We also strip adjacent duplicate words to decrease the size
     * of the permutation string.
     *
     * For example, given the region "Seattle, WA" and the variable
     * "Population Count", we would produce the following question:
     *      "population seattle population"
     *  Which will match both of the following queries:
     *      "seattle population" and
     *      "population seattle"
     */
    _text() {
        const variableWords = Stopwords.importantWords(this.variable.name);
        const regionName = _simpleRegionName(this.region);

        const permutations = _permutations([regionName].concat(variableWords));
        const permutationString = _removeAdjacentDuplicates(_.flatten(permutations)).join(' ');
        return permutationString;
    }

    /* Various fields are encoded in each question for use by the client.
     * Variables are colon delimited and base64 encoded.
     *
     * The following fields are encoded in each question (in order):
     *  - region name (complete name with state suffix)
     *  - region id
     *  - region population (estimate from 2013 ACS)
     *  - data source vector
     *  - data source name (lowercase)
     *  - variable name (lowercase with respect for all-caps words like "GDP")
     *  - metric name
     *  - variable index (position of variable in list of variables)
     */
    _encoded() {
        const encodedFields = [
            this.region.name,
            this.region.id,
            this.region.population,
            this.source.vector,
            this.source.name.toLowerCase(),
            _lowercase(this.variable.name),
            this.variable.metric,
            this.index
        ];

        return `${this.text} ${_encode(encodedFields)}`;
    }
}

class QuestionVariable {
    constructor(questionSource, variable, index) {
        this.source = questionSource;
        this.mapSource = questionSource.mapSource;
        this.dataSource = questionSource.dataSource;
        this.variable = variable;
        this.index = index; // index is used to rank variables so default appears first
    }

    filterRegions(regions) {
        return regions.filter(region => this.source.supportsRegion(region));
    }

    questions(allRegions) {
        if ('questions' in this.variable && !this.variable.questions) return [];

        return this.filterRegions(allRegions)
            .map(region => new Question(this.dataSource, this.variable, region, this.index));
    }
}

class QuestionSource {
    constructor(mapSource) {
        this.mapSource = mapSource;
        this.dataSource = Sources.source(mapSource.name);

        this.variables = mapSource.variables.map((variable, index) => {
            return new QuestionVariable(this, variable, index);
        });
    }

    supportsRegion(region) {
        return (_.contains(this.dataSource.regions, region.type) &&
            (!this.dataSource.include || this.dataSource.include(region)));
    }

    questions(allRegions) {
        const questions = this.variables.map(variable => variable.questions(allRegions));
        return _.flatten(questions);
    }
}

class Counter {
    constructor(template) {
        this.template = template || (n => `${n}`);
        this.counter = 0;
    }

    increment() {
        this.counter++;
    }

    log() {
        console.log(this.template(this.counter));
    }
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

/* Encodes a list in base64. Elements of the list are delimited with a ":". */
function _encode(list) {
    return new Buffer(list.join(':')).toString('base64');
}

/* Lowercase of string unless string is all uppercase. */
function _lowercase(string) {
    return string.split(' ').map(word => {
        return _allUpperCase(word) ? word : word.toLowerCase();
    }).join(' ');
}

/* Tests if a word is all uppercase. */
function _allUpperCase(word) {
    return word.split('').reduce((previous, current) => {
        return previous && (current == current.toUpperCase());
    }, true);
}

/* Generates all permutations of the given list.
 * All elements of the list are assumed to be unique.
 *
 * e.g. [1, 2] -> [[1, 2], [2, 1]]
 */
function _permutations(list) {
    if (list.length === 0) return [];
    if (list.length === 1) return [list];
    if (list.length === 2) return [list, list.slice(0).reverse()];

    return _.flatten(list.map(element => {
        return _permutations(_.without(list, element))
            .map(permutation => [element].concat(permutation));
    }));
}

/* Replaces groups of duplicates with only one element.
 *
 * e.g. [1, 2, 2, 1, 1, 1] -> [1, 2, 1]
 */
function _removeAdjacentDuplicates(list) {
    return list.filter((element, index) => {
        return (index === list.length - 1) || (element !== list[index + 1]);
    });
}

/* Handles a promise rejection by logging the stack trace. */
function _error(error) {
    console.error(error.stack);
}

main();

