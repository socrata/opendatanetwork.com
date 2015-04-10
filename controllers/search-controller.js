var _request = require('request');
var _searchUrl = 'http://api.us.socrata.com/api/catalog/v1?only=datasets&q=';

module.exports = SearchController;

function SearchController() {
};

// Public methods
//
SearchController.prototype.search = function(q, completionHandler) {

    var options = {
        url: _searchUrl + encodeURIComponent(q),
        headers: {
            'User-Agent' : 'www.opendatanetwork.com'
        }
    };

    _request(
        options, 
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