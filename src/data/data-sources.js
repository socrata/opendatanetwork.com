'use strict';

if (typeof require !== 'undefined') var _ = require('lodash');

/**
 * Data Sources.
 *
 * [Tab] -> [Chart]
 */

const ODN_DOMAIN = 'odn.data.socrata.com';

const ATTRIBUTIONS = {
    acs: {
        name: 'U.S. Census American Community Survey',
        url: 'https://www.census.gov/programs-surveys/acs/'
    },
    bea: {
        name: 'U.S. Bureau of Economic Analysis',
        url: 'http://www.bea.gov/'
    },
    hud: {
        name: 'U.S. Department of Housing and Urban Development',
        url: 'http://www.hud.gov/'
    }
};

const ALL_REGIONS = ['nation', 'region', 'division', 'state', 'county',
                     'msa', 'place', 'zip_code'];

function _toPercent(column) {
    return rows => {
        return rows.map(row => _.extend(row, { [column]: parseFloat(row[column]) / 100 }));
    };
}

function _rename(column, names) {
    return rows => {
        return rows.map(row => _.extend(row, {[column]: names[row[column]]}));
    };
}

const SOURCES = [
    {
        tabName: 'Population',
        vector: 'population',
        name: 'Population',
        attribution: ATTRIBUTIONS.acs,
        domain: ODN_DOMAIN,
        fxf: 'e3rd-zzmr',
        regions: ALL_REGIONS,
        charts: [
            {
                name: 'Population over Time',
                data: [
                    {
                        column: 'year',
                        label: 'Year',
                        type: 'string'
                    },
                    {
                        column: 'population',
                        label: 'Population',
                        format: { pattern: '###,###' }
                    }
                ],
                chart: 'line',
                options: {
                    vAxis: { format: 'short' }
                }
            },
            {
                name: 'Population Change over Time',
                data: [
                    {
                        column: 'year',
                        label: 'Year',
                        type: 'string',
                    },
                    {
                        column: 'population_percent_change',
                        label: 'Population Change',
                        type: 'number',
                        format: { pattern: '#.##%' }
                    }
                ],
                transform: rows => {
                    return rows
                        .filter(row => row.year !== '2009')
                        .map(row => _.extend(row, { population_percent_change: parseFloat(row.population_percent_change) / 100 }));
                },
                chart: 'line',
                options: {
                    vAxis: { format: '#.##%' }
                }
            }
        ]
    },
    {
        tabName: 'Education',
        vector: 'education',
        name: 'Education',
        attribution: ATTRIBUTIONS.acs,
        domain: ODN_DOMAIN,
        fxf: 'uf4m-5u8r',
        regions: ALL_REGIONS,
        charts: [
            {
                name: 'Graduation Rates',
                data: [
                    {
                        column: 'percent_high_school_graduate_or_higher',
                        label: 'High School',
                    },
                    {
                        column: 'percent_bachelors_degree_or_higher',
                        label: 'College',
                    }
                ],
                transpose: [
                    {
                        column: 'variable',
                        label: 'Graduation Rate',
                        type: 'string'
                    },
                    {
                        column: 'value',
                        label: 'Value',
                        format: { pattern: '#.#%' }
                    }
                ],
                transform: _toPercent('value'),
                chart: 'column',
                options: {
                    vAxis: { format: 'percent' }
                }
            }
        ]
    },
    {
        tabName: 'Earnings',
        vector: 'earnings',
        name: 'Earnings',
        attribution: ATTRIBUTIONS.acs,
        domain: ODN_DOMAIN,
        fxf: 'wmwh-4vak',
        regions: ALL_REGIONS,
        charts: [
            {
                name: 'Median Earnings by Gender (Full-Time and Part-Time Workers)',
                data: [
                    {
                        column: 'median_earnings',
                        label: 'All',
                    },
                    {
                        column: 'male_median_earnings',
                        label: 'Male',
                    },
                    {
                        column: 'female_median_earnings',
                        label: 'Female',
                    }
                ],
                transpose: [
                    {
                        column: 'variable',
                        label: '',
                        type: 'string'
                    },
                    {
                        column: 'value',
                        label: 'Value',
                        format: { pattern: '###,###', prefix: '$' }
                    }
                ],
                chart: 'column',
                options: {
                    vAxis: {
                        format: 'currency',
                        viewWindow: {
                            min: 0
                        }
                    }
                }
            },
            {
                name: 'Median Earnings by Education Level (Full-Time and Part-Time Workers)',
                data: [
                    {
                        column: 'median_earnings_less_than_high_school',
                        label: 'Less than High School'
                    },
                    {
                        column: 'median_earnings_high_school',
                        label: 'High School'
                    },
                    {
                        column: 'median_earnings_some_college_or_associates',
                        label: 'Some College or Associates'
                    },
                    {
                        column: 'median_earnings_bachelor_degree',
                        label: 'Bachelor\'s Degree'
                    },
                    {
                        column: 'median_earnings_graduate_or_professional_degree',
                        label: 'Graduate or Professional Degree'
                    }
                ],
                transpose: [
                    {
                        column: 'variable',
                        label: 'Level of Education',
                        type: 'string'
                    },
                    {
                        column: 'value',
                        label: 'Value',
                        format: { pattern: '###,###', prefix: '$' }
                    }
                ],
                chart: 'column',
                options: {
                    vAxis: { format: 'currency' }
                }
            }
        ]
    },
    {
        tabName: 'Occupations',
        vector: 'occupations',
        name: 'Percent Employed in Each Occupation',
        attribution: ATTRIBUTIONS.acs,
        domain: ODN_DOMAIN,
        fxf: 'qfcm-fw3i',
        regions: ALL_REGIONS,
        charts: [
            {
                data: [
                    {
                        column: 'occupation',
                        label: 'Occupation',
                        type: 'string'
                    },
                    {
                        column: 'percent_employed',
                        label: 'Percent Employed',
                        format: { pattern: '#.#%' }
                    }
                ],
                transform: _toPercent('percent_employed'),
                chart: 'table',
                options: {
                    height: 800
                }
            }
        ]
    },
    {
        tabName: 'GDP',
        vector: 'gdp',
        name: 'Gross Domestic Product (GDP)',
        sourceURL: 'http://www.bea.gov/regional/index.htm',
        description: `
            Gross Domestic Product (GDP) is a measure of the value of all goods and services
            produced in a region minus the value of the goods and services used up in production.
            Real GDP is adjusted for changes in the value of money (inflation and deflation)
            so that values can be compared between years.
            Data is available for U.S. states and metropolitan areas.`,
        attribution: ATTRIBUTIONS.bea,
        domain: ODN_DOMAIN,
        fxf: 'ks2j-vhr8',
        regions: ['state', 'msa'],
        include: region => _.contains(region.name, 'Metro'),
        charts: [
            {
                name: 'GDP per Capita over Time',
                data: [
                    {
                        column: 'year',
                        label: 'Year',
                        type: 'string'
                    },
                    {
                        column: 'per_capita_gdp',
                        label: 'Per Capita GDP',
                        format: { pattern: '$###,###' }
                    }
                ],
                chart: 'line',
                options: {
                    vAxis: { format: '$###,###' }
                }
            },
            {
                name: 'Annual Change in Per Capita GDP',
                data: [
                    {
                        column: 'year',
                        label: 'Year',
                        type: 'string'
                    },
                    {
                        column: 'per_capita_gdp_percent_change',
                        label: 'Annual Change in Per Capita GDP over Time',
                        format: { pattern: '##.#%' }
                    }
                ],
                transform: _toPercent('per_capita_gdp_percent_change'),
                chart: 'line',
                options: {
                    vAxis: { format: '##.#%' }
                }
            }
        ]
    },
    {
        tabName: 'Cost of Living',
        vector: 'cost_of_living',
        name: 'Cost of Living Indexes (100 is the U.S. Average)',
        sourceURL: 'http://www.bea.gov/newsreleases/regional/rpp/rpp_newsrelease.htm',
        description: `
            The cost of living index measures the difference in the price levels of goods
            and services across regions.
            The average cost of living index in the U.S. is 100,
            with higher values corresponding to costlier goods and services.
            Data is available for U.S. states and metropolitan areas.`,
        attribution: ATTRIBUTIONS.bea,
        domain: ODN_DOMAIN,
        fxf: 'hpnf-gnfu',
        regions: ['state', 'msa'],
        include: region => _.contains(region.name, 'Metro'),
        charts: ['All', 'Rents', 'Goods', 'Other'].map(component => {
            return {
                name: `Category: ${component}`,
                params: {component},
                data: [
                    {
                        column: 'year',
                        label: 'Year',
                        type: 'string'
                    },
                    {
                        column: 'index',
                        label: 'Index'
                    }
                ],
                chart: 'line'
            };
        })
    },
    {
        tabName: 'Consumption',
        vector: 'consumption',
        name: 'Personal Consumption Expenditures',
        sourceURL: 'http://blog.bea.gov/2015/12/03/bureau-of-economic-analysis-releases-two-new-data-sets-to-deepen-understanding-of-u-s-economy/',
        description: `
            Personal consumption expenditure is a measure of goods and services
            purchased by or on behalf of households.
            Data is available for U.S. states and for the nation as a whole.`,
        attribution: ATTRIBUTIONS.bea,
        domain: ODN_DOMAIN,
        fxf: 'va5j-wsjq',
        regions: ['state', 'nation'],
        charts: [
            {
                name: 'Personal Consumption Expenditures over Time (Millions of USD)',
                data: [
                    {
                        column: 'year',
                        label: 'Year',
                        type: 'string'
                    },
                    {
                        column: 'personal_consumption_expenditures',
                        label: 'Personal Consumption Expenditures (Millions of USD)',
                        format: { pattern: '$###,###M' }
                    }
                ],
                chart: 'line',
                options: {vAxis: {format: '$###,###M'}}
            },
            {
                name: 'Change in Personal Consumption Expenditures over Time',
                data: [
                    {
                        column: 'year',
                        label: 'Year',
                        type: 'string'
                    },
                    {
                        column: 'expenditures_percent_change',
                        label: 'Annual Change',
                        format: { pattern: '#.##%' }
                    }
                ],
                transform: rows => {
                    return rows
                        .filter(row => row.year !== '1997')
                        .map(row => _.extend(row, { expenditures_percent_change: parseFloat(row.expenditures_percent_change) / 100 }));
                },
                chart: 'line',
                options: {
                    vAxis: { format: '#.##%' }
                }
            }
        ]
    },
    {
        tabName: 'Job Proximity',
        vector: 'job_proximity',
        name: 'Jobs Proximity Index',
        description: `
            The jobs proximity index quantifies access to employment oppurtunities in a region.
            Values are percentile ranked and range from 0 to 100,
            with higher values corresponding to better access to jobs.
            Data is available for U.S. counties and is current as of .`,
        attribution: ATTRIBUTIONS.hud,
        domain: ODN_DOMAIN,
        fxf: '5pnb-mvzq',
        regions: ['county'],
        charts: [
            {
                name: 'Median Jobs Promiximity Index',
                params: { variable: 'jobs-prox-idx-median' },
                data: [
                    {
                        column: 'variable',
                        label: 'Job Proximity Index',
                        type: 'string'
                    },
                    {
                        column: 'value',
                        label: 'Value'
                    }
                ],
                transform: _rename('variable', {'jobs-prox-idx-median': 'Median Jobs Proximity Index'}),
                chart: 'column',
                options: {vAxis: {viewWindow: {min: 0}}}
            }
        ]
    },
    {
        tabName: 'Environment',
        vector: 'environmental_health',
        name: 'Environmental Health Hazard Index',
        sourceURL: 'http://egis.hud.opendata.arcgis.com/datasets/53a856bef6f24356abee30653399e94a_0',
        description: `
            The environmental health hazard exposure index summarizes potential exposure to harmful toxins
            including carcinogenic, respiratory, and neurological hazards.
            Values are percentile ranked and range from 0 to 100,
            with higher values corresponding to less exposure to harmful toxins.
            Data is available for U.S. counties and is current as of 6/15/2015.`,
        attribution: ATTRIBUTIONS.hud,
        domain: ODN_DOMAIN,
        fxf: 'nax7-t6ga',
        regions: ['county'],
        charts: [
            {
                name: 'Median Environmental Health Hazard Index',
                params: {variable: 'env-health-idx-median'},
                data: [
                    {
                        column: 'variable',
                        label: 'Environmental Health Hazard Index',
                        type: 'string'
                    },
                    {
                        column: 'value',
                        label: 'Value'
                    }
                ],
                transform: _rename('variable', {'env-health-idx-median': 'Median Environmental Health Hazard Index'}),
                chart: 'column',
                options: {vAxis: {viewWindow: {min: 0}}}
            }
        ]
    }
];

const SOURCES_BY_VECTOR = _.indexBy(SOURCES, source => source.vector);

class Sources {
    static has(vector) {
        return vector in SOURCES_BY_VECTOR;
    }

    static get(vector) {
        return SOURCES_BY_VECTOR[vector];
    }

    static defaultVector() {
        return SOURCES[0];
    }

    static supportsVector(vector, regions) {
        if (!(vector in SOURCES_BY_VECTOR)) return false;
        return Sources.supports(SOURCES_BY_VECTOR[vector], regions);
    }

    static supports(source, regions) {
        for (const region of regions) {
            if (!_.contains(source.regions, region.type)) return false;
        }
        return true;
    }

    static forRegions(regions) {
        return SOURCES.filter(source => Sources.supports(source, regions));
    }
}


if (typeof module !== 'undefined') module.exports = Sources;

