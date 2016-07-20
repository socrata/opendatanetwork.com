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
                chartType: 'line',
                name: 'Personal Consumption Expenditures over Time (Millions of USD)',
                options: {
                    hAxis: { format:'####' },
                    height: 300,
                    title: 'Personal Consumption Expenditures over Time (Millions of USD)',
                    vAxis: { format: '#,###' }
                },
                variableId: 'economy.consumption.personal_consumption_expenditures', 
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
                chartType: 'line',
                name: 'Change in Personal Consumption Expenditures over Time',
                options: {
                    hAxis: { format:'####' },
                    height: 300,
                    title: 'Change in Personal Consumption Expenditures over Time',
                    vAxis: { format: '#.##%' }
                },
                variableId: 'economy.consumption.expenditures_percent_change',
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
                chartType: 'line',
                description: 'Real (inflation adjusted) GDP per Capita over time.',
                name: 'GDP',
                options: {
                    hAxis: { format:'####' },
                    height: 300,
                    title: 'GDP',
                    vAxis: { format: '#,###' }
                },
                variableId: 'economy.gdp.per_capita_gdp', 
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
                chartType: 'line',
                description: 'Annual change in real GDP.',
                name: 'Change in GDP',
                options: {
                    hAxis: { format:'####' },
                    height: 300,
                    title: 'Change in GDP',
                    vAxis: { format: '#.##%' }
                },
                variableId: 'economy.gdp.per_capita_gdp_percent_change',
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

    'demographics.population': {
        attribution: [DATASET_ATTRIBUTIONS.acs],
        charts: [
            {
                chartType: 'line',
                name: 'Population Change',
                options: {
                    hAxis: { format:'####' },
                    height: 300,
                    title: 'Population Change',
                    vAxis: { format: '#.##%' }
                },
                variableId: 'demographics.population.change',
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
                chartType: 'line',
                name: 'Population',
                options: {
                    hAxis: { format:'####' },
                    height: 300,
                    title: 'Population',
                    vAxis: { format: '#,###' }
                },
                variableId: 'demographics.population.count',
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
