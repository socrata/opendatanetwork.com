
class DatasetChart {

    constructor() {
    }

    render(datasetId, chartId, data) {

        const config = this.getChartConfig(datasetId, chartId);

        // Format data labels
        //
        data = this.formatDataLabels(datasetId, config.variables, data);

        // Get the data table
        //
        const table = google.visualization.arrayToDataTable(data);

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

        // Format forecasted data
        //
        if (config.forecast) {

            const columns = table.getNumberOfColumns();
            const rows = table.getNumberOfRows();

            // Set the (Measured) or (Forecasted) label
            //
            _.range(1, columns).forEach(columnIndex => {

                _.range(0, rows).forEach(rowIndex => {

                    const forecasted = (rows - rowIndex - 1) < config.forecast;
                    const currentValue = table.getFormattedValue(rowIndex, columnIndex);
                    const formatted = `${currentValue} (${forecasted ? 'Forecasted' : 'Measured'})`;

                    table.setFormattedValue(rowIndex, columnIndex, formatted);
                });
            });

            // Set the certainty role to true for measured data, false for forecasted data
            // 
            _.range(columns - 1).forEach((region, index) => {

                const columnIndex = columns - index;

                table.insertColumn(columnIndex, 'boolean');
                table.setColumnProperty(columnIndex, 'role', 'certainty');

                _.range(0, rows).forEach(rowIndex => {

                    const certainty = (rows - rowIndex) > config.forecast;
                    table.setCell(rowIndex, columnIndex, certainty);
                });
            });
        }

        // Render chart
        //
        const containerId = 'chart-' + chartId;
        const chart = this.getGoogleChart(config, containerId);
        const options = this.getChartOptions(config);

        chart.draw(table, options);
    }

    formatDataLabels(datasetId, chartVariables, data) {

        if (data.length == 0)
            return;

        if (data[0].length == 0)
            return;

        // Clear 'variable' label
        //
        data[0][0] = '';

        // Replace the short variable names with the label specified in the config
        //
        data.forEach(row => {

            for (var i = 0; i < chartVariables.length; i++) {

                var chartVariable = chartVariables[i];

                if (`${datasetId}.${row[0]}` == chartVariable.variableId) {
                    row[0] = chartVariable.label;
                    break;
                }
            }
        });

        return data;
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
