'use strict';

if (typeof require !== 'undefined') {
    var _ = require('lodash');
    var d3 = require('d3');
    var Requests = require('../../controllers/request');
}

/**
 * Data Sources.
 *
 * Tabs -> Datasets -> Charts
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
    },
    crimeReports: {
        name: 'CrimeReports.com',
        url: 'http://crimereports.socrata.com/'

    },
    iesNces: {
        name: 'Institute of Education Sciences at National Center for Education Statistics',
        url: 'http://nces.ed.gov/ccd/elsi'

    },
    hhs: {
        name: 'U.S. Department of Health and Human Services',
        url: 'http://www.hhs.gov/'
    }
};

const ALL_REGIONS = ['nation', 'region', 'division', 'state', 'county',
                     'msa', 'place', 'zip_code'];

function _getParams(component) {
    return { component };
}

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
        name: 'Demographics',
        datasets: [
            {
                vector: 'population',
                name: 'Population',
                attribution: ATTRIBUTIONS.acs,
                domain: ODN_DOMAIN,
                fxf: 'e3rd-zzmr',
                datalensFXF: 'va7f-2qjr',
                regions: ALL_REGIONS,
                searchTerms: ['population', 'household', 'demographics', 'ethnicity', 'minority'],
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
                        forecast: {
                            type: 'linear',
                            steps: 5
                        },
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
                        options: {
                            height: 300,
                            vAxis: { format: '#.##%' }
                        }
                    }
                ]
            }
        ]
    },
    {
        name: 'Education',
        datasets: [
            {
                vector: 'education',
                name: 'Graduation Rates',
                attribution: ATTRIBUTIONS.acs,
                domain: ODN_DOMAIN,
                fxf: 'uf4m-5u8r',
                regions: ALL_REGIONS,
                searchTerms: ['college', 'education', 'school', 'university', 'instruction', 'teaching', 'teacher', 'professor', 'student', 'graduation', 'scholastic', 'matriculation'],
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
                vector: 'education_places',
                name: 'Education Places',
                attribution: ATTRIBUTIONS.hhs,
                domain: ODN_DOMAIN,
                fxf: 'uf4m-5u8r',
                datalensFXF: '72qd-7s2t',
                description: `
                    The above map shows schools, libraries, parks, and other education-related
                    places near the selected city.
                    Head Start Centers are available for the entire nation,
                    but other types of places are only available for some cities.`,
                regions: ['place'],
                hasAutosuggest: false,
                searchTerms: ['college', 'education', 'school', 'university', 'instruction', 'teaching', 'teacher', 'professor', 'student', 'graduation', 'scholastic', 'matriculation'],
                charts: []
            },
            {
                vector: 'education_expenditures',
                name: 'Expenditures',
                attribution: ATTRIBUTIONS.iesNces,
                domain: ODN_DOMAIN,

                /**
                 * NBE 4x4 of public dataset on odn.data.socrata.com
                 */
                fxf: 'nxzi-u9nr',

                datalensFXF: '55b9-6f2w',
                description: `
                    All expenditures data are in US$. Year values represent the end of a school year; for example, if the
                    school year was 2004-2005, the listed year will be 2005. Normalization is applied against the total
                    student enrollment for that year; for example, the capital expenditures per student takes the total
                    capital expenditures ending in the given school year, and divides by the total enrollees in that
                    given year, with the result rounded to the nearest integer.`,
                regions: ['state'],

                /**
                 * Terms used to formulate search query to populate datasets. Choose such that subcat, i.e. Classroom
                 * statistics is well represented, but if recall is a problem, include generalizing terms to capture
                 * the category, e.g. Education.
                 */
                searchTerms: ['school budget', 'school funding', 'school construction', 'teacher salaries', 'university salaries',
                'college budget', 'college funding', 'college salaries', 'university budget', 'university funding',
                'college', 'education', 'school', 'university', 'instruction', 'teaching', 'teacher', 'professor',
                'student', 'graduation', 'scholastic', 'matriculation'],

                charts: [
                    {
                        name: 'Capital Expenditures (US$)',
                        params: {variable: 'capital-expenditures'},
                        data: [
                            {
                                column: 'year',
                                label: 'Year',
                                type: 'string'
                            },
                            {
                                column: 'value',
                                label: 'education related capital expenditures',
                                format: { pattern: '###,###' }
                            }
                        ],
                        chart: 'line',
                        forecast: {
                           type: 'linear',
                           steps: 7
                         },
                         options: {
                            height: 300
                        }
                    },
                    {
                        name: 'Capital Expenditures Per Student (US$)',
                        params: {variable: 'capital-expenditures-per-student'},
                        data: [
                            {
                                column: 'year',
                                label: 'Year',
                                type: 'string'
                            },
                            {
                                column: 'value',
                                label: 'capital expenditures per student',
                                format: { pattern: '###,###' }
                            }
                        ],
                        chart: 'line',
                        forecast: {
                           type: 'linear',
                           steps: 7
                         },
                         options: {
                            height: 300
                        }
                    },
                    {
                        name: 'Administration Salaries (US$)',
                        params: {variable: 'administration-salaries'},
                        data: [
                            {
                                column: 'year',
                                label: 'Year',
                                type: 'string'
                            },
                            {
                                column: 'value',
                                label: 'education related administration salaries',
                                format: { pattern: '###,###' }
                            }
                        ],
                        chart: 'line',
                        forecast: {
                           type: 'linear',
                           steps: 7
                         },
                         options: {
                            height: 300
                        }
                    },
                    {
                        name: 'Administration Salaries Per Student (US$)',
                        params: {variable: 'administration-salaries-per-student'},
                        data: [
                            {
                                column: 'year',
                                label: 'Year',
                                type: 'string'
                            },
                            {
                                column: 'value',
                                label: 'administration salaries per student',
                                format: { pattern: '###,###' }
                            }
                        ],
                        chart: 'line',
                        forecast: {
                           type: 'linear',
                           steps: 7
                         },
                         options: {
                            height: 300
                        }
                    },
                    {
                        name: 'Instruction Salaries (US$)',
                        params: {variable: 'instruction-salaries'},
                        data: [
                            {
                                column: 'year',
                                label: 'Year',
                                type: 'string'
                            },
                            {
                                column: 'value',
                                label: 'teacher and other instruction related salaries',
                                format: { pattern: '###,###' }
                            }
                        ],
                        chart: 'line',
                        forecast: {
                           type: 'linear',
                           steps: 7
                         },
                         options: {
                            height: 300
                        }
                    },
                    {
                        name: 'Instruction Salaries Per Student (US$)',
                        params: {variable: 'instruction-salaries-per-student'},
                        data: [
                            {
                                column: 'year',
                                label: 'Year',
                                type: 'string'
                            },
                            {
                                column: 'value',
                                label: 'teacher and other instruction related salaries per student',
                                format: { pattern: '###,###' }
                            }
                        ],
                        chart: 'line',
                        forecast: {
                           type: 'linear',
                           steps: 7
                         },
                         options: {
                            height: 300
                        }
                    }
                ]
            },
            {
                vector: 'classroom_statistics',
                name: 'Classroom Statistics',
                attribution: ATTRIBUTIONS.iesNces,
                domain: ODN_DOMAIN,

                /**
                 * NBE 4x4 of public dataset on odn.data.socrata.com
                 */
                fxf: 'kx62-ayme',

                datalensFXF: '6xsy-aftn',

                regions: ['state', 'county', 'msa'],

                /**
                 * Terms used to formulate search query to populate datasets. Choose such that subcat, i.e. Classroom
                 * statistics is well represented, but if recall is a problem, include generalizing terms to capture
                 * the category, e.g. Education.
                 */
                searchTerms: ['class size', 'pupil teacher ratio', 'student teacher ratios', 'student teacher ratio', 'college', 'education', 'school', 'university', 'instruction', 'teaching', 'teacher', 'professor', 'student', 'scholastic', 'matriculation'],

                charts: [
                    {
                        name: 'Student Teacher Ratio',
                        data: [
                            /**
                             * X axis variable definition.
                             */
                            {
                                /**
                                 * Corresponds to the column in the source dataset containing the variable value.
                                 */
                                column: 'year',

                                label: 'Year',
                                type: 'string'
                            },
                            {
                                column: 'value',
                                label: 'Student Teacher Ratios',
                                format: { pattern: '###.##' }
                            }
                        ],
                        chart: 'line',
                        forecast: {
                           type: 'linear',
                           steps: 7
                         },
                         options: {
                            height: 300
                        }
                    }
                ]
            }
        ]
    },
    {
        name: 'Jobs',
        datasets: [
            {
                vector: 'earnings',
                name: 'Earnings',
                attribution: ATTRIBUTIONS.acs,
                domain: ODN_DOMAIN,
                fxf: 'wmwh-4vak',
                regions: ALL_REGIONS,
                searchTerms: ['revenue', 'budget', 'dividend', 'wage', 'income', 'compensation', 'assets', 'salary', 'earnings'],
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
                vector: 'occupations',
                name: 'Occupations',
                attribution: ATTRIBUTIONS.acs,
                domain: ODN_DOMAIN,
                fxf: 'qfcm-fw3i',
                regions: ALL_REGIONS,
                searchTerms: ['occupations', 'wage', 'profession', 'business', 'work', 'job', 'profession', 'employment', 'labor', 'avocation'],
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
                vector: 'job_proximity',
                name: 'Jobs Proximity',
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
                searchTerms: ['job location', 'job opportunities', 'employment location', 'employment opportunities', 'commute', 'telecommute', 'transportation', 'traffic'],
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
            }
        ]
    },
    {
        name: 'Economy',
        datasets: [
            {
                vector: 'gdp',
                name: 'GDP',
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
                searchTerms: ['gdp', 'gross domestic product', 'economy', 'production', 'revenue', 'gross national product', 'gnp'],
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
                        forecast: {
                            type: 'linear',
                            steps: 5
                        },
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
                        options: {
                            height: 300,
                            vAxis: { format: '##.#%' }
                        }
                    }
                ]
            },
            {
                vector: 'consumption',
                name: 'Consumption',
                sourceURL: 'http://blog.bea.gov/2015/12/03/bureau-of-economic-analysis-releases-two-new-data-sets-to-deepen-understanding-of-u-s-economy/',
                description: `
                    Personal consumption expenditure is a measure of goods and services
                    purchased by or on behalf of households.
                    Data is available for U.S. states and for the nation as a whole.`,
                attribution: ATTRIBUTIONS.bea,
                domain: ODN_DOMAIN,
                fxf: 'va5j-wsjq',
                regions: ['state', 'nation'],
                searchTerms: ['consumption', 'consumer', 'household consumption', 'goods and services', 'personal expenditure', 'personal expenses', 'pce'],
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
                        forecast: {
                            type: 'linear',
                            steps: 5
                        },
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
                        options: {
                            height: 300,
                            vAxis: { format: '#.##%' }
                        }
                    }
                ]
            },
            {
                vector: 'cost_of_living',
                name: 'Cost of Living',
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
                searchTerms: ['cost of living', 'rent', 'housing', 'consumer price index', 'expensive', 'inexpensive', 'housing cost', 'home price'],
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
                    ].concat([
                        ['All', 'Overall Cost of Living'],
                        ['Goods', 'Cost of Goods'],
                        ['Rents', 'Cost of Rents'],
                        ['Other', 'Other Costs']].map(component => {
                    return {
                        name: component[1],
                        params: _getParams(component[0]),
                        data: [
                            {
                                column: 'year',
                                label: 'Year',
                                type: 'string'
                            },
                            {
                                column: 'index',
                                label: component[1],
                                format: { pattern: '#.#' }
                            }
                        ],
                        chart: 'line',
                        forecast: {
                            type: 'linear',
                            steps: 5
                        }
                    };
                }))
            }
        ]
    },
    {
        name: 'Health',
        datasets: [
            {
                vector: 'environmental_health',
                name: 'Environment',
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
                searchTerms: ['environment', 'pollution', 'carbon', 'emissions', 'energy', 'waste', 'toxic', 'smog', 'climate', 'radiation', 'toxin', 'hazard'],
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
                searchTerms: ['health', 'fitness', 'smoking', 'alcohol', 'tobacco', 'obesity', 'tobacco', 'exercise', 'junk food'],
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
                vector: 'health_indicators',
                name: 'Health Indicators',
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
                searchTerms: ['health', 'asthma', 'arthritis', 'cardiac', 'cancer', 'copd', 'diabetes', 'disease', 'chronic'],
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
        ]
    },
    {
        name: 'Public Safety',
        datasets: [
            {
                vector: 'city_crime',
                name: 'Crime',
                description: `
                    Summary crime statistics are generated by an aggregation
                    across month and crime type. Crime incidents whose recorded
                    coordinates are not located inside the US Census based boundary
                    of a given city are not included in summary statistics.
                    Normalization is based on US Census 2013 population counts.
                    Crime rates are normalized on a per 100K basis;
                    specifically, the crime count is divided by the population count,
                    the result is then multiplied by 100K and rounded to the
                    nearest integer value. Crime counts are not available
                    for all cities in the US, and in some cases,
                    policing agencies for a given city may have partial crime type coverage.
                    For detailed crime timelines and incidents see: `,
                mapDescription: `
                    Note: Cities often report crimes for a subset of crime types.
                    As a result, cities may appear or disappear from the map for
                    a given crime type selection. The absence of a city should not
                    be interpreted as the absence of the specified crime type.`,
                attribution: ATTRIBUTIONS.crimeReports,
                domain: ODN_DOMAIN,
                fxf: 'ee8v-jgb5',
                regions: ['place'],
                include: region => _.contains(['DC', 'VA', 'MD'], _.last(region.name.split(', '))),
                searchTerms: ['crime', 'police', 'arrest', 'warrant'],
                charts: [
                    {
                        name: 'Crime Rate over Time',
                        description: `
                            Crimes reported per month per 100,000 people.
                            Only crime types that are reported by every selected city are shown.`,
                        data: [
                            {
                                column: 'year',
                                label: 'Year'
                            },
                            {
                                column: 'crime_rate',
                                label: 'Crime Rate',
                                format: {pattern: '###,###'}
                            },
                            {
                                column: 'month',
                                label: 'Month'
                            },
                            {
                                column: 'incident_parent_type'
                            }
                        ],
                        transform: rows => {
                            return _crimeTransform('crimerateovertime', 'crime_rate')(rows).map(row => _.extend(row, {
                                crime_rate: row.crime_rate * 100000
                            }));
                        },
                        x: {
                            column: 'date',
                            label: 'Date',
                            type: 'date',
                            formatter: 'date',
                            format: {pattern: 'MMMM y'}
                        },
                        chart: 'line',
                        options: {
                            height: 300,
                            hAxis: {format: 'MMMM y'}
                        }
                    },
                    {
                        name: 'Crime over Time',
                        description: `
                            Crimes reported per month.
                            Only crime types that are reported by every selected city are shown.`,
                        descriptionPromise: (regions) => {
                            return new Promise((resolve, reject) => {
                            });
                        },
                        data: [
                            {
                                column: 'year',
                                label: 'Year'
                            },
                            {
                                column: 'crime_count',
                                label: 'Crime Count',
                                format: { pattern: '###,###' }
                            },
                            {
                                column: 'month',
                                label: 'Month'
                            },
                            {
                                column: 'incident_parent_type'
                            }
                        ],
                        transform: _crimeTransform('crimeovertime', 'crime_count'),
                        x: {
                            column: 'date',
                            label: 'Date',
                            type: 'date',
                            formatter: 'date',
                            format: {pattern: 'MMMM y'}
                        },
                        chart: 'line',
                        options: {
                            height: 300,
                            hAxis: {format: 'MMMM y'}
                        }
                    }
                ],
                callback: (regions) => {
                    const baseURL = 'https://odn.data.socrata.com/resource/gm3u-gw57.json';
                    const params = {
                        '$where': `id in (${regions.map(region => `'${region.id}'`).join(',')})`,
                        '$select': 'id,location,name'
                    };

                    const url = `${baseURL}?${$.param(params)}`;

                    d3.promise.json(url).then(_regions => {
                        const links = _.chain(_regions)
                            .map(_region => _.extend(_region, {
                                name: _.find(regions, region => region.id === _region.id).name || _region.name,
                                url: `http://preview.crimereports.com/#!/dashboard?lat=${_region.location.coordinates[1]}&lng=${_region.location.coordinates[0]}&incident_types=Assault%252CAssault%2520with%2520Deadly%2520Weapon%252CBreaking%2520%2526%2520Entering%252CDisorder%252CDrugs%252CHomicide%252CKidnapping%252CLiquor%252COther%2520Sexual%2520Offense%252CProperty%2520Crime%252CProperty%2520Crime%2520Commercial%252CProperty%2520Crime%2520Residential%252CQuality%2520of%2520Life%252CRobbery%252CSexual%2520Assault%252CSexual%2520Offense%252CTheft%252CTheft%2520from%2520Vehicle%252CTheft%2520of%2520Vehicle&start_date=2016-02-23&end_date=2016-03-01&days=sunday%252Cmonday%252Ctuesday%252Cwednesday%252Cthursday%252Cfriday%252Csaturday&start_time=0&end_time=23&include_sex_offenders=false&zoom=15&shapeNames=&show_list=true`
                            }))
                            .map(link => `<a href="${link.url}">${link.name}</a>`)
                            .value();

                        function wordJoin(list, separator) {
                            if (list.length === 0) return '';
                            if (list.length === 1) return list[0];
                            separator = separator || 'and';
                            return `${list.slice(0, list.length - 1).join(', ')} ${separator} ${list[list.length - 1]}`;
                        }

                        d3.select('p#dataset-description')
                            .append('span')
                            .html(wordJoin(links, 'or'));
                    }, error => {
                        console.log('error fetching coordinates for crime description.');
                        console.log(regions);
                        console.log(url);
                        console.log(error);
                    });
                }
            }
        ]
    }
];

const DATASETS = _.flatten(SOURCES.map(tab => tab.datasets));
const DATASETS_BY_VECTOR = _.indexBy(DATASETS, source => source.vector);

class Sources {
    static source(vector) {
        return DATASETS_BY_VECTOR[vector];
    }

    static groups(regions) {
        return SOURCES.filter(group => {
            return group.datasets
                .map(dataset => Sources.supports(dataset, regions))
                .some(_.identity);
        });
    }

    static group(vector) {
        return _.find(SOURCES, group => {
            return _.find(group.datasets, dataset => dataset.vector === vector);
        });
    }

    static sources(group, regions) {
        return group.datasets.filter(dataset => Sources.supports(dataset, regions));
    }

    static has(vector) {
        return vector in DATASETS_BY_VECTOR;
    }

    static get(vector) {
        return DATASETS_BY_VECTOR[vector];
    }

    static defaultVector() {
        return DATASETS[0];
    }

    static supportsVector(vector, regions) {
        if (!(vector in DATASETS_BY_VECTOR)) return false;
        return Sources.supports(DATASETS_BY_VECTOR[vector], regions);
    }

    /**
     * True if dataset has data for any of the given regions.
     */
    static supports(dataset, regions) {
        return regions.map(region => {
            return (_.contains(dataset.regions, region.type) &&
                    (!dataset.include || dataset.include(region)));
        }).some(_.identity);
    }

    static forRegions(regions) {
        return DATASETS.filter(source => Sources.supports(source, regions));
    }

    static validRegions(source, regions) {
        return new Promise((resolve, reject) => {
            if (regions.length < 1) {
                resolve([]);
            } else {
                const path = `https://${source.domain}/resource/${source.fxf}.json`;
                const id = source.idColumn || 'id';
                const params = {
                    '$select': id,
                    '$where': `${id} in (${regions.map(region => `'${region.id}'`)})`,
                };

                function request() {
                    if (typeof Requests === 'undefined') {
                        const url = `${path}?${$.param(params)}`;
                        return d3.promise.json(url);
                    } else {
                        const url = Requests.buildURL(path, params);
                        return Requests.getJSON(url);
                    }
                }

                request().then(data => {
                    const ids = _.uniq(data.map(_.property(id)));
                    const validRegions = regions.filter(region => _.contains(ids, region.id));
                    resolve(validRegions);
                }, reject);
            }
        });
    }
}

function _crimeTransform(div, column) {
    return rows => {
        const availableTypes = _.chain(rows)
            .groupBy(row => [row.id].join(','))
            .values()
            .map(rows => _.uniq(rows.map(row => row.incident_parent_type)))
            .value();
        let availableForAll = _.intersection.apply({}, availableTypes);

        const description = availableForAll.length > 1 ?
            `For the selected regions, the following crime types are available:
             ${availableForAll.join(', ')}.` :
            `Since there are no crime types for which every selected region has data,
             data for all crime types is shown.`;
        var descriptionSel = d3.select(`div#${div} p.chart-description`);
        descriptionSel.text(`${descriptionSel.text()} ${description}`);
        if (availableForAll.length < 1) availableForAll = _.union.apply({}, availableTypes);

        return _.chain(rows)
            .groupBy(row => [row.id, row.year, row.month].join(','))
            .values()
            .map(values => {
                return _.chain(values)
                    .filter(value => _.contains(availableForAll, value.incident_parent_type))
                    .groupBy(value => value.incident_parent_type)
                    .values()
                    .map(forType => _.max(forType, value => parseFloat(value[column])))
                    .value();
            })
            .map(values => {
                return _.extend({}, _.max(values, value => parseFloat(value[column])), {
                    incident_parent_type: 'all',
                    [column]: _.reduce(values, (sum, row) => sum + parseFloat(row[column]), 0)
                });
            })
            .sortBy(row => (parseInt(row.year) - 2000) * 12 + parseInt(row.month))
            .filter(row => (row.year) && (row.month))
            .map(row => {
                return _.extend({}, row, {
                    date: `Date(${parseInt(row.year)}, ${parseInt(row.month) - 1})`
                });
            })
            .value();
    };
}


if (typeof module !== 'undefined') module.exports = Sources;

