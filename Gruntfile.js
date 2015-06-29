module.exports = function (grunt) {
    // load all grunt tasks matching the `grunt-*` pattern
    require('load-grunt-tasks')(grunt);

    var files = ['Gruntfile.js', 'bin/npm-windows-upgrade'];

    grunt.initConfig({
        jshint: {
            files: files,
            options: {
                jshintrc: './.jshintrc'
            }
        },
        jscs: {
            files: {
                src: files
            },
            options: {
                config: '.jscsrc',
                esnext: true
            }
        }
    });

    grunt.registerTask('codestyle', ['jshint', 'jscs']);
    grunt.registerTask('test', ['codestyle']);
    grunt.registerTask('default', ['test']);
};
