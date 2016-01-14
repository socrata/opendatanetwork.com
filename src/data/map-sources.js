
const DOMAIN = 'odn.data.socrata.com';


function variableGenerator(years=[2013], value=parseFloat) {
    return variableTuples => {
        return variableTuples.map(variable => {
            const [name, column, format, stoplight] = variable;
            return {name, column, format, years, value, stoplight};
        });
    };
}


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
                format: format.integer,
            },
            {
                name: 'Population Change',
                column: 'population_percent_change',
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
        variables: ['Management', 'Business and Finance', 'Computers and Math', 'Engineering', 'Social Sciences', 'Social Services', 'Legal', 'Education', 'Media', 'Healthcare', 'Health Technicians', 'Health Support', 'Fire Fighting', 'Law Enforcement', 'Food Service', 'Janitorial', 'Personal Care', 'Sales', 'Office and Administration', 'Farming, Fishing, Foresty', 'Construction and Extraction', 'Repair', 'Production', 'Transportation', 'Material Moving']
            .map(occupation => {
                return {
                    name: occupation,
                    column: 'percent_employed',
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
                years: _.range(2001, 2014),
                format: format.dollar,
                stoplight: true
            },
            {
                name: 'Annual Change in GDP',
                column: 'per_capita_gdp_percent_change',
                years: _.range(2002, 2014),
                format: format.percent,
                stoplight: true
            }
        ]
    },

    rpp: {
        name: 'rpp',
        domain: DOMAIN,
        fxf: 'hpnf-gnfu',
        variables: ['All', 'Goods', 'Rents', 'Other'].map(
            component => {
                return {
                    name: component,
                    column: 'index',
                    reverse: true,
                    params: {component},
                    years: _.range(2008, 2014),
                    format: d3.format('.1f'),
                    stoplight: true
                };
            })
    },

    health: {
        name: 'health',
        domain: DOMAIN,
        fxf: '7ayp-utp2',
        variables: ['Adult Smoking', 'Adult Obesity',
                    'Physical Inactivity', 'Excessive Drinking'].map(
            name => {
                return {
                    name: `${name} Rate`,
                    column: `${name.toLowerCase().replace(/\s/g, '_')}_value`,
                    years: [2015],
                    reverse: true,
                    format: format.ratio,
                    stoplight: true
                };
            })
    }
};

