'use strict';

class DatasetChart {
    constructor(config) {
        this.config = config;
        this.selector = `chart-${config.id}`;
        this.selection = document.getElementById(this.selector);
    }

    getData() {
        const url = 'https://api.opendatanetwork.com/data/v1/values?app_token=cQovpGcdUT1CSzgYk0KPYdAI0&entity_id=0400000US53&format=google&variable=demographics.population.count&forecast=5&describe=true';
        return d3.promise.json(url);
    }

    render(data) {
        const table = new google.visualization.DataTable(data.data);

        const chart = createChart(this.config.type, this.selection);
        const options = this.getOptions();

        chart.draw(table, options);
    }

    getOptions() {
        return _.extend({
            title: this.config.name || 'Chart'
        }, DATASET_CONSTANTS.CHART_OPTIONS, this.config.options || {});
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

