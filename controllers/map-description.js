'use strict';

const _ = require('lodash');

const Navigate = require('./navigate');
const Request = require('./request');

const MAP_SOURCES = require('../src/data/map-sources.js');


class MapSource {
    constructor(mapSource) {
        this.source = mapSource;
        this.variables = mapSource.variables;
        this.id = mapSource.idColumn || 'id';
        this.year = mapSource.yearolumn || 'year';
    }

    otherVariables(currentVariable) {
        return this.variables.filter(variable => variable.name !== currentVariable.name);
    }

    variables() {


    }

    getData(variable, year, regions) {
        const path = `https://${this.source.domain}/resource/${this.source.fxf}.json`;
        const columns = [this.id].concat(variable.column);
        const params = _.extend({
            '$select': columns.join(','),
            '$where': `${this.id} in (${regions.map(region => `'${region.id}'`)})`,
            [this.year]: year
        });
        const url = Request.buildURL(path, params);
        return Request.getJSON(url);
    }

    summarize(variable, year, regions) {
        return new Promise((resolve, reject) => {
            this.getData(variable, year, regions).then(data => {
                const summary = regions.map(region => {
                    const row = _.find(data, row => row[this.id] === region.id);

                    const value = variable.format(row[variable.column]);
                    return `The ${variable.name.toLowerCase()} of ${region.name} in ${year} was ${value}.`;
                }).join(' ');

                resolve(summary);
            });
        });
    }

    getVariable(column) {
        const variable = _.find(this.variable, variable => variable.column === column);
        return variable ? variable : this.variables[0];
    }

    getYear(variable, year) {
        return _.contains(variable.years, year) ? year : _.max(variable.years);
    }
}

class MapDescription {
    static summarizeFromParams(params) {
        return new Promise((resolve, reject) => {
            if (params.vector && params.vector in MAP_SOURCES) {
                const source = new MapSource(MAP_SOURCES[params.vector]);
                const variable = source.getVariable(params.metric);
                const year = source.getYear(variable, parseFloat(params.year));
                const regions = params.regions;

                source.summarize(variable, year, regions).then(resolve, reject);
            } else {
                resolve('');
            }
        });
    }
}

module.exports = MapDescription;

