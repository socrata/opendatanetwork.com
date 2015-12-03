
var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cached = require('gulp-cached');
var remember = require('gulp-remember');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var nodemon = require('gulp-nodemon');

var baseScripts = [
    'src/app.js',
    'src/api-controller.js',
    'src/constants.js',
    'src/region-lookup.js',
    'src/autocomplete.js',
    'src/multi-complete.js',
    'src/source-complete.js',
];

var mapScripts = [
    'src/maps/scales.js',
    'src/maps/constants.js',
    'src/maps/model.js',
    'src/maps/tooltip.js',
    'src/maps/legend-control.js',
    'src/maps/variable-control.js',
    'src/maps/view.js',
    'src/maps/format.js',
    'src/data/map-sources.js'
];

var autosuggestScripts = [
    'src/autosuggest/base64.js',
    'src/autosuggest/autosuggest-source.js',
    'src/autosuggest/autosuggest-results.js',
    'src/autosuggest/autosuggest.js',
    'src/dataset-popup.js',
    'src/data/autosuggest-multi.js',
    'src/data/autosuggest-sources.js'
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
    .concat(['src/home.js']);

gulp.task('home', js(homeScripts, 'home.min.js'));


var searchScripts = baseScripts
    .concat(autosuggestScripts)
    .concat(mapScripts)
    .concat(['src/search-page-controller.js', 'src/search.js']);

gulp.task('search', js(searchScripts, 'search.min.js'));

gulp.task('js', ['home', 'search']);


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
        watch: ['lib/', 'styles/compressed/', 'controllers/', 'data/']
    });
});

gulp.task('default', ['watch']);

