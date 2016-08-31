'use strict';

class SearchHelper {
    static regionToUrlSegment(name) {
        return name.replace(/ /g, '_').replace(/\//g, '_').replace(/,/g, '');
    }

}

module.exports = SearchHelper;
