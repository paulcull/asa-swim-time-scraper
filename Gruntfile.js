module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            beforerequirejs: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
            // afterrequirejs: []
            // beforeconcat: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
            // afterconcat: []
            // afterconcat: ['build/<%= pkg.name %>.js']
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint', 'mochaTest']
        },
        requirejs: {

            compile: {
                options: {
                    appDir: 'src/',
                    baseUrl: '.',
                    dir: 'build/',
                    optimize: 'uglify',
                    modules: [{
                            name: 'scraper'
                        },
                        {
                            name: 'index'
                        }
                    ],
                    logLevel: 0,
                    findNestedDependencies: true,
                    fileExclusionRegExp: /^\./,
                    inlineText: true
                }
            }
        },
        clean: {
            build: {
                src: ['build/**/*', 'target/**/*']
            },
            dist: {
                src: ['build/**/*', 'target/**/*', 'dist/**/*']
            },
            coverage: {
                src: ['coverage/**']
            }
        },
        // concat: {
        //     options: {
        //         // define a string to put between each file in the concatenated output
        //         // separator: ';'
        //         separator: ''
        //     },
        //     dist: {
        //         // the files to concatenate (exclue example)
        //         src: [],
        //         // src: ['target/**/*.js', '!target/example.js', '!target/*mongo*.js'],
        //         // src: ['src/**/*.js', '!src/example.js', '!src/*mongo*.js'],
        //         // the location of the resulting JS file
        //         // dest: 'build/<%= pkg.name %>.js'
        //         dest: ''
        //     }
        // },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    captureFile: 'coverage/results.txt', // Optionally capture the reporter output to a file
                    quiet: false, // Optionally suppress output to standard out (defaults to false)
                    clearRequireCache: false, // Optionally clear the require cache before running tests (defaults to false)
                    noFail: false // Optionally set to not fail on failed tests (will still fail on other errors)
                },
                src: ['test/**/*.js']
            }
        },
        mocha_istanbul: {
            coverage: {
                src: ['test/**/*.js'],
                // a folder works nicely
                options: {
                    coverage: true, // this will make the grunt.event.on('coverage') event listener to be triggered
                    check: {
                        lines: 75,
                        statements: 75
                    },
                    root: './src', // define where the cover task should consider the root of libraries that are covered by tests
                    reportFormats: ['lcov']
                }
            }
        },
        istanbul_check_coverage: {
            default: {
                options: {
                    coverageFolder: 'coverage', // will check both coverage folders and merge the coverage results
                    check: {
                        lines: 80,
                        statements: 80
                    }
                }
            }
        },
        coveralls: {
            // Options relevant to all targets
            options: {
                // When true, grunt-coveralls will only print a warning rather than
                // an error, to prevent CI builds from failing unnecessarily (e.g. if
                // coveralls.io is down). Optional, defaults to false.
                force: false
            },
            your_target: {
                // LCOV coverage file (can be string, glob or array)
                src: 'coverage/*.info',
                options: {
                    // Any options for just this target
                }
            },
        },
        // uglify: {
        //     options: {
        //         banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy - mm - dd ") %> */\n'
        //     },
        //     build: {
        //         src: 'build/<%= pkg.name %>.js',
        //         dest: 'dist/<%= pkg.name %>.min.js'
        //     }
        // },
        copy: {
            conversionTables: {
                expand: true,
                cwd: 'src',
                src: 'strokeList.js',
                dest: 'dist',
            },
            main: {
                expand: true,
                cwd: 'build',
                src: '*.js',
                dest: 'dist',
            },
        },
        release: {
            options: {
                bump: 'false', //only from version is changed
            }
        },
        documentation: {
            default: {
                files: [{
                    'expand': true,
                    'cwd': 'src',
                    'src': ['**/*.js']
                }],
                options: {
                    destination: 'docs'
                }
            }
        }
    });

    grunt.event.on('coverage', function(lcovFileContents, done) {
        // Check below on the section 'The coverage event'
        done();
    });

    //load the dependencies
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    // grunt.loadNpmTasks('grunt-contrib-uglify');
    // grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-mocha-istanbul');
    grunt.loadNpmTasks('grunt-coveralls');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-release');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-documentation');

    //set the tasks / taskmaps
    grunt.registerTask('reportCoveralls', ['clean:coverage', 'mocha_istanbul:coverage', 'coveralls']);
    grunt.registerTask('coverage', ['clean:coverage', 'mocha_istanbul:coverage']);
    grunt.registerTask('ci-build', ['clean:dist', 'jshint:beforerequirejs', 'documentation', 'mochaTest', 'requirejs', 'copy:main', 'copy:conversionTables']);
    grunt.registerTask('build', ['clean:dist', 'jshint:beforerequirejs', 'documentation', 'mochaTest', 'requirejs', 'copy:main', 'copy:conversionTables']);
    grunt.registerTask('test', ['clean:coverage', 'jshint', 'mochaTest', 'coverage']);
    grunt.registerTask('watch', ['watch']);
    grunt.registerTask('releaseToNPM', ['build', 'test', 'coverage', 'release']);

    grunt.registerTask('localBuild', ['clean:dist', 'jshint:beforerequirejs', 'documentation', 'requirejs', 'copy:main', 'copy:conversionTables']);


    grunt.registerTask('default', ['build']);

};