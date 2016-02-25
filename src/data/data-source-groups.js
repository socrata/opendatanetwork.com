'use strict';

const SOURCE_GROUPS = [
    {
        name: 'demographics',
        tabName: 'Demographics',
        sourceVectors: ['population', 'earnings', 'occupations', ]
    },
    {
        name: 'economy',
        tabName: 'Economy',
        sourceVectors: ['cost_of_living', 'gdp', 'consumption', 'job_proximity']
    },
    {
        name: 'education',
        tabName: 'Education',
        sourceVectors: ['education']
    },
    {
        name: 'health',
        tabName: 'Health',
        sourceVectors: ['environmental_health', 'health', 'health_indicators']
    }
];

class SourceGroups {

    static forRegions(regions) {
        return SOURCE_GROUPS;
    }
}

if (typeof module !== 'undefined') module.exports = SourceGroups;

