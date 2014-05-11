var express = require('express');
var app = express();
var soc = require('./modules/socrata');
var fs = require('fs');

// Set up static folders.
//
app.use('/data', express.static(__dirname + '/data'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/images', express.static(__dirname + '/images'));
app.use('/scripts', express.static(__dirname + '/scripts'));
app.use('/styles', express.static(__dirname + '/styles'));

app.locals.title = 'OpenData Network';

fs.readFile(__dirname + '/data/tiles.json', function(err, data) {
  app.locals.columns = JSON.parse(data);
});

fs.readFile(__dirname + '/data/slides.json', function(err, data) {
  app.locals.slides = JSON.parse(data);
});

app.get('/', function(req, res) {
    app.locals.css = 'index.css';
    res.render('index.ejs');
});

app.get('/finder', function(req, res) {
    app.locals.css = 'finder.css';
    res.render('finder.ejs');
});

app.listen(3000);
console.log('app is listening at localhost:3000');