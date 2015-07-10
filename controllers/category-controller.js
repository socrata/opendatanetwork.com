var CacheController = require('./cache-controller');

var _cacheController = new CacheController();
var _fs = require('fs');
var _key = "categories";

module.exports = CategoryController;

function CategoryController() {
};

// Public methods
//
CategoryController.prototype.getCategory = function(title, completionHandler) {

    _cacheController.getCategories(function(results) {

        if (completionHandler) completionHandler(results[title]);
    });
};

CategoryController.prototype.getCategories = function(completionHandler) {

    _cacheController.get(_key, function(o) {

        if (o == undefined) {

            _fs.readFile(__dirname + '/../data/categories.json', function(err, data) {

                if (err && (data == undefined)) {

                    if (completionHandler) completionHandler();
                }

                var oo = JSON.parse(data);
                _cacheController.set(_key, oo, function(oo) {

                    var results = convertCategoriesToArray(oo);
                    if (completionHandler) completionHandler(results);
                });
            });

            return;
        }

        var results = convertCategoriesToArray(o);
        if (completionHandler) completionHandler(results);
    });
};

function convertCategoriesToArray(o) {

    var results = [];

    for (var key in o) {
        results.push(o[key]);
    }
    
    return results;    
}
