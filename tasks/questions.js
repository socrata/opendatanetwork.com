'use strict';

/*
 * Generating questions for the ODN to answer.
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

class Question {
    constructor(source, variable, region, stopwords) {
        this.source = source;
        this.variable = variable;
        this.region = region;
        this.stopwords = stopwords;

        this.text = this._text();
        this.url = this._url();
        this.encoded = this._encoded();
    }

    // Generates a simplifed name for a region for autocompletion.
    //
    // e.g. Seattle Metro Area (WA) -> Seattle
    //      Seattle, WA -> Seattle
    //      King County, WA -> King County
    //      98122 ZIP Code -> 98122
    //      Washington -> Washington
    _simpleRegionName() {
        const name = this.region.name;
        const type = this.region.type;

        if (type === 'zip_code') {
            return name.split(' ')[0];
        } else if (type === 'place' || type === 'county') {
            return name.split(',')[0];
        } else if (type === 'msa') {
            return _.initial(name.split(' '), 3);
        } else {
            return name;
        }
    }

    /* Extracts all the important words from a string.
     * Ignores all words in stopwords.json.
     */
    _importantWords(string) {
        return string.replace(/[\.,]/g, '')
            .replace(/[\\\/]/g, ' ')
            .toLowerCase()
            .split(' ')
            .filter(word => !_.contains(this.stopwords, word));
    }

    /* Say we have a question like:
     *      Population of Seattle
     *
     * Since autocomplete depends on word ordering, we have to generate
     * likely permutations of each question. For example, instead of just
     * having "seattle population" we also need "population seattle".
     *
     * Take all of the important words in the variable name by stripping stop words.
     *      "population count" -> "population"
     *      "population rate of change" -> "population change"
     *      "median earnings" -> "earnings"
     *      "median female earnings (full time)" -> "female earnings"
     *      "high school graduation rate" -> "high school graduation"
     *      "computers and math employment rate" -> "computers math employment"
     * Then, generate all of the permutations of this with the simplified region name.
     *      "Seattle", "population" ->
     *          "Seattle population", "population Seattle"
     *      "Seattle", "population change" ->
     *          "Seattle population change", "population change Seattle",
     *          "Seattle population", "population Seattle"
     *      "Seattle", "computers math employment"
     *          "Seattle computers", "computers Seattle",
     *          "Seattle math", "math Seattle",
     *          "Seattle employment", "employment Seattle",
     *          "Seattle computers employment",
     *      "Seattle", "computers math employment"
     *          "Seattle computers", "computers Seattle",
     *          "Seattle math", "math Seattle",
     *          "Seattle employment", "employment Seattle",
     *          "Seattle computers employment"...
     */

    _text() {
        const variableWords = this._importantWords(this.variable.name);
        const regionName = this._simpleRegionName(this.region);

        const permutations = _permutations(variableWords.concat(regionName));
        const permutationString = _.flatten(permutations).join(' ');
        return permutationString;
    }

    _url() {
        return `/region/${this.region.id}/${this.source.name}/${this.variable.metric}`;
    }

    _encoded() {
        return `${this.text} ${_encode([this.region.name, _lowercase(this.variable.name), this.url])}`;
    }
}

class QuestionVariable {
    constructor(questionSource, variable, stopwords) {
        this.source = questionSource;
        this.mapSource = questionSource.mapSource;
        this.dataSource = questionSource.dataSource;
        this.variable = variable;
        this.stopwords = stopwords;
    }

    filterRegions(regions) {
        return regions.filter(region => this.source.supportsRegion(region));
    }

    questions(allRegions, stopwords) {
        return this.filterRegions(allRegions)
            .map(region => new Question(this.dataSource, this.variable, region, this.stopwords));
    }
}

class QuestionSource {
    constructor(mapSource, stopwords) {
        this.mapSource = mapSource;
        this.dataSource = Sources.source(mapSource.name);
        this.stopwords = stopwords;

        this.variables = mapSource.variables.map(variable => {
            return new QuestionVariable(this, variable, stopwords);
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

function _error(error) {
    console.error(error.stack);
}

_regions().then(regions => {
    _stopwords().then(stopwords => {
        try {
            const mapSource = MAP_SOURCES.population;

            regions = regions.slice(0, 100);
            const nestedQuestions = _.values(MAP_SOURCES).slice(0, 1).map(mapSource => {
                const questionSource = new QuestionSource(mapSource, stopwords);
                return questionSource.questions(regions);
            });
            const questions = _.flatten(nestedQuestions);
            const questionsString = questions.map(question => `"${question.encoded}"`).join('\n');

            fs.writeFile('tasks/questions.csv', questionsString, error => {
                if (error) console.error(error);
            });
        } catch (error) {
            _error(error);
        }
    }, _error);
}, _error);

function _readJSONFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
}

function _regions() {
    return _readJSONFile('tasks/roster.json');
}

function _stopwords() {
    return _readJSONFile('tasks/stopwords.json');
}

function _encode(list) {
    return new Buffer(list.join(':')).toString('base64');
}

function _allUpperCase(word) {
    return word.split('').reduce((previous, current) => {
        return previous && (current == current.toUpperCase());
    }, true);
}

function _lowercase(string) {
    return string.split(' ').map(word => {
        return _allUpperCase(word) ? word : word.toLowerCase();
    }).join(' ');
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

