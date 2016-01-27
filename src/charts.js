
class Tab {
    constructor(tab) {
        if (!tab.name) throw Error('tab missing name');
        this.name = tab.name;
        this.description = tab.description || '';
        if (!tab.groups) throw Error('tab missing groups');
        this.groups = tab.groups.map(group => new ChartGroup(group));
    }

    render(regions) {
        this.groups.forEach(group => group.render(regions));
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
        this.id_column = group.id_column || 'id';
        if (!group.charts) throw Error('group missing charts');
        this.charts = group.charts.map(chart => new Chart(this, chart));
    }

    render(regions) {
        this.charts.forEach(chart => chart.render(regions));
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

    render(regions) {
        this.getData(regions).then(data => {
            data = this.parseData(data, regions);
            console.log(data);
        }, error => {
            console.error(error);
        });
    }

    getData(regions) {
        const columns = [this.group.id_column].concat(this.data.map(variable => variable.column));
        const params = {
            '$select': columns.join(','),
            '$where': `id in (${regions.map(region => `'${region.id}'`)})`,
            '$order': columns.map(column => `${column} ASC`).join(',')
        };
        const url = `${this.group.path}?${$.param(params)}`;
        return d3.promise.json(url);
    }

    parseData(data, regions) {
        const grouped = _.groupBy(data, row => row[this.group.id_column]);
        return regions
            .filter(region => region.id in grouped)
            .map(region => {
                return {region: region, data: grouped[region.id]};
            });
    }
}

