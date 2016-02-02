
class Tab {
    constructor(tab) {
        if (!tab.tabName) throw Error('tab missing tab');
        this.tabName = tab.tabName;

        this.description = tab.description || '';

        this.name = tab.name || this.tabName;

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
    }

    render(selection, regions) {
        const container = selection.append('div')
            .attr('class', 'chart-tab');

        container.append('h2')
            .attr('class', 'chart-tab-heading')
            .text(this.name);

        this.charts.forEach(chart => chart.render(container, regions));
    }
}

class Chart {
    constructor(tab, chart) {
        this.tab = tab;
        this.name = chart.name || '';
        if (!chart.data) throw Error('chart missing data');
        this.data = Chart._columns(chart.data);
        this.x = chart.data[0];
        this.y = chart.data[1];
        if (!chart.chart) throw Error('chart missing chart');
        if (!(chart.chart in Constants.CHART_TYPES)) throw Error(`invalid chart type: ${chart.chart}`);
        this.chart = Constants.CHART_TYPES[chart.chart];
        this.options = _.extend({}, Constants.CHART_OPTIONS, chart.options || {}, { title: this.name });
        this.transform = chart.transform;
        if (chart.transpose && chart.transpose.length !== 2) throw Error('transpose requires two variables');
        if (chart.transpose) this.transpose = Chart._columns(chart.transpose);
        this.params = chart.params || {};
    }

    static _columns(columns) {
        return columns.map(column => {
            column.type = column.type || 'number';
            column.label = column.label || '';
            column.column = column.column || '';
            return column;
        });
    }

    render(selection, regions) {
        this.getData(regions).then(data => {
            if (this.transpose) data = this._transpose(data);
            if (this.transform) data = this.transform(data);
            const dataTable = this.dataTable(data, regions);

            const container = selection.append('div')
                .attr('class', 'chart-container');

            const chart = new this.chart(container[0][0]);
            chart.draw(dataTable, this.options);
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
        const columns = [this.tab.idColumn].concat(this.data.map(variable => variable.column));
        const params = _.extend({
            '$select': columns.join(','),
            '$where': `id in (${regions.map(region => `'${region.id}'`)})`,
            '$order': columns.map(column => `${column} ASC`).join(',')
        }, this.params);
        const url = `${this.tab.path}?${$.param(params)}`;
        return d3.promise.json(url);
    }

    dataTable(data, regions) {
        const regionColumns = regions.map(region => { return {label: region.name, type: this.y.type}; });
        const columns = [this.x].concat(regionColumns);

        const byX = _.groupBy(data, row => row[this.x.column]);
        const rows = _.pairs(byX).map(([x, rows]) => {
            const byID = _.indexBy(rows, row => row[this.tab.idColumn]);
            return [x].concat(regions.map(region => byID[region.id][this.y.column]));
        });

        let table = google.visualization.arrayToDataTable([columns].concat(rows));

        if (this.x.format) {
            const format = new google.visualization.NumberFormat(this.x.format);
            format.format(table, 0);
        }

        if (this.y.format) {
            const format = new google.visualization.NumberFormat(this.y.format);
            _.range(1, columns.length).forEach(index => {
                format.format(table, index);
            });
        }

        return table;
    }
}

