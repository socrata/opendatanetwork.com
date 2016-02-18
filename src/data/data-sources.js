'use strict';

if (typeof require !== 'undefined') var _ = require('lodash');

/**
 * Data Sources.
 *
 * [Tab] -> [Chart]
 *
 * const exampleSource = {
 *     tabName: 'Example', // Tab names should be kept short.
 *     vector: 'example', // Name that goes in the url. Lowercase, underscores, same as map source.
 *     name: 'Example Data', // Shown in chart header.
 *     attribution: { // See ATTRIBUTIONS.
 *         name: 'Example Data Provider',
 *         url: 'http://example.com' // Home page.
 *     },
 *     domain: 'odn.data.socrata.com',
 *     fxf: '1234-abcd', // Make sure to use a NBE fxf!
 *     regions: ['state', 'county'], // See ALL_REGIONS.
 *     charts: [
 *         {
 *             name: 'Example Chart' // Name passed to chart as 'title' attribute.
 *         }
 *     ]
 * };
 *
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
    },
    rwjf: {
        name: 'Robert Wood Johnson Foundation',
        url: 'http://www.rwjf.org/'
    },
    cdc: {
        name: 'Centers for Disease Control and Prevention',
        url: 'http://www.cdc.gov/'
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
        return rows.map(row => {
            const name = names[row[column]] || row[column];
            return _.extend(row, {[column]: name});
        });
    };
}

function _order(column, orders) {
    return rows => {
        return _.sortBy(rows, row => orders.indexOf(row[column]));
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
        datalensFXF: 'va7f-2qjr',
        regions: ALL_REGIONS,
        searchTerms: ['population', 'housing', 'demographics', 'race'],
        charts: [
            {
                name: 'Population',
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
                forecast: 5,
                options: {
                    height: 300
                }
            },
            {
                name: 'Population Change',
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
                forecast: 5,
                options: {
                    height: 300,
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
        searchTerms: ['college', 'education', 'school', 'university', 'instruction', 'teaching', 'teacher', 'professor'],
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
                        label: '',
                        type: 'string'
                    },
                    {
                        column: 'value',
                        label: 'Value',
                        format: { pattern: '#.#%' }
                    }
                ],
                transform: _toPercent('value'),
                chart: 'table',
                options: {
                    vAxis: {
                        format: 'percent',
                        viewWindow: {
                            min: 0,
                            max: 1
                        }
                    }
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
        searchTerms: ['economy', 'revenue', 'gdp', 'tax', 'revenue', 'budget', 'fiscal'],
        charts: [
            {
                name: 'Earnings and Gender',
                description: `
                    Median earnings of full-time and part-time workers broken down by gender.`,
                data: [
                    {
                        column: 'median_earnings',
                        label: 'All Workers',
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
                chart: 'table'
            },
            {
                name: 'Earnings and Education',
                description: `
                    Median earnings of full-time and part-time workers broken down
                    by level of education.`,
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
                chart: 'stepped-area',
                options: {
                    height: 300,
                    vAxis: { format: 'currency' },
                    areaOpacity: 0,
                    lineWidth: 2
                }
            }
        ]
    },
    {
        tabName: 'Occupations',
        vector: 'occupations',
        name: 'Occupations',
        attribution: ATTRIBUTIONS.acs,
        domain: ODN_DOMAIN,
        fxf: 'qfcm-fw3i',
        regions: ALL_REGIONS,
        searchTerms: ['occupations', 'wages', 'wage', 'profession', 'business', 'work', 'commute'],
        charts: [
            {
                name: 'Occupations',
                description: `
                    Percentage of workers employed in each occupation.`,
                data: [
                    {
                        column: 'occupation',
                        label: '',
                        type: 'string'
                    },
                    {
                        column: 'percent_employed',
                        label: 'Percent Employed',
                        format: { pattern: '#.#%' }
                    }
                ],
                transform: _toPercent('percent_employed'),
                chart: 'table'
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
        searchTerms: ['gdp', 'gross domestic product', 'economy', 'goods', 'production', 'revenue'],
        charts: [
            {
                name: 'GDP',
                description: `
                    Real (inflation adjusted) GDP per Capita over time.`,
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
                forecast: 5,
                options: {
                    height: 300,
                    vAxis: { format: '$###,###' }
                }
            },
            {
                name: 'Change in GDP',
                description: `
                    Annual change in real GDP.`,
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
                forecast: 5,
                options: {
                    height: 300,
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
        searchTerms: ['cost of living', 'rent', 'housing', 'income', 'tax'],
        charts: [
            {
                name: 'Cost of Living',
                data: [
                    {
                        column: 'component',
                        label: '',
                        type: 'string'
                    },
                    {
                        column: 'index',
                        label: 'Index'
                    },
                    {
                        column: 'year',
                        label: 'Year'
                    }
                ],
                chart: 'table'
            }
            ].concat(['All', 'Rents', 'Goods', 'Other'].map(component => {
            return {
                name: `${component}`,
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
                chart: 'line',
                forecast: 5
            };
        }))
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
        searchTerms: ['consumption', 'consumer', 'spending', 'earning', 'fiscal', 'economy'],
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
                forecast: 5,
                options: {
                    height: 300,
                    vAxis: { format: '$###,###M' }
                }
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
                forecast: 5,
                options: {
                    height: 300,
                    vAxis: { format: '#.##%' }
                }
            }
        ]
    },
    {
        tabName: 'Job Proximity',
        vector: 'job_proximity',
        name: 'Jobs Proximity Index',
        sourceURL: 'http://egis.hud.opendata.arcgis.com/datasets/636ecbfb0ee5480ea5b68e65991e4815_0',
        description: `
            The jobs proximity index quantifies access to employment opportunities in a region.
            Values are percentile ranked and range from 0 to 100,
            with higher values corresponding to better access to jobs.
            Data is computed for U.S. counties by applying summary statistics across all
            census tracts present in a county and is current as of 2015.
            <br /><br />
            The underlying index quantifies the accessibility of a given residential neighborhood
            as a function of its distance to all job locations within a census tract,
            with distance to larger employment centers weighted more heavily.
            Specifically, a gravity model is used, where the accessibility (Ai)
            of a given residential block-group is a summary description of the
            distance to all job locations, with the distance from any single job
            location positively weighted by the size of employment (job opportunities)
            at that location and inversely weighted by the labor supply (competition) to that location.`,
        attribution: ATTRIBUTIONS.hud,
        domain: ODN_DOMAIN,
        fxf: '5pnb-mvzq',
        regions: ['county'],
        searchTerms: ['occupations', 'wages', 'wage', 'profession', 'business', 'work', 'commute'],
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
                options: {
                    height: 300,
                    vAxis: { viewWindow: { min: 0 } }
                }
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
            Data is computed for U.S. counties by applying summary statistics across
            all census tracts present in a county and is current as of 2015.`,
        attribution: ATTRIBUTIONS.hud,
        domain: ODN_DOMAIN,
        fxf: 'nax7-t6ga',
        regions: ['county'],
        searchTerms: ['environment', 'health', 'pollution', 'carbon', 'emissions', 'energy', 'waste', 'lead', 'inspection'],
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
                options: {
                    height: 300,
                    vAxis: { viewWindow: { min: 0 } }
                }
            }
        ]
    },
    {
        tabName: 'Health Behaviors',
        vector: 'health',
        name: 'Health Behaviors',
        sourceURL: 'http://www.countyhealthrankings.org/rankings/data',
        description: `
            The Robert Wood Johnson Foundation produces health rankings for states and counties.
            They explore many aspects of health including quality of life, health behaviors,
            access to clinical care, socioeconomic factors, and environmental factors.`,
        attribution: ATTRIBUTIONS.rwjf,
        domain: ODN_DOMAIN,
        fxf: '7ayp-utp2',
        regions: ['county', 'state'],
        searchTerms: ['health', 'fitness', 'smoking', 'drinking', 'alcohol', 'tobacco', 'obesity', 'parks'],
        charts: [
            {
                name: 'Health Behaviors',
                description: `
                    Adult Smoking is the percentage of the adult population that currently smokes
                    every day or most days and has smoked at least 100 cigarettes in their lifetime.
                    <br /><br />
                    Adult Obesity is the percentage of the adult population (age 20 and older) that
                    reports a body mass index (BMI) greater than or equal to 30 kg/m^2.
                    <br /><br />
                    Physical Inactivity is the percentage of adults aged 20 and over reporting no
                    leisure-time physical activity. Examples of physical activities provided
                    include running, calisthenics, golf, gardening, or walking for exercise.
                    <br /><br />
                    Access to Exercise Opportunities measures the percentage of individuals
                    in a county who live reasonably close to a location for physical activity.
                    Locations for physical activity are defined as parks or recreational facilities.
                    Individuals who reside in a census block within half a mile from a park,
                    reside in an urban census tract within one mile of a recreational facility, or
                    reside in a rural census tract within three miles of a recreational facility
                    are considered to have adequate access for opportunities for physical activity.
                    <br /><br />
                    Excessive Drinking is the percentage of adults that report either binge drinking,
                    defined as consuming more than 4 (women) or 5 (men) alcoholic beverages on a
                    single occasion in the past 30 days, or heavy drinking, defined as drinking
                    more than one (women) or 2 (men) drinks per day on average.`,
                data: [
                    {
                        column: 'Adult obesity Value',
                        label: 'Adult Obesity Rate'
                    },
                    {
                        column: 'Adult smoking Value',
                        label: 'Adult Smoking Rate'
                    },
                    {
                        column: 'Physical inactivity Value',
                        label: 'Physical Inactivity Rate'
                    },
                    {
                        column: 'Access to exercise opportunities Value',
                        label: 'Access to Exercise Opportunities Rate'
                    },
                    {
                        column: 'Excessive drinking Value',
                        label: 'Excessive Drinking Rate'
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
                        format: { pattern: '#.##%' }
                    }
                ],
                chart: 'table'
            }
        ]
    },
    {
        tabName: 'Health Indicators',
        vector: 'health_indicators',
        name: 'Health',
        sourceURL: 'http://www.cdc.gov/brfss/',
        description: `
            The CDC's Behavioral Risk Factor Surveillance System (BRFSS) is the nation's
            premier system of health-related telephone surveys that collect state data
            about U.S. residents regarding their health-related risk behaviors,
            chronic health conditions, and use of preventive services.
            Established in 1984 with 15 states, BRFSS now collects data in
            all 50 states as well as the District of Columbia and three U.S. territories.
            BRFSS completes more than 400,000 adult interviews each year,
            making it the largest continuously conducted health survey system in the world.`,
        attribution: ATTRIBUTIONS.cdc,
        domain: ODN_DOMAIN,
        fxf: 'n4rt-3rmd',
        regions: ['state'],
        idColumn: '_geoid',
        searchTerms: ['health', 'fitness', 'smoking', 'drinking', 'alcohol', 'tobacco', 'obesity', 'parks'],
        charts: [
            {
                name: 'Chronic Health Indicators',
                params: {
                    'break_out': 'Overall',
                    'year': '2013',
                    'response': 'Yes',
                    'classid': 'CLASS03'
                },
                data: [
                    {
                        column: 'question',
                        label: '',
                        type: 'string'
                    },
                    {
                        column: 'data_value',
                        label: 'Value',
                        format: { pattern: '#.#%' }
                    }
                ],
                transform: _toPercent('data_value'),
                chart: 'table'
            },
            {
                name: 'Disability Status',
                params: {
                    'break_out': 'Overall',
                    'year': '2013',
                    'response': 'Yes',
                    'classid': 'CLASS05',
                    'topicid': 'Topic19'
                },
                data: [
                    {
                        column: 'question',
                        label: '',
                        type: 'string'
                    },
                    {
                        column: 'data_value',
                        label: 'Value',
                        format: { pattern: '#.#%' }
                    }
                ],
                transform: _toPercent('data_value'),
                chart: 'table'
            },
            {
                name: 'Time of Last Checkup',
                params: {
                    'break_out': 'Overall',
                    'year': '2013',
                    'classid': 'CLASS07',
                    'topicid': 'Topic36'
                },
                data: [
                    {
                        column: 'response',
                        label: 'Response',
                        type: 'string'
                    },
                    {
                        column: 'data_value',
                        label: 'Value',
                        format: { pattern: '#.#%' }
                    }
                ],
                transform: rows => {
                    const orders = [
                        'Never',
                        '5 or more years ago',
                        'Within the past 5 years',
                        'Within the past 2 years',
                        'Within the past year'
                    ];

                    const percent = _toPercent('data_value');
                    const order = _order('response', orders);

                    return order(percent(rows));
                },
                chart: 'column',
                options: {
                    height: 300,
                    vAxis: { format: '#.##%', viewWindow: { min: 0 } },
                }
            },
            {
                name: 'Health Status',
                params: {
                    'break_out': 'Overall',
                    'year': '2013',
                    'classid': 'CLASS08',
                    'topicid': 'Topic41'
                },
                data: [
                    {
                        column: 'response',
                        label: 'Response',
                        type: 'string'
                    },
                    {
                        column: 'data_value',
                        label: 'Value',
                        format: { pattern: '#.#%' }
                    }
                ],
                transform: rows => {
                    const orders = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'];
                    const percent = _toPercent('data_value');
                    const order = _order('response', orders);

                    return order(percent(rows));
                },
                chart: 'column',
                options: {
                    height: 300,
                    vAxis: { format: '#.##%', viewWindow: { min: 0 } },
                }
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
            if (!_.contains(source.regions, region.type) ||
               (source.include && !source.include(region))) return false;
        }
        return true;
    }

    static forRegions(regions) {
        return SOURCES.filter(source => Sources.supports(source, regions));
    }
}


if (typeof module !== 'undefined') module.exports = Sources;

