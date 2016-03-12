
const Constants = {
    ROSTER_URL: 'https://federal.demo.socrata.com/resource/bdeb-mf9k.json',

    AUTOCOMPLETE_SEPARATOR: ':',
    AUTOCOMPLETE_URL: (domain, fxf, column, term) => {
        return `https://${domain}/views/${fxf}/columns/${column}/suggest/${term}`;
    },
    AUTOCOMPLETE_WAIT_MS: 150,
    AUTOCOMPLETE_MAX_OPTIONS: 100,
    AUTOCOMPLETE_SHOWN_OPTIONS: 5,

    PEER_REGIONS: 5,
    PEER_REGIONS_MAX: 10,

    REGION_NAMES: {
        nation: 'Nation',
        region: 'US Census Region',
        division: 'US Census Division',
        state: 'US State',
        county: 'US County',
        msa: 'Metropolitan Statistical Area',
        place: 'City',
        zip_code: 'ZIP Code'
    }
};

