var CategoriesController = require('./controllers/category-controller');
var DatasetController = require('./controllers/dataset-controller');
var PortalController = require('./controllers/portal-controller');
var SearchController = require('./controllers/search-controller');

var express = require('express');
var fs = require('fs');
var favicon = require('serve-favicon');
var helmet = require('helmet');

var categoriesController = new CategoriesController();
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
app.get('/explore-open-data', function(req, res) {

    res.locals.css = 'explore.min.css';
    res.locals.title = 'Explore the Open Data Network.';
    res.render('explore.ejs');
});

app.get('/open-data-census', function(req, res) {

    portalController.getPortals(function(results) {

        res.locals.css = 'census.min.css';
        res.locals.title = 'Visit Open Data Network portals and datasets in common data categories.';
        res.render('census.ejs', { results: results });
    });
});

app.get('/popular-open-datasets', function(req, res) {

    datasetController.getPopularDatasets(function(results) {

        res.locals.css = 'popular.min.css';
        res.locals.title = 'Visit the all-time, most-viewed open datasets from the Open Data Network.';
        res.render('popular.ejs', { results: results });
    });
});

app.get('/join-open-data-network/complete', function(req, res) {

    res.locals.css = 'join-complete.min.css';
    res.locals.title = 'Thanks for joining the Open Data Network.';
    res.render('join-complete.ejs');
});

app.get('/join-open-data-network', function(req, res) {

    res.locals.css = 'join.min.css';
    res.locals.title = 'Join the Open Data Network.';
    res.render('join.ejs');
});

app.get('/articles/:article', function(req, res) {

    res.locals.css = 'article.min.css';
    res.locals.modal = false;
    res.render('articles/' + req.params.article + '.ejs');
});

app.get('/modal/:article', function(req, res) {

    res.locals.css = 'modal.min.css';
    res.locals.modal = true;
    res.render('articles/' + req.params.article + '.ejs');
});

app.get('/google0679b96456cb5b3a.html', function(req, res) {

    res.render('static/google0679b96456cb5b3a.ejs');
});

// V2 homepage
//
app.get('/', function (req, res) {

    var params = searchController.getSearchParameters(req.query);
    res.render(
        'v2-home.ejs', 
        {
            css : ['/styles/v2-home.min.css', '//cdn.jsdelivr.net/jquery.slick/1.5.0/slick.css'], 
            scripts : ['/scripts/v2-home.min.js', '//cdn.jsdelivr.net/jquery.slick/1.5.0/slick.min.js'], 
            params : params 
        });
})

app.get('/v2-search', function(req, res) {

    var params = searchController.getSearchParameters(req.query);

    searchController.search(params, function(data) {

        res.render(
            'v2-search.ejs', 
            {
                css : ['/styles/v2-search.min.css'], 
                scripts : ['/scripts/v2-search.min.js'], 
                params : params, 
                data : data 
            });
    });
});

// V3 homepage
//
app.get('/v3', function (req, res) {

    var params = searchController.getSearchParameters(req.query);

    categoriesController.getCategories(function(categories) {

        res.render(
            'v3-home.ejs', 
            { 
                css : ['/styles/v3-home.min.css', '//cdn.jsdelivr.net/jquery.slick/1.5.0/slick.css'],
                scripts : ['/scripts/v3-home.min.js', '//cdn.jsdelivr.net/jquery.slick/1.5.0/slick.min.js'],
                params : params,
                categories : categories,
            });
    });
});

app.get('/v3-search', function(req, res) {

    var params = searchController.getSearchParameters(req.query);

    categoriesController.getCategories(function(categories) {

        searchController.getCategories(10, function(categoryResults) {

            searchController.getDomains(10, function(domainResults) {

                searchController.getTags(10, function(tagResults) {

                    searchController.search(params, function(searchResults) {

                        res.render(
                            'v3-search.ejs', 
                            { 
                                css : ['/styles/v3-search.min.css'],
                                scripts : ['/scripts/v3-search.min.js'],
                                params : params,
                                searchResults : searchResults,
                                categoryResults : categoryResults,
                                domainResults : domainResults,
                                tagResults : tagResults,
                                categories : categories,
                            });
                    });
                });
            });
        });
    });
});

// Start listening
//
var port = Number(process.env.PORT || 3000);

app.listen(port);
console.log('app is listening on ' + port);
