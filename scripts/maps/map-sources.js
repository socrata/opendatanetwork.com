
const mapSources = (() => {
    const regions = {
        nation: {name: 'USA', id: 'nation'},
        region: {name: 'Regions', id: 'region'},
        division: {name: 'Divisions', id: 'division'},
        state: {name: 'States', id: 'state'},
        county: {name: 'Counties', id: 'county'},
        msa: {name: 'Metros', id: 'msa'},
        place: {name: 'Cities', id: 'place'}
    };

    const defaultRegion = regions.state;
    const allRegions = _.values(regions);

    function findVariable(variables, id) {
        const result = _.find(variables, variable => variable.id === id);

        if (!result) {
            console.warn(`${name} not found in variables:`);
            console.warn(variables);
        }

        return result;
    }

    const population = (() => {
        function populationGenerator(year) {
            return {
                name: `Population (${year})`,
                id: `population_${year}`,
                params: {year},
                value: region => parseInt(region.population, 10),
                format: charts.format.integer
            };
        }

        function populationChangeGenerator(year) {
            return {
                name: `Population Change (${year})`,
                id: `population_change_${year}`,
                params: {year},
                value: region => parseFloat(region.population_percent_change),
                format: charts.format.percent
            };
        }

        const variables = _.map(_.range(2009, 2014), populationGenerator)
            .concat(_.map(_.range(2010, 2014), populationChangeGenerator));

        return {
            name: 'Population',
            url: 'https://federal.demo.socrata.com/resource/e3rd-zzmr.json?',
            regions: allRegions,
            defaultRegion: defaultRegion,
            variables: variables,
            defaultVariable: findVariable(variables, 'population_2013')
        };
    })();

    function columnGenerator(name, column, format) {
        const params = {};
        const value = region => parseFloat(region[column]);
        const id = column;

        return {name, id, params, value, format};
    }

    const education = (() => {
        const variables = [
            columnGenerator('High School Graduation Rate', 'percent_high_school_graduate_or_higher', charts.format.percent),
            columnGenerator('College Graduation Rate', 'percent_bachelors_degree_or_higher', charts.format.percent)
        ];

        return {
            name: 'Education',
            url: 'https://federal.demo.socrata.com/resource/uf4m-5u8r.json?',
            regions: allRegions,
            defaultRegion: defaultRegion,
            variables: variables,
            defaultVariable: findVariable(variables, 'percent_bachelors_degree_or_higher')
        };
    })();

    const earnings = (() => {
        const variables = [
            columnGenerator('Median Earnings', 'median_earnings', charts.format.dollars),
            columnGenerator('Median Female Earnings', 'female_median_earnings', charts.format.dollars),
            columnGenerator('Median Male Earnings', 'male_median_earnings', charts.format.dollars),
            columnGenerator('Median Female Earnings (Full Time)', 'female_full_time_median_earnings', charts.format.dollars),
            columnGenerator('Median Male Earnings (Full Time)', 'male_full_time_median_earnings', charts.format.dollars),
            columnGenerator('Earnings less than $10,000', 'percent_with_earnings_1_to_9999', charts.format.percent),
            columnGenerator('Earnings $10,000 to $14,999', 'percent_with_earnings_10000_to_14999', charts.format.percent),
            columnGenerator('Earnings $15,000 to $24,999', 'percent_with_earnings_15000_to_24999', charts.format.percent),
            columnGenerator('Earnings $25,000 to $34,999', 'percent_with_earnings_25000_to_34999', charts.format.percent),
            columnGenerator('Earnings $35,000 to $49,999', 'percent_with_earnings_35000_to_49999', charts.format.percent),
            columnGenerator('Earnings $50,000 to $64,999', 'percent_with_earnings_50000_to_64999', charts.format.percent),
            columnGenerator('Earnings $65,000 to $74,999', 'percent_with_earnings_65000_to_74999', charts.format.percent),
            columnGenerator('Earnings $75,000 to $99,999', 'percent_with_earnings_75000_to_99999', charts.format.percent),
            columnGenerator('Earnings over $100,000', 'percent_with_earnings_over_100000', charts.format.percent)
        ];

        return {
            name: 'Earnings',
            url: 'https://federal.demo.socrata.com/resource/wmwh-4vak.json?',
            regions: allRegions,
            defaultRegion: defaultRegion,
            variables: variables,
            defaultVariable: findVariable(variables, 'median_earnings')
        };
    })();

    const occupations = (() => {
        function occupationGenerator(occupation) {
            return {
                name: occupation,
                id: `percent_employed_in_${occupation.toLowerCase().replace(' ', '_')}`,
                params: {occupation},
                value: region => parseFloat(region.percent_employed),
                format: charts.format.percent
            };
        }

        const occupations = ['Management', 'Business and Finance', 'Computers and Math', 'Engineering', 'Social Sciences', 'Social Services', 'Legal', 'Education', 'Media', 'Healthcare', 'Health Technicians', 'Health Support', 'Fire Fighting', 'Law Enforcement', 'Food Service', 'Janitorial', 'Personal Care', 'Sales', 'Office and Administration', 'Farming, Fishing, Foresty', 'Construction and Extraction', 'Repair', 'Production', 'Transportation', 'Material Moving'];
        const variables = _.map(occupations, occupationGenerator);

        return {
            name: 'Occupations',
            url: 'https://federal.demo.socrata.com/resource/qfcm-fw3i.json?',
            regions: allRegions,
            defaultRegion: defaultRegion,
            variables: variables,
            defaultVariable: findVariable(variables, 'percent_employed_in_management')
        };
    })();

    const perCapitaGDP = (() => {
        function perCapitaGDPGenerator(year) {
            return {
                name: `Per Capita GDP (${year})`,
                id: `pcgdp_${year}`,
                params: {year},
                value: region => parseInt(region.per_capita_gdp, 10),
                format: charts.format.dollars
            };
        }

        function perCapitaGDPChangeGenerator(year) {
            return {
                name: `Percent Change ${year - 1} → ${year}`,
                id: `pcgdp_change_${year}`,
                params: {year},
                value: region => parseFloat(region.per_capita_gdp_percent_change),
                format: charts.format.percent
            };
        }

        const firstYear = 2001;
        const lastYear = 2014;

        const gdpYears = _.range(firstYear, lastYear);
        const gdpVariables = _.map(gdpYears, perCapitaGDPGenerator);

        const gdpChangeYears = _.range(firstYear + 1, lastYear);
        const gdpChangeVariables = _.map(gdpChangeYears, perCapitaGDPChangeGenerator);

        const variables = gdpVariables.concat(gdpChangeVariables);

        return {
            name: 'Per Capita GDPs',
            url: 'https://federal.demo.socrata.com/resource/ks2j-vhr8.json?',
            regions: [regions.state, regions.msa],
            defaultRegion: defaultRegion,
            variables: variables,
            defaultVariable: findVariable(variables, 'pcgdp_2013')
        };
    })();

    const rpp = (() => {
        function rppGenerator(year, component) {
            return {
                name: `${component} (${year})`,
                id: `rpp_${component}_${year}`,
                params: {year, component},
                value: region => parseFloat(region.index),
                format: charts.format.number
            };
        }

        const firstYear = 2008;
        const lastYear = 2013;

        const years = _.range(firstYear, lastYear + 1);
        const components = ['All', 'Goods', 'Rents', 'Other'];

        let variables = [];
        components.forEach(component => {
            years.forEach(year => {
                variables.push(rppGenerator(year, component));
            });
        });

        return {
            name: 'Regional Price Parities',
            url: 'https://federal.demo.socrata.com/resource/hpnf-gnfu.json?',
            regions: [regions.state, regions.msa],
            defaultRegion: defaultRegion,
            variables: variables,
            defaultVariable: findVariable(variables, 'rpp_All_2013')
        };
    })();

    const countyHealth = (() => {
        function variable(name) {
            const id = `${name.toLowerCase().replace(/\s/g, '_')}_value`;

            return {
                name: `${name} Rate`,
                id: id,
                params: {},
                value: region => parseFloat(region[id]),
                format: charts.format.ratio
            };
        }

        const names = [
            'Adult Smoking',
            'Adult Obesity',
            'Physical Inactivity',
            'Excessive Drinking'
        ];

        const variables = _.map(names, variable);

        return {
            name: 'RWJF County Health Rankings',
            url: 'https://mark.demo.socrata.com/resource/dmq3-vqu7.json',
            regions: [regions.county, regions.state],
            defaultRegion: regions.county,
            variables: variables,
            defaultVariable: findVariable(variables, 'adult_smoking_value')
        };
    })();

    const cityHealth = (() => {
        function variable(name) {
            const id = name.toLowerCase().replace(/\s/g, '-');

            return {
                name: name,
                id: id,
                params: {},
                value: region => parseFloat(region[id]),
                format: charts.format.ratio
            };
        }

        const names = [
            'Percent of Adults Who Currently Smoke',
            'Percent below 200% Poverty Level',
            'AIDS Diagnoses Rate',
            'HIV Diagnoses Rate',
            'HIV-Related Mortality Rate'
        ];

        const variables = _.map(names, variable);

        return {
            name: 'NACCHO Big Cities',
            url: 'https://mark.demo.socrata.com/resource/jij8-x493.json',
            regions: [regions.place],
            defaultRegion: regions.place,
            variables: variables,
            defaultVariable: findVariable(variables, 'percent-of-adults-who-currently-smoke')
        };
    })();

    return {population, education, earnings, occupations, perCapitaGDP,
            rpp, countyHealth, cityHealth};
})();
