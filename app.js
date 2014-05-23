var express = require('express');
var app = express();
var fs = require('fs');

// Set up static folders.
//
app.use('/data', express.static(__dirname + '/data'));
app.use('/images', express.static(__dirname + '/images'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/scripts', express.static(__dirname + '/scripts/compressed'));
app.use('/styles', express.static(__dirname + '/styles/compressed'));

app.use(express.favicon(__dirname + '/images/favicon.ico'));

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

app.get('/robots.txt', function(req, res) {
    res.render('static/robots.ejs');
});

app.get('/google0679b96456cb5b3a.html', function(req, res) {
    res.render('static/google0679b96456cb5b3a.ejs');
});


// Start listening
//
var port = Number(process.env.PORT || 3000);

app.listen(port);
console.log('app is listening on ' + port);