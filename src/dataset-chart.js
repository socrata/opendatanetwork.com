'use strict';

class DatasetChart {
    constructor(config) {
        this.config = config;
    }

    getData() {
        return getJSON(this.getDataURL());
    }

    getDataURL() {
        const entityIDs = _data.entities.map(_.property('id'));
        const variableID = this.config.variables ?
            this.config.variables.join(',') :
            this.config.dataset_id;
        const constraints = this.config.constraint;
        const describe = true;
        const forecast = this.config.forecast;
        const format = 'google';

        return odn.valuesURL(entityIDs, variableID, constraints, describe, forecast, format);
    }

    render(data) {
        this.excludeColumns(data);

        this.renderChart(data);
        this.renderDescription(data);
    }

    renderChart(data) {
        const table = new google.visualization.DataTable(data.data);

        const selection = document.getElementById(`chart-${this.config.id}`);
        const chart = createChart(this.config.type, selection);
        const options = this.getOptions();

        chart.draw(table, options);
    }

    renderDescription(data) {
        if (!('forecast_descriptions' in data)) return;

        d3.select(document.getElementById(`dataset-description-${this.config.id}`))
            .select('div.forecast-descriptions')
            .selectAll('p')
            .data(data.forecast_descriptions)
            .enter()
            .append('p')
            .text(_.identity);
    }

    getOptions() {

        if (d3.select("body").node().getBoundingClientRect().width > GlobalConfig.mobile_width) {

            return _.extend({
                    title: this.config.name || 'Chart'
                },
                GlobalConfig.charts.options,
                this.config.options || {});
        }
        else {

            return _.extend({
                    title: this.config.name || 'Chart'
                },
                GlobalConfig.charts.options,
                this.config.options || {},
                this.config.mobileOptions || {});
        }
    }

    clear() {
        document.getElementById(this.containerId).innerHTML = '';
    }

    excludeColumns(data) {
        if (!('exclude' in this.config)) return;

        const excluded = new Set(this.config.exclude);
        data.data.rows = data.data.rows.filter(row => {
            return !excluded.has(row.c[0].v);
        });
    }
}

function createChart(type, container) {
    if (!(type in CHART_TYPES))
        throw new Error(`chart type not found: ${type}`);
    return new google.visualization[CHART_TYPES[type]](container);
}

const CHART_TYPES = {
    'bar': 'BarChart',
    'column': 'ColumnChart',
    'line': 'LineChart',
    'stepped-area': 'SteppedAreaChart',
    'table': 'Table',
};

