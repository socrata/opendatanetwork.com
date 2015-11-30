
const Constants = {
    ROSTER_URL: 'https://federal.demo.socrata.com/resource/7g2b-8brv.json',

    AUTOCOMPLETE_SEPARATOR: ':',
    AUTOCOMPLETE_URL: (domain, fxf, column, term) => {
        return `https://${domain}/views/${fxf}/columns/${column}/suggest/${term}?size=5`;
    },
    AUTOCOMPLETE_WAIT_MS: 150
};

