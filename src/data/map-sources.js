
const DOMAIN = 'odn.data.socrata.com';


function variableGenerator(years=[2013], value=parseFloat) {
    return variableTuples => {
        return variableTuples.map(variable => {
            const [name, column, format] = variable;
            return {name, column, format, years, value};
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
                value: parseFloat,
                format: format.integer
            },
            {
                name: 'Population Change',
                column: 'population_percent_change',
                years: [2010, 2011, 2012, 2013],
                value: parseFloat,
                format: format.percent
            }
        ]
    },

    earnings: {
        name: 'earnings',
        domain: DOMAIN,
        fxf: 'wmwh-4vak',
        hasPopulation: true,
        variables: variableGenerator()([
            ['Median Earnings', 'median_earnings', format.dollar],
            ['Median Female Earnings', 'female_median_earnings', format.dollar],
            ['Median Male Earnings', 'male_median_earnings', format.dollar],
            ['Median Female Earnings (Full Time)', 'female_full_time_median_earnings', format.dollar],
            ['Median Male Earnings (Full Time)', 'male_full_time_median_earnings', format.dollar],
            ['Earnings less than $10,000', 'percent_with_earnings_1_to_9999', format.percent],
            ['Earnings $10,000 to $14,999', 'percent_with_earnings_10000_to_14999', format.percent],
            ['Earnings $15,000 to $24,999', 'percent_with_earnings_15000_to_24999', format.percent],
            ['Earnings $25,000 to $34,999', 'percent_with_earnings_25000_to_34999', format.percent],
            ['Earnings $35,000 to $49,999', 'percent_with_earnings_35000_to_49999', format.percent],
            ['Earnings $50,000 to $64,999', 'percent_with_earnings_50000_to_64999', format.percent],
            ['Earnings $65,000 to $74,999', 'percent_with_earnings_65000_to_74999', format.percent],
            ['Earnings $75,000 to $99,999', 'percent_with_earnings_75000_to_99999', format.percent],
            ['Earnings over $100,000', 'percent_with_earnings_over_100000', format.percent]
        ])
    },

    education: {
        name: 'education',
        domain: DOMAIN,
        fxf: 'uf4m-5u8r',
        hasPopulation: true,
        variables: variableGenerator()([
            ['High School Graduation Rate', 'percent_high_school_graduate_or_higher', format.percent],
            ['College Graduation Rate', 'percent_bachelors_degree_or_higher', format.percent]
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
                    value: parseFloat,
                    format: format.percent
                };
            })
    }
};

