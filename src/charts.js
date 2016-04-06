
class Tab {
    constructor(tab) {
        if (!tab.name) throw Error('tab missing name');
        this.name = tab.name;

        this.description = tab.description || '';

        if (!tab.attribution) throw Error('tab missing attribution');
        this.attribution = tab.attribution;

        if (!tab.domain) throw Error('tab missing domain');
        this.domain = tab.domain;

        if (!tab.fxf) throw Error('tab missing fxf');
        this.fxf = tab.fxf;

        this.path = `https://${this.domain}/resource/${this.fxf}.json`;

        this.idColumn = tab.idColumn || 'id';

        if (!tab.charts) throw Error('tab missing charts');
        this.charts = tab.charts.map(chart => new Chart(this, chart));

        this.callback = tab.callback || (() => {});
    }

    render(selection, regions) {
        this.charts.forEach(chart => {
            chart.render(regions);
        });

        this.callback(regions);
    }

    clearCharts() {
        this.charts.forEach(chart => chart.clearChart());
    }

    redrawCharts() {
        this.charts.forEach(chart => chart.redraw());
    }
}

class Chart {
    constructor(tab, chart) {
        this.tab = tab;

        if (!chart.name) throw Error('chart missing name');
        this.name = chart.name;

        if (!chart.data) throw Error('chart missing data');
        this.data = Chart._columns(chart.data);

        this.x = chart.x || chart.data[0];
        this.xFormatter = ChartConstants.FORMAT_TYPES[this.x.formatter || 'number'];
        this.y = chart.y || chart.data[1];
        this.yFormatter = ChartConstants.FORMAT_TYPES[this.y.formatter || 'number'];

        if (!chart.chart) throw Error('chart missing chart');
        if (!(chart.chart in ChartConstants.CHART_TYPES))
            throw Error(`invalid chart type: ${chart.chart}`);
        this.chart = ChartConstants.CHART_TYPES[chart.chart];

        this.options = _.extend({}, ChartConstants.CHART_OPTIONS, chart.options || {}, {title: chart.name});

        this.transform = chart.transform;

        if (chart.transpose && chart.transpose.length !== 2)
            throw Error('transpose requires two variables');
        if (chart.transpose) this.transpose = Chart._columns(chart.transpose);

        this.params = chart.params || {};

        this.description = chart.description || '';

        if (chart.forecast && chart.chart !== 'line')
            throw Error('forecasting only available for line charts');
        if (chart.forecast && !(chart.forecast.type in ChartConstants.FORECAST_TYPES))
            throw Error(`invalid forecast type: ${chart.forecast.type}`);
        if (chart.forecast) {
            chart.forecast.forecaster = ChartConstants.FORECAST_TYPES[chart.forecast.type];
            chart.forecast.steps = chart.forecast.steps || 3;
            chart.forecast.steps = parseInt(chart.forecast.steps);
            this.forecast = chart.forecast;
        }
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

    clearChart() {
        if (this.googleChart)
            this.googleChart.clearChart();
    }

    redraw() {
        if (this.googleChart && this.dataTable)
            this.googleChart.draw(this.dataTable, this.options);
    }

    render(regions) {
        this.getData(regions).then(data => {
            if (this.transpose) data = this._transpose(data);
            if (this.transform) data = this.transform(data);

            const container = d3
                .select(`div.chart#${this.name.toLowerCase().replace(/\W/g, '')}`)
                .select('.chart-container');

            const parsed = this.parseData(data, regions);
            this.dataTable = this.dataTable(parsed);
            this.googleChart = new this.chart(container[0][0]);
            this.googleChart.draw(this.dataTable, this.options);
        }, error => {
            console.error(error);
        });
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
            const notNull = columns.map(column => `${column} IS NOT NULL`).join(' AND ');
            const params = _.extend({
                '$select': columns.join(','),
                '$where': `${this.tab.idColumn} in (${regions.map(region => `'${region.id}'`)}) AND (${notNull})`,
                '$order': columns.map(column => `${column} ASC`).join(',')
            }, this.params);
            const url = `${this.tab.path}?${$.param(params)}`;

            resolve(d3.promise.json(url));
        });
    }

    parseData(data, regions) {
        const regionColumns = regions.map(region => { return {label: region.name, type: this.y.type}; });
        const columns = [this.x].concat(regionColumns);

        const byX = _.groupBy(data, row => row[this.x.column]);
        let rows = _.pairs(byX).map(([x, rows], index, all) => {
            const byID = _.indexBy(rows, row => row[this.tab.idColumn]);
            return [x].concat(regions.map(region => ((byID[region.id] || {})[this.y.column] || null)));
        });

        if (this.forecast) rows = rows.concat(this.forecastRows(rows));
        return [columns, rows];
    }

    forecastRows(rows) {
        const forecast = _.partial(this.forecast.forecaster, this.forecast.steps);
        return transpose(transpose(rows).map(forecast));
    }

    dataTable([columns, rows]) {
        let table = google.visualization.arrayToDataTable([columns].concat(rows));

        if (this.x.format) {
            const format = new this.xFormatter(this.x.format);
            format.format(table, 0);
        }

        if (this.y.format) {
            const format = new this.yFormatter(this.y.format);
            _.range(1, columns.length).forEach(columnIndex => {
                format.format(table, columnIndex);
            });
        }

        if (this.forecast) {
            _.range(1, columns.length).forEach(columnIndex => {
                _.range(0, rows.length).forEach(rowIndex => {
                    const forecasted = this.forecast && rows.length - rowIndex - 1 < this.forecast.steps;
                    const currentValue = table.getFormattedValue(rowIndex, columnIndex);
                    const formatted = `${currentValue} (${forecasted ? 'Forecasted' : 'Measured'})`;
                    table.setFormattedValue(rowIndex, columnIndex, formatted);
                });
            });

            _.range(columns.length - 1).forEach((region, index) => {
                const columnIndex = columns.length - index;
                table.insertColumn(columnIndex, 'boolean');
                table.setColumnProperty(columnIndex, 'role', 'certainty');
                rows.forEach((row, rowIndex) => {
                    table.setCell(rowIndex, columnIndex, rows.length - rowIndex > this.forecast.steps);
                });
            });
        }

        return table;
    }
}

function transpose(matrix) {
    return _.zip.apply(_, matrix);
}

