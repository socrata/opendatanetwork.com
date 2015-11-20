module.exports = function(grunt) {
    var baseScripts = [
        'compiled/v4-app.js',
        'compiled/v4-api-controller.js',
        'compiled/constants.js',
        'compiled/region-lookup.js',
        'compiled/autocomplete.js',
        'compiled/multi-complete.js',
        'compiled/source-complete.js'
    ];

    grunt.initConfig({
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
        babel: {
            options: {
                sourceMap: 'both',
                presets: ['es2015']
            },
            build: {
                files: [ {
                    expand: true,
                    cwd: '<%= project.scripts %>',
                    src: ['*.js'],
                    dest: 'compiled',
                    ext: '.js'
                }]
            }
        },
        uglify: {
            options: {
                sourceMap: true,
                sourceMapName: function(name) {
                    console.log(name);
                },
                mangle: false
            },
            home: {
                src: baseScripts.concat(['compiled/v4-home.js']),
                dest: 'lib/home.min.js'
            },
            search: {
                src: baseScripts.concat(['compiled/v4-search-page-controller.js',
                                         'compiled/v4-search.js']),
                dest: 'lib/search.min.js'
            }
        }
    });

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.registerTask('default', ['sass', 'babel', 'uglify']);
};
