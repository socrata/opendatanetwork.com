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
        return `/region/${region.id}/${region.name}`;
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
}

module.exports = Navigate;

