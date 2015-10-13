var ApiController = require('./controllers/api-controller');
var CategoryController = require('./controllers/category-controller');
var TagController = require('./controllers/tag-controller');

var cookieParser = require('cookie-parser');
var express = require('express');
var favicon = require('serve-favicon');
var helmet = require('helmet');

var apiController = new ApiController();
var categoryController = new CategoryController();
var tagController = new TagController();
var app = express();

// Cookie parser
//
app.use(cookieParser());

// Set X-Frame-Options header
//
app.use(helmet.xframe('deny'));

// Set up static folders
//
app.use('/images', express.static(__dirname + '/images'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/scripts', express.static(__dirname + '/scripts/compressed'));
app.use('/styles', express.static(__dirname + '/styles/compressed'));
app.use(favicon(__dirname + '/images/favicon.ico'));

// Set up static files
//
app.use('/maintenance.html', express.static(__dirname + '/views/static/maintenance.html'));
app.use('/google0679b96456cb5b3a.html', express.static(__dirname + '/views/static/google0679b96456cb5b3a.html'));
app.use('/robots.txt', express.static(__dirname + '/views/static/robots.txt'));
app.use('/error.html', express.static(__dirname + '/views/static/error.html'));

// Set up 301 redirects for old routes
//
app.get('/articles/*', function(req, res) { res.redirect(301, '/'); });
app.get('/census', function(req, res) { res.redirect(301, '/'); });
app.get('/explore', function(req, res) { res.redirect(301, '/'); });
app.get('/explore-open-data', function(req, res) { res.redirect(301, '/'); });
app.get('/modal/*', function(req, res) { res.redirect(301, '/'); });
app.get('/open-data-census', function(req, res) { res.redirect(301, '/'); });
app.get('/popular', function(req, res) { res.redirect(301, '/'); });
app.get('/join', function(req, res) { res.redirect(301, '/join-open-data-network'); });
app.get('/join/complete', function(req, res) { res.redirect(301, '/join-open-data-network/complete'); });

// Set up routes
//
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

app.get('/', function (req, res) {

    apiController.getCategoriesAll(function(allCategoryResults) {

        categoryController.attachCategoryMetadata(allCategoryResults, function(allCategoryResults) {

            // Set the tooltips shown cookie
            //
            res.cookie('tooltips-shown', '1', { expires: new Date(Date.now() + (1 * 24 * 60 * 60 * 1000)), httpOnly: true }); // one day

            // Get params
            //
            var params = apiController.getSearchParameters(req.query);

            // Render page
            //
            res.render(
                'v3-home.ejs', 
                {
                    css : ['/styles/v3-home.min.css', '//cdn.jsdelivr.net/jquery.slick/1.5.0/slick.css'],
                    scripts : [
                        '/scripts/v3-home.min.js', 
                        '//cdn.jsdelivr.net/jquery.slick/1.5.0/slick.min.js', 
                        {
                            'url' : '//fast.wistia.net/static/popover-v1.js',
                            'charset' : 'ISO-8859-1'
                        }],
                    params : params,
                    allCategoryResults : allCategoryResults,
                    tooltips : (req.cookies['tooltips-shown'] != '1'),
                });
        });
    }, function() { renderErrorPage(req, res); });
});

app.get('/search', function(req, res) {

    var defaultFilterCount = 10;
    var params = apiController.getSearchParameters(req.query);

    // Get all categories for the header menus
    //
    apiController.getCategoriesAll(function(allCategoryResults) {

        categoryController.attachCategoryMetadata(allCategoryResults, function(categoryResults) {

            // Get the current category
            //
            var currentCategory = categoryController.getCurrentCategory(params, allCategoryResults);

            // Get all tags
            //
            apiController.getTagsAll(function(allTagResults) {

                tagController.attachTagMetadata(allTagResults, function(tagResults) {

                    // Get the current tag
                    //
                    var currentTag = tagController.getCurrentTag(params, allTagResults);

                    // Get the categories for the filter menus
                    //
                    var filterCategoryCount = params.ec ? null : defaultFilterCount;
                    apiController.getCategories(filterCategoryCount, function(filterCategoryResults) {
        
                        // Get the domains for the filter menus
                        //
                        var domainCount = params.ed ? null : defaultFilterCount;
                        apiController.getDomains(domainCount, function(filterDomainResults) {
        
                            // Get the tags for the filter menus
                            //
                            var tagCount = params.et ? null : defaultFilterCount;
                            apiController.getTags(tagCount, function(filterTagResults) {
        
                                // Do the search
                                //
                                apiController.search(params, function(searchResults) {
        
                                    res.render(
                                        'v3-search.ejs', 
                                        { 
                                            css : ['/styles/v3-search.min.css'],
                                            scripts : ['/scripts/v3-search.min.js'],
                                            params : params,
                                            currentCategory : currentCategory,
                                            currentTag : currentTag,
                                            allCategoryResults : allCategoryResults,
                                            filterCategoryResults : filterCategoryResults,
                                            filterDomainResults : filterDomainResults,
                                            filterTagResults : filterTagResults,
                                            searchResults : searchResults,
                                            showcaseResults : [],
                                            tooltips : false,
                                        });
                                }, function() { renderErrorPage(req, res) }); // apiController.search
                            }, function() { renderErrorPage(req, res) }); // apiController.getTags
                        }, function() { renderErrorPage(req, res) }); // apiController.getDomains
                    }, function() { renderErrorPage(req, res) }); // apiController.getCategories
                }); // tagController.attachTagMetadata
            }, function() { renderErrorPage(req, res); }); // apiController.getTagsAll
        }); // categoryController.attachCategoryMetadata
    }, function() { renderErrorPage(req, res); }); // apiController.getCategoriesAll
});

app.get('/v4-search', function(req, res) {

    var defaultFilterCount = 10;
    var params = apiController.getSearchParameters(req.query);

    // Get all categories for the header menus
    //
    apiController.getCategoriesAll(function(allCategoryResults) {

        categoryController.attachCategoryMetadata(allCategoryResults, function(categoryResults) {

            // Get the current category
            //
            var currentCategory = categoryController.getCurrentCategory(params, allCategoryResults);

            // Get all tags
            //
            apiController.getTagsAll(function(allTagResults) {

                tagController.attachTagMetadata(allTagResults, function(tagResults) {

                    // Get the current tag
                    //
                    var currentTag = tagController.getCurrentTag(params, allTagResults);

                    // Get the categories for the filter menus
                    //
                    var filterCategoryCount = params.ec ? null : defaultFilterCount;
                    apiController.getCategories(filterCategoryCount, function(filterCategoryResults) {
        
                        // Get the domains for the filter menus
                        //
                        var domainCount = params.ed ? null : defaultFilterCount;
                        apiController.getDomains(domainCount, function(filterDomainResults) {
        
                            // Get the tags for the filter menus
                            //
                            var tagCount = params.et ? null : defaultFilterCount;
                            apiController.getTags(tagCount, function(filterTagResults) {
        
                                // Do the search
                                //
                                apiController.search(params, function(searchResults) {
        
                                    res.render(
                                        'v4-search.ejs', 
                                        { 
                                            css : ['/styles/v3-search.min.css'],
                                            scripts : ['/scripts/v3-search.min.js'],
                                            params : params,
                                            currentCategory : currentCategory,
                                            currentTag : currentTag,
                                            allCategoryResults : allCategoryResults,
                                            filterCategoryResults : filterCategoryResults,
                                            filterDomainResults : filterDomainResults,
                                            filterTagResults : filterTagResults,
                                            searchResults : searchResults,
                                            showcaseResults : [],
                                            tooltips : false,
                                        });
                                }, function() { renderErrorPage(req, res) }); // apiController.search
                            }, function() { renderErrorPage(req, res) }); // apiController.getTags
                        }, function() { renderErrorPage(req, res) }); // apiController.getDomains
                    }, function() { renderErrorPage(req, res) }); // apiController.getCategories
                }); // tagController.attachTagMetadata
            }, function() { renderErrorPage(req, res); }); // apiController.getTagsAll
        }); // categoryController.attachCategoryMetadata
    }, function() { renderErrorPage(req, res); }); // apiController.getCategoriesAll
});


app.get('/search-results', function(req, res) {

    var params = apiController.getSearchParameters(req.query);

    apiController.search(params, function(searchResults) {

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

app.listen(port);
console.log('app is listening on ' + port);

// Private functions
//
function renderErrorPage(req, res) {

    res.status(503);
    res.sendFile(__dirname + '/views/static/error.html');
}