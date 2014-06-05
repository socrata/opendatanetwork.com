var _pg = require('pg');
var _fs = require('fs');
var _request = require('superagent');

var _connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/census';
var _portals;
var _queries = ['housing', 'restaurant inspections', 'transit', 'health', 'crime', 'permits'];
var _portalIndex = 22;
var _queryIndex = 0;

function next()
{
    // If at end of queries, move to next base url and reset query index
    //
    if (_queryIndex == _queries.length - 1)
    {
        upsert(_portalIndex);

        // If at end of urls, then stop
        //
        if (_portalIndex == _portals.length - 1)
            return;

         _queryIndex = 0;
         _portalIndex++;
    }
    else
    {
        _queryIndex++;
    }

    makeRequest(_portalIndex, _queryIndex);
}

function makeRequest(portalIndex, queryIndex) 
{
    var portal = _portals[portalIndex];

    console.log('makeRequest ' + portal.url + ' ' + portalIndex + ' ' + queryIndex + ' ');

    try 
    {
        _request.get(portal.url + '/api/search/views.json')
            .query({ q: _queries[queryIndex] })
            .query({ limit: '1' })
            .end(function(err, res) {

                if (err)
                {
                    console.error('Could not make request to ' + portal.url, err);
                    next();
                    return;
                }

                if (res.ok) 
                {
                    console.log(' count : ' + res.body.count);
                    portal.data[queryIndex] = res.body.count;
                } 
                else 
                {
                    console.log(res.status);
                }

                next();
            });
    } 
    catch (ex)
    {
        console.log ('*****  Exception Throw for portal.url ' + portal.url);
        next();
    }
}

function upsert(portalIndex)
{
    var portal = _portals[portalIndex];
    var client = new _pg.Client(_connectionString);
    
    console.log('upsert ' + portal.url + ' ' + portal.data[0] + ' ' + portal.data[1] + ' ' + portal.data[2] + ' ' + portal.data[3]+ ' ' + portal.data[4] + ' ' + portal.data[5]);

    client.connect(function(err) {
    
        if (err)
            return console.error('Could not connect to postgres', err);

        client.query(
        {
            text: 'UPDATE documents SET portal_title = $2, housing = $3, restaurant_inspections = $4, transit = $5, health = $6, crime = $7, permits = $8 WHERE portal_url = $1', 
            values: [portal.url, portal.title, portal.data[0], portal.data[1], portal.data[2], portal.data[3], portal.data[4], portal.data[5]]
        },
        function(err, result) {

            if (err) 
                return console.error('error running update', err);

            // If nothing was updated, then insert it
            //
            if (result.rowCount == 0)
            {
                client.query(
                {
                    text: 'INSERT INTO documents (portal_url, portal_title, housing, restaurant_inspections, transit, health, crime, permits) VALUES ($1 , $2, $3, $4, $5, $6, $7, $8)', 
                    values: [portal.url, portal.title, portal.data[0], portal.data[1], portal.data[2], portal.data[3], portal.data[4], portal.data[5]]
                },
                function(err, result) {

                    if (err) 
                        return console.error('error running insert', err);

                    client.end();
                });
            }
            else
            {
                client.end();
            }
        });
    });
}

// Begin
//
_fs.readFile(
    __dirname + '/../data/portals.json', 
    function(err, data) {

        if (err)
            return console.error('error during readFile', err);

        _portals = JSON.parse(data).portals;

        // Create the data array to hold the document counts for each category.
        //
        for (var i in _portals)
        {
            _portals[i].data = [0, 0, 0, 0, 0, 0];
        }

        //_portals.length = 1;

        makeRequest(_portalIndex, _queryIndex);
    });
