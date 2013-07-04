var expect = require('expect.js');
var spawnChild = require('../util/spawn');

describe('Spooky provides a stdio transport', function () {
    var context = {};
    var hooks = require('../util/hooks');

    beforeEach(hooks.before(context));

    it('crashes if passed invalid JSON', function (done) {
        var child = spawnChild();

        // wait until ready
        child.stdout.once('line', function (line) {
            expect(line).to.contain('ready');

            // expect child to exit non-zero
            var exited = false;
            child.on('exit', function (code, signal) {
                expect(code).not.to.be(0);
                exited = true;

                if (emitted) {
                    done();
                }
            });

            // expect child to emit an error event
            var emitted = false;
            child.stdout.once('line', function (line) {
                var message = JSON.parse(line);

                expect(message.params[0]).to.be('error');
                emitted = true;

                if (exited) {
                    done();
                }
            });

            child.stdin.write('not valid JSON\n');
        });
    });

    it('allows chained suites', function (done) {
        var spooky = context.spooky;
        var steps = [];

        spooky.on('test.step', function (step) {
            steps.push(step);
        });

        spooky.on('test.done', function () {
            expect(steps).to.eql([1, 2]);
            done();
        });

        spooky.start();
        spooky.then(function () {
            this.emit('test.step', 1);
        });
        spooky.run(function () {
            this.start();
            this.then(function () {
                this.emit('test.step', 2);
            });
            this.run(function () {
                this.emit('test.done');
            });
        });
    });

    it('allows restarts after completion', function (done) {
        var out = [];

        function onConsole(line) {
            if (line === 'Fourth') {
                expect(out).to.contain('First');
                expect(out).to.contain('Second');
                expect(out).to.contain('Third');
                context.spooky.removeListener('console', onConsole);
                done();
                return;
            }

            out.push(line);
        }
        context.spooky.on('console', onConsole);

        context.spooky.start();
        context.spooky.then(function () {
            this.echo('First');
        });
        context.spooky.then(function () {
            this.echo('Second');
        });
        context.spooky.run(function() {
            this.emit('test.done');
        });

        context.spooky.on('test.done', function() {
            context.spooky.start();
            context.spooky.then(function () {
                this.echo('Third');
            });
            context.spooky.then(function () {
                this.echo('Fourth');
            });
            context.spooky.run();
        });
    });

    it('allows restarts queued before completion', function (done) {
        var out = [];

        function onConsole(line) {
            if (line === 'Fourth') {
                expect(out).to.contain('First');
                expect(out).to.contain('Second');
                expect(out).to.contain('Third');
                context.spooky.removeListener('console', onConsole);
                done();
                return;
            }

            out.push(line);
        }
        context.spooky.on('console', onConsole);

        context.spooky.start();
        context.spooky.then(function () {
            this.echo('First');
        });
        context.spooky.then(function () {
            this.echo('Second');
        });
        context.spooky.run(function() {});

        context.spooky.start();
        context.spooky.then(function () {
            this.echo('Third');
        });
        context.spooky.then(function () {
            this.echo('Fourth');
        });
        context.spooky.run();
    });
});
