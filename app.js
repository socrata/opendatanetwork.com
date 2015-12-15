var RenderController = require('./controllers/render-controller');

var cookieParser = require('cookie-parser');
var express = require('express');
var favicon = require('serve-favicon');
var helmet = require('helmet');

var renderController = new RenderController();
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
app.use('/lib', express.static(__dirname + '/lib'));
app.use('/geo', express.static(__dirname + '/geo'));
app.use('/lib/third-party', express.static(__dirname + '/scripts/third-party'));
app.use('/styles', express.static(__dirname + '/styles/compressed'));
app.use('/styles/third-party', express.static(__dirname + '/styles/third-party'));
app.use(favicon(__dirname + '/images/favicon.ico'));

// Set up static file routes
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
app.get('/v4', function(req, res) { res.redirect(301, '/') });

// Set up routes
//
app.get('/', renderController.renderHomePage);
app.get('/categories.json', renderController.renderCategoriesJson);
app.get('/join-open-data-network/complete', renderController.renderJoinOpenDataNetworkComplete);
app.get('/join-open-data-network', renderController.renderJoinOpenDataNetwork);
app.get('/search', renderController.renderSearchPage);
app.get('/search/search-results', renderController.renderSearchResults);
app.get('/search/:vector', renderController.renderSearchPage);
app.get('/dataset/:domain/:id', renderController.renderDatasetPage);
app.get('/region/:regionIds', renderController.renderSearchPage);
app.get('/region/:regionIds/:regionNames', renderController.renderSearchPage);
app.get('/region/:regionIds/:regionNames/search-results', renderController.renderSearchResults);
app.get('/region/:regionIds/:regionNames/:vector', renderController.renderSearchWithVectorPage);
app.get('/region/:regionIds/:regionNames/:vector/search-results', renderController.renderSearchResults);
app.get('/sitemap', renderController.renderSitemap);

// Start listening
//
var port = Number(process.env.PORT || 3000);

app.listen(port);
console.log('app is listening on ' + port);
