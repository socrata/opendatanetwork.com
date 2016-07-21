'use strict';

const DATASET_ATTRIBUTIONS = {
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
        name: 'FBI Uniform Crime Reporting Program',
        url: 'https://www.fbi.gov/about-us/cjis/ucr/ucr'

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

const DATASET_CONFIG = {

    'crime.fbi_ucr' : {
        attribution: [DATASET_ATTRIBUTIONS.crimeReports],
        charts: [
            {
                chartId: 'crime.fbi_ucr.count.chart',
                chartType: 'line',
                name: 'Crime Incident Count',
                options: {
                    hAxis: { format:'####' },
                    height: 300,
                    title: 'Crime Incident Count',
                    vAxis: { format: '###.#' }
                },
                variables: [
                    {
                        variableId: 'crime.fbi_ucr.count',
                        label: 'Crime Incident Count',
                    }
                ],
                x: {
                    formatter: 'number',
                    format: { pattern: '####'}
                },
                y: {
                    formatter: 'number',
                    format: { pattern: '###.#'}
                },
            }]
    },

    'economy.consumption' : {
        attribution: [DATASET_ATTRIBUTIONS.bea],
        charts: [
            {
                chartId: 'economy.consumption.personal_consumption_expenditures.chart',
                chartType: 'line',
                name: 'Personal Consumption Expenditures over Time (Millions of USD)',
                options: {
                    hAxis: { format:'####' },
                    height: 300,
                    title: 'Personal Consumption Expenditures over Time (Millions of USD)',
                    vAxis: { format: '#,###' }
                },
                variables: [
                    {
                        variableId: 'economy.consumption.personal_consumption_expenditures'
                    }
                ],
                x: {
                    formatter: 'number',
                    format: { pattern: '####'}
                },
                y: {
                    formatter: 'number',
                    format: { pattern: '$###,###'}
                },
            },
            {
                chartId: 'economy.consumption.expenditures_percent_change.chart',
                chartType: 'line',
                name: 'Change in Personal Consumption Expenditures over Time',
                options: {
                    hAxis: { format:'####' },
                    height: 300,
                    title: 'Change in Personal Consumption Expenditures over Time',
                    vAxis: { format: '#.##%' }
                },
                variables: [
                    {
                        variableId: 'economy.consumption.expenditures_percent_change'
                    }
                ],
                x: {
                    formatter: 'number',
                    format: { pattern: '####'}
                },
                y: {
                    formatter: 'number',
                    format: { pattern: '#.##\'%\''}
                },
            }]
    },

    'economy.cost_of_living': {
        attribution: [DATASET_ATTRIBUTIONS.bea],
        charts: [
            {
                chartId: 'economy.cost_of_living.index.chart',
                chartType: 'table',
                constraint: {
                    year: '2013'
                },
                name: 'Cost of Living',
                options: {},
                variables: [
                    {
                        variableId: 'economy.cost_of_living.index',
                    },
                ],
                y: {
                    formatter: 'number',
                    format: { pattern: '###.#'}
                },
            },
            {
                chartId: 'economy.cost_of_living.index.all.chart',
                chartType: 'line',
                constraint: {
                    component: 'All'
                },
                name: 'Overall Cost of Living',
                options: {
                    hAxis: { format:'####' },
                    height: 300,
                    title: 'Overall Cost of Living',
                    vAxis: { format: '#.#' }
                },
                variables: [
                    {
                        variableId: 'economy.cost_of_living.index',
                    }
                ],
                x: {
                    formatter: 'number',
                    format: { pattern: '####'}
                },
                y: {
                    formatter: 'number',
                    format: { pattern: '#.#'}
                },
            },
            {
                chartId: 'economy.cost_of_living.index.goods.chart',
                chartType: 'line',
                constraint: {
                    component: 'Goods'
                },
                name: 'Cost of Goods',
                options: {
                    hAxis: { format:'####' },
                    height: 300,
                    title: 'Cost of Goods',
                    vAxis: { format: '#.#' }
                },
                variables: [
                    {
                        variableId: 'economy.cost_of_living.index',
                    }
                ],
                x: {
                    formatter: 'number',
                    format: { pattern: '####'}
                },
                y: {
                    formatter: 'number',
                    format: { pattern: '#.#'}
                },
            },
            {
                chartId: 'economy.cost_of_living.index.rents.chart',
                chartType: 'line',
                constraint: {
                    component: 'Rents'
                },
                name: 'Cost of Rents',
                options: {
                    hAxis: { format:'####' },
                    height: 300,
                    title: 'Cost of Rents',
                    vAxis: { format: '#.#' }
                },
                variables: [
                    {
                        variableId: 'economy.cost_of_living.index',
                    }
                ],
                x: {
                    formatter: 'number',
                    format: { pattern: '####'}
                },
                y: {
                    formatter: 'number',
                    format: { pattern: '#.#'}
                },
            },
            {
                chartId: 'economy.cost_of_living.index.other.chart',
                chartType: 'line',
                constraint: {
                    component: 'Other'
                },
                name: 'Other Costs',
                options: {
                    hAxis: { format:'####' },
                    height: 300,
                    title: 'Other Costs',
                    vAxis: { format: '#.#' }
                },
                variables: [
                    {
                        variableId: 'economy.cost_of_living.index',
                    }
                ],
                x: {
                    formatter: 'number',
                    format: { pattern: '####'}
                },
                y: {
                    formatter: 'number',
                    format: { pattern: '#.#'}
                },
            }]
    },

    'economy.gdp': {
        attribution: [DATASET_ATTRIBUTIONS.bea],
        charts: [
            {
                chartId: 'economy.gdp.per_capita_gdp.chart',
                chartType: 'line',
                description: 'Real (inflation adjusted) GDP per Capita over time.',
                name: 'GDP',
                options: {
                    hAxis: { format:'####' },
                    height: 300,
                    title: 'GDP',
                    vAxis: { format: '#,###' }
                },
                variables: [
                    {
                        variableId: 'economy.gdp.per_capita_gdp'
                    }
                ],
                x: {
                    formatter: 'number',
                    format: { pattern: '####'}
                },
                y: {
                    formatter: 'number',
                    format: { pattern: '$###,###'}
                },
            },
            {
                chartId: 'economy.gdp.per_capita_gdp_percent_change.chart',
                chartType: 'line',
                description: 'Annual change in real GDP.',
                name: 'Change in GDP',
                options: {
                    hAxis: { format:'####' },
                    height: 300,
                    title: 'Change in GDP',
                    vAxis: { format: '#.##%' }
                },
                variables: [
                    {
                        variableId: 'economy.gdp.per_capita_gdp_percent_change'
                    }
                ],
                x: {
                    formatter: 'number',
                    format: { pattern: '####'}
                },
                y: {
                    formatter: 'number',
                    format: { pattern: '#.##\'%\''}
                },
            }]
    },

    'education.classroom_statistics' : {
        attribution: [DATASET_ATTRIBUTIONS.iesNces],
        charts: [
            {
                chartId: 'education.classroom_statistics.chart',
                chartType: 'line',
                name: 'Student Teacher Ratio',
                options: {
                    hAxis: { format:'####' },
                    height: 300,
                    title: 'Student Teacher Ratio',
                    vAxis: { format: '###.#' }
                },
                variables: [
                    {
                        variableId: 'education.classroom_statistics.student-teacher-ratio',
                        label: 'Student Teacher Ratio',
                    }
                ],
                x: {
                    formatter: 'number',
                    format: { pattern: '####'}
                },
                y: {
                    formatter: 'number',
                    format: { pattern: '###.#'}
                },
            }]
    },

    'education.education' : {
        attribution: [DATASET_ATTRIBUTIONS.acs],
        charts: [
            {
                chartId: 'education.education.chart',
                chartType: 'table',
                constraint: {
                    year: '2013'
                },
                name: 'Graduation Rates',
                options: {},
                variables: [
                    {
                        variableId: 'education.education.percent_high_school_graduate_or_higher',
                        label: 'High School',
                    },
                    {
                        variableId: 'education.education.percent_bachelors_degree_or_higher',
                        label: 'College',
                    }
                ],
                y: {
                    formatter: 'number',
                    format: { pattern: '#.##\'%\''}
                },
            }]
    },

    'demographics.population': {
        attribution: [DATASET_ATTRIBUTIONS.acs],
        charts: [
            {
                chartId: 'demographics.population.change.chart',
                chartType: 'line',
                name: 'Population Change',
                options: {
                    hAxis: { format:'####' },
                    height: 300,
                    title: 'Population Change',
                    vAxis: { format: '#.##%' }
                },
                variables: [
                    {
                        variableId: 'demographics.population.change'
                    }
                ],
                x: {
                    formatter: 'number',
                    format: { pattern: '####'}
                },
                y: {
                    formatter: 'number',
                    format: { pattern: '#.##\'%\''}
                },
            },
            {
                chartId: 'demographics.population.count.chart',
                chartType: 'line',
                name: 'Population',
                options: {
                    hAxis: { format:'####' },
                    height: 300,
                    title: 'Population',
                    vAxis: { format: '#,###' }
                },
                variables: [
                    {
                        variableId: 'demographics.population.count'
                    }
                ],
                x: {
                    formatter: 'number',
                    format: { pattern: '####'}
                },
                y: {
                    formatter: 'number',
                    format: { pattern: '#,###'}
                },
            }]
    },

    'health.health' : {
        attribution: [DATASET_ATTRIBUTIONS.rwjf],
        charts: [
            {
                chartId: 'health.health.chart',
                chartType: 'table',
                constraint: {
                    year: '2015'
                },
                name: 'Health Behaviors',
                options: {},
                variables: [
                    {
                        variableId: 'health.health.adult_obesity_value',
                        label: 'Adult Obesity Rate',
                    },
                    {
                        variableId: 'health.health.adult_smoking_value',
                        label: 'Adult Smoking Rate',
                    },
                    {
                        variableId: 'health.health.physical_inactivity_value',
                        label: 'Physical Inactivity Rate',
                    },
                    {
                        variableId: 'health.health.access_to_exercise_opportunities_value',
                        label: 'Access to Exercise Opportunities Rate',
                    },
                    {
                        variableId: 'health.health.excessive_drinking_value',
                        label: 'Excessive Drinking Rate',
                    }
                ],
                y: {
                    formatter: 'number',
                    format: { pattern: '###.##%'}
                },
            }]
    },

    'jobs.earnings' : {
        attribution: [DATASET_ATTRIBUTIONS.acs],
        charts: [
            {
                chartId: 'jobs.earnings.gender.chart',
                chartType: 'table',
                constraint: {
                    year: '2013'
                },
                name: 'Earnings and Gender',
                options: {},
                variables: [
                    {
                        variableId: 'jobs.earnings.median_earnings',
                        label: 'All Workers',
                    },
                    {
                        variableId: 'jobs.earnings.female_median_earnings',
                        label: 'Female',
                    },
                    {
                        variableId: 'jobs.earnings.male_median_earnings',
                        label: 'Male',
                    }
                ],
                y: {
                    formatter: 'number',
                    format: { pattern: '$###,###'}
                },
            }]
    },

    'jobs.occupations' : {
        attribution: [DATASET_ATTRIBUTIONS.acs],
        charts: [
            {
                chartId: 'jobs.occupations.chart',
                chartType: 'table',
                constraint: {
                    year: '2013'
                },
                name: 'Occupations',
                options: {},
                variables: [
                    {
                        variableId: 'jobs.occupations.percent_employed',
                    },
                ],
                y: {
                    formatter: 'number',
                    format: { pattern: '#.#\'%\''}
                },
            }]
    }
};

if (typeof module !== 'undefined') module.exports = DATASET_CONFIG;
