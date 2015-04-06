var _request = require('request');
var _searchUrl = 'http://api.us.socrata.com/api/catalog/v1?q=';

module.exports = SearchController;

function SearchController() {
};

// Public methods
//
SearchController.prototype.search = function(q, completionHandler) {

    var url = _searchUrl + encodeURIComponent(q);

    _request(
        url, 
        function(err, resp, html) {

            if (err) {
             
                console.log('Could not connect to Socrata');

                if (completionHandler)
                    completionHandler(null);

                return;
            }
            
            if (completionHandler) 
                completionHandler(JSON.parse(resp.body));
        });
}