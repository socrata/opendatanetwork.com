
const Constants = {
    ROSTER_URL: 'https://federal.demo.socrata.com/resource/7g2b-8brv.json',

    AUTOCOMPLETE_SEPARATOR: ':',
    AUTOCOMPLETE_URL: (domain, fxf, column, term) => {
        return `https://${domain}/views/${fxf}/columns/${column}/suggest/${term}`;
    },
    AUTOCOMPLETE_WAIT_MS: 150,
    AUTOCOMPLETE_MAX_OPTIONS: 100,
    AUTOCOMPLETE_SHOWN_OPTIONS: 5
};

