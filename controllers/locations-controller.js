var CacheController = require('./cache-controller');
var fs = require('fs');

var cacheController = new CacheController();
var key = "locations";

module.exports = LocationsController;

function LocationsController() {
};

// Public methods
//
LocationsController.prototype.getLocations = function(completionHandler) {

    cacheController.get(key, function(o) {

        if (o == undefined) {

            fs.readFile(__dirname + '/../data/locations.json', function(err, data) {

                if (err && (data == undefined)) {
                    if (completionHandler) completionHandler();
                }

                var locations = JSON.parse(data);

                cacheController.set(key, locations, function() {

                    if (completionHandler) completionHandler(locations);
                });
            });

            return;
        }

        if (completionHandler) completionHandler(o);
    });  
};
