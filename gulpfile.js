
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
    'src/api-controller.js',
    'src/constants.js',
    'src/region-lookup.js'
];

var mapScripts = [
    'src/maps/geocode.js',
    'src/maps/scales.js',
    'src/maps/constants.js',
    'src/maps/model.js',
    'src/maps/expand-collapse-control.js',
    'src/maps/legend-control.js',
    'src/maps/tooltip-control.js',
    'src/maps/variable-control.js',
    'src/maps/description.js',
    'src/maps/view.js',
    'src/maps/format.js',
    'src/data/map-sources.js',
    'src/maps/new-view.js'
];

var autosuggestScripts = [
    'src/autosuggest/base64.js',
    'src/autosuggest/stopwords.js',
    'src/autosuggest/autosuggest-source.js',
    'src/autosuggest/autosuggest-results.js',
    'src/autosuggest/autosuggest.js',
    'src/data/autosuggest-multi.js',
    'src/data/autosuggest-sources.js'
];

var regionsScripts = [
    'src/quick-links.js',
    'src/forecast.js',
    'src/chart-constants.js',
    'src/data/data-sources.js',
    'src/charts.js',
    'src/questions.js',
    'src/questions-mobile.js',
    'src/refine-controls-mobile.js',
    'src/search-refine-controls-mobile.js',
    'src/search-page-controller.js',
    'src/search.js'
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
        'src/quick-links.js',
        'src/home-page-controller.js',
        'src/home.js']);
gulp.task('home', js(homeScripts, 'home.min.js'));

var searchScripts = baseScripts
    .concat(autosuggestScripts)
    .concat(mapScripts)
    .concat(regionsScripts)
    .concat([
        'src/api/odn-api.js',
        'src/dataset-menus.js',
        'src/dataset-chart.js',
        'src/dataset-config.js',
        'src/dataset-constants.js']);
gulp.task('search', js(searchScripts, 'search.min.js'));

var datasetScripts = baseScripts
    .concat(autosuggestScripts)
    .concat([
        'src/quick-links.js',
        'src/dataset.js'
        ]);
gulp.task('dataset', js(datasetScripts, 'dataset.min.js'));

gulp.task('js', ['home', 'search', 'dataset']);

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
        watch: ['lib/', 'styles/compressed/', 'controllers/', 'data/'],
        harmony_destructuring: true
    });
});

gulp.task('default', ['watch']);

