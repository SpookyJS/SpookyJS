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
});
