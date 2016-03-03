'use strict';

if (typeof require !== 'undefined') {
    var d3 = require('d3');
    var _ = require('lodash');
}

const DOMAIN = 'odn.data.socrata.com';

function nameToURL(name) {
    return name.toLowerCase().replace(/,/g, '').replace(/[ \/]/g, '_');
}

function variableGenerator(years, value) {
    years = years || [2013];
    value = value || parseFloat;

    return variableTuples => {
        return variableTuples.map(variable => {
            return {
                years,
                value,
                name: variable[0],
                metric: nameToURL(variable[0]),
                column: variable[1],
                format: variable[2],
                stoplight: variable[3]
            };
        });
    };
}

const format = {
    integer: d3.format(',.0f'),
    percent: n => `${d3.format('.1f')(n)}%`,
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
                name: 'Population Count',
                column: 'population',
                metric: 'population',
                years: [2009, 2010, 2011, 2012, 2013],
                format: format.integer
            },
            {
                name: 'Population Rate of Change',
                column: 'population_percent_change',
                metric: 'population_change',
                years: [2010, 2011, 2012, 2013],
                format: format.percent,
                stoplight: true
            }
        ]
    },

    earnings: {
        name: 'earnings',
        domain: DOMAIN,
        fxf: 'wmwh-4vak',
        hasPopulation: true,
        variables: variableGenerator()([
            ['Median Earnings', 'median_earnings', format.dollar, true],
            ['Median Female Earnings', 'female_median_earnings', format.dollar, true],
            ['Median Male Earnings', 'male_median_earnings', format.dollar, true],
            ['Median Female Earnings (Full Time)', 'female_full_time_median_earnings', format.dollar, true],
            ['Median Male Earnings (Full Time)', 'male_full_time_median_earnings', format.dollar, true],
            ['Percent Earning less than $10,000', 'percent_with_earnings_1_to_9999', format.percent, false],
            ['Percent Earning $10,000 to $14,999', 'percent_with_earnings_10000_to_14999', format.percent, false],
            ['Percent Earning $15,000 to $24,999', 'percent_with_earnings_15000_to_24999', format.percent, false],
            ['Percent Earning $25,000 to $34,999', 'percent_with_earnings_25000_to_34999', format.percent, false],
            ['Percent Earning $35,000 to $49,999', 'percent_with_earnings_35000_to_49999', format.percent, false],
            ['Percent Earning $50,000 to $64,999', 'percent_with_earnings_50000_to_64999', format.percent, false],
            ['Percent Earning $65,000 to $74,999', 'percent_with_earnings_65000_to_74999', format.percent, false],
            ['Percent Earning $75,000 to $99,999', 'percent_with_earnings_75000_to_99999', format.percent, false],
            ['Percent Earning over $100,000', 'percent_with_earnings_over_100000', format.percent, false]
        ])
    },

    education: {
        name: 'education',
        domain: DOMAIN,
        fxf: 'uf4m-5u8r',
        hasPopulation: true,
        variables: variableGenerator()([
            ['High School Graduation Rate', 'percent_high_school_graduate_or_higher', format.percent, true],
            ['College Graduation Rate', 'percent_bachelors_degree_or_higher', format.percent, true]
        ])
    },

    occupations: {
        name: 'occupations',
        domain: DOMAIN,
        fxf: 'qfcm-fw3i',
        hasPopulation: true,
        variables: ['Business and Finance', 'Computers and Math', 'Construction and Extraction', 'Education', 'Engineering', 'Farming, Fishing, Foresty', 'Fire Fighting', 'Food Service', 'Healthcare', 'Health Support', 'Health Technicians', 'Janitorial', 'Law Enforcement', 'Legal', 'Management', 'Material Moving', 'Media', 'Office and Administration', 'Personal Care', 'Production', 'Repair', 'Sales', 'Social Sciences', 'Social Services', 'Transportation'].map(occupation => {
            return {
                name: `${occupation} Employment Rate`,
                column: 'percent_employed',
                metric: nameToURL(occupation),
                params: {occupation},
                years: [2013],
                format: format.percent
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
                metric: 'gdp_per_capita',
                years: _.range(2001, 2014),
                format: format.dollar,
                stoplight: true
            },
            {
                name: 'Annual Change in GDP',
                column: 'per_capita_gdp_percent_change',
                metric: 'annual_change_in_gdp',
                years: _.range(2002, 2014),
                format: format.percent,
                stoplight: true
            }
        ]
    },

    cost_of_living: {
        name: 'cost_of_living',
        domain: DOMAIN,
        fxf: 'hpnf-gnfu',
        variables: ['All', 'Goods', 'Rents', 'Other'].map(component => {
            return {
                name: component,
                column: 'index',
                metric: nameToURL(component),
                reverse: true,
                params: {component},
                years: _.range(2008, 2014),
                format: d3.format('.1f'),
                stoplight: true
            };
        })
    },

    consumption: {
        name: 'consumption',
        domain: DOMAIN,
        fxf: 'va5j-wsjq',
        variables: [
            {
                name: 'Personal Consumption Expenditure',
                column: 'personal_consumption_expenditures',
                metric: 'personal_consumption_expenditure',
                years: _.range(1997, 2015),
                format: format.millionDollar
            },
            {
                name: 'Annual Change in PCE',
                column: 'expenditures_percent_change',
                metric: 'annual_change_in_pce',
                years: _.range(1998, 2015),
                format: format.percent
            }
        ]
    },

    job_proximity: {
        name: 'job_proximity',
        domain: DOMAIN,
        fxf: '5pnb-mvzq',
        variables: [['Median', 'median', true], ['Mean', 'mean', true]].map(tuple => {
            return {
                name: `${tuple[0]} Jobs Proximity Index`,
                column: 'value',
                metric: nameToURL(`${tuple[0]} Jobs Proximity Index`),
                params: {variable: `jobs-prox-idx-${tuple[1]}`},
                years: [2015],
                format: format.integer,
                stoplight: true
            };
        })
    },

    environmental_health: {
        name: 'environmental_health',
        domain: DOMAIN,
        fxf: 'nax7-t6ga',
        variables: [['Median', 'median', true], ['Mean', 'mean', true]].map(tuple => {
            return {
                name: `${tuple[0]} Environmental Health Hazard Index`,
                column: 'value',
                metric: nameToURL(`${tuple[0]} Environmental Health Hazard Index`),
                params: {variable: `env-health-idx-${tuple[1]}`},
                years: [2015],
                format: format.integer,
                stoplight: true
            };
        })
    },

    health: {
        name: 'health',
        domain: DOMAIN,
        fxf: '7ayp-utp2',
        variables: ['Adult Obesity', 'Adult Smoking',
                    'Physical Inactivity', 'Excessive Drinking',
                    'Access to Exercise Opportunities'].map((name, index) => {
            return {
                name: `${name} Rate`,
                column: `${name.toLowerCase().replace(/\s/g, '_')}_value`,
                metric: nameToURL(`${name} Rate`),
                years: [2015],
                reverse: index != 4,
                format: format.ratio,
                stoplight: true
            };
        })
    },

    health_indicators: {
        name: 'health_indicators',
        domain: DOMAIN,
        fxf: 'n4rt-3rmd',
        idColumn: '_geoid',
        typeColumn: '_type',
        nameColumn: 'Locationdesc',
        variables:
           [['Asthma', 'Adults who have been told they currently have asthma'],
            ['Arthritis', 'Adults who have been told they have arthritis'],
            ['Heart Attack', 'Ever told you had a heart attack (myocardial infarction)?'],
            ['Heart Disease', 'Ever told you had angina or coronary heart disease?'],
            ['Skin Cancer', 'Ever told you had skin cancer?'],
            ['Other Cancer', 'Ever told you had any other types of cancer?'],
            ['COPD', 'Ever told you have COPD?'],
            ['Kidney Disease', 'Ever told you have kidney disease?'],
            ['Depression', 'Ever told you that you have a form of depression?'],
            ['Diabetes', 'Have you ever been told by a doctor that you have diabetes?']].map(tuple => {
            return {
                name: `${tuple[0]} Rate`,
                column: 'data_value',
                metric: nameToURL(`${tuple[0]} Rate`),
                years: [2011, 2012, 2013],
                params: {
                    'break_out': 'Overall',
                    'response': 'Yes',
                    'question': tuple[1]
                },
                format: format.percent,
                stoplight: true,
                reverse: true
            };
        })
    },

    city_crime: {
        name: 'city_crime',
        domain: DOMAIN,
        fxf: 'wehh-eh9p',
        variables:
            _.flatten([
             'Theft',
             'Other',
             'Traffic',
             'Breaking & Entering',
             'Assault',
             'Theft from Vehicle',
             'Theft of Vehicle',
             'Property Crime',
             'Community Policing',
             'Vehicle Stop',
             'Robbery',
             'Disorder',
             'Drugs',
             'Other Sexual Offense',
             'Assault with Deadly Weapon',
             'Liquor',
             'Family Offense',
             'Weapons Offense',
             'Death',
             'Sexual Assault',
             'Alarm',
             'Missing Person',
             'Arson',
             'Quality of Life',
             'Emergency',
             'Kidnapping',
             'Proactive Policing',
             'Pedestrian Stop',
             'Sexual Offense',
             'Vehicle Recovery',
             'Homicide',
             'Fire'].map(crimeType => {
            return [
                {
                    name: `${crimeType} Rate`,
                    column: 'crime_rate',
                    metric: nameToURL(`${crimeType} Rate`),
                    years: [2015],
                    params: {
                        incident_parent_type: crimeType,
                        '$order': 'crime_rate ASC'
                    },
                    format: n => format.integer(n * 100000),
                    descriptionFormat: n => `${format.integer(n * 100000)} crimes per month per 100,000 people`,
                    legendFormat: n => `${format.integer(n * 100000)} crimes / month / 100K`,
                    stoplight: true,
                    reverse: true
                },
                {
                    name: `${crimeType} Count`,
                    column: 'crime_count',
                    metric: nameToURL(`${crimeType} Count`),
                    years: [2015],
                    params: {
                        incident_parent_type: crimeType,
                        '$order': 'crime_count ASC'
                    },
                    format: format.integer
                }
            ];
        })),
        callback: (regions) => {
            const baseURL = 'https://odn.data.socrata.com/resource/wehh-eh9p.json';
            const params = {
                '$where': `id in (${regions.map(region => `'${region.id}'`).join(',')})`,
                '$select': 'id,incident_parent_type,crime_rate',
                year: 2015
            };
            const url = `${baseURL}?${$.param(params)}`;

            const mapVariableText = d3.select('#map-variable-text').style('opacity', 0);

            d3.promise.json(url).then(rows => {
                const available = _.chain(rows)
                    .groupBy(row => row.id)
                    .values()
                    .map(rows => _.uniq(rows.map(row => row.incident_parent_type)))
                    .value();
                const availableForAll = _.intersection.apply({}, available);

                if (availableForAll.length > 1) {
                    d3.select('#map-variable-list')
                        .selectAll('li')
                        .each(function() {
                            const li = d3.select(this);
                            const type = _.initial(li.select('a').text().split(' ')).join(' ');
                            if (!_.contains(availableForAll, type)) li.remove();
                        });
                }
                d3.select('#map-variable-text').style('opacity', 1);
            }, error => {
                d3.select('#map-variable-text').style('opacity', 1);
            });
        }
    }
};


if (typeof module !== 'undefined') module.exports = MAP_SOURCES;

