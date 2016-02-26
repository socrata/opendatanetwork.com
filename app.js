'use strict';

const _ = require('lodash');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const helmet = require('helmet');
const numeral = require('numeral');
const RenderController = require('./controllers/render-controller');

const app = express();

app.use(compression());

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
app.use('/googlefd1b89f5a265e3ee.html', express.static(__dirname + '/views/static/googlefd1b89f5a265e3ee.html'));
app.use('/robots.txt', express.static(__dirname + '/views/static/robots.txt'));
app.use('/error.html', express.static(__dirname + '/views/static/error.html'));
app.use('/robots.txt', express.static(__dirname + '/views/static/robots.txt'));
app.use('/sitemap.xml', express.static(__dirname + '/views/static/sitemap.xml'));

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
app.get('/v4', function(req, res) { res.redirect(301, '/'); });

app.get('/', RenderController.home);
app.get('/categories.json', RenderController.categories);
app.get('/join-open-data-network', RenderController.join);
app.get('/join-open-data-network/complete', RenderController.joinComplete);
app.get('/search', RenderController.search);
app.get('/search/search-results', RenderController.searchResults);
app.get('/search/:vector', RenderController.search);
app.get('/dataset/:domain/:id', RenderController.dataset);
app.get('/region/:regionIds', RenderController.search);
app.get('/region/:regionIds/:regionNames', RenderController.search);
app.get('/region/:regionIds/:regionNames/search-results', RenderController.searchResults);
app.get('/region/:regionIds/:regionNames/:vector/search-results', RenderController.searchResults);
app.get('/region/:regionIds/:regionNames/:vector/:metric/:year', RenderController.searchWithVector);
app.get('/region/:regionIds/:regionNames/:vector/:metric/:year/search-results', RenderController.searchResults);
app.get('/region/:regionIds/:regionNames/:vector/:metric', RenderController.searchWithVector);
app.get('/region/:regionIds/:regionNames/:vector', RenderController.searchWithVector);
app.get('/region/:regionIds/:regionNames', RenderController.search);

app.use((error, req, res, next) => {
    RenderController.error(req, res)(error);
});

// Start listening
//
var port = Number(process.env.PORT || 3000);

app.listen(port);
console.log('app is listening on ' + port);

app.locals._ = _;
app.locals.numeral = numeral;

