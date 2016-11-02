'use strict';

const DATASET_CONFIG = {
    'finance.michigan_debt': {
        charts: [
            {
                id: 'finance.michigan_debt.debt_service.chart',
                type: 'line',
                name: 'Debt Service',
                variables: [
                    'finance.michigan_debt.debt_service'
                ],
                options: {
                    vAxis: {
                        format: "#,###.##%"
                    }
                }
            },
            {
                id: 'finance.michigan_debt.long_term_debt_revenue.chart',
                type: 'line',
                name: 'Long Term Debt Revenue',
                variables: [
                    'finance.michigan_debt.long_term_debt_revenue'
                ],
                options: {
                    vAxis: {
                        format: "#,###.##%"
                    }
                }
            },
            {
                id: 'finance.michigan_debt.debt_long_term.chart',
                type: 'line',
                name: 'Long Term Debt',
                variables: [
                    'finance.michigan_debt.debt_long_term'
                ]
            },
            {
                id: 'finance.michigan_debt.debt_health.chart',
                type: 'line',
                name: 'Debt Per Capita',
                variables: [
                    'finance.michigan_debt.debt_health'
                ]
            }
        ]
    },

    'finance.michigan_expenditures': {
        charts: [
            {
                id: 'finance.michigan_expenditures.public_safety_expenditures.chart',
                type: 'line',
                name: 'Total Public Safety Fund Expenditures',
                variables: [
                    'finance.michigan_expenditures.public_safety_expenditures'
                ]
            },
            {
                id: 'finance.michigan_expenditures.total_general_fund_expenditures.chart',
                type: 'line',
                name: 'Total General Fund Expenditures',
                variables: [
                    'finance.michigan_expenditures.total_general_fund_expenditures'
                ]
            }
        ]
    },

    'finance.michigan_general_fund': {
        charts: [
            {
                id: 'finance.michigan_general_fund.general_fund_balance.chart',
                type: 'line',
                name: 'General Fund Balance Operating Budget Surplus(Deficit)',
                variables: [
                    'finance.michigan_general_fund.general_fund_balance'
                ]
            },
            {
                id: 'finance.michigan_general_fund.general_fund_unrestricted_balance.chart',
                type: 'line',
                name: 'General Fund Unrestricted Balance',
                variables: [
                    'finance.michigan_general_fund.general_fund_unrestricted_balance'
                ]
            },
            {
                id: 'finance.michigan_general_fund.liquidity_ratio.chart',
                type: 'line',
                name: 'Liquidity Ratio',
                variables: [
                    'finance.michigan_general_fund.liquidity_ratio'
                ]
            },
            {
                id: 'finance.michigan_general_fund.general_fund_health.chart',
                type: 'line',
                name: 'General Fund Balance Per Capita',
                variables: [
                    'finance.michigan_general_fund.general_fund_health'
                ]
            }
        ]
    },

    'finance.michigan_pensions': {
        charts: [
            {
                id: 'finance.michigan_pensions.unfunded_pension_liability.chart',
                type: 'line',
                name: 'Unfunded Pension Liability',
                variables: [
                    'finance.michigan_pensions.unfunded_pension_liability'
                ]
            },
            {
                id: 'finance.michigan_pensions.pension_health.chart',
                type: 'line',
                name: 'Unfunded Pension Liability Per Capita',
                variables: [
                    'finance.michigan_pensions.pension_health'
                ]
            }
        ]
    },

    'finance.michigan_property_tax': {
        charts: [
            {
                id: 'finance.michigan_property_tax.debt_taxable_value.chart',
                type: 'line',
                name: 'Debt as % of Taxable Value',
                variables: [
                    'finance.michigan_property_tax.debt_taxable_value'
                ],
                options: {
                    vAxis: {
                        format: "#,###.##%"
                    }
                }
            },
            {
                id: 'finance.michigan_property_tax.total_taxable_value.chart',
                type: 'line',
                name: 'Total Taxable Value',
                variables: [
                    'finance.michigan_property_tax.total_taxable_value'
                ]
            },
            {
                id: 'finance.michigan_property_tax.property_tax_health.chart',
                type: 'line',
                name: 'Total Taxable Value Per Capita',
                variables: [
                    'finance.michigan_property_tax.property_tax_health'
                ]
            }
        ]
    },

    'finance.michigan_revenues': {
        charts: [
            {
                id: 'finance.michigan_revenues.total_general_fund_revenue.chart',
                type: 'line',
                name: 'Total General Fund Revenue',
                variables: [
                    'finance.michigan_revenues.total_general_fund_revenue'
                ]
            },
            {
                id: 'finance.michigan_revenues.unrestricted_revenue.chart',
                type: 'line',
                name: 'Unrestricted Revenue',
                variables: [
                    'finance.michigan_revenues.unrestricted_revenue'
                ]
            }
        ]
    },

    'crime.fbi_ucr': {
        charts: [
            {
                id: 'crime.fbi_ucr.count.chart',
                type: 'bar',
                constraint: {
                    year: '2014'
                },
                name: 'Crime Incident Count',
                options: {
                    chartArea: {
                        left: 270
                    },
                    height: 450
                },
                mobileOptions: {
                    chartArea: {
                        left: 100
                    }
                },
                variables: [
                    'crime.fbi_ucr.count'
                ],
                // Variables or constraint values to be excluded from the chart.
                exclude: ['All Crimes']
            },
            {
                id: 'crime.fbi_ucr.rate.chart',
                type: 'bar',
                constraint: {
                    year: '2014'
                },
                name: 'Crime Incident Rate per 100,000 People',
                options: {
                    chartArea: {
                        left: 270
                    },
                    height: 450
                },
                mobileOptions: {
                    chartArea: {
                        left: 100
                    }
                },
                variables: [
                    'crime.fbi_ucr.rate'
                ],
                // Variables or constraint values to be excluded from the chart.
                exclude: ['All Crimes']
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
                ]
            },
            {
                id: 'demographics.population.change.chart',
                type: 'line',
                name: 'Population Change',
                variables: [
                    'demographics.population.change'
                ]
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
                ]
            },
            {
                id: 'economy.consumption.expenditures_percent_change.chart',
                type: 'line',
                name: 'Change in Personal Consumption Expenditures over Time',
                variables: [
                    'economy.consumption.expenditures_percent_change'
                ]
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
                ]
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
                ]
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
                ]
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
                ]
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
                ]
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
                ]
            },
            {
                id: 'economy.gdp.per_capita_gdp_percent_change.chart',
                type: 'line',
                description: 'Annual change in real GDP.',
                name: 'Change in GDP',
                variables: [
                    'economy.gdp.per_capita_gdp_percent_change'
                ]
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
                ]
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
                name: 'Graduation Rates'
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
                ]
            },
            {
                id: 'education.education_expenditures.capital-expenditures-per-student.chart',
                type: 'line',
                forecast: 7,
                name: 'Capital Expenditures Per Student',
                variables: [
                    'education.education_expenditures.capital-expenditures-per-student'
                ]
            },
            {
                id: 'education.education_expenditures.administration-salaries.chart',
                type: 'line',
                forecast: 7,
                name: 'Administration Salaries',
                variables: [
                    'education.education_expenditures.administration-salaries'
                ]
            },
            {
                id: 'education.education_expenditures.administration-salaries-per-student.chart',
                type: 'line',
                forecast: 7,
                name: 'Administration Salaries Per Student',
                variables: [
                    'education.education_expenditures.administration-salaries-per-student'
                ]
            },
            {
                id: 'education.education_expenditures.instruction-salaries.chart',
                type: 'line',
                forecast: 7,
                name: 'Instruction Salaries',
                variables: [
                    'education.education_expenditures.instruction-salaries'
                ]
            },
            {
                id: 'education.education_expenditures.instruction-salaries-per-student.chart',
                type: 'line',
                forecast: 7,
                name: 'Instruction Salaries Per Student',
                variables: [
                    'education.education_expenditures.instruction-salaries-per-student'
                ]
            }
        ]
    },

    'health.health_insurance': {
        charts: [
            {
                id: 'health.health_insurance.pctui.chart',
                type: 'line',
                constraint: {
                    age: '18 to 64',
                    race: 'All races',
                    sex: 'Both sexes',
                    income: 'All income levels'
                },
                name: 'Percent Uninsured',
                forecast: 5,
                variables: [
                    'health.health_insurance.pctui'
                ]
            },
            {
                id: 'health.health_insurance.income.chart',
                type: 'column',
                constraint: {
                    year: '2014',
                    age: '18 to 64',
                    race: 'All races',
                    sex: 'Both sexes',
                },
                name: 'Percent Uninsured by Income Level',
                variables: [
                    'health.health_insurance.pctui'
                ]
            },
            {
                id: 'health.health_insurance.race.chart',
                type: 'bar',
                constraint: {
                    year: '2014',
                    age: '18 to 64',
                    sex: 'Both sexes',
                    income: 'All income levels'
                },
                name: 'Percent Uninsured by Race',
                variables: [
                    'health.health_insurance.pctui'
                ]
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
                ]
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
                ]
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
                ]
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
                ]
            }
        ]
    }
};

if (typeof module !== 'undefined') module.exports = DATASET_CONFIG;

