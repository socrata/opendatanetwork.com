
/**
 * Data Sources.
 *
 * [Tab] -> [Chart Group] -> [Chart]
 */

const ODN_DOMAIN = 'odn.data.socrata.com';

const attributions = {
    acs: {
        name: 'American Community Survey'
    },
    bea: {
        name: 'Bureau of Economic Analysis'
    }
};

function _toPercent(column) {
    return rows => {
        return rows.map(row => _.extend(row, { [column]: parseFloat(row[column]) / 100 }));
    };
}

const SOURCES = {
    population: {
        name: 'Population',
        groups: [
            {
                name: 'Population',
                attribution: attributions.acs,
                domain: ODN_DOMAIN,
                fxf: 'e3rd-zzmr',
                charts: [
                    {
                        name: 'Population over Time',
                        data: [
                            {
                                column: 'year',
                                label: 'Year',
                                type: 'string'
                            },
                            {
                                column: 'population',
                                label: 'Population',
                                format: { pattern: '###,###' }
                            }
                        ],
                        chart: google.visualization.LineChart,
                        options: {
                            vAxis: { format: 'short' }
                        }
                    },
                    {
                        name: 'Population Change over Time',
                        data: [
                            {
                                column: 'year',
                                label: 'Year',
                                type: 'string',
                            },
                            {
                                column: 'population_percent_change',
                                label: 'Population Change',
                                type: 'number',
                                format: { pattern: '#.##%' }
                            }
                        ],
                        transform: rows => {
                            return rows
                                .filter(row => row.year !== '2009')
                                .map(row => _.extend(row, { population_percent_change: parseFloat(row.population_percent_change) / 100 }));
                        },
                        chart: google.visualization.LineChart,
                        options: {
                            vAxis: { format: '#.##%' }
                        }
                    }
                ]
            }
        ]
    },

    education: {
        name: 'Education',
        description: 'Educational data.',
        groups: [
            {
                name: 'Education',
                attribution: attributions.acs,
                domain: ODN_DOMAIN,
                fxf: 'uf4m-5u8r',
                charts: [
                    {
                        name: 'Graduation Rates',
                        data: [
                            {
                                column: 'percent_high_school_graduate_or_higher',
                                label: 'High School',
                            },
                            {
                                column: 'percent_bachelors_degree_or_higher',
                                label: 'College',
                            }
                        ],
                        transpose: [
                            {
                                column: 'variable',
                                label: 'Graduation Rate',
                                type: 'string'
                            },
                            {
                                column: 'value',
                                label: 'Value',
                                format: { pattern: '#.#%' }
                            }
                        ],
                        transform: _toPercent('value'),
                        chart: google.visualization.ColumnChart,
                        options: {
                            vAxis: { format: 'percent' }
                        }
                    }
                ]
            }
        ]
    },

    earnings: {
        name: 'Earnings',
        description: 'Earnings and income data.',
        groups: [
            {
                name: 'Earnings',
                attribution: attributions.acs,
                domain: ODN_DOMAIN,
                fxf: 'wmwh-4vak',
                charts: [
                    {
                        name: 'Median Earnings by Gender (Full-Time and Part-Time Workers)',
                        data: [
                            {
                                column: 'median_earnings',
                                label: 'All',
                            },
                            {
                                column: 'male_median_earnings',
                                label: 'Male',
                            },
                            {
                                column: 'female_median_earnings',
                                label: 'Female',
                            }
                        ],
                        transpose: [
                            {
                                column: 'variable',
                                label: '',
                                type: 'string'
                            },
                            {
                                column: 'value',
                                label: 'Value',
                                format: { pattern: '###,###', prefix: '$' }
                            }
                        ],
                        chart: google.visualization.ColumnChart,
                        options: {
                            vAxis: {
                                format: 'currency',
                                viewWindow: {
                                    min: 0
                                }
                            }
                        }
                    },
                    {
                        name: 'Median Earnings by Education Level (Full-Time and Part-Time Workers)',
                        data: [
                            {
                                column: 'median_earnings_less_than_high_school',
                                label: 'Less than High School'
                            },
                            {
                                column: 'median_earnings_high_school',
                                label: 'High School'
                            },
                            {
                                column: 'median_earnings_some_college_or_associates',
                                label: 'Some College or Associates'
                            },
                            {
                                column: 'median_earnings_bachelor_degree',
                                label: 'Bachelor\'s Degree'
                            },
                            {
                                column: 'median_earnings_graduate_or_professional_degree',
                                label: 'Graduate or Professional Degree'
                            }
                        ],
                        transpose: [
                            {
                                column: 'variable',
                                label: 'Level of Education',
                                type: 'string'
                            },
                            {
                                column: 'value',
                                label: 'Value',
                                format: { pattern: '###,###', prefix: '$' }
                            }
                        ],
                        chart: google.visualization.ColumnChart,
                        options: {
                            vAxis: { format: 'currency' }
                        }
                    }
                ]
            }
        ]
    },

    occupations: {
        name: 'Occupations',
        description: 'Occupations data.',
        groups: [
            {
                name: 'Percent Employed in Each Occupation',
                attribution: attributions.acs,
                domain: ODN_DOMAIN,
                fxf: 'qfcm-fw3i',
                charts: [
                    {
                        data: [
                            {
                                column: 'occupation',
                                label: 'Occupation',
                                type: 'string'
                            },
                            {
                                column: 'percent_employed',
                                label: 'Percent Employed',
                                format: { pattern: '#.#%' }
                            }
                        ],
                        transform: _toPercent('percent_employed'),
                        chart: google.visualization.Table,
                        options: {
                            height: 800
                        }
                    }
                ]
            }
        ]
    },

    gdp: {
        name: 'Gross Domestic Product',
        description: 'Gross Domestic Product (GDP) data.',
        groups : [
            {
                name: 'Gross Domestic Product (GDP)',
                attribution: attributions.bea,
                domain: ODN_DOMAIN,
                fxf: 'ks2j-vhr8',
                charts: [
                    {
                        name: 'GDP per Capita over Time',
                        data: [
                            {
                                column: 'year',
                                label: 'Year',
                                type: 'string'
                            },
                            {
                                column: 'per_capita_gdp',
                                label: 'Per Capita GDP',
                                format: { pattern: '$###,###' }
                            }
                        ],
                        chart: google.visualization.LineChart,
                        options: {
                            vAxis: { format: '$###,###' }
                        }
                    },
                    {
                        name: 'Annual Change in Per Capita GDP',
                        data: [
                            {
                                column: 'year',
                                label: 'Year',
                                type: 'string'
                            },
                            {
                                column: 'per_capita_gdp_percent_change',
                                label: 'Annual Change in Per Capita GDP over Time',
                                format: { pattern: '##.#%' }
                            }
                        ],
                        transform: _toPercent('per_capita_gdp_percent_change'),
                        chart: google.visualization.LineChart,
                        options: {
                            vAxis: { format: '##.#%' }
                        }
                    }
                ]
            }
        ]
    },

    cost_of_living: {
        name: 'Cost of Living',
        groups: [
            {
                name: 'Cost of Living Indexes (100 is the U.S. Average)',
                attribution: attributions.bea,
                domain: ODN_DOMAIN,
                fxf: 'hpnf-gnfu',
                charts: ['All', 'Rents', 'Goods', 'Other'].map(component => {
                    return {
                        name: `Category: ${component}`,
                        params: {component},
                        data: [
                            {
                                column: 'year',
                                label: 'Year',
                                type: 'string'
                            },
                            {
                                column: 'index',
                                label: 'Index'
                            }
                        ],
                        chart: google.visualization.LineChart
                    };
                })
            }
        ]
    }
};

const DEFAULT_SOURCE = SOURCES.population;

