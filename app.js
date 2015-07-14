var CategoryController = require('./controllers/category-controller');
var DatasetController = require('./controllers/dataset-controller');
var PortalController = require('./controllers/portal-controller');
var SearchController = require('./controllers/search-controller');

var _cookieParser = require('cookie-parser')
var _express = require('express');
var _fs = require('fs');
var _favicon = require('serve-favicon');
var _helmet = require('helmet');

var _categoryController = new CategoryController();
var _portalController = new PortalController();
var _datasetController = new DatasetController();
var _searchController = new SearchController();
var _app = _express();

// Cookie parser
//
_app.use(_cookieParser())

// Set X-Frame-Options header
//
_app.use(_helmet.xframe('deny'));

// Set up static folders
//
_app.use('/data', _express.static(__dirname + '/data'));
_app.use('/images', _express.static(__dirname + '/images'));
_app.use('/jquery', _express.static(__dirname + '/node_modules/jquery/dist'));
_app.use('/scripts', _express.static(__dirname + '/scripts/compressed'));
_app.use('/styles', _express.static(__dirname + '/styles/compressed'));
_app.use(_favicon(__dirname + '/images/favicon.ico'));

// Set up app data
//
_fs.readFile(__dirname + '/data/tiles.json', function(err, data) {

    _app.locals.columns = JSON.parse(data);
});

_fs.readFile(__dirname + '/data/slides.json', function(err, data) {

    _app.locals.slides = JSON.parse(data);
});

// Set up 301 redirects for old routes
//
_app.get('/census', function(req, res) {

    res.redirect(301, '/open-data-census');
});

_app.get('/explore', function(req, res) {

    res.redirect(301, '/explore-open-data');
});

_app.get('/join', function(req, res) {

    res.redirect(301, '/join-open-data-network');
});

_app.get('/join/complete', function(req, res) {

    res.redirect(301, '/join-open-data-network/complete');
});

_app.get('/popular', function(req, res) {

    res.redirect(301, '/popular-open-datasets');
});

// Set up routes
//
_app.get('/explore-open-data', function(req, res) {

    res.locals.css = 'explore.min.css';
    res.locals.title = 'Explore the Open Data Network.';
    res.render('explore.ejs');
});

_app.get('/open-data-census', function(req, res) {

    _portalController.getPortals(function(results) {

        res.locals.css = 'census.min.css';
        res.locals.title = 'Visit Open Data Network portals and datasets in common data categories.';
        res.render('census.ejs', { results: results });
    });
});

_app.get('/popular-open-datasets', function(req, res) {

    _datasetController.getPopularDatasets(function(results) {

        res.locals.css = 'popular.min.css';
        res.locals.title = 'Visit the all-time, most-viewed open datasets from the Open Data Network.';
        res.render('popular.ejs', { results: results });
    });
});

_app.get('/join-open-data-network/complete', function(req, res) {

    res.locals.css = 'join-complete.min.css';
    res.locals.title = 'Thanks for joining the Open Data Network.';
    res.render('join-complete.ejs');
});

_app.get('/join-open-data-network', function(req, res) {

    res.locals.css = 'join.min.css';
    res.locals.title = 'Join the Open Data Network.';
    res.render('join.ejs');
});

_app.get('/articles/:article', function(req, res) {

    res.locals.css = 'article.min.css';
    res.locals.modal = false;
    res.render('articles/' + req.params.article + '.ejs');
});

_app.get('/modal/:article', function(req, res) {

    res.locals.css = 'modal.min.css';
    res.locals.modal = true;
    res.render('articles/' + req.params.article + '.ejs');
});

_app.get('/google0679b96456cb5b3a.html', function(req, res) {

    res.render('static/google0679b96456cb5b3a.ejs');
});

// V2 homepage
//
_app.get('/', function (req, res) {

    var params = _searchController.getSearchParameters(req.query);
    res.render(
        'v2-home.ejs', 
        {
            css : ['/styles/v2-home.min.css', '//cdn.jsdelivr.net/jquery.slick/1.5.0/slick.css'], 
            scripts : ['/scripts/v2-home.min.js', '//cdn.jsdelivr.net/jquery.slick/1.5.0/slick.min.js'], 
            params : params 
        });
})

_app.get('/v2-search', function(req, res) {

    var params = _searchController.getSearchParameters(req.query);

    _searchController.search(params, function(data) {

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
_app.get('/v3', function (req, res) {

    var params = _searchController.getSearchParameters(req.query);

    _categoryController.getCategories(function(categories) {

        // Set the tooltips shown cookie
        //
        res.cookie('tooltips-shown', '1', { expires: new Date(Date.now() + (1 * 24 * 60 * 60 * 1000)), httpOnly: true }); // one day

        // Render page
        //
        res.render(
            'v3-home.ejs', 
            { 
                css : ['/styles/v3-home.min.css', '//cdn.jsdelivr.net/jquery.slick/1.5.0/slick.css'],
                scripts : ['/scripts/v3-home.min.js', '//cdn.jsdelivr.net/jquery.slick/1.5.0/slick.min.js'],
                params : params,
                categories : categories,
                tooltips : (req.cookies['tooltips-shown'] != '1'),
            });

    });
});

_app.get('/v3-search', function(req, res) {

    var defaultFilterCount = 10;
    var params = _searchController.getSearchParameters(req.query);

    _categoryController.getCategories(function(categories) {

        _categoryController.getSelectedCategory(params, function(selectedCategory) {

            var categoryCount = params.ec ? null : defaultFilterCount;
            _searchController.getCategories(categoryCount, function(categoryResults) {

                var domainCount = params.ed ? null : defaultFilterCount;
                _searchController.getDomains(domainCount, function(domainResults) {

                    var tagCount = params.et ? null : defaultFilterCount;
                    _searchController.getTags(tagCount, function(tagResults) {

                        _searchController.search(params, function(searchResults) {

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
                                    selectedCategory : selectedCategory,
                                    tooltips : false,
                                });
                        });
                    });
                });
            });
        });
    });
});

_app.get('/v3-search-results', function(req, res) {

    var params = _searchController.getSearchParameters(req.query);

    _searchController.search(params, function(searchResults) {

        console.log(searchResults.results.length);

        if (searchResults.results.length == 0) {

            res.status(204);
            res.end();
            return;
        }

        res.render(
            'v3-search-results.ejs',
            {
                css : [],
                scripts : [],
                params : params,
                searchResults : searchResults,
            });
    });
});

// Start listening
//
var port = Number(process.env.PORT || 3000);

_app.listen(port);
console.log('app is listening on ' + port);
