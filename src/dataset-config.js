'use strict';

const DATASET_CONFIG = {
    'michigan.finance': {
        charts: [
            {
                id: 'michigan.finance.liquidity_ratio',
                type: 'line',
                name: 'Liquidity Ratio',
                variables: [
                    'michigan.finance.liquidity_ratio'
                ],
            }
        ]
    },

    'crime.fbi_ucr': {
        charts: [
            {
                id: 'crime.fbi_ucr.count.chart',
                type: 'column',
                constraint: {
                    year: '2014'
                },
                name: 'Crime Incident Count',
                variables: [
                    'crime.fbi_ucr.count'
                ],
            },
            {
                id: 'crime.fbi_ucr.rate.chart',
                type: 'column',
                constraint: {
                    year: '2014'
                },
                name: 'Crime Incident Rate per 100,000 People',
                variables: [
                    'crime.fbi_ucr.rate'
                ],
            }
        ]
    },

    'demographics.population': {
        charts: [
            {
                id: 'demographics.population.count.chart',
                type: 'line',
                forecast: 5,
                name: 'Population',
                variables: [
                    'demographics.population.count'
                ],
            },
            {
                id: 'demographics.population.change.chart',
                type: 'line',
                name: 'Population Change',
                variables: [
                    'demographics.population.change'
                ],
            }
        ]
    },

    'economy.consumption': {
        charts: [
            {
                id: 'economy.consumption.personal_consumption_expenditures.chart',
                type: 'line',
                forecast: 5,
                name: 'Personal Consumption Expenditures over Time (Millions of USD)',
                variables: [
                    'economy.consumption.personal_consumption_expenditures'
                ],
            },
            {
                id: 'economy.consumption.expenditures_percent_change.chart',
                type: 'line',
                name: 'Change in Personal Consumption Expenditures over Time',
                variables: [
                    'economy.consumption.expenditures_percent_change'
                ],
            }
        ]
    },

    'economy.cost_of_living': {
        charts: [
            {
                id: 'economy.cost_of_living.index.chart',
                type: 'table',
                constraint: {
                    year: '2013'
                },
                name: 'Cost of Living',
                variables: [
                    'economy.cost_of_living.index'
                ],
            },
            {
                id: 'economy.cost_of_living.index.all.chart',
                type: 'line',
                constraint: {
                    component: 'All'
                },
                forecast: 5,
                name: 'Overall Cost of Living',
                variables: [
                    'economy.cost_of_living.index'
                ],
            },
            {
                id: 'economy.cost_of_living.index.goods.chart',
                type: 'line',
                constraint: {
                    component: 'Goods'
                },
                forecast: 5,
                name: 'Cost of Goods',
                variables: [
                    'economy.cost_of_living.index'
                ],
            },
            {
                id: 'economy.cost_of_living.index.rents.chart',
                type: 'line',
                constraint: {
                    component: 'Rents'
                },
                forecast: 5,
                name: 'Cost of Rents',
                variables: [
                    'economy.cost_of_living.index'
                ],
            },
            {
                id: 'economy.cost_of_living.index.other.chart',
                type: 'line',
                constraint: {
                    component: 'Other'
                },
                forecast: 5,
                name: 'Other Costs',
                variables: [
                    'economy.cost_of_living.index'
                ],
            }
        ]
    },

    'economy.gdp': {
        charts: [
            {
                id: 'economy.gdp.per_capita_gdp.chart',
                type: 'line',
                forecast: 5,
                description: 'Real (inflation adjusted) GDP per Capita over time.',
                name: 'GDP',
                variables: [
                    'economy.gdp.per_capita_gdp'
                ],
            },
            {
                id: 'economy.gdp.per_capita_gdp_percent_change.chart',
                type: 'line',
                description: 'Annual change in real GDP.',
                name: 'Change in GDP',
                variables: [
                    'economy.gdp.per_capita_gdp_percent_change'
                ],
            }
        ]
    },

    'education.classroom_statistics': {
        charts: [
            {
                id: 'education.classroom_statistics.chart',
                type: 'line',
                forecast: 7,
                name: 'Student Teacher Ratio',
                variables: [
                    'education.classroom_statistics.student-teacher-ratio'
                ],
            }
        ]
    },

    'education.graduation_rates': {
        charts: [
            {
                id: 'education.education.chart',
                type: 'table',
                constraint: {
                    year: '2013'
                },
                name: 'Graduation Rates',
                variables: [
                    'education.graduation_rates.percent_high_school_graduate_or_higher',
                    'education.graduation_rates.percent_bachelors_degree_or_higher'
                ],
            }
        ]
    },

    'education.education_expenditures': {
        charts: [
            {
                id: 'education.education_expenditures.capital-expenditures.chart',
                type: 'line',
                forecast: 7,
                name: 'Capital Expenditures',
                variables: [
                    'education.education_expenditures.capital-expenditures'
                ],
            },
            {
                id: 'education.education_expenditures.capital-expenditures-per-student.chart',
                type: 'line',
                forecast: 7,
                name: 'Capital Expenditures Per Student',
                variables: [
                    'education.education_expenditures.capital-expenditures-per-student'
                ],
            },
            {
                id: 'education.education_expenditures.administration-salaries.chart',
                type: 'line',
                forecast: 7,
                name: 'Administration Salaries',
                variables: [
                    'education.education_expenditures.administration-salaries'
                ],
            },
            {
                id: 'education.education_expenditures.administration-salaries-per-student.chart',
                type: 'line',
                forecast: 7,
                name: 'Administration Salaries Per Student',
                variables: [
                    'education.education_expenditures.administration-salaries-per-student'
                ],
            },
            {
                id: 'education.education_expenditures.instruction-salaries.chart',
                type: 'line',
                forecast: 7,
                name: 'Instruction Salaries',
                variables: [
                    'education.education_expenditures.instruction-salaries'
                ],
            },
            {
                id: 'education.education_expenditures.instruction-salaries-per-student.chart',
                type: 'line',
                forecast: 7,
                name: 'Instruction Salaries Per Student',
                variables: [
                    'education.education_expenditures.instruction-salaries-per-student'
                ],
            }
        ]
    },

    'health.environmental_health': {
        charts: [
            {
                id: 'health.environmental_health.chart',
                type: 'column',
                constraint: {
                    year: '2015'
                },
                name: 'Median Environmental Health Hazard Index',
                variables: [
                    'health.environmental_health.env-health-idx-median'
                ]
            }
        ]
    },

    'health.health_behaviors': {
        charts: [
            {
                id: 'health.health_behaviors.chart',
                type: 'table',
                constraint: {
                    year: '2015'
                },
                name: 'Health Behaviors',
                options: {
                    height: 400
                },
                variables: [
                    'health.health_behaviors'
                ],
            }
        ]
    },

    'jobs.earnings': {
        charts: [
            {
                id: 'jobs.earnings.gender.chart',
                type: 'table',
                constraint: {
                    year: '2013'
                },
                name: 'Earnings and Gender',
                variables: [
                    'jobs.earnings.median_earnings',
                    'jobs.earnings.female_median_earnings',
                    'jobs.earnings.male_median_earnings'
                ],
            },
            {
                id: 'jobs.earnings.education.chart',
                type: 'stepped-area',
                constraint: {
                    year: '2013'
                },
                name: 'Earnings and Education',
                options: {
                    areaOpacity: 0
                },
                variables: [
                    'jobs.earnings.median_earnings_less_than_high_school',
                    'jobs.earnings.median_earnings_high_school',
                    'jobs.earnings.median_earnings_some_college_or_associates',
                    'jobs.earnings.median_earnings_bachelor_degree',
                    'jobs.earnings.median_earnings_graduate_or_professional_degree'
                ],
            }
        ]
    },

    'jobs.job_proximity': {
        charts: [
            {
                id: 'jobs.job_proximity',
                type: 'column',
                constraint: {
                    year: '2015'
                },
                name: 'Median Jobs Proximity Index',
                variables: [
                    'jobs.job_proximity.jobs-prox-idx-median'
                ]
            }
        ]
    },

    'jobs.occupations': {
        charts: [
            {
                id: 'jobs.occupations.chart',
                type: 'table',
                constraint: {
                    year: '2013'
                },
                name: 'Occupations',
                variables: [
                    'jobs.occupations.percent_employed'
                ],
            }
        ]
    }
};

if (typeof module !== 'undefined') module.exports = DATASET_CONFIG;
