'use strict';

const _ = require('lodash');

const REGION_TYPES = {
    'nation'    : ['population', 'education', 'earnings', 'occupations'],
    'region'    : ['population', 'education', 'earnings', 'occupations'],
    'division'  : ['population', 'education', 'earnings', 'occupations'],
    'place'     : ['population', 'education', 'earnings', 'occupations'],
    'zip_code'  : ['population', 'education', 'earnings', 'occupations'],
    'state'     : ['population', 'education', 'earnings', 'occupations', 'gdp', 'cost_of_living', 'health'],
    'msa'       : ['population', 'education', 'earnings', 'occupations', 'gdp', 'cost_of_living'],
    'county'    : ['population', 'education', 'earnings', 'occupations', 'health']
};

class Sources {

    constructor(sources) {
        this.sources = sources;
    }

    forRegions(regions) {
        return _.intersection(...regions.map(region => this.sources[region.type]));
    }

    static getSources() {
        return new Sources(REGION_TYPES);
    }
}

module.exports = Sources;
