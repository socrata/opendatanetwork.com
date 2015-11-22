module.exports = function(grunt) {
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
                    src: ['*.scss', '*.sass'],
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
                src: baseScripts.concat(['src/home.js']),
                dest: 'lib/home.es6.js'
            },
            search: {
                src: baseScripts.concat(mapScripts).concat(
                    ['src/search-page-controller.js',
                     'src/search.js']),
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
