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


class Question {
    constructor(source, variable, region) {
        this.source = source;
        this.variable = variable;
        this.region = region;

        this.text = this._text();
        this.url = this._url();
        this.encoded = this._encoded();
    }

    _text() {
        return `What is the ${_lowercase(this.variable.name)} for ${this.region.name}?`;
    }

    _url() {
        return `/region/${this.region.id}/${this.source.name}/${this.variable.metric}`;
    }

    _encoded() {
        return `${this.text} ${_encode(this.url)}`;
    }
}

_regions().then(regions => {
    try {
        const sources = _.values(MAP_SOURCES);

        _.values(MAP_SOURCES).forEach(source => {
            source.variables.forEach(variable => {
                const question = new Question(source, variable, regions[0]);
                console.log(question.text);
            });
        });
    } catch (error) {
        console.error(error);
    }
}, error => {
    console.error(error);
});

function _regions() {
    return new Promise((resolve, reject) => {
        fs.readFile('tasks/roster.json', (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
}

function _encode(ascii) {
    return new Buffer(ascii, 'base64');
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
