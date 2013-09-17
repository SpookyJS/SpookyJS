var _ = require('underscore');
var util = require('util');
var expect = require('expect.js');

describe('bootstrap/emit', function () {
    var context = {};
    var hooks = require('../util/hooks');
    var FIXTURE_URL = hooks.FIXTURE_URL;

    beforeEach(hooks.before(context));

    it('provides emit, which emits an event', function (done) {
        context.spooky.start();

        context.spooky.then(function () {
            var fs = require('fs');
            var emit =
                require(fs.workingDirectory + '/lib/bootstrap/emit').emit;

            emit('testing', 1, 2, 3);
        });

        context.spooky.once('testing', function () {
            var args = _.toArray(arguments);

            expect(args[0]).to.be(1);
            expect(args[1]).to.be(2);
            expect(args[2]).to.be(3);

            done();
        });

        context.spooky.run();
    });

    it('provides console.*, which emit a console events', function (done) {
        var out = [];

        context.spooky.start();

        context.spooky.then(function () {
            var fs = require('fs');
            var console =
                require(fs.workingDirectory + '/lib/bootstrap/emit').console;

            console.log('HEYO');
            console.debug('HEYO');
            console.info('HEYO');
            console.warn('HEYO');
            console.error('HEYO');
        });

        function onConsole(line) {
            out.push(line);
        }

        context.spooky.on('console', onConsole);

        context.spooky.once('run.complete', function (entry) {
            expect(out).to.contain('HEYO');

            expect(out).to.contain('debug HEYO');
            expect(out).to.contain('info HEYO');
            expect(out).to.contain('warn HEYO');
            expect(out).to.contain('error HEYO');

            context.spooky.removeListener('console', onConsole);
            done();
        });

        context.spooky.run();
    });

    afterEach(hooks.after(context));
});


