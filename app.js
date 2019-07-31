'use strict';

const _ = require('lodash');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const express = require('express');
const minifyHTML = require('express-minify-html');
const morgan = require('morgan');
const favicon = require('serve-favicon');
const helmet = require('helmet');
const numeral = require('numeral');
const querystring = require('querystring');
const expose = require('express-expose');

const HomeController = require('./app/controllers/home-controller');
const CategoriesController = require('./app/controllers/categories-controller');
const DatasetController = require('./app/controllers/dataset-controller');
const PagesController = require('./app/controllers/pages-controller');

const ErrorHandler = require('./app/lib/error-handler');
const UrlUtil = require('./app/lib/url-util');
const GlobalConfig = require('./src/config');

const app = expose(express());

// HACK HACK HACK DOS BLOCKER
const BLOCKLIST = (process.env.BLOCKLIST || "").split(",");
const BLOCKAGENTS = (process.env.BLOCKAGENTS || "").split(",");
app.use((req, res, next) => {
  var ip = req.headers["x-forwarded-for"];
  var agent = req.headers["user-agent"];
  if(BLOCKLIST.includes(ip) || BLOCKAGENTS.includes(agent)) {
    console.log("Blocked", ip, req.headers["user-agent"]);
    res.end("Oh no you din't!");
  } else {
    next();
  }
});

// Compression
app.use(compression());

// HTML Minification
app.use(minifyHTML({
    override: true,
    htmlMinifier: {
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeEmptyAttributes: true,
        minifyJS: false
    }
}));

// Cookie parser
app.use(cookieParser());

// Set up apache common log format output
//app.use(morgan('combined'));

app.use((req, res, next) => {
  const query_inbound_url = req.query['x-return-url'];
  const query_inbound_url_description = req.query['x-return-description'];
  if (!_.isUndefined(query_inbound_url)) {
    delete req.query['x-return-url'];
    delete req.query['x-return-description'];

    res.cookie('inbound_url', query_inbound_url, {});
    res.cookie('inbound_url_description', query_inbound_url_description || 'Back', {});
  }
  res.locals.session_inbound_url = UrlUtil.addHttp(query_inbound_url || req.cookies.inbound_url || null);
  res.locals.session_inbound_url_description = (query_inbound_url_description || req.cookies.inbound_url_description || 'Back');
  next();
});

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
app.use('/googlec2f723ab6cc99ce1.html', express.static(__dirname + '/views/static/googlec2f723ab6cc99ce1.html'));
app.use('/robots.txt', express.static(__dirname + '/views/static/robots.txt'));
app.use('/error.html', express.static(__dirname + '/views/static/error.html'));
app.use('/robots.txt', express.static(__dirname + '/views/static/robots.txt'));

app.use('/sitemap.xml', express.static(__dirname + '/views/static/sitemap.xml'));
app.use('/sitemap', express.static(__dirname + '/views/static/sitemap'));

// Expose our config to the client
app.expose(GlobalConfig, 'GlobalConfig');

// Ensure HTTP
//
app.get('*', function(req, res, next) {

    if (req.headers['x-forwarded-proto'] === 'http')
        res.redirect(301, 'https://' + req.hostname + req.url);
    else
        next();
});

// Strip all get parameters to avoid XSS attempts
var strip = function(string) { return string.replace(/[^A-z0-9-_.+&]+/g, ' '); };
app.get('*', function(req, res, next) {
  _.each(req.query, function(value, key) {
    if(_.isArray(value)) {
      // Handle repeated parameters, which come back as arrays
      _.each(value, function(aval, idx) {
        req.query[key][idx] = strip(aval);
      });
    } else {
      req.query[key] = strip(value);
    }
  });
  next();
});

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

app.get('/', HomeController.index);
app.get('/categories.json', CategoriesController.categories);
app.get('/join-open-data-network', PagesController.join);
app.get('/join-open-data-network/complete', PagesController.joinComplete);
app.get('/search', require('./app/controllers/search-controller'));
/*
app.get('/search/search-results', SearchController.searchResults);
app.get('/search/:vector', SearchController.search);
*/
app.get('/dataset/:domain/:id', DatasetController.show);

// new URL format
const entityController = require('./app/controllers/entity-controller');
app.get('/entity/:entityIDs', entityController);
app.get('/entity/:entityIDs/:entityNames', entityController);
app.get('/entity/:entityIDs/:entityNames/:variableID', entityController);

const redirectRegion = require('./app/controllers/redirect/region');
app.get('/region/:regionIDs', redirectRegion);
app.get('/region/:regionIDs/:regionNames', redirectRegion);
app.get('/region/:regionIDs/:regionNames/:vector', redirectRegion);
app.get('/region/:regionIDs/:regionNames/:vector/:metric', redirectRegion);
app.get('/region/:regionIDs/:regionNames/:vector/:metric/:year', redirectRegion);

app.get('/search-results', require('./app/controllers/search-results-controller'));
app.get('/search-results/entity', require('./app/controllers/entity-search-results-controller'));

app.use((error, req, res, next) => {
  ErrorHandler.error(req, res)(error);
});

// Start listening
//
var port = Number(process.env.PORT || 3000);

process.on('unhandledRejection', function(reason, p){
    console.log("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
    // application specific logging here
});

String.prototype.format = function() {
  var args = arguments;

  return this.replace(/{(\d+)}/g, function(match, number) {
    return typeof args[number] != 'undefined' ? args[number] : match;
  });
};

app.listen(port);
console.log('app is listening on ' + port);

app.locals._ = _;
app.locals.numeral = numeral;
app.locals.querystring = querystring;

