var NodeCache = require('node-cache');

var nodeCache = new NodeCache();
var ttl = 60 * 60; // seconds

module.exports = CacheController;

function CacheController() {
};

// Public methods
//
CacheController.prototype.get = function(key, completionHandler) {

    nodeCache.get(key, function(err, o) {

        if (err || (o == undefined)) {

            if (completionHandler) completionHandler();
            return;
        }

        console.log('Get from cache: ' + key);
        if (completionHandler) completionHandler(o);
    });
};

CacheController.prototype.set = function(key, o, completionHandler) {

    nodeCache.set(key, o, ttl, function(err, success) {

        if (err || !success) {

            if (completionHandler) completionHandler();
            return;
        }

        console.log('Set in cache: ' + key);
        if (completionHandler) completionHandler(o);
    });
}
