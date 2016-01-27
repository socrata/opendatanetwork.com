
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
            idColumn: 'id',
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
                        height: 300,
                        vAxis: { format: 'short' }
                    })
                }
            ]
        }
    ]
};

