
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
                            type: 'number'
                        },
                        {
                            column: 'population',
                            label: 'Population',
                            type: 'number'
                        }
                    ]
                }
            ]
        }
    ]
};

