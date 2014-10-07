var _pg = require('pg');
var _fs = require('fs');
var _connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/odn';
var _request = require('request');
var _portalIndex = 0;
var _portals;
var _datasetIndex = 0;
var _datasets;
var _descriptionSize = 500;

function next()
{
    // If at end of datasets, move to next portal url and reset dataset index
    //
    if (_datasetIndex < _datasets.length - 1) {

        upsert(_datasetIndex);
        return;
    }

    if (_portalIndex == _portals.length - 1) {

        console.log('Done');
        return;
    }

    _portalIndex++;
    _datasetIndex = 0;

    makeRequest(_portalIndex);
}

function makeRequest(portalIndex) 
{
    var portal = _portals[portalIndex];

    _datasets = [];

    try 
    {
        var url = portal.url + '/api/search/views.json?sortBy=MOST_ACCESSED&limit=100';
        console.log('makeRequest - ' + url);

        _request(
            {
                'url' : url
            }, 
            function (error, response, body) {
        
                if (error) {

                    console.log(error);
                    next();
                    return;
                }

                if (response.statusCode == 200) {

                    var o = JSON.parse(body);
                    var results = o.results;

                    for (var i = 0; i < results.length; i++) {

                        var view = results[i].view;
                        var description = view.description || '';

                        description = description.trim();

                        if (description.length > _descriptionSize)
                            description = description.substring(0, _descriptionSize - 3) + '...';
    
                        _datasets.push(
                        {
                            'datasetUrl' : portal.url + '/w/' + view.id,
                            'description' : description,
                            'identifier' : view.id,
                            'name' :  view.name,
                            'portalTitle' : portal.title,
                            'portalUrl' : portal.url,
                            'viewCount' : view.viewCount
                        });
                    }
                }

                next();
            });
    } 
    catch (ex) {

        console.log(ex);
    }
}

function upsert(datasetIndex)
{
    var dataset = _datasets[datasetIndex];
    var client = new _pg.Client(_connectionString);
    
    console.log('upsert - ' + dataset.datasetUrl + ' ' + dataset.viewCount);

    client.connect(function(err) {
    
        if (err)
            return console.error('Could not connect to postgres', err);

        client.query(
        {
            text: 'UPDATE datasets SET description = $2, name = $3, view_count = $4 WHERE identifier = $1', 
            values: [dataset.identifier, dataset.description, dataset.name, dataset.viewCount]
        },
        function(err, result) {

            if (err) {
             
                console.error('error running update', err);

                _datasetIndex++;
                next();
                return;
            }

            // If nothing was updated, then insert it
            //
            if (result.rowCount > 0) {

                client.end();

                _datasetIndex++;
                next();
                return;
            }

            client.query(
            {
                text: 'INSERT INTO datasets (dataset_url, description, identifier, name, portal_title, portal_url, view_count) VALUES ($1, $2, $3, $4, $5, $6, $7)', 
                values: [dataset.datasetUrl, dataset.description, dataset.identifier, dataset.name, dataset.portalTitle, dataset.portalUrl, dataset.viewCount]
            },
            function(err, result) {

                if (err) 
                    console.error('error running insert', err);

                client.end();

                _datasetIndex++;
                next();
            });
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

        makeRequest(_portalIndex);
    });
