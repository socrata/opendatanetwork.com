var CacheController = require('./cache-controller');
var fs = require('fs');

var cacheController = new CacheController();
var cacheKey = "synonyms";

module.exports = SynonymController;

function SynonymController() {
};

// Public methods
//
SynonymController.prototype.getSynonyms = function(q, completionHandler) {

    SynonymController.prototype.getSynonymsArray(function(synonymsArray) {

        var key = q.toLowerCase().trim();

        // If empty, just call the completion handler with an empty array
        //
        if (key.length == 0) {
            
            if (completionHandler) completionHandler([]);
            return;
        }

        for (var i in synonymsArray) {

            var synonymObject = synonymsArray[i];

            // Is the key found on the synonym object?
            //
            if (synonymObject[key] == undefined) 
                continue;

            // It is!
            //
            if (completionHandler) completionHandler(Object.keys(synonymObject));
            return;
        }

        // The query had no synonyms, so just put it in an array by itself, and call the completion handler
        //
        if (completionHandler) completionHandler([q]);
    });
};

SynonymController.prototype.getSynonymsArray = function(completionHandler) {

    cacheController.get(cacheKey, function(o) {

        if (o == undefined) {

            fs.readFile(__dirname + '/../data/synonyms.json', function(err, data) {

                if (err && (data == undefined)) {
                    if (completionHandler) completionHandler();
                }

                var o = JSON.parse(data);

                cacheController.set(cacheKey, o, function() {

                    if (completionHandler) completionHandler(o);
                });
            });

            return;
        }

        if (completionHandler) completionHandler(o);
    });  
};
