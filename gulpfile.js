
var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cached = require('gulp-cached');
var remember = require('gulp-remember');

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
    'src/maps/view.js',
    'src/maps/container.js',
    'src/maps/scale-control.js',
    'src/maps/tooltip-control.js',
    'src/maps/variable-control.js'
];


function js(src, dest) {
    return function() {
        return gulp.src(src)
            .pipe(sourcemaps.init())
            .pipe(babel())
            .pipe(concat(dest))
            .pipe(uglify())
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('lib'));
    };
}


var homeScripts = baseScripts
    .concat(['src/home.js']);

gulp.task('home', js(homeScripts, 'home.min.js'));


var searchScripts = baseScripts
    .concat(mapScripts)
    .concat(['src/search-page-controller.js', 'src/search.js']);

gulp.task('search', js(searchScripts, 'search.min.js'));


gulp.task('default', ['home', 'search']);

