var NodeCache = require('node-cache');

var _nodeCache = new NodeCache();
var _ttl = 60 * 60; // seconds

module.exports = CacheController;

function CacheController() {
};

// Public methods
//
CacheController.prototype.get = function(key, completionHandler) {

    _nodeCache.get(key, function(err, o) {

        if (err || (o == undefined)) {

            if (completionHandler) completionHandler();
            return;
        }

        console.log('Get from cache: ' + key);
        if (completionHandler) completionHandler(o);
    });
};

CacheController.prototype.set = function(key, o, completionHandler) {

    _nodeCache.set(key, o, _ttl, function(err, success) {

        if (err || !success) {

            if (completionHandler) completionHandler();
            return;
        }

        console.log('Set in cache: ' + key);
        if (completionHandler) completionHandler(o);
    });
}
