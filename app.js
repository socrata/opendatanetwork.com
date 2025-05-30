'use strict';

const _ = require('lodash');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const express = require('express');
const session = require('express-session');
const minifyHTML = require('express-minify-html');
const rateLimit = require('express-rate-limit');
const ipFilter = require('express-ipfilter').IpFilter;
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
const recaptchaMiddleware = require('./app/lib/recaptcha-middleware');

const app = expose(express());

// Reverse proxy (Heroku) fix for X-Forwarded-For
app.set('trust proxy', 2);

// Implement IP address blocks based on BLOCKLIST environment variable
const BLOCKLIST = ['47.79.*.*', '73.172.36.102'] // (process.env.BLOCKLIST || "").split(",");
let clientIp = function (req, res) {
  return req.headers['x-forwarded-for'] ? (req.headers['x-forwarded-for']).split(',')[0] : "";
};

app.use(ipFilter({filter: BLOCKLIST, detectIp: function(req, res) { 
  console.log(req.ip);
  return req.ip
}}))

// Implement user agent blocks based on BLOCKAGENTS environment variable
app.use((req, res, next) => {
  let agent = req.get("User-Agent");
  const BLOCKAGENTS = (process.env.BLOCKAGENTS || "").split(",");
  if (BLOCKAGENTS.includes(agent) || agent.includes("Presto")) {
    console.log(`Blocked user agent: ${agent}`);
    res.send(401, "You are not authorized to access this page.");
  } else {
    next();
  }
});

// Configure rate limiter
const RATE_WINDOW = (process.env.RATE_LIMIT || 60000); // Defaults to 1000ms (or 1s) * 60 (or 1min)
const RATE_LIMIT = (process.env.RATE_INTERVAL || 60); // Defaults to 60 requests per window
let rateLimiter = rateLimit({
  windowMs: RATE_WINDOW,
  limit: RATE_LIMIT,
  standardHeaders: 'draft-7',
  legacyHeaders: false, // Disable X-RateLimit-* header
  // store: Memcached
});

// Implement rate limiter
app.use(rateLimiter);

/*
// HACK HACK HACK DOS BLOCKER
const BLOCKLIST = (process.env.BLOCKLIST || "").split(",");
console.log("USING BLOCKLIST", BLOCKLIST);
const BLOCKAGENTS = (process.env.BLOCKAGENTS || "").split(",");
app.use((req, res, next) => {
  var ip = req.ip;
  var agent = req.headers["user-agent"];
  console.log("IP:", ip, "AGENT:", agent);
  if(BLOCKLIST.includes(ip) || BLOCKAGENTS.includes(agent) || agent.includes("Presto")) {
    console.log("Blocked", ip, req.headers["user-agent"]);
    res.end("Oh no you din't!");
  } else {
    next();
  }
});
*/

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

// Session middleware with Memcached store for multi-dyno support
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'odn-recaptcha-secret-change-me',
    resave: false,
    saveUninitialized: true, // Changed to true to ensure session is created
    proxy: true, // Trust the reverse proxy (Heroku)
    cookie: {
        secure: true, // Always use secure on Heroku (HTTPS)
        httpOnly: true,
        maxAge: 3600000, // 1 hour
        sameSite: 'lax' // Helps with CSRF protection
    }
};

// TODO: Add Memcached session store for multi-dyno support
// For now, using default memory store
console.log('Using default memory session store - reCAPTCHA sessions may not persist across dynos');

app.use(session(sessionConfig));

// Body parser for POST requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

// Add reCAPTCHA middleware to all requests
app.use(recaptchaMiddleware.addToLocals());

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
app.get('/ip', (request, response) => response.send(request.ip));
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

// reCAPTCHA verification endpoint
app.post('/recaptcha-verify', (req, res) => {
    const recaptchaResponse = req.body['g-recaptcha-response'];
    const originalUrl = req.body.originalUrl || '/';
    
    if (!recaptchaResponse) {
        return res.render('recaptcha-verify.ejs', {
            originalUrl,
            title: 'Security Verification - Open Data Network',
            error: 'Please complete the reCAPTCHA challenge.'
        });
    }
    
    // Verify the reCAPTCHA
    if (recaptchaMiddleware.isEnabled()) {
        const reCAPTCHA = require('google-recaptcha');
        const recaptcha = new reCAPTCHA({
            secret: process.env.RECAPTCHA_SECRET_KEY
        });
        
        recaptcha.verify({
            response: recaptchaResponse,
            remoteip: req.ip
        }, (error) => {
            if (error) {
                console.error('reCAPTCHA verification failed:', error);
                return res.render('recaptcha-verify.ejs', {
                    originalUrl,
                    title: 'Security Verification - Open Data Network',
                    error: 'Verification failed. Please try again.'
                });
            }
            
            // Success - set session and redirect
            if (req.session) {
                req.session.recaptchaVerified = true;
                req.session.recaptchaTimestamp = Date.now();
                
                // Ensure session is saved before redirecting
                req.session.save((err) => {
                    if (err) {
                        console.error('Session save error:', err);
                    }
                    res.redirect(originalUrl);
                });
            } else {
                res.redirect(originalUrl);
            }
        });
    } else {
        res.redirect(originalUrl);
    }
});
/*
app.get('/search/search-results', SearchController.searchResults);
app.get('/search/:vector', SearchController.search);
*/
app.get('/dataset/:domain/:id', recaptchaMiddleware.verify(), DatasetController.show);

// new URL format
const entityController = require('./app/controllers/entity-controller');
app.get('/entity/:entityIDs', recaptchaMiddleware.verify(), entityController);
app.get('/entity/:entityIDs/:entityNames', recaptchaMiddleware.verify(), entityController);
app.get('/entity/:entityIDs/:entityNames/:variableID', recaptchaMiddleware.verify(), entityController);

const redirectRegion = require('./app/controllers/redirect/region');
app.get('/region/:regionIDs', redirectRegion);
app.get('/region/:regionIDs/:regionNames', redirectRegion);
app.get('/region/:regionIDs/:regionNames/:vector', redirectRegion);
app.get('/region/:regionIDs/:regionNames/:vector/:metric', redirectRegion);
app.get('/region/:regionIDs/:regionNames/:vector/:metric/:year', redirectRegion);

app.get('/search-results', require('./app/controllers/search-results-controller'));
app.get('/search-results/entity', require('./app/controllers/entity-search-results-controller'));

// Protected API proxy endpoints
app.get('/api/*', recaptchaMiddleware.verify(), require('./app/controllers/api-proxy-controller'));

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
console.log(`Application running on port ${port}...`);

app.locals._ = _;
app.locals.numeral = numeral;
app.locals.querystring = querystring;
