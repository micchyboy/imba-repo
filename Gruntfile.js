module.exports = function(grunt) {

    var target = grunt.option('target') || 'dev';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            dist: {
                src: [
                    'public/lib/angular.js',
                    'public/lib/jquery-1.10.2.min.js',
                    'public/lib/bootstrap.min.js',
                    'public/lib/ngmodules/*',
                    'public/declarations.js',
                    'public/controllers/*.js',
                    'public/directives/*.js',
                    'public/filters/*.js',
                    'public/services/*.js'
                ],
                dest: 'public/build/production.js'
            }
        },
        uglify: {
            options: {
                mangle: false
            },
            build: {
                src: 'public/build/production.js',
                dest: 'public/build/production.min.js'
            }
        },
        watch: {
            scripts: {
                files: ['public/**/*.js', '!public/build/*.js'],
                tasks: ['concat', 'uglify'],
                options: {
                    spawn: false
                }
            }
        },
        preprocess: {
            options: {
                context: {
                    DEBUG: true,
                    ENV: target
                }
            },
            multifile: {
                files: {
                    'public/views/dependencies.html': 'preprocess_config/dependencies.html',
                    'public/clientConfig.js': 'preprocess_config/clientConfig.js',
                    'serverConfig.js': 'preprocess_config/serverConfig.js'
                    //,'test/test.processed.js'   : 'test/test.js'
                }
            }
        }
    });

    // 3. Where we tell Grunt we plan to use this plug-in.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-preprocess');

    // 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
    grunt.registerTask('default', ['concat', 'uglify']);

};