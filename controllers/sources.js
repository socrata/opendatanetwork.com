'use strict';

const _ = require('lodash');

const ALL_REGIONS = ['nation', 'region', 'division', 'state', 'county',
                     'msa', 'place', 'zip_code'];

const SOURCES = [
    {
        name: 'population',
        regions: ALL_REGIONS
    },
    {
        name: 'education',
        regions: ALL_REGIONS
    },
    {
        name: 'earnings',
        regions: ALL_REGIONS
    },
    {
        name: 'occupations',
        regions: ALL_REGIONS
    },
    {
        name: 'gdp',
        regions: ['state', 'msa'],
        include: region => _.contains(region.name, 'Metro')
    },
    {
        name: 'cost_of_living',
        regions: ['state', 'msa'],
        include: region => _.contains(region.name, 'Metro')
    },
    {
        name: 'health',
        regions: ['state', 'county']
    }
];

class Sources {

    constructor(sources) {
        this.sources = sources;
    }

    supports(source, regions) {
        return regions.filter(region => {
            const include = source.include || (region => true);
            return _.contains(source.regions, region.type) && include(region);
        }).length == regions.length;
    }

    forRegions(regions) {
        return this.sources
            .filter(source => this.supports(source, regions))
            .map(source => source.name);
    }

    static getSources() {
        return new Sources(SOURCES);
    }
}

module.exports = Sources;

