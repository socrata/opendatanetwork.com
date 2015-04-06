var DatasetController = require('./controllers/dataset-controller');
var PortalController = require('./controllers/portal-controller');
var SearchController = require('./controllers/search-controller');

var express = require('express');
var fs = require('fs');
var favicon = require('serve-favicon');
var helmet = require('helmet');

var portalController = new PortalController();
var datasetController = new DatasetController();
var searchController = new SearchController();
var app = express();

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


// Set up 301 redirects for old routes
//
app.get('/census', function(req, res) {

    res.redirect(301, '/open-data-census');
});

app.get('/explore', function(req, res) {

    res.redirect(301, '/explore-open-data');
});

app.get('/join', function(req, res) {

    res.redirect(301, '/join-open-data-network');
});

app.get('/join/complete', function(req, res) {

    res.redirect(301, '/join-open-data-network/complete');
});

app.get('/popular', function(req, res) {

    res.redirect(301, '/popular-open-datasets');
});

// Set up routes
//
app.get('/', function(req, res) {

    app.locals.css = 'home.min.css';
    app.locals.title = 'Introducing the Open Data Network the new hub for the vibrant and growing open data ecosystem.';
    res.render('home.ejs');
});

app.get('/explore-open-data', function(req, res) {

    app.locals.css = 'explore.min.css';
    app.locals.title = 'Explore the Open Data Network.';
    res.render('explore.ejs');
});

app.get('/open-data-census', function(req, res) {

    portalController.getPortals(function(results) {

        app.locals.css = 'census.min.css';
        app.locals.title = 'Visit Open Data Network portals and datasets in common data categories.';
        res.render('census.ejs', { results: results });
    });
});

app.get('/popular-open-datasets', function(req, res) {

    datasetController.getPopularDatasets(function(results) {

        app.locals.css = 'popular.min.css';
        app.locals.title = 'Visit the all-time, most-viewed open datasets from the Open Data Network.';
        res.render('popular.ejs', { results: results });
    });
});

app.get('/join-open-data-network/complete', function(req, res) {

    app.locals.css = 'join-complete.min.css';
    app.locals.title = 'Thanks for joining the Open Data Network.';
    res.render('join-complete.ejs');
});

app.get('/join-open-data-network', function(req, res) {

    app.locals.css = 'join.min.css';
    app.locals.title = 'Join the Open Data Network.';
    res.render('join.ejs');
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

// Beta homepage
//
app.get('/beta', function(req, res) {

    if (req.query.q) {

        searchController.search(req.query.q, function(data) {

            res.render('search.ejs', { q : req.query.q, data : data });
        });
    }
    else {

        res.render('search.ejs', { q : null, data : null });
    }
});


// Start listening
//
var port = Number(process.env.PORT || 3000);

app.listen(port);
console.log('app is listening on ' + port);
