var express = require('express');
var app = express();
var soc = require('./modules/socrata');
var fs = require('fs');

// Set up static folders.
//
app.use('/images', express.static(__dirname + '/images'));
app.use('/scripts', express.static(__dirname + '/scripts'));
app.use('/styles', express.static(__dirname + '/styles'));

app.locals.title = 'OpenData Network';

app.all('*', function(req, res, next){
    fs.readFile(__dirname + '/data/tiles.json', function(err, data) {
      res.locals.columns = JSON.parse(data);
      next();
    });
});

app.get('/', function(req, res) {
    app.locals.css = 'index.css';
    res.render('index.ejs');
}); 

app.listen(3000);
console.log('app is listening at localhost:3000');