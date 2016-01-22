
function datasetURL(fxf) {
    return `https://odn.data.socrata.com/resource/${fxf}.json`;
}

const Constants = {
    datasetURL,

    CATALOG_URL: 'http://api.us.socrata.com/api/catalog/v1',
    SYNONYMS_FILE: 'data/synonyms.json',

    PEERS_URL: 'https://odn-peers.herokuapp.com/peers',
    N_PEERS: 5,

    RELATIVES_URL: datasetURL('iv2c-wasz'),
    N_RELATIVES: 5,

    DATASET_SUMMARY_URL: 'https://{0}/api/views/{1}.json',
    ATHENA_URL: 'https://socrata-athena.herokuapp.com/schema/v1/applied/{0}',

    VECTOR_FXFS: {
        'population': 'e3rd-zzmr',
        'education': 'uf4m-5u8r',
        'earnings': 'wmwh-4vak',
        'occupations': 'qfcm-fw3i',
        'health': '7ayp-utp2',
        'gdp': 'ks2j-vhr8',
        'cost_of_living': 'hpnf-gnfu'
    },

    TIMEOUT_MS: 1000
};

module.exports = Constants;

