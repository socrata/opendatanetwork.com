'use strict';

if (typeof require !== 'undefined') {
    var _ = require('lodash');

    var Navigate = require('../../controllers/navigate');
    var Requests = require('../../controllers/request');

    var MAP_SOURCES = require('../data/map-sources');
}

class MapSource {
    constructor(mapSource) {
        this.source = mapSource;
        this.variables = mapSource.variables;
        this.id = mapSource.idColumn || 'id';
        this.year = mapSource.yearColumn || 'year';
    }

    otherVariables(currentVariable) {
        return this.variables.filter(variable => variable.name !== currentVariable.name);
    }

    summarize(variable, year, regions) {
        return new Promise((resolve, reject) => {
            this.getData(variable, year, regions).then(data => {
                const _descriptions = regions.map(region => {
                    const row = _.find(data, row => row[this.id] === region.id);
                    const value = variable.format(row[variable.column]);
                    return `${variable.name.toLowerCase()} of ${region.name} in ${year} was ${value}.`;
                });

                const descriptions = _descriptions.map(description => `The ${description}`);
                const metas = _descriptions.map((description, index) => {
                    return (index == 0) ? `Maps, charts and data show the ${description}` : `The ${description}`;
                });

                resolve([descriptions, metas].map(sentences => sentences.join(' ')));
            }, error => resolve(['', '']));
        });
    }

    getData(variable, year, regions) {
        const path = `https://${this.source.domain}/resource/${this.source.fxf}.json`;
        const columns = [this.id].concat(variable.column);
        const params = _.extend({
            '$select': columns.join(','),
            '$where': `${this.id} in (${regions.map(region => `'${region.id}'`)})`,
            [this.year]: year
        }, variable.params || {});

        if (typeof Requests === 'undefined') {
            const url = `${path}?${$.param(params)}`;
            return d3.promise.json(url);
        } else {
            const url = Requests.buildURL(path, params);
            return Requests.getJSON(url);
        }
    }

    getVariable(metric) {
        const variable = _.find(this.variables, variable => variable.metric === metric);
        return variable ? variable : this.variables[0];
    }

    getYear(variable, year) {
        if (year && year !== '' && _.contains(variable.years, parseFloat(year))) return parseFloat(year);
        return _.max(variable.years);
    }
}

class MapDescription {
    static summarizeFromParams(params) {
        if (params.vector && params.vector in MAP_SOURCES) {
            const source = new MapSource(MAP_SOURCES[params.vector]);
            const variable = source.getVariable(params.metric);
            const year = source.getYear(variable, params.year);
            const regions = params.regions;

            return source.summarize(variable, year, regions);
        } else {
            return new Promise((resolve, reject) => resolve(['', '']));
        }
    }

    static variablesFromParams(params) {
        if (params.vector && params.vector in MAP_SOURCES) {
            const source = new MapSource(MAP_SOURCES[params.vector]);
            const currentVariable = source.getVariable(params.metric);
            const variables = source.otherVariables(currentVariable);

            return variables.map(variable => {
                const metric = Navigate.escapeName(variable.name).toLowerCase();
                const newParams = _.extend({}, params, {metric, year: undefined});
                const url = Navigate.url(newParams);
                return _.extend(variable, {url});
            });
        } else {
            return [];
        }
    }
}

if (typeof module !== 'undefined') module.exports = MapDescription;

