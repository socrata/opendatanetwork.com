
const GlobalConstants = require("../src/constants"); 

/**
 * Constants used in the controller module only. All GlobalConstants are available in ../src/constants
 */
const ControllerConstants = {

    CATALOG_URL: 'http://api.us.socrata.com/api/catalog/v1',
    ROSTER_URL: 'https://odn.data.socrata.com/resource/czuf-rtrf.json',
    SEARCH_RESULTS_REGIONS_URL: 'https://odn.data.socrata.com/resource/czuf-rtrf.json',

    RELATED_CHILD_URL: GlobalConstants.ODN_API_BASE_URL+'/entity/v1/child',
    RELATED_PARENT_URL: GlobalConstants.ODN_API_BASE_URL+'/entity/v1/parent',
    RELATED_PEER_URL: GlobalConstants.ODN_API_BASE_URL+'/entity/v1/peer',
    RELATED_SIBLING_URL: GlobalConstants.ODN_API_BASE_URL+'/entity/v1/sibling',
    SEARCH_DATASET_URL: GlobalConstants.ODN_API_BASE_URL+'/search/v1/dataset',
    SEARCH_QUESTION_URL: GlobalConstants.ODN_API_BASE_URL+'/search/v1/question',

    N_RELATIVES: 5,

    DATASET_SUMMARY_URL: 'https://{0}/api/views/{1}.json',
    DATASET_MIGRATIONS_URL: 'https://{0}/api/migrations/{1}.json',
    ATHENA_URL: 'https://socrata-athena.herokuapp.com/schema/v1/applied/{0}',

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

module.exports = ControllerConstants;

