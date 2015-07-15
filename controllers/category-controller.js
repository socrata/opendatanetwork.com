var CacheController = require('./cache-controller');
var fs = require('fs');

var categoriesKey = "categories";
var cacheController = new CacheController();

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

    cacheController.get(categoriesKey, function(o) {

        if (o == undefined) {

            fs.readFile(__dirname + '/../data/categories.json', function(err, data) {

                if (err && (data == undefined)) {

                    if (completionHandler) completionHandler();
                }

                var categories = JSON.parse(data);

                cacheController.set(categoriesKey, categories, function(categories) {

                    if (completionHandler) completionHandler(categories);
                });
            });

            return;
        }

        if (completionHandler) completionHandler(o);
    });
};

CategoryController.prototype.getSelectedCategory = function(req, params, completionHandler) {

    if ((params.q != "") || (params.categories.length != 1)) {

        if (completionHandler) completionHandler();
        return;
    }

    if (req.cookies['selected-category-hidden'] == '1') {

        if (completionHandler) completionHandler();
        return;
    }

    this.getCategory(params.categories[0], completionHandler);
};
