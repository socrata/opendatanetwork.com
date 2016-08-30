'use strict';

class Navigate {
    constructor(params) {
        this.regions = params.regions;
        this.vector = params.vector;
    }

    current() {
        return Navigate.regions(this.regions);
    }

    add(region) {
        return Navigate.regions(this.regions.concat(region));
    }

    static region(region) {
        return `/region/${region.id}/${Navigate.escapeName(region.name)}`;
    }

    static regions(regions) {
        const vector = this.vector || '/';

        const ids = regions.map(region => region.id);
        const names =  regions
            .map(region => region.name)
            .map(Navigate.escapeName);

        return `/region/${ids.join('-')}/${names.join('-')}${vector}`;
    }

    static escapeName(name) {
        return name.replace(/,/g, '').replace(/[ \/]/g, '_');
    }

    static url(params) {
        const ids = params.regions
            .map(region => region.id)
            .join('-');
        const names = params.regions
            .map(region => region.name)
            .map(Navigate.escapeName)
            .join('-');

        let navigate = [];
        if (params.vector && params.vector !== '') {
            navigate.push(params.vector);
            if (params.metric) navigate.push(params.metric);
            if (params.year) navigate.push(params.year);
        }

        return `/region/${ids}/${names}/${navigate.join('/')}`;
    }
}

module.exports = Navigate;

