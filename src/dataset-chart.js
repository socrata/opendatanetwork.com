
class DatasetChart {

    constructor() {
    }

    render(datasetId, variableId, data, containerId) {

        const table = google.visualization.arrayToDataTable(data);

        // Format data
        //
        const chartConfig = this.getChartConfig(datasetId, variableId);
        const xFormatter = this.getFormatter(chartConfig.x.formatter, chartConfig.x.format);
        xFormatter.format(table, 0);

        const yFormatter = this.getFormatter(chartConfig.y.formatter, chartConfig.y.format);
        _.range(1, table.getNumberOfColumns()).forEach(columnIndex => {
            yFormatter.format(table, columnIndex);
        });

        // Render chart
        //
        const chart = this.getGoogleChart(datasetId, variableId, containerId);
        const chartOptions = this.getChartOptions(datasetId, variableId);

        chart.draw(table, chartOptions);
    }

    getChartConfig(datasetId, variableId) {

        return _.find(DATASET_CONFIG[datasetId].charts, chart => chart.variableId == variableId);
    }

    getChartOptions(datasetId, variableId) {

        const chartConfig = this.getChartConfig(datasetId, variableId);
        const options = _.isUndefined(chartConfig) ? {} : chartConfig.options;
        return _.extend({}, DATASET_CONSTANTS.CHART_OPTIONS, options);
    }

    getGoogleChart(datasetId, variableId, containerId) {

        const config = this.getChartConfig(datasetId, d);
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