module.exports = function(grunt) {
    var baseScripts = [
        'compiled/v4-app.js',
        'compiled/v4-api-controller.js',
        'compiled/v4-auto-suggest-region-controller.js',
        'compiled/constants.js',
        'compiled/region-lookup.js'
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
        concat: {
            options: {
                sourceMap: true,
                sourceMapStyle: 'embed'
            },
            home: {
                src: baseScripts.concat(['compiled/v4-home.js']),
                dest: 'concat/home.js'
            },
            search: {
                src: baseScripts.concat(['compiled/v4-search-page-controller.js',
                                         'compiled/v4-search.js']),
                dest: 'concat/search.js'
            }
        },
        uglify: {
            build: {
                options: {
                    mangle: false
                },
                files: [{
                    expand: true,
                    cwd: 'concat',
                    src: ['*.js'],
                    dest: 'lib',
                    ext: '.min.js'
                }]
            }
        }
    });

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.registerTask('default', ['sass', 'babel', 'concat', 'uglify']);
};
