'use strict';

if (typeof require !== 'undefined') {
    var d3 = require('d3');
    var _ = require('lodash');
}

const DOMAIN = 'odn.data.socrata.com';


function variableGenerator(years, value) {
    years = years || 2013;
    value = value || parseFloat;

    return variableTuples => {
        return variableTuples.map(variable => {
            return {
                years,
                value,
                name: variable[0],
                column: variable[1],
                format: variable[2],
                stoplight: variable[3],
                metric: variable[4]
            };
        });
    };
}


const format = {
    integer: d3.format(',.0f'),
    percent: n => `${d3.format('.2f')(n)}%`,
    ratio: d3.format('.1%'),
    dollar: d3.format('$,.0f'),
    millionDollar: n => `${d3.format('$,.0f')(n)}M`
};


const MAP_SOURCES = {
    population: {
        name: 'population',
        domain: DOMAIN,
        fxf: 'e3rd-zzmr',
        hasPopulation: true,
        variables: [
            {
                name: 'Population',
                column: 'population',
                years: [2009, 2010, 2011, 2012, 2013],
                format: format.integer,
                metric: 'population_value',
            },
            {
                name: 'Population Change',
                column: 'population_percent_change',
                years: [2010, 2011, 2012, 2013],
                format: format.percent,
                stoplight: true,
                metric: 'population_change',
            }
        ]
    },

    earnings: {
        name: 'earnings',
        domain: DOMAIN,
        fxf: 'wmwh-4vak',
        hasPopulation: true,
        variables: variableGenerator()([
            ['Median Earnings', 'median_earnings', format.dollar, true, 'median_earnings'],
            ['Median Female Earnings', 'female_median_earnings', format.dollar, true, 'female_median_earnings'],
            ['Median Male Earnings', 'male_median_earnings', format.dollar, true, 'male_median_earnings'],
            ['Median Female Earnings (Full Time)', 'female_full_time_median_earnings', format.dollar, true, 'female_full_time_median_earnings'],
            ['Median Male Earnings (Full Time)', 'male_full_time_median_earnings', format.dollar, true, 'male_full_time_median_earnings'],
            ['Percent Earning less than $10,000', 'percent_with_earnings_1_to_9999', format.percent, false, 'percent_with_earnings_1_to_9999'],
            ['Percent Earning $10,000 to $14,999', 'percent_with_earnings_10000_to_14999', format.percent, false, 'percent_with_earnings_10000_to_14999'],
            ['Percent Earning $15,000 to $24,999', 'percent_with_earnings_15000_to_24999', format.percent, false, 'percent_with_earnings_15000_to_24999'],
            ['Percent Earning $25,000 to $34,999', 'percent_with_earnings_25000_to_34999', format.percent, false, 'percent_with_earnings_25000_to_34999'],
            ['Percent Earning $35,000 to $49,999', 'percent_with_earnings_35000_to_49999', format.percent, false, 'percent_with_earnings_35000_to_49999'],
            ['Percent Earning $50,000 to $64,999', 'percent_with_earnings_50000_to_64999', format.percent, false, 'percent_with_earnings_50000_to_64999'],
            ['Percent Earning $65,000 to $74,999', 'percent_with_earnings_65000_to_74999', format.percent, false, 'percent_with_earnings_65000_to_74999'],
            ['Percent Earning $75,000 to $99,999', 'percent_with_earnings_75000_to_99999', format.percent, false, 'percent_with_earnings_75000_to_99999'],
            ['Percent Earning over $100,000', 'percent_with_earnings_over_100000', format.percent, false, 'percent_with_earnings_over_100000']
        ])
    },

    education: {
        name: 'education',
        domain: DOMAIN,
        fxf: 'uf4m-5u8r',
        hasPopulation: true,
        variables: variableGenerator()([
            ['High School Graduation Rate', 'percent_high_school_graduate_or_higher', format.percent, true, 'percent_high_school_graduate_or_higher'],
            ['College Graduation Rate', 'percent_bachelors_degree_or_higher', format.percent, true, 'percent_bachelors_degree_or_higher']
        ])
    },

    occupations: {
        name: 'occupations',
        domain: DOMAIN,
        fxf: 'qfcm-fw3i',
        hasPopulation: true,
        variables: ['Business and Finance', 'Computers and Math', 'Construction and Extraction', 'Education', 'Engineering', 'Farming, Fishing, Foresty', 'Fire Fighting', 'Food Service', 'Healthcare', 'Health Support', 'Health Technicians', 'Janitorial', 'Law Enforcement', 'Legal', 'Management', 'Material Moving', 'Media', 'Office and Administration', 'Personal Care', 'Production', 'Repair', 'Sales', 'Social Sciences', 'Social Services', 'Transportation'].map(occupation => {
            return {
                name: occupation,
                column: 'percent_employed',
                params: {occupation},
                years: [2013],
                format: format.percent,
                metric : `${occupation.toLowerCase().replace(/\s/g, '_').replace(/,/g, '')}`
            };
        })
    },

    gdp: {
        name: 'gdp',
        domain: DOMAIN,
        fxf: 'ks2j-vhr8',
        variables: [
            {
                name: 'GDP per Capita',
                column: 'per_capita_gdp',
                years: _.range(2001, 2014),
                format: format.dollar,
                stoplight: true,
                metric: 'per_capita_gdp'
            },
            {
                name: 'Annual Change in GDP',
                column: 'per_capita_gdp_percent_change',
                years: _.range(2002, 2014),
                format: format.percent,
                stoplight: true,
                metric: 'per_capita_gdp_change'
            }
        ]
    },

    cost_of_living: {
        name: 'cost of living',
        domain: DOMAIN,
        fxf: 'hpnf-gnfu',
        variables: ['All', 'Goods', 'Rents', 'Other'].map(component => {
            return {
                name: component,
                column: 'index',
                reverse: true,
                params: {component},
                years: _.range(2008, 2014),
                format: d3.format('.1f'),
                stoplight: true,
                metric: component.toLowerCase()
            };
        })
    },

    health: {
        name: 'health',
        domain: DOMAIN,
        fxf: '7ayp-utp2',
        variables: ['Adult Smoking', 'Adult Obesity',
                    'Physical Inactivity', 'Excessive Drinking'].map(name => {
            return {
                name: `${name} Rate`,
                column: `${name.toLowerCase().replace(/\s/g, '_')}_value`,
                years: [2015],
                reverse: true,
                format: format.ratio,
                stoplight: true,
                metric: `${name.toLowerCase().replace(/\s/g, '_')}_rate`
            };
        })
    },

    consumption: {
        name: 'consumption',
        domain: DOMAIN,
        fxf: 'va5j-wsjq',
        variables: [
            {
                name: 'Expenditure (Millions of USD)',
                column: 'personal_consumption_expenditures',
                years: _.range(1997, 2015),
                format: format.millionDollar,
                metric: 'personal_consumption_expenditure'
            },
            {
                name: 'Annual Expenditure Change',
                column: 'expenditures_percent_change',
                years: _.range(1998, 2015),
                format: format.percent,
                metric: 'expenditures_percent_change'
            }
        ]
    }
};


if (typeof module !== 'undefined') module.exports = MAP_SOURCES;

