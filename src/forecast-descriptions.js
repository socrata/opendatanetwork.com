'use strict';

if (typeof require !== 'undefined') {

    var _ = require('lodash');
    var forecast = require('./forecast');
    var numeral = require('numeral');
    var queryString = require('query-string');
    var Request = require('../controllers/request'); 
}

class ForecastDescriptions {

    constructor(tab) {

        this.domain = tab.domain;
        this.fxf = tab.fxf;
        this.idColumn = tab.idColumn || 'id';
        this.path = `https://${this.domain}/resource/${this.fxf}.json`;
        this.charts = tab.charts.map(chart => new ForecastDescription(this, chart));
    }

    getPromise(regions) {

        const promises = this.charts.map(chart => chart.getPromise(regions));
        return Promise.all(promises);
    };
}

class ForecastDescription {
    
    constructor(tab, chart) {
        
        this.tab = tab;
        this.name = chart.name;
        this.data = ForecastDescription._columns(chart.data);
        this.x = chart.x || chart.data[0];
        this.y = chart.y || chart.data[1];
        this.transform = chart.transform;

        if (chart.transpose) this.transpose = ForecastDescription._columns(chart.transpose);

        this.params = chart.params || {};
        this.description = chart.description || '';

        if (chart.forecast) {

            chart.forecast.forecaster = forecast.linear;
            chart.forecast.steps = chart.forecast.steps || 3;
            chart.forecast.steps = parseInt(chart.forecast.steps);

            this.forecast = chart.forecast;
        }
    }

    getPromise(regions) {

        return new Promise((resolve, reject) => {

            this.getData(regions).then(data => {

                if (this.transpose) data = this._transpose(data);
                if (this.transform) data = this.transform(data);

                var descriptions = [];

                if (this.forecast && (this.forecast.type === 'linear')) {

                    const groupedData = _.groupBy(data, 'id');

                    descriptions = regions.map(region => {

                        var regionData = groupedData[region.id];

                        var firstMeasuredIndex = this.getFirstMeasuredIndex(regionData, this.y.column);
                        var firstMeasured = parseFloat(regionData[firstMeasuredIndex][this.y.column]);
                        var firstMeasuredYear = parseInt(regionData[firstMeasuredIndex].year); 
                        
                        var lastMeasuredIndex = this.getLastMeasuredIndex(regionData, this.y.column);
                        var lastMeasured = parseFloat(regionData[lastMeasuredIndex][this.y.column]);
                        var lastMeasuredYear = parseInt(regionData[lastMeasuredIndex].year);

                        var years = lastMeasuredYear - firstMeasuredYear;
                        var percentChange = parseFloat((lastMeasured - firstMeasured) / firstMeasured) / parseFloat(years);
                        var slope = parseFloat(lastMeasured - firstMeasured) / parseFloat(years);
                        var lastForecast = (slope * this.forecast.steps) + lastMeasured;
                        var lastForecastYear = lastMeasuredYear + this.forecast.steps;

                        return `The last measured ${this.y.label.toLowerCase()} for ${region.name} was ${numeral(lastMeasured).format(this.y.format.pattern)}. ${region.name} experienced an average annual growth rate of ${numeral(percentChange).format('0.00%')} from our first ${this.y.label.toLowerCase()} statistic recorded in ${firstMeasuredYear}. If past trends continue, we forecast the ${this.y.label.toLowerCase()} to be ${numeral(lastForecast).format(this.y.format.pattern)} by ${lastForecastYear}.`;
                    });
                }
                
                resolve({ 
                    column: this.y.column,
                    description: descriptions.join('  ')
                });
            }, 
            error => {
                reject();
            });
        });
    }
    
    getFirstMeasuredIndex(data, column) {

        for (var i = 0; i < data.length; i++) {
            if (!_.isUndefined(data[i][column]))
                return i;
        }

        return 0;
    }
    
    getLastMeasuredIndex(data, column) {

        for (var i = data.length - 1; i >= 0; i--) {
            if (!_.isUndefined(data[i][column]))
                return i;
        }

        return 0;
    }

    _transpose(rows) {
        this.x = this.transpose[0];
        this.y = this.transpose[1];

        return _.flatten(rows.map(row => {
            return this.data.map(variable => {
                return {
                    id: row[this.tab.idColumn],
                    [this.x.column]: variable.label,
                    [this.y.column]: row[variable.column]
                };
            });
        }));
    }


    getData(regions) {

        return new Promise((resolve, reject) => {

            const columns = [this.tab.idColumn].concat(this.data.map(variable => variable.column));
            const params = _.extend({
                '$select': columns.join(','),
                '$where': `${this.tab.idColumn} in (${regions.map(region => `'${region.id}'`)})`,
                '$order': columns.map(column => `${column} ASC`).join(',')
            }, this.params);

            const url = `${this.tab.path}?${queryString.stringify(params)}`;
            resolve(Request.getJSON(url));
        });
    }

    static _columns(columns) {
        return columns.map(column => {
            column.type = column.type || 'number';
            column.label = column.label || '';
            column.column = column.column || '';
            column.column = column.column.replace(/ /g, '_');
            return column;
        });
    }
}

if (typeof module !== 'undefined') module.exports = ForecastDescriptions;
