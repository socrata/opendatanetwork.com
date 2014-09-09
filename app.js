var express = require('express');
var app = express();
var fs = require('fs');
var pg = require('pg');
var favicon = require('serve-favicon');
var helmet = require('helmet');

// Set X-Frame-Options header
//
app.use(helmet.xframe('deny'));


// Set up static folders
//
app.use('/data', express.static(__dirname + '/data'));
app.use('/images', express.static(__dirname + '/images'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/scripts', express.static(__dirname + '/scripts/compressed'));
app.use('/styles', express.static(__dirname + '/styles/compressed'));

app.use(favicon(__dirname + '/images/favicon.ico'));


// Set up app data
//
fs.readFile(__dirname + '/data/tiles.json', function(err, data) {
    app.locals.columns = JSON.parse(data);
});
fs.readFile(__dirname + '/data/slides.json', function(err, data) {
    app.locals.slides = JSON.parse(data);
});


// Set up routes
//
app.get('/', function(req, res) {
    app.locals.css = 'home.min.css';
    res.render('home.ejs');
});

app.get('/explore', function(req, res) {
    app.locals.css = 'explore.min.css';
    res.render('explore.ejs');
});

app.get('/census', function(req, res) {
    app.locals.css = 'census.min.css';
    
    var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/census';
    var client = new pg.Client(connectionString);
    var results = [];
    
    client.connect();

    var query = client.query("SELECT * FROM documents ORDER BY portal_title;");
    
    query.on('row', function(row) {
        results.push(
            { 
                portal_title: row.portal_title,
                portal_url: row.portal_url,
                housing: row.housing,
                restaurant_inspections: row.restaurant_inspections,
                transit: row.transit,
                health: row.health,
                crime: row.crime,
                permits: row.permits
            });
    });

    query.on('end', function() { 
        client.end(); 
        res.render('census.ejs', { results: results });
    });
});

app.get('/articles/:article', function(req, res) {
    app.locals.css = 'article.min.css';
    app.locals.modal = false;
    res.render('articles/' + req.params.article + '.ejs');
});

app.get('/modal/:article', function(req, res) {
    app.locals.css = 'modal.min.css';
    app.locals.modal = true;
    res.render('articles/' + req.params.article + '.ejs');
});

app.get('/google0679b96456cb5b3a.html', function(req, res) {
    res.render('static/google0679b96456cb5b3a.ejs');
});


// Start listening
//
var port = Number(process.env.PORT || 3000);

app.listen(port);
console.log('app is listening on ' + port);