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
    'src/odn-client/build-url.js',
    'src/odn-client/get-json.js',
    'src/odn-client/odn-client.js',
    'src/navigate/entity.js',
    'src/navigate/search.js',
    'src/api-badge/api-badge.js',
    'src/api-badge/api-popup.js'
];

var mapScripts = [
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
        'src/infinite-scroll.js',
        'src/show-more-questions.js',
        'src/mobile-menus.js',
        'src/search.js',
        'src/api/odn-api.js']);
gulp.task('search', js(searchScripts, 'search.min.js'));

var entityScripts = baseScripts
    .concat(autosuggestScripts)
    .concat(mapScripts)
    .concat([
        'src/dataset-chart.js',
        'src/infinite-scroll.js',
        'src/show-more-questions.js',
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

gulp.task('start', function() {
    return nodemon({
        script: 'app.js',
        watch: ['lib/', 'styles/compressed/', 'controllers/', 'data/', 'app/'],
        harmony_destructuring: true
    });
});

gulp.task('default', ['watch']);

