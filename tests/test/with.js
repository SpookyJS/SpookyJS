var util = require('util');
var expect = require('expect.js');

describe("Spooky provides Casper's with* functions", function () {
    var nop = function nop() {};
    var context = {};
    var hooks = require('../util/hooks');
    var FIXTURE_URL = hooks.FIXTURE_URL;

    beforeEach(hooks.before(context));

    describe('spooky.withFrame', function () {
        it('throws if its step is not a function',
            function (done) {
                context.spooky.swallowErrors = true;
                context.spooky.once('error', function (e) {
                    expect(e.message.toLowerCase()).to.
                        contain('cannot parse function');
                    done();
                });

                context.spooky.withFrame(0, 'I am not a valid function');
            });

        it('performs its step in the context of the frame', function (done) {
            context.spooky.start(FIXTURE_URL + '/frames.html');

            context.spooky.withFrame('frame1', function () {
                var expected = 'One';
                var title = this.evaluate(function () {
                    return document.title;
                });

                if (title !== expected) {
                    throw new Error(
                        'expected title === ' + expected + ', but is ' + title);
                }
            });

            context.spooky.withFrame('frame2', function () {
                var expected = 'Two';
                var title = this.evaluate(function () {
                    return document.title;
                });

                if (title !== expected) {
                    throw new Error(
                        'expected title === ' + expected + ', but is ' + title);
                }

                this.emit('done');
            });

            context.spooky.on('done', done);

            context.spooky.run();
        });
    });

    describe('spooky.withPopup', function () {
        it('throws if its second argument is not a function',
            function (done) {
                context.spooky.swallowErrors = true;
                context.spooky.once('error', function (e) {
                    expect(e.message.toLowerCase()).to.
                        contain('cannot parse function');
                    done();
                });

                context.spooky.withPopup(0, 'I am not a valid function');
            });

        it('performs its step in the context of the popup', function (done) {
            context.spooky.start(FIXTURE_URL + '/popup.html');

            context.spooky.thenClick('#popup1');
            context.spooky.waitForPopup('1.html');

            context.spooky.withPopup('1.html', function () {
                var expected = 'One';
                var title = this.evaluate(function () {
                    return document.title;
                });

                if (title !== expected) {
                    throw new Error(
                        'expected title === ' + expected + ', but is ' + title);
                }

                this.emit('done');
            });

            context.spooky.on('done', done);

            context.spooky.run();
        });
    });

    afterEach(hooks.after(context));
});
