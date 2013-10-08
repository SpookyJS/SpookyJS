// Gruntfile.js
module.exports = function (grunt) {
  // load all grunt tasks matching the `grunt-*` pattern
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        globals: {}
      },
      gruntfile: {
        src: 'Gruntfile.js',
        options: {
          node: true
        }
      },
      node_libs: {
        src: ['lib/spooky.js', 'lib/spooky/**/*.js'],
        options: {
          node: true
        }
      },
      phantom_libs: {
        src: ['lib/bootstrap.js', 'lib/bootstrap/**/*.js'],
        options: {
          phantom: true,
          browser: true,
          globals: {
            patchRequire: true,
            module: true
          }
        }
      },
      tests: {
        src: ['tests/test/**/*.js'],
        options: {
          phantom: true,
          node: true,
          browser: true,
          globals: {
            it: true,
            describe: true,
            beforeEach: true,
            afterEach: true
          }
        }
      }
    }
  });

  grunt.registerTask('default', []);
};
