
class Tab {
    constructor(tab) {
        if (!tab.name) throw Error('tab missing name');
        this.name = tab.name;
        this.description = tab.description || '';
        if (!tab.groups) throw Error('tab missing groups');
        this.groups = tab.groups.map(group => new ChartGroup(group));
    }

    render(selection, regions) {
        this.groups.forEach(group => group.render(selection, regions));
    }
}

class ChartGroup {
    constructor(group) {
        if (!group.name) throw Error('group missing name');
        this.name = group.name;
        if (!group.attribution) throw Error('group missing attribution');
        this.attribution = group.attribution;
        if (!group.domain) throw Error('group missing domain');
        this.domain = group.domain;
        if (!group.fxf) throw Error('group missing fxf');
        this.fxf = group.fxf;
        this.path = `https://${this.domain}/resource/${this.fxf}.json`;
        this.idColumn = group.idColumn || 'id';
        if (!group.charts) throw Error('group missing charts');
        this.charts = group.charts.map(chart => new Chart(this, chart));
    }

    render(selection, regions) {
        const container = selection.append('div')
            .attr('class', 'chart-group');

        container.append('h2')
            .attr('class', 'chart-group-heading')
            .text(this.name);

        this.charts.forEach(chart => chart.render(container, regions));
    }
}

class Chart {
    constructor(group, chart) {
        this.group = group;
        this.name = chart.name || '';
        if (!chart.data) throw Error('chart missing data');
        this.data = Chart._columns(chart.data);
        this.x = chart.data[0];
        this.y = chart.data[1];
        if (!chart.chart) throw Error('chart missing chart');
        this.chart = chart.chart;
        this.options = _.extend({}, Constants.DEFAULT_CHART_OPTIONS, chart.options || {}, { title: this.name });
        this.transform = chart.transform;
        if (chart.transpose && chart.transpose.length !== 2) throw Error('transpose requires two variables');
        if (chart.transpose) this.transpose = Chart._columns(chart.transpose);
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
                    id: row[this.group.idColumn],
                    [this.x.column]: variable.label,
                    [this.y.column]: row[variable.column]
                };
            });
        }));
    }

    getData(regions) {
        const columns = [this.group.idColumn].concat(this.data.map(variable => variable.column));
        const params = {
            '$select': columns.join(','),
            '$where': `id in (${regions.map(region => `'${region.id}'`)})`,
            '$order': columns.map(column => `${column} ASC`).join(',')
        };
        const url = `${this.group.path}?${$.param(params)}`;
        return d3.promise.json(url);
    }

    dataTable(data, regions) {
        const regionColumns = regions.map(region => { return {label: region.name, type: this.y.type}; });
        const columns = [this.x].concat(regionColumns);

        const byX = _.groupBy(data, row => row[this.x.column]);
        const rows = _.pairs(byX).map(([x, rows]) => {
            const byID = _.indexBy(rows, row => row[this.group.idColumn]);
            return [x].concat(regions.map(region => byID[region.id][this.y.column]));
        });

        let table = google.visualization.arrayToDataTable([columns].concat(rows));

        if (this.x.formatter) {
            const formatter = new this.x.formatter(this.x.formatterOptions || {});
            formatter.format(table, 0);
        }

        if (this.y.formatter) {
            const formatter = new this.y.formatter(this.y.formatterOptions || {});
            _.range(1, columns.length).forEach(index => {
                formatter.format(table, index);
            });
        }

        return table;
    }
}

