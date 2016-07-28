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

    'crime.fbi_ucr': {
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
                    vAxis: { format: '###,###' }
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
                    format: { pattern: '###,###'}
                },
            },
            {
                chartId: 'crime.fbi_ucr.rate.chart',
                chartType: 'line',
                name: 'Crime Incident Rate per 100,000 People',
                options: {
                    hAxis: { format:'####' },
                    height: 300,
                    title: 'Crime Incident Rate per 100,000 People',
                    vAxis: { format: '#.###' }
                },
                variables: [
                    {
                        variableId: 'crime.fbi_ucr.rate',
                        label: 'Crime Incident Rate per 100,000 People',
                    }
                ],
                x: {
                    formatter: 'number',
                    format: { pattern: '####'}
                },
                y: {
                    formatter: 'number',
                    format: { pattern: '#.###'}
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
                    hAxis: { format: '####' },
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

    'economy.consumption': {
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

    'education.classroom_statistics': {
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

    'education.education': {
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

    'education.education_expenditures': {
        attribution: [DATASET_ATTRIBUTIONS.acs],
        charts: [
            {
                chartId: 'education.education_expenditures.capital-expenditures.chart',
                chartType: 'line',
                name: 'Capital Expenditures',
                options: {
                    hAxis: { format:'####' },
                    height: 300,
                    title: 'Capital Expenditures',
                    vAxis: { format: '$###,###' }
                },
                variables: [
                    {
                        variableId: 'education.education_expenditures.capital-expenditures'
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
                chartId: 'education.education_expenditures.capital-expenditures-per-student.chart',
                chartType: 'line',
                name: 'Capital Expenditures Per Student',
                options: {
                    hAxis: { format:'####' },
                    height: 300,
                    title: 'Capital Expenditures Per Student',
                    vAxis: { format: '$###,###' }
                },
                variables: [
                    {
                        variableId: 'education.education_expenditures.capital-expenditures-per-student'
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
                chartId: 'education.education_expenditures.administration-salaries.chart',
                chartType: 'line',
                name: 'Administration Salaries',
                options: {
                    hAxis: { format:'####' },
                    height: 300,
                    title: 'Administration Salaries',
                    vAxis: { format: '$###,###' }
                },
                variables: [
                    {
                        variableId: 'education.education_expenditures.administration-salaries'
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
                chartId: 'education.education_expenditures.administration-salaries-per-student.chart',
                chartType: 'line',
                name: 'Administration Salaries Per Student',
                options: {
                    hAxis: { format:'####' },
                    height: 300,
                    title: 'Administration Salaries Per Student',
                    vAxis: { format: '$###,###' }
                },
                variables: [
                    {
                        variableId: 'education.education_expenditures.administration-salaries-per-student'
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
                chartId: 'education.education_expenditures.instruction-salaries.chart',
                chartType: 'line',
                name: 'Instruction Salaries',
                options: {
                    hAxis: { format:'####' },
                    height: 300,
                    title: 'Instruction Salaries',
                    vAxis: { format: '$###,###' }
                },
                variables: [
                    {
                        variableId: 'education.education_expenditures.instruction-salaries'
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
                chartId: 'education.education_expenditures.instruction-salaries-per-student.chart',
                chartType: 'line',
                name: 'Instruction Salaries Per Student',
                options: {
                    hAxis: { format:'####' },
                    height: 300,
                    title: 'Instruction Salaries Per Student',
                    vAxis: { format: '$###,###' }
                },
                variables: [
                    {
                        variableId: 'education.education_expenditures.instruction-salaries-per-student'
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
            }]
    },

    'health.environmental_health': {
        attribution: [DATASET_ATTRIBUTIONS.hud],
        charts: [
            {
                chartId: 'health.environmental_health.chart',
                chartType: 'column',
                constraint: {
                    year: '2015'
                },
                name: 'Median Environmental Health Hazard Index',
                options: {
                    height: 300,
                    title: 'Median Environmental Health Hazard Index',
                },
                variables: [
                    {
                        variableId: 'health.environmental_health.env-health-idx-median',
                        label: 'Median Environmental Health Hazard Index'
                    }
                ]
            }]
    },

    'health.health': {
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

    'health.health_indicators' : {
        attribution: [DATASET_ATTRIBUTIONS.rwjf],
        charts: [
            {
                chartId: 'health.health_indicators.chart',
                chartType: 'table',
                constraint: {
                    break_out: 'Overall',
                    question_response: 'Yes',
                    year: '2013'
                },
                name: 'Chronic Health Indicators',
                options: {},
                variables: [
                    {
                        variableId: 'health.health_indicators.data_value',
                    }
                ],
                y: {
                    formatter: 'number',
                    format: { pattern: '#.#\'%\''}
                },
            },
            {
                chartId: 'health.health_indicators.last_checkup.chart',
                chartType: 'column',
                constraint: {
                    break_out: 'Overall',
                    question: 'About how long has it been since you last visited a doctor for a routine checkup?',
                    year: '2013'
                },
                name: 'Time of Last Checkup',
                options: {
                    height: 300,
                    title: 'Time of Last Checkup',
                },
                variables: [
                    {
                        variableId: 'health.health_indicators.data_value',
                    }
                ],
                y: {
                    formatter: 'number',
                    format: { pattern: '#.#\'%\''}
                }
            },
            {
                chartId: 'health.health_indicators.general_health.chart',
                chartType: 'column',
                constraint: {
                    break_out: 'Overall',
                    question: 'How is your general health?',
                    year: '2013'
                },
                name: 'Health Status',
                options: {
                    height: 300,
                    title: 'Health Status',
                },
                variables: [
                    {
                        variableId: 'health.health_indicators.data_value',
                    }
                ],
                y: {
                    formatter: 'number',
                    format: { pattern: '#.#\'%\''}
                }
            }]
    },

    'jobs.earnings': {
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
            },
            {
                chartId: 'jobs.earnings.education.chart',
                chartType: 'stepped-area',
                constraint: {
                    year: '2013'
                },
                name: 'Earnings and Education',
                options: {},
                variables: [
                    {
                        variableId: 'jobs.earnings.median_earnings_less_than_high_school',
                        label: 'Less than High School',
                    },
                    {
                        variableId: 'jobs.earnings.median_earnings_high_school',
                        label: 'High School',
                    },
                    {
                        variableId: 'jobs.earnings.median_earnings_some_college_or_associates',
                        label: 'Some College or Associates',
                    },
                    {
                        variableId: 'jobs.earnings.median_earnings_bachelor_degree',
                        label: 'Bachelor\'s Degree',
                    },
                    {
                        variableId: 'jobs.earnings.median_earnings_graduate_or_professional_degree',
                        label: 'Graduate or Professional Degree',
                    }
                ],
                y: {
                    formatter: 'number',
                    format: { pattern: '$###,###'}
                },
            },
            ]
    },

    'jobs.job_proximity': {
        attribution: [DATASET_ATTRIBUTIONS.hud],
        charts: [
            {
                chartId: 'jobs.job_proximity',
                chartType: 'column',
                constraint: {
                    year: '2015'
                },
                name: 'Median Jobs Proximity Index',
                options: {
                    height: 300,
                    title: 'Median Jobs Proximity Index',
                },
                variables: [
                    {
                        variableId: 'jobs.job_proximity.jobs-prox-idx-median',
                        label: 'Median Jobs Proximity Index'
                    }
                ]
            }]
    },

    'jobs.occupations': {
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
