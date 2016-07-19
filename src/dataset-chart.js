
class DatasetChart {

    constructor() {
    }

    render(dataset, variable, data, containerId) {

        const table = google.visualization.arrayToDataTable(data);

        // Format data
        //
        const config = DATASET_CONFIG[dataset.id].charts[variable.id];

        const xFormatter = this.getFormatter(config.x.formatter, config.x.format);
        xFormatter.format(table, 0);

        const yFormatter = this.getFormatter(config.y.formatter, config.y.format);
        _.range(1, table.getNumberOfColumns()).forEach(columnIndex => {
            yFormatter.format(table, columnIndex);
        });

        // Render chart
        //
        const chart = this.getGoogleChart(dataset.id, variable.id, containerId);
        const chartOptions = this.getChartOptions(dataset, variable);
        const options = _.extend({}, DATASET_CONSTANTS.CHART_OPTIONS, chartOptions);

        chart.draw(table, options);
    }

    getChartOptions(dataset, variable) {

        const config = DATASET_CONFIG[dataset.id][variable.id];
        const options = _.isUndefined(config) ? {} : config.options;

        options.title = variable.name.capitalize();

        return options;
    }

    getGoogleChart(datasetId, variableId, containerId) {

        const config = DATASET_CONFIG[datasetId][variableId];
        const container = document.getElementById(containerId);

        if (!_.isUndefined(config)) {
            switch (config.chartType) {
                case 'line': return new google.visualization.LineChart(container);
            }
        }

        return new google.visualization.LineChart(container);
    }

    getFormatter(formatterType, format) {

        switch (formatterType) {
            case 'number':
                return new google.visualization.NumberFormat(format);
        }

        return null;
    }
}

String.prototype.capitalize = function() {
    return this.replace( /(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); } );
};