
class DatasetChart {

    constructor() {
    }

    render(datasetId, chartId, data) {

        const config = this.getChartConfig(datasetId, chartId);
        const table = new google.visualization.DataTable(data);

        // Format data using data formatters
        //
        if (config.x) {
            const xFormatter = this.getFormatter(config.x.formatter, config.x.format);
            xFormatter.format(table, 0);
        }

        if (config.y) {
            const yFormatter = this.getFormatter(config.y.formatter, config.y.format);
            _.range(1, table.getNumberOfColumns()).forEach(columnIndex => {
                yFormatter.format(table, columnIndex);
            });
        }

        // Render chart
        //
        const containerId = 'chart-' + chartId;
        const chart = this.getGoogleChart(config, containerId);
        const options = this.getChartOptions(config);

        chart.draw(table, options);
    }

    getChartConfig(datasetId, chartId) {

        return _.find(DATASET_CONFIG[datasetId].charts, chart => chart.chartId == chartId);
    }

    getChartOptions(config) {

        const options = _.isUndefined(config) ? {} : config.options;
        return _.extend({}, DATASET_CONSTANTS.CHART_OPTIONS, options);
    }

    getGoogleChart(config, containerId) {

        const container = document.getElementById(containerId);

        if (!_.isUndefined(config)) {
            switch (config.chartType) {
                case 'bar': return new google.visualization.BarChart(container);
                case 'column': return new google.visualization.ColumnChart(container);
                case 'line': return new google.visualization.LineChart(container);
                case 'stepped-area': return new google.visualization.SteppedAreaChart(container);
                case 'table': return new google.visualization.Table(container);
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
