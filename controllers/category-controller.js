var CacheController = require('./cache-controller');
var fs = require('fs');

var cacheController = new CacheController();
var categoryMetadataKey = "category-metadata";
var emptyMetadata = { "description" : "", "icon" : "fa-database", "showcase" : [] };

module.exports = CategoryController;

function CategoryController() {
};

// Public methods
//
CategoryController.prototype.attachCategoryMetadata = function(categories, completionHandler) {

    this.getCategoryMetadata(function(metadata) {

        attachMetadata(categories, metadata);
        if (completionHandler) completionHandler(categories);
    });
};

CategoryController.prototype.getCategoryMetadata = function(completionHandler) {

    cacheController.get(categoryMetadataKey, function(o) {

        if (o == undefined) {

            fs.readFile(__dirname + '/../data/category-metadata.json', function(err, data) {

                if (err && (data == undefined)) {
                    if (completionHandler) completionHandler();
                }

                var metadata = JSON.parse(data);

                cacheController.set(categoryMetadataKey, metadata, function() {

                    if (completionHandler) completionHandler(metadata);
                });
            });

            return;
        }

        if (completionHandler) completionHandler(o);
    });  
};

CategoryController.prototype.getCurrentCategory = function(params, categoryResults) {

    if ((params.q != "") || (params.categories.length != 1))
        return null;

    for (var i in categoryResults.results) {

        var result = categoryResults.results[i];

        if (result.category == params.categories[0].toLowerCase())
            return result;
    }

    return null;
};

CategoryController.prototype.getShowcaseForCurrentCategory = function(params, categoryResults, completionHandler) {

    var currentCategory = this.getCurrentCategory(params, categoryResults);

    // If there is a current category and it has a non-empty showcase return it
    //
    if ((currentCategory != null) && (currentCategory.metadata.showcase.length > 0)) {

        if (completionHandler) completionHandler(currentCategory.metadata.showcase);
        return;
    }

    this.getCategoryMetadata(function(metadata) {

       if (metadata == null) {

           // Return an empty showcase
           //
           if (completionHandler) completionHandler([]);
           return;
       }

       // Return the default showcase
       //
       if (completionHandler) completionHandler(metadata.default.showcase);
    });
};

// Private functions
//
function attachMetadata(categories, metadata) {

    categories.results.forEach(function(result) {

        var o = metadata[result.category];
        result.metadata = (o != null)  ? o : emptyMetadata;
    });
}
