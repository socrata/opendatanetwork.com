
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

    ALGORITHMIA_KEY: 'simYpkAEVZ9jk7geAuJol7rrhP/1',
    ALGORITHMIA_FORECAST: 'algo://TimeSeries/Forecast/0.1.15'
};

