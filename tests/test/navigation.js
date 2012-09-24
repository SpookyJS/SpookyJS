var util = require('util');
var expect = require('expect.js');

describe("Spooky provides Casper's navigation functions", function () {
    var context = {};
    var hooks = require('../util/hooks');
    var FIXTURE_URL = hooks.FIXTURE_URL;

    beforeEach(hooks.before(context));

    describe('spooky.back', function () {
        it("moves back a step in the browser's history", function (done) {
            context.spooky.start();

            context.spooky.thenOpen(FIXTURE_URL + '/1.html');
            context.spooky.thenOpen(FIXTURE_URL + '/2.html');
            context.spooky.back();

            context.spooky.then(function () {
                this.echo(this.getCurrentUrl());
            });

            function onConsole(line) {
                if (line === FIXTURE_URL + '/1.html') {
                    context.spooky.removeListener('console', onConsole);
                    done();
                    return;
                }
            }
            context.spooky.on('console', onConsole);

            context.spooky.run();
        });
    });

    describe('spooky.forward', function () {
        it("moves forward a step in the browser's history", function (done) {
            context.spooky.start();

            context.spooky.thenOpen(FIXTURE_URL + '/1.html');
            context.spooky.thenOpen(FIXTURE_URL + '/2.html');
            context.spooky.thenOpen(FIXTURE_URL + '/3.html');
            context.spooky.back();
            context.spooky.back();
            context.spooky.forward();

            context.spooky.then(function () {
                this.echo(this.getCurrentUrl());
            });

            function onConsole(line) {
                if (line === FIXTURE_URL + '/2.html') {
                    context.spooky.removeListener('console', onConsole);
                    done();
                    return;
                }
            }
            context.spooky.on('console', onConsole);

            context.spooky.run();
        });
    });

    describe('spooky.open', function () {
        it('opens a given location in the browser', function (done) {
            context.spooky.start();

            context.spooky.open(FIXTURE_URL + '/1.html');

            context.spooky.then(function () {
                this.echo(this.getCurrentUrl());
            });

            function onConsole(line) {
                if (line === FIXTURE_URL + '/1.html') {
                    context.spooky.removeListener('console', onConsole);
                    done();
                    return;
                }
            }
            context.spooky.on('console', onConsole);

            context.spooky.run();
        });

        // TODO: figure out how to test settings object
    });

    afterEach(hooks.after(context));
});

