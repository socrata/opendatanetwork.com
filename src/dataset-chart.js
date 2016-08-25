
class DatasetChart {

    constructor(datasetId, chartId, data) {

        this.datasetId = datasetId;
        this.chartId = chartId;
        this.data = data;
        this.containerId = 'chart-' + this.chartId;
    }

    render() {

        const config = this.getChartConfig(this.datasetId, this.chartId);
        const table = new google.visualization.DataTable(this.data);

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
        const chart = this.getGoogleChart(config, this.containerId);
        const options = this.getChartOptions(config);

        chart.draw(table, options);
    }

    clear() {

        document.getElementById(this.containerId).innerHTML = '';
    }

    getChartConfig(datasetId, chartId) {

        const config = DatasetConfig.getConfig(datasetId);
        return _.find(config.charts, chart => chart.chartId == chartId);
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
