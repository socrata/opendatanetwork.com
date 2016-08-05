
const Constants = {

    CATALOG_URL: 'http://api.us.socrata.com/api/catalog/v1',
    ROSTER_URL: 'https://odn.data.socrata.com/resource/czuf-rtrf.json',
    SEARCH_RESULTS_REGIONS_URL: 'https://odn.data.socrata.com/resource/czuf-rtrf.json',
    SEARCH_DATASET_URL: 'http://api.opendatanetwork.com/search/v1/dataset',

    RELATED_PEER_URL: 'http://odn-backend.herokuapp.com/entity/v1/peer',
    RELATED_SIBLING_URL: 'http://odn-backend.herokuapp.com/entity/v1/sibling',
    RELATED_CHILD_URL: 'http://odn-backend.herokuapp.com/entity/v1/child',
    RELATED_PARENT_URL: 'http://odn-backend.herokuapp.com/entity/v1/parent',
    N_RELATIVES: 5,

    DATA_AVAILABILITY_URL: 'http://odn-backend.herokuapp.com/data/v1/availability',
    DATA_VALUES_URL: 'http://odn-backend.herokuapp.com/data/v1/values',

    DATASET_SUMMARY_URL: 'https://{0}/api/views/{1}.json',
    DATASET_MIGRATIONS_URL: 'https://{0}/api/migrations/{1}.json',
    ATHENA_URL: 'https://socrata-athena.herokuapp.com/schema/v1/applied/{0}',

    APP_TOKEN : 'CqcTvF7wVsI8IYAq7CdZszLbU',
    USER_AGENT: 'OpenDataNetwork.com',

    TIMEOUT_MS: 5000,
    CACHE_OPTIONS: {
        expires: 43200, // 12 hours
    },

    DEFAULT_METADATA: {
        description: '',
        icon: 'fa-database',
    }
};

module.exports = Constants;

