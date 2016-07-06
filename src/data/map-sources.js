'use strict';

if (typeof require !== 'undefined') {
    var d3 = require('d3');
    var _ = require('lodash');
}

const DOMAIN = 'odn.data.socrata.com';

function _getParams(component) {
    return { component };
}

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
                stoplight: variable[3],
                questions: variable.length < 5 || variable[4]
            };
        });
    };
}

const format = {
    integer: d3.format(',.0f'),
    terse_float: n => `${d3.format('.1f')(n)}`,
    percent: n => `${d3.format('.1f')(n)}%`,
    ratio: d3.format('.1%'),
    dollar: d3.format('$,.0f'),
    millionDollar: n => `${d3.format('$,.0f')(n)}M`,
    millionDollarWConversion: n => `${d3.format('$,.0f')(0.000001*n)}M`

};


/**
 * Defines mappings from data to maps appearing on site under the subcat/subsubcat URL structure where the high
 * level category, e.g. Education is not in the URL structure (since we often change these, subcat corresponds to
 * high level rollup of map and charts that corresponds to a question answer, e.g. Classroom Statistics, Graduation
 * Rates, etc., and the subsubcat corresponds to the specific variable of interest, e.g. student_teacher_ratio
 */
const MAP_SOURCES = {
    population: {
        name: 'population',
        domain: DOMAIN,
        fxf: 'e3rd-zzmr',
        hasPopulation: true,
        questions: true,
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
        questions: true,
        variables: variableGenerator()([
            ['Median Earnings', 'median_earnings', format.dollar, true],
            ['Median Female Earnings', 'female_median_earnings', format.dollar, true],
            ['Median Male Earnings', 'male_median_earnings', format.dollar, true],
            ['Median Female Earnings (Full Time)', 'female_full_time_median_earnings', format.dollar, true, false],
            ['Median Male Earnings (Full Time)', 'male_full_time_median_earnings', format.dollar, true, false],
            ['Percent Earning less than $10,000', 'percent_with_earnings_1_to_9999', format.percent, false, false],
            ['Percent Earning $10,000 to $14,999', 'percent_with_earnings_10000_to_14999', format.percent, false, false],
            ['Percent Earning $15,000 to $24,999', 'percent_with_earnings_15000_to_24999', format.percent, false, false],
            ['Percent Earning $25,000 to $34,999', 'percent_with_earnings_25000_to_34999', format.percent, false, false],
            ['Percent Earning $35,000 to $49,999', 'percent_with_earnings_35000_to_49999', format.percent, false, false],
            ['Percent Earning $50,000 to $64,999', 'percent_with_earnings_50000_to_64999', format.percent, false, false],
            ['Percent Earning $65,000 to $74,999', 'percent_with_earnings_65000_to_74999', format.percent, false, false],
            ['Percent Earning $75,000 to $99,999', 'percent_with_earnings_75000_to_99999', format.percent, false, false],
            ['Percent Earning over $100,000', 'percent_with_earnings_over_100000', format.percent, false, false]
        ])
    },

    education: {
        name: 'education',
        domain: DOMAIN,
        fxf: 'uf4m-5u8r',
        hasPopulation: true,
        questions: true,
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
        variables: ['Head Start Center',
                    'Public Art', 'Museums and Galleries', 'Libraries', 'Playfields',
                    'Elementary Schools', 'Middle Schools', 'High Schools', 'Higher Education', 'Alternative Schools',
                    'Computer/Media Center', 'Environmental Learning  Centers',
                    'Community Centers', 'Family Support Center', 'Neighborhood Service Centers'].map(classification => {
            return {
                name: classification.replace('  ', ' '),
                metric: nameToURL(classification.replace('  ', ' ')),
                params: {classification}
            };
        }),
        variableFilter: (regions, source) => {
            return new Promise((resolve, reject) => {
                const url = `https://odn.data.socrata.com/resource/rz8v-4esg.json?
                    $select=classification,count(*)&
                    $where=within_circle(location,${regions[0].coordinates.slice(0).reverse().join(',')},10000)&
                    $group=classification&
                    $order=count+DESC`.replace(/[ \n]/g, '');

                d3.promise.json(url).then(response => {
                    const classifications = response.map(_.property('classification'));
                    const validVariables = source.variables.filter(variable => {
                        return _.contains(classifications, variable.params.classification);
                    });

                    resolve(validVariables);
                }, reject);
            });
        }
    },

    /**
     * Corresponds to the subcat, forms URL of the form: /region/0400000US53/Washington/classroom_statistics. Name must
     * match the name param below as well as the vector in data-sources.js.
     */
    education_expenditures: {
        /**
        * Corresponds to the subcat, forms URL of the form: /region/0400000US53/Washington/classroom_statistics
        * Note: name must match the above node name. @TODO Fix this dependency
        */
        name: 'education_expenditures',

        domain: DOMAIN,

        /**
         * NBE 4x4 of public dataset on odn.data.socrata.com
         */
        fxf: 'nxzi-u9nr',

        /**
         * Whether or not to generate questions. Defaults to false
         */
        questions: true,

        variables: [
            {
                /**
                 * Corresponds to the visually displayed subsubcat defined above. Used to populate the menu, mouseovers
                 * inside the map, and the summary sentence above the map, e.g. The Student Teacher Ratio of Washington
                 * was blah.
                 */
                name: 'Instruction Salaries Per Student',

                /**
                 * Corresponds to the column in the source dataset containing the variable value.
                 */
                column: 'value',

                /**
                 * Corresponds to the visually displayed subsubcat defined above. Used to populate part of the URL,
                 * e.g. /region/0400000US53/Washington/classroom_statistics/student_teacher_ratio
                 */
                metric: 'instruction_salaries_per_student',

                /**
                 * Corresponds to the name of the variable in the variable column of the source dataset.
                 */
                params: {variable: `instruction-salaries-per-student`},

                /**
                 * Corresponds to the range of years to use. The largest year is the default.
                 */
                years: _.range(2005, 2014),

                /**
                 * Corresponds to the number format used in the map and summary text, i.e. The student teacher ratio of
                 * Washington in 2014 was 19.3.
                 */
                format: format.dollar,

            },
            {
                /**
                 * Corresponds to the visually displayed subsubcat defined above. Used to populate the menu, mouseovers
                 * inside the map, and the summary sentence above the map, e.g. The Student Teacher Ratio of Washington
                 * was blah.
                 */
                name: 'Total Instruction Related Salaries',

                /**
                 * Corresponds to the column in the source dataset containing the variable value.
                 */
                column: 'value',

                /**
                 * Corresponds to the visually displayed subsubcat defined above. Used to populate part of the URL,
                 * e.g. /region/0400000US53/Washington/classroom_statistics/student_teacher_ratio
                 */
                metric: 'instruction_salaries',

                /**
                 * Corresponds to the name of the variable in the variable column of the source dataset.
                 */
                params: {variable: `instruction-salaries`},

                /**
                 * Corresponds to the range of years to use. The largest year is the default.
                 */
                years: _.range(2005, 2014),

                /**
                 * Corresponds to the number format used in the map and summary text, i.e. The student teacher ratio of
                 * Washington in 2014 was 19.3.
                 */
                format: format.millionDollarWConversion,
            },
            {
                /**
                 * Corresponds to the visually displayed subsubcat defined above. Used to populate the menu, mouseovers
                 * inside the map, and the summary sentence above the map, e.g. The Student Teacher Ratio of Washington
                 * was blah.
                 */
                name: 'Administration Salaries Per Student',

                /**
                 * Corresponds to the column in the source dataset containing the variable value.
                 */
                column: 'value',

                /**
                 * Corresponds to the visually displayed subsubcat defined above. Used to populate part of the URL,
                 * e.g. /region/0400000US53/Washington/classroom_statistics/student_teacher_ratio
                 */
                metric: 'administration_salaries_per_student',

                /**
                 * Corresponds to the name of the variable in the variable column of the source dataset.
                 */
                params: {variable: `administration-salaries-per-student`},

                /**
                 * Corresponds to the range of years to use. The largest year is the default.
                 */
                years: _.range(2005, 2014),

                /**
                 * Corresponds to the number format used in the map and summary text, i.e. The student teacher ratio of
                 * Washington in 2014 was 19.3.
                 */
                format: format.dollar,
            },
            {
                /**
                 * Corresponds to the visually displayed subsubcat defined above. Used to populate the menu, mouseovers
                 * inside the map, and the summary sentence above the map, e.g. The Student Teacher Ratio of Washington
                 * was blah.
                 */
                name: 'Total Administration Salaries',

                /**
                 * Corresponds to the column in the source dataset containing the variable value.
                 */
                column: 'value',

                /**
                 * Corresponds to the visually displayed subsubcat defined above. Used to populate part of the URL,
                 * e.g. /region/0400000US53/Washington/classroom_statistics/student_teacher_ratio
                 */
                metric: 'administration_salaries',

                /**
                 * Corresponds to the name of the variable in the variable column of the source dataset.
                 */
                params: {variable: `administration-salaries`},

                /**
                 * Corresponds to the range of years to use. The largest year is the default.
                 */
                years: _.range(2005, 2014),

                /**
                 * Corresponds to the number format used in the map and summary text, i.e. The student teacher ratio of
                 * Washington in 2014 was 19.3.
                 */
                format: format.millionDollarWConversion,
            },
            {
                /**
                 * Corresponds to the visually displayed subsubcat defined above. Used to populate the menu, mouseovers
                 * inside the map, and the summary sentence above the map, e.g. The Student Teacher Ratio of Washington
                 * was blah.
                 */
                name: 'Capital Expenditure Per Student',

                /**
                 * Corresponds to the column in the source dataset containing the variable value.
                 */
                column: 'value',

                /**
                 * Corresponds to the visually displayed subsubcat defined above. Used to populate part of the URL,
                 * e.g. /region/0400000US53/Washington/classroom_statistics/student_teacher_ratio
                 */
                metric: 'capital_expenditures_per_student',

                /**
                 * Corresponds to the name of the variable in the variable column of the source dataset.
                 */
                params: {variable: `capital-expenditures-per-student`},

                /**
                 * Corresponds to the range of years to use. The largest year is the default.
                 */
                years: _.range(2005, 2014),

                /**
                 * Corresponds to the number format used in the map and summary text, i.e. The student teacher ratio of
                 * Washington in 2014 was 19.3.
                 */
                format: format.dollar,
            },
            {
                /**
                 * Corresponds to the visually displayed subsubcat defined above. Used to populate the menu, mouseovers
                 * inside the map, and the summary sentence above the map, e.g. The Student Teacher Ratio of Washington
                 * was blah.
                 */
                name: 'Total Capital Expenditures',

                /**
                 * Corresponds to the column in the source dataset containing the variable value.
                 */
                column: 'value',

                /**
                 * Corresponds to the visually displayed subsubcat defined above. Used to populate part of the URL,
                 * e.g. /region/0400000US53/Washington/classroom_statistics/student_teacher_ratio
                 */
                metric: 'capital_expenditures',

                /**
                 * Corresponds to the name of the variable in the variable column of the source dataset.
                 */
                params: {variable: `capital-expenditures`},

                /**
                 * Corresponds to the range of years to use. The largest year is the default.
                 */
                years: _.range(2005, 2014),

                /**
                 * Corresponds to the number format used in the map and summary text, i.e. The student teacher ratio of
                 * Washington in 2014 was 19.3.
                 */
                format: format.millionDollarWConversion,
            }
        ]
    },

    /**
     * Corresponds to the subcat, forms URL of the form: /region/0400000US53/Washington/classroom_statistics. Name must
     * match the name param below as well as the vector in data-sources.js.
     */
    classroom_statistics: {
        /**
        * Corresponds to the subcat, forms URL of the form: /region/0400000US53/Washington/classroom_statistics
        * Note: name must match the above node name. @TODO Fix this dependency
        */
        name: 'classroom_statistics',

        domain: DOMAIN,

        /**
         * NBE 4x4 of public dataset on odn.data.socrata.com
         */
        fxf: 'kx62-ayme',

        variables: [
            {
                /**
                 * Corresponds to the visually displayed subsubcat defined above. Used to populate the menu, mouseovers
                 * inside the map, and the summary sentence above the map, e.g. The Student Teacher Ratio of Washington
                 * was blah.
                 */
                name: 'Student Teacher Ratio',

                /**
                 * Corresponds to the column in the source dataset containing the variable value.
                 */
                column: 'value',

                /**
                 * Corresponds to the visually displayed subsubcat defined above. Used to populate part of the URL,
                 * e.g. /region/0400000US53/Washington/classroom_statistics/student_teacher_ratio
                 */
                metric: 'student_teacher_ratio',

                /**
                 * Corresponds to the name of the variable in the variable column of the source dataset.
                 */
                params: {variable: `student-teacher-ratio`},

                /**
                 * Corresponds to the range of years to use. The largest year is the default.
                 */
                years: _.range(2004, 2015),

                /**
                 * Corresponds to the number format used in the map and summary text, i.e. The student teacher ratio of
                 * Washington in 2014 was 19.3.
                 */
                format: format.terse_float
            }
        ]
    },

    occupations: {
        name: 'occupations',
        domain: DOMAIN,
        fxf: 'qfcm-fw3i',
        hasPopulation: true,
        questions: true,
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
        questions: true,
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
        questions: true,
        variables: [
            ['All', 'Overall Cost of Living'],
            ['Goods', 'Cost of Goods'],
            ['Rents', 'Cost of Rents'],
            ['Other', 'Other Costs']].map(component => {
            return {
                name: component[1],
                column: 'index',
                metric: nameToURL(component[0]),
                reverse: true,
                params: _getParams(component[0]),
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
        questions: true,
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
        questions: true,
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
        questions: true,
        variables: [['Median', 'median', true], ['Mean', 'mean', true]].map((tuple, index) => {
            return {
                name: `${tuple[0]} Environmental Health Hazard Index`,
                column: 'value',
                metric: nameToURL(`${tuple[0]} Environmental Health Hazard Index`),
                params: {variable: `env-health-idx-${tuple[1]}`},
                years: [2015],
                format: format.integer,
                stoplight: true,
                questions: index === 0
            };
        })
    },

    health: {
        name: 'health',
        domain: DOMAIN,
        fxf: '7ayp-utp2',
        questions: true,
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
                stoplight: true,
                questions: index % 2 === 0 // hacky - only questions for non-sparse variables
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
        fxf: 'eds5-udzt',
        variables:
            _.flatten([
                ["Aggravated assault", 'foo'],
                ["Arson", 'foo'],
                ["Burglary", 'foo'],
                ["Forcible rape", 'foo'],
                ["Larceny", 'foo'],
                ["Motor vehicle theft", 'foo'],
                ["Murder and nonnegligent manslaughter", 'foo'],
                ["Property crime", 'foo'],
                ["Rape (legacy definition)", 'foo'],
                ["Rape (revised definition)", 'foo'],
                ["Robbery", 'foo'],
                ["Violent crime", 'foo']
             ].map(tuple => {
            return [
                {
                    name: `${tuple[0]} Rate`,
                    column: 'value',
                    metric: nameToURL(`${tuple[0]} Rate`),
                    years: [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014],
                    params: {
                        crime_type: tuple[0],
                        variable: 'rate',
                        '$order': 'value DESC'
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
                    column: 'value',
                    metric: nameToURL(`${tuple[0]} Count`),
                    years: [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014],
                    params: {
                        crime_type: tuple[0],
                        variable: 'count',
                        '$order': 'value DESC',
                    },
                    format: format.integer,
                    mapSummaryLinkDescription : tuple[1]
                }
            ];
        })),
        callback: (regions) => {
            const baseURL = 'https://odn.data.socrata.com/resource/eds5-udzt.json';
            const params = {
                '$where': `id in (${regions.map(region => `'${region.id}'`).join(',')})`,
                '$select': 'id,crime_type,value',
                variable: 'rate',
                year: 2015
            };
            const url = `${baseURL}?${$.param(params)}`;

            const mapVariableText = d3.select('.map-variable-text').style('opacity', 0);

            d3.promise.json(url).then(rows => {
                const available = _.chain(rows)
                    .groupBy(row => row.id)
                    .values()
                    .map(rows => _.uniq(rows.map(row => row.crime_type)))
                    .value();
                const availableForAll = _.intersection.apply({}, available);

                if (availableForAll.length > 1) {
                    d3.select('.map-variable-list')
                        .selectAll('li')
                        .each(function() {
                            const li = d3.select(this);
                            const type = _.initial(li.select('a').text().split(' ')).join(' ');
                            if (!_.contains(availableForAll, type)) li.remove();
                        });
                }
                d3.select('.map-variable-text').style('opacity', 1);
            }, error => {
                d3.select('.map-variable-text').style('opacity', 1);
            });
        }
    }
};


if (typeof module !== 'undefined') module.exports = MAP_SOURCES;

