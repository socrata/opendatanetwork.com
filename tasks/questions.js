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

class QuestionVariable {
    constructor(questionSource, variable) {
        this.source = questionSource;
        this.mapSource = questionSource.mapSource;
        this.dataSource = questionSource.dataSource;
        this.variable = variable;
    }

    supportsRegion(region) {
        return new Promise((resolve, reject) => {
            if (!this.source.supportsRegion(region)) {
                resolve(false);
            } else {
                resolve(true);
                /*
                const path = `https://${this.mapSource.domain}/resource/${this.mapSource.fxf}.json`;
                const baseParams = {
                    [this.mapSource.idColumn || 'id']: region.id,
                    [this.mapSource.typeColumn || 'type']: region.type,
                    [this.mapSource.yearColumn || 'year']: _.max(this.variable.years),
                };
                const params = _.extend(baseParams, this.variable.params);
                const url = Request.buildURL(path, params);

                Request.getJSON(url).then(response => {
                    console.log(response);
                    resolve(response.length > 0);
                }, reject);
                */
            }
        });
    }

    filterRegions(regions) {
        return new Promise((resolve, reject) => {
            const promises = regions.map(region => this.supportsRegion(region));

            Promise.all(promises).then(supportsVector => {
                console.log(supportsVector);
                resolve(regions.filter((region, index) => {
                    return supportsVector[index];
                }));
            }, reject);
        });
    }

    questions(allRegions) {
        return new Promise((resolve, reject) => {
            try {
            allRegions.forEach(region => {
                this.supportsRegion(region).then(supported => {
                    if (supported) {
                        resolve(new Question(this.dataSource, this.variable, region));
                    }
                }, error => {
                    console.error(error);
                });
            });
            } catch (error) { throw error; }
        });

        /*
        return new Promise((resolve, reject) => {
            this.filterRegions(allRegions).then(regions => {
                resolve(regions.map(region => {
                    return new Question(this.dataSource, this.variable, region);
                }));
            }, reject);
        });
        */
    }
}

class QuestionSource {
    constructor(mapSource) {
        this.mapSource = mapSource;
        this.dataSource = Sources.source(mapSource.name);

        this.variables = mapSource.variables.map(variable => {
            return new QuestionVariable(this, variable);
        });
    }

    supportsRegion(region) {
        return (_.contains(this.dataSource.regions, region.type) &&
            (!this.dataSource.include || this.dataSource.include(region)));
    }
}

_regions().then(regions => {
    try {
        const mapSource = MAP_SOURCES.population;
        const questionSource = new QuestionSource(mapSource);
        questionSource.variables[0].questions(regions).then(question => {
            console.log(question);
        }, error => {
            console.error(error);
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
