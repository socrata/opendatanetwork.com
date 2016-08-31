'use strict';
const _ = require('lodash');

class UrlUtil {
    static addHttp(domain) {
        if (_.isUndefined(domain)) {
            return domain;
        }
        if (!_.isEmpty(domain) && !/^https?:\/\//i.test(domain)) {
            let url = '';

            if (/^mailto:/i.test(domain)) {
                url = domain;
            } else {
                url = 'http://' + domain;
            }

            return url;
        } else {
            return domain;
        }
    }
}

module.exports = UrlUtil;
