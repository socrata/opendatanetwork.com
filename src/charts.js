
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
        const div = selection.append('div')
            .attr('class', 'chart-group');

        div.append('h2')
            .attr('class', 'chart-group-heading')
            .text(this.name);

        this.charts.forEach(chart => chart.render(selection, regions));
    }
}

class Chart {
    constructor(group, chart) {
        this.group = group;
        if (!chart.name) throw Error('chart missing name');
        this.name = chart.name;
        if (!chart.data) throw Error('chart missing data');
        this.data = chart.data;
    }

    render(selection, regions) {
        this.getData(regions).then(data => {
            const dataTable = this.dataTable(data);
        }, error => {
            console.error(error);
        });
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

    dataTable(data) {
        const id = {column: this.group.idColumn, label: 'ID', type: 'string'};
        const columns = this.data.concat([id]);
        const rows = data.map(row => columns.map(column => row[column.column]));

        return google.visualization.arrayToDataTable([columns].concat(rows));
    }
}

