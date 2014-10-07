var pg = require('pg');
var numeral = require('numeral');

module.exports = DatasetController;

function DatasetController() {
};

// Public methods
//
DatasetController.prototype.getPopularDatasets = function(completionHandler) {

    var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/odn';
    var client = new pg.Client(connectionString);
    var results = [];
    
    client.connect();

    var query = client.query('SELECT * FROM datasets ORDER BY view_count DESC;');
    
    query.on('row', function(row) {

        results.push(
            { 
                datasetUrl : row.dataset_url,
                description : row.description,
                name : row.name,
                portalTitle : row.portal_title,
                portalUrl : row.portal_url,
                viewCount : row.view_count,
                viewCountString : numeral(row.view_count).format('0,0')
            });
    });

    query.on('end', function() { 

        client.end(); 

        if (completionHandler)
            completionHandler(results);
    });
}
