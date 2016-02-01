
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

    DEFAULT_CHART_OPTIONS: {
        curveType: 'function',
        lineWidth: 4,
        legend : { position : 'top' },
        pointShape : 'circle',
        pointSize : 6,
        height: 300,
        colors: ['#2ecc71', '#3498db', '#9b59b6', '#f1c40f', '#e67e22', '#e74c3c', '#34495e', '#1abc9c']
    }
};

