var util = require('util');
var expect = require('expect.js');

describe('Spooky', function () {
    var context = {};
    var hooks = require('../util/hooks');

    before(hooks.before(context));

    describe('spooky.then', function () {
        it('throws if passed something that is not a function',
            function (done) {
                context.spooky.once('error', function (e) {
                    expect(e.data.toLowerCase()).to.
                        contain('cannot parse function');
                    done();
                });

                context.spooky.then('I am not a valid function');
            });
    });

    after(hooks.after(context));
});

