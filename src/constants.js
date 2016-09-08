'use strict';

const _ODN_API_HOST_AND_PORT = 'api.opendatanetwork.com';
const _ODN_API_BASE_URL = 'https://'+_ODN_API_HOST_AND_PORT;

const GlobalConstants = {
    ODN_API_HOST_AND_PORT: _ODN_API_HOST_AND_PORT,
    ODN_API_BASE_URL: _ODN_API_BASE_URL,
    APP_TOKEN: 'cQovpGcdUT1CSzgYk0KPYdAI0',

    ENTITY_LOOKUP_URL: _ODN_API_BASE_URL + '/entity/v1',
    DATA_AVAILABILITY_URL: _ODN_API_BASE_URL + '/data/v1/availability',
    DATA_CONSTRAINT_URL:  _ODN_API_BASE_URL + '/data/v1/constraint/{0}',
    DATA_VALUES_URL:  _ODN_API_BASE_URL + '/data/v1/values',

    AUTOCOMPLETE_MAX_OPTIONS: 100,
    AUTOCOMPLETE_SEPARATOR: ':',
    AUTOCOMPLETE_SHOWN_OPTIONS: 5,
    AUTOCOMPLETE_URL: type => `${_ODN_API_BASE_URL}/suggest/v1/${type}`,
    AUTOCOMPLETE_WAIT_MS: 150,

    PEER_REGIONS: 5,
    PEER_REGIONS_MAX: 10,

    REGION_NAMES: {
        'region.nation': 'Nation',
        'region.region': 'Region',
        'region.division': 'Division',
        'region.state': 'State',
        'region.county': 'County',
        'region.msa': 'Metro Area',
        'region.place': 'Place',
        'region.zip_code': 'ZIP Code'
    },

    PLURAL_REGION_NAMES: {
        'region.nation': 'Nations',
        'region.region': 'Regions',
        'region.division': 'Divisions',
        'region.state': 'States',
        'region.county': 'Counties',
        'region.msa': 'Metro Areas',
        'region.place': 'Places',
        'region.zip_code': 'ZIP Codes'
    },

    ROSTER_URL: 'https://federal.demo.socrata.com/resource/bdeb-mf9k.json',

    SCROLL_THRESHOLD: 1000
};

/**
 * Makes this accessible inside of server side executed controllers stuff
 */
if (typeof module !== 'undefined') module.exports = GlobalConstants;
