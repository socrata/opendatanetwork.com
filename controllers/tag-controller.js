var CacheController = require('./cache-controller');
var fs = require('fs');

var cacheController = new CacheController();
var tagMetadataKey = "tag-metadata";
var emptyMetadata = { "description" : "", "icon" : "fa-database", "showcase" : [] };

module.exports = TagController;

function TagController() {
};

// Public methods
//
TagController.prototype.attachTagMetadata = function(tags, completionHandler) {

    this.getTagMetadata(function(metadata) {

        attachMetadata(tags, metadata);
        if (completionHandler) completionHandler(tags);
    });
};

TagController.prototype.getTagMetadata = function(completionHandler) {

    cacheController.get(tagMetadataKey, function(o) {

        if (o == undefined) {

            fs.readFile(__dirname + '/../data/tag-metadata.json', function(err, data) {

                if (err && (data == undefined)) {
                    if (completionHandler) completionHandler();
                }

                var metadata = JSON.parse(data);

                cacheController.set(tagMetadataKey, metadata, function() {

                    if (completionHandler) completionHandler(metadata);
                });
            });

            return;
        }

        if (completionHandler) completionHandler(o);
    });  
};

TagController.prototype.getCurrentTag = function(params, tagResults) {

    if (params.tags.length != 1)
        return null;

    for (var i in tagResults.results) {

        var result = tagResults.results[i];

        if (result.tag == params.tags[0].toLowerCase())
            return result;
    }

    return null;
};

// Private functions
//
function attachMetadata(tags, metadata) {

    tags.results.forEach(function(result) {

        var o = metadata[result.tag];
        result.metadata = (o != null)  ? o : emptyMetadata;
    });
}
