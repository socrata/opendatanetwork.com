'use strict';

class DatasetChart {
    constructor(config) {
        this.config = config;
        this.selector = `chart-${config.chartId}`;
        this.selection = document.getElementById(this.selector);
    }

    getData() {
        const url = 'https://api.opendatanetwork.com/data/v1/values?app_token=cQovpGcdUT1CSzgYk0KPYdAI0&entity_id=0400000US53&format=google&variable=demographics.population.count&forecast=5&describe=true';
        return d3.promise.json(url);
    }

    render(data) {
        const table = new google.visualization.DataTable(data.data);

        const chart = createChart(this.config.chartType, this.selection);
        const options = _.extend({}, DATASET_CONSTANTS.CHART_OPTIONS, this.config.options);

        chart.draw(table, options);
    }

    clear() {
        document.getElementById(this.containerId).innerHTML = '';
    }
}

function createChart(type, container) {
    if (!(type in CHART_TYPES))
        throw new Error(`chart type not found: ${type}`);

    return new CHART_TYPES[type](container);
}

const CHART_TYPES = {
    'bar': google.visualization.BarChart,
    'column': google.visualization.ColumnChart,
    'line': google.visualization.LineChart,
    'stepped-area': google.visualization.SteppedAreaChart,
    'table': google.visualization.Table,
};

