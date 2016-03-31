
const Constants = {
    ROSTER_URL: 'https://odn.data.socrata.com/resource/czuf-rtrf.json',
    SEARCH_RESULTS_REGIONS_URL: 'https://odn.data.socrata.com/resource/7g2b-8brv.json',
    CATALOG_URL: 'http://api.us.socrata.com/api/catalog/v1',

    PEERS_URL: 'https://odn-peers.herokuapp.com/peers',
    N_PEERS: 5,

    RELATIVES_URL: 'https://odn.data.socrata.com/resource/iv2c-wasz.json',
    N_RELATIVES: 5,

    DATASET_SUMMARY_URL: 'https://{0}/api/views/{1}.json',
    DATASET_MIGRATIONS_URL: 'https://{0}/api/migrations/{1}.json',
    ATHENA_URL: 'https://socrata-athena.herokuapp.com/schema/v1/applied/{0}',

    TIMEOUT_MS: 5000,
    CACHE_OPTIONS: {},

    DEFAULT_METADATA: {
        description: '',
        icon: 'fa-database',
    }
};

module.exports = Constants;

