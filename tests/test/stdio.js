var expect = require('expect.js');

describe('Spooky provides a stdio transport', function () {
    var context = {};
    var hooks = require('../util/hooks');

    beforeEach(hooks.before(context));

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
