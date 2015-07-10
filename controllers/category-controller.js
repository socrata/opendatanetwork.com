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

    this.getCategories(function(results) {

        for (var i in results) {

            var result = results[i];

            if (result.title.toLowerCase() == title) {

                if (completionHandler) completionHandler(result);
                return;
            }
        }

        if (completionHandler) completionHandler();
    });
};

CategoryController.prototype.getCategories = function(completionHandler) {

    _cacheController.get(_key, function(o) {

        if (o == undefined) {

            _fs.readFile(__dirname + '/../data/categories.json', function(err, data) {

                if (err && (data == undefined)) {

                    if (completionHandler) completionHandler();
                }

                var categories = JSON.parse(data);

                _cacheController.set(_key, categories, function(categories) {

                    if (completionHandler) completionHandler(categories);
                });
            });

            return;
        }

        if (completionHandler) completionHandler(o);
    });
};

CategoryController.prototype.getSelectedCategory = function(params, completionHandler) {

    if ((params.q != "") || (params.categories.length != 1)) {

        if (completionHandler) completionHandler();
        return;
    }

    this.getCategory(params.categories[0], completionHandler);
};
