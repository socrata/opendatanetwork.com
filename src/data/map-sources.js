
const DOMAIN = 'odn.data.socrata.com';

const MapSources = {
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
                value: parseFloat,
                format: d3.format(',.0f')
            },
            {
                name: 'Population Change',
                column: 'population_percent_change',
                years: [2010, 2011, 2012, 2013],
                value: parseFloat,
                format: value => `${d3.format('.2f')(value)}%`
            }
        ]
    }
};

