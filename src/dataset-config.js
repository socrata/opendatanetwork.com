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
    }
};

if (typeof module !== 'undefined') module.exports = DATASET_CONFIG;
