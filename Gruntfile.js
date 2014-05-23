module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        project: {
            scripts: 'scripts',
            styles: 'styles'
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
        uglify: {
            build: {
                options: {
                    mangle: false
                },
                files: [{
                    expand: true,
                    cwd: '<%= project.scripts %>',
                    src: ['*.js'],
                    dest: '<%= project.scripts %>/compressed',
                    ext: '.min.js'
                }]
            }
        }
    });

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.registerTask('default', ['sass','uglify']);
};
