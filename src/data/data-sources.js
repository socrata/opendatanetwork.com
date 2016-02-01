
/**
 * Data Sources.
 *
 * [Tab] -> [Chart Group] -> [Chart]
 */

const ODN_DOMAIN = 'odn.data.socrata.com';

const attributions = {
    acs: {
        name: 'American Community Survey'
    }
};

const lineOptions = {
    curveType: 'function',
    lineWidth: 4,
    legend : { position : 'top' },
    pointShape : 'circle',
    pointSize : 6,
    height: 300,
    colors: ['#2ecc71', '#3498db', '#9b59b6', '#f1c40f', '#e67e22', '#e74c3c', '#34495e', '#1abc9c']
}

const demographics = {
    name: 'Demographics',
    description: 'Information about population, race, age, and sex.',
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
                            type: 'number',
                            formatter: google.visualization.NumberFormat,
                            formatterOptions: { pattern: '###,###' }
                        }
                    ],
                    chart: google.visualization.LineChart,
                    options: _.extend({}, lineOptions, {
                        title : 'Population over Time',
                        vAxis: { format: 'short' }
                    })
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
                            formatter: google.visualization.NumberFormat,
                            formatterOptions: { pattern: '#.##%' }
                        }
                    ],
                    transform: rows => {
                        return rows
                            .filter(row => row.year !== '2009')
                            .map(row => _.extend(row, { population_percent_change: parseFloat(row.population_percent_change) / 100 }));
                    },
                    chart: google.visualization.LineChart,
                    options: _.extend({}, lineOptions, {
                        title: 'Population Change over Time',
                        vAxis: { format: 'percent' }
                    })
                }
            ]
        }
    ]
};

const education =  {
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
                            type: 'number'
                        },
                        {
                            column: 'percent_bachelors_degree_or_higher',
                            label: 'College',
                            type: 'number'
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
                            type: 'number',
                            formatter: google.visualization.NumberFormat,
                            formatterOptions: { pattern: '#.##%' }
                        }
                    ],
                    transform: rows => {
                        return rows.map(row => {
                            row.value = parseFloat(row.value) / 100;
                            return row;
                        });
                    },
                    chart: google.visualization.Table
                }
            ]
        }
    ]
};

const earnings = {
    name: 'Earnings',
    description: 'Earnings and income data.',
    groups: [
        {
            name: 'Median Earnings of Full-Time and Part-Time Workers',
            attribution: attributions.acs,
            domain: ODN_DOMAIN,
            fxf: 'wmwh-4vak',
            charts: [
                {
                    name: 'Median Earnings of Full-time and Part-time Workers',
                    data: [
                        {
                            column: 'median_earnings',
                            label: 'Median Earnings',
                            type: 'number'
                        },
                        {
                            column: 'male_median_earnings',
                            label: 'Median Male Earnings',
                            type: 'number'
                        },
                        {
                            column: 'female_median_earnings',
                            label: 'Median Female Earnings',
                            type: 'number'
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
                            type: 'number',
                            formatter: google.visualization.NumberFormat,
                            formatterOptions: { pattern: '###,###', prefix: '$' }
                        }
                    ],
                    chart: google.visualization.Table
                }
            ]
        }
    ]
};

