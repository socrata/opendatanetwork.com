var pg = require('pg');
var numeral = require('numeral');

module.exports = PortalController;

function PortalController() {
};

// Public methods
//
PortalController.prototype.getPortals = function(completionHandler) {

    var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/odn';
    var client = new pg.Client(connectionString);
    var results = [];
    
    client.connect();

    var query = client.query('SELECT * FROM portals ORDER BY title;');
    
    query.on('row', function(row) {

        results.push(
            { 
                title : row.title,
                url : row.url,
                housing : row.housing,
                restaurant_inspections : row.restaurant_inspections,
                transit : row.transit,
                health : row.health,
                crime : row.crime,
                permits : row.permits,
                population : row.population ? '(pop: ' + numeral(row.population).format('0,0') + ')' : '',
                description : row.description
            });
    });

    query.on('end', function() { 

        client.end(); 

        if (completionHandler)
            completionHandler(results);
    });
}
