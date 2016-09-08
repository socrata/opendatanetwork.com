'use strict';

var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cached = require('gulp-cached');
var util = require('gulp-util');
var exit = require('gulp-exit');
var remember = require('gulp-remember');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var nodemon = require('gulp-nodemon');
var spawn = require('child_process').spawn;
var net = require('net');

var baseScripts = [
    'src/app.js',
    'src/constants.js',
    'src/odn-client/build-url.js',
    'src/odn-client/get-json.js',
    'src/odn-client/odn-client.js',
    'src/navigate/entity.js',
    'src/navigate/search.js',
    'src/api-badge/api-badge.js',
    'src/api-badge/api-popup.js'
];

var mapScripts = [
    'src/maps/constants.js',
    'src/maps/expand-collapse-control.js',
    'src/maps/legend-control.js',
    'src/maps/tooltip-control.js',
    'src/maps/view.js'
];

var autosuggestScripts = [
    'src/autosuggest/autosuggest-sources.js',
    'src/autosuggest/autosuggest-source.js',
    'src/autosuggest/autosuggest-results.js',
    'src/autosuggest/autosuggest.js',
];

function js(src, dest) {
    return function() {
        return gulp.src(src)
            .pipe(cached(dest))
            .pipe(sourcemaps.init())
            .pipe(babel())
            .pipe(remember(dest))
            .pipe(concat(dest))
            .pipe(uglify())
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('lib'));
    };
}

var homeScripts = baseScripts
    .concat(autosuggestScripts)
    .concat([
        'src/home-page-controller.js',
        'src/home.js']);
gulp.task('home', js(homeScripts, 'home.min.js'));

var searchScripts = baseScripts
    .concat(autosuggestScripts)
    .concat([
        'src/search-refine-controls-mobile.js',
        'src/infinite-scroll.js',
        'src/mobile-menus.js',
        'src/search.js',
        'src/api/odn-api.js']);
gulp.task('search', js(searchScripts, 'search.min.js'));

var entityScripts = baseScripts
    .concat(autosuggestScripts)
    .concat(mapScripts)
    .concat([
        'src/dataset-constants.js',
        'src/dataset-chart.js',
        'src/infinite-scroll.js',
        'src/mobile-menus.js',
        'src/entity.js']);
gulp.task('entity', js(entityScripts, 'entity.min.js'));

var datasetScripts = baseScripts
    .concat(autosuggestScripts)
    .concat([
        'src/dataset.js']);
gulp.task('dataset', js(datasetScripts, 'dataset.min.js'));

gulp.task('js', ['home', 'search', 'dataset', 'entity']);

gulp.task('css', function() {
    return gulp.src(['styles/**/*.scss', 'styles/**/*.sass'])
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('styles/compressed'));
});

gulp.task('build', ['js', 'css']);

gulp.task('watch', ['build'], function() {
    gulp.watch('src/**/*.js', ['js']);
    gulp.watch(['styles/*.sass', 'styles/*.scss'], ['css']);
});

gulp.task('test', function () {
    var server = nodemon({
        script: 'app.js',
        ignore: '*', // HACK: Prevent restarting
        env: { 'PORT' : 3002 }
    });

    var checkServer = function() {
      util.log('Confirming that the server is up on port 3002...');
      net.connect({ port: 3002 })
          .on('error', function() {
              util.log('Error connecting, waiting longer...');
              setTimeout(checkServer, 1000);
          })
          .on('timeout', function() {
              util.log('Timeout connecting, waiting longer...');
              setTimeout(checkServer, 1000);
          })
          .on('connect', function() {
              util.log('Successfully connected!');

              var casper = spawn('casperjs', ['test', './tests'], {
                  stdio: 'inherit',
                  waitTimeout: 30
              });

              casper.on('close', function(code) {
                  util.log("code: " + code);
                  if(code === 0) {
                      util.log('Tests succeeded!');
                      process.exit(0);
                  } else {
                      util.log('Tests FAILED!');
                      process.exit(1);
                  }
              });
          });
    };

    checkServer();
});


gulp.task('start', function() {
    return nodemon({
        script: 'app.js',
        watch: ['lib/', 'styles/compressed/', 'controllers/', 'data/', 'app/'],
        harmony_destructuring: true
    });
});

gulp.task('default', ['watch']);

