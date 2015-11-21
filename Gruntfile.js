module.exports = function(grunt) {
    var baseScripts = [
        'scripts/app.js',
        'scripts/api-controller.js',
        'scripts/constants.js',
        'scripts/region-lookup.js',
        'scripts/autocomplete.js',
        'scripts/multi-complete.js',
        'scripts/source-complete.js',
    ];

    var mapScripts = [
        'scripts/maps/scales.js',
        'scripts/maps/constants.js',
        'scripts/maps/model.js',
        'scripts/maps/view.js'
    ];

    var config = {
        pkg: grunt.file.readJSON('package.json'),
        project: {
            scripts: 'scripts',
            styles: 'styles'
        },
        concurrent: {
            dev: {
                tasks: ['nodemon', 'watch'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        watch: {
            css: {
                files: ['<%= project.styles %>/*.scss'],
                tasks: ['sass']
            },
            scripts: {
                files: ['<%= project.scripts %>/*.js'],
                tasks: ['babel', 'uglify']
            },
        },
        nodemon: {
            dev: {
                script: 'app.js',
                options: {
                    ignore: ['.sass-cache/**', 'node_modules/**'],
                    ext: 'css,ejs,js,json',
                }
            }
        },
        sass: {
            build: {
                options: {
                    style: 'compressed'
                },
                files: [{
                    expand: true,
                    cwd: '<%= project.styles %>',
                    src: ['*.scss'],
                    dest: '<%= project.styles %>/compressed',
                    ext: '.min.css'
                }]
            }
        },
        concat: {
            options: {
                sourceMap: true,
                sourceMapStyle: 'embed',
                process: function(src, filepath) {
                    return '// ' + filepath + '\n' + src;
                }
            },
            home: {
                src: baseScripts.concat(['scripts/home.js']),
                dest: 'lib/home.es6.js'
            },
            search: {
                src: baseScripts.concat(mapScripts).concat(
                    ['scripts/search-page-controller.js',
                     'scripts/search.js']),
                dest: 'lib/search.es6.js'
            }
        },
        babel: {
            options: {
                sourceMap: true,
                presets: ['es2015']
            },
            home: {
                src: 'lib/home.es6.js',
                dest: 'lib/home.js'
            },
            search: {
                src: 'lib/search.es6.js',
                dest: 'lib/search.js'
            }
        },
        uglify: {
            options: {
                sourceMap: true,
                mangle: false
            },
            home: {
                options: {
                    sourceMapIn: 'lib/home.js.map'
                },
                src: 'lib/home.js',
                dest: 'lib/home.min.js'
            },
            search: {
                options: {
                    sourceMapIn: 'lib/search.js.map'
                },
                src: 'lib/search.js',
                dest: 'lib/search.min.js'
            }
        }
    };

    grunt.initConfig(config);
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    grunt.registerTask('default', ['sass', 'concat', 'babel', 'uglify']);
};
