'use strict';

const _ = require('lodash');
const request = require('request-promise');
const GlobalConfig = require('../../src/config');

/**
 * API Proxy Controller that adds reCAPTCHA protection to ODN API calls
 */

const ALLOWED_PATHS = [
    'entity/v1',
    'data/v1/availability',
    'data/v1/constraint',
    'data/v1/values',
    'data/v1/map/new',
    'search/v1/dataset',
    'search/v1/question',
    'suggest/v1'
];

module.exports = (req, res) => {
    const path = req.params[0];
    
    // Validate path
    const isAllowed = ALLOWED_PATHS.some(allowed => path.startsWith(allowed));
    if (!isAllowed) {
        return res.status(404).json({ error: 'Not found' });
    }
    
    // Build target URL
    const targetUrl = `${GlobalConfig.odn_api.base}/${path}`;
    const queryParams = _.extend({}, req.query, {
        app_token: GlobalConfig.app_token
    });
    
    // Make the request to the ODN API
    const options = {
        uri: targetUrl,
        qs: queryParams,
        json: true,
        headers: {
            'User-Agent': 'OpenDataNetwork.com'
        }
    };
    
    request(options)
        .then(response => {
            res.json(response);
        })
        .catch(error => {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal Server Error';
            res.status(statusCode).json({ error: message });
        });
};