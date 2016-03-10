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


    education_places: {
        name: 'education_places',
        domain: DOMAIN,
        fxf: 'rz8v-4esg',
        poi: true, // point of interest map
        variables: ['Head Start Center', 'Public Art', 'Computer/Media Center',
                    'Playfields', 'Elementary Schools', 'Libraries', 'Community Centers',
                    'Museums and Galleries', 'Alternative Schools', 'High Schools',
                    'Middle Schools', 'Family Support Center', 'Higher Education',
                    'Neighborhood Service Centers', 'Environmental Learning  Centers'].map(classification => {
            return {
                name: classification.replace('  ', ' '),
                metric: nameToURL(classification.replace('  ', ' ')),
                params: {classification}
            };
        })
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
             ['Theft', 'The taking or attempting to take anything of value from the care, custody, or control of a person.'],
             ['Other', 'Other crimes or incidents not falling into another category.'],
             ['Traffic', 'A violation of traffic law or code.'],
             ['Breaking & Entering', 'The unlawful entry of a structure to commit a felony or a theft.'],
             ['Assault', 'An unlawful attack by one person upon another.'],
             ['Theft from Vehicle', 'The theft of articles from a motor vehicle, whether locked or unlocked.'],
             ['Theft of Vehicle', 'Thefts of all classes of motor vehicles that serve the primary purpose of transporting people from one place to another.'],
             ['Property Crime', 'General crimes committed on residential or commercial property.'],
             ['Community Policing', 'The theory and practice of engaging criminals before they commit a crime.'],
             ['Vehicle Stop', 'A temporary detention of a driver of a vehicle by police to investigate a possible crime or civil infraction.'],
             ['Robbery', 'The taking or attempting to take anything of value from the care, custody, or control of a person by force, threat of violence, and/or by putting the victim in fear.'],
             ['Disorder', 'Any behavior that tends to disturb the public peace or decorum, scandalize the community, or shock the public sense of morality.'],
             ['Drugs', 'The violation of laws prohibiting the production, distribution, and/or use of certain controlled substances and the equipment or devices utilized in their preparation and/or use. The unlawful cultivation, manufacture, distribution, sale, purchase, use, possession, transportation, or importation of any controlled drug or narcotic substance.'],
             ['Other Sexual Offense', 'Offenses that are sexual in nature and not immediately classified as a Sexual Offense or Sexual Assault.'],
             ['Assault with Deadly Weapon', 'An unlawful attack by one person upon another for the purpose of inflicting severe or aggravated bodily injury.'],
             ['Liquor', 'Driving or operating a motor vehicle or common carrier while mentally or physically impaired as the result of consuming an alcoholic beverage or using a drug or narcotic.'],
             ['Family Offense', 'Unlawful nonviolent acts by a family member (or legal guardian) that threaten the physical, mental, or economic well-being or morals of another family member and that are not classifiable as other offenses, such as Assault or Sex Offenses.'],
             ['Weapons Offense', 'The violation of laws or ordinances prohibiting the manufacture, sale, purchase, transportation, possession, concealment, or use of firearms, cutting instruments, explosives, incendiary devices, or other deadly weapons.'],
             ['Death', 'Loss of life caused by negligence, suicide, and accidental death.'],
             ['Sexual Assault', 'The carnal knowledge of an individual forcibly and against her or his will.'],
             ['Alarm', 'A burglary alarm which was responded to by law enforcement.'],
             ['Missing Person', 'A missing person is a person 18 years old or older whose disappearance is possibly not voluntary, or a child whose whereabouts are unknown to the child\'s legal custodian.'],
             ['Arson', 'Any willful or malicious burning or attempt to burn, with or without intent to defraud, a dwelling, house, public building, motor vehicle or aircraft, personal property of another.'],
             ['Quality of Life', 'Incidents related to drugs, liquor, and disorder.'],
             ['Emergency', 'A natural or manmade disaster or emergency that public safety officers responded to.'],
             ['Kidnapping', 'The crime of unlawfully seizing and carrying away a person by force or Fraud, or seizing and detaining a person against his or her will with an intent to carry that person away at a later time.'],
             ['Proactive Policing', 'The theory and practice of engaging criminals or violators before they commit a crime.'],
             ['Pedestrian Stop', 'A temporary detention of a pedestrian by police to investigate a possible crime or civil infraction.'],
             ['Sexual Offense', 'This classification includes offenses against chastity, common decency, morals, and the like.'],
             ['Vehicle Recovery', 'A vehicle, other than an antique or classic vehicle, which was reported stolen but subsequently recovered.'],
             ['Homicide', 'The willful killing of one human being by another.'],
             ['Fire', 'A fire that public safety officers responded to.']].map(tuple => {
            return [
                {
                    name: `${tuple[0]} Rate`,
                    column: 'crime_rate',
                    metric: nameToURL(`${tuple[0]} Rate`),
                    years: [2015],
                    params: {
                        incident_parent_type: tuple[0],
                        '$order': 'crime_rate ASC'
                    },
                    format: n => format.integer(n * 100000),
                    descriptionFormat: n => `${format.integer(n * 100000)} crimes per month per 100,000 people`,
                    legendFormat: n => `${format.integer(n * 100000)} crimes / month / 100K`,
                    stoplight: true,
                    reverse: true,
                    mapSummaryLinkDescription : tuple[1]
                },
                {
                    name: `${tuple[0]} Count`,
                    column: 'crime_count',
                    metric: nameToURL(`${tuple[0]} Count`),
                    years: [2015],
                    params: {
                        incident_parent_type: tuple[0],
                        '$order': 'crime_count ASC',
                    },
                    format: format.integer,
                    mapSummaryLinkDescription : tuple[1]
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

