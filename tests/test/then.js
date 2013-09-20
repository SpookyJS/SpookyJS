var util = require('util');
var expect = require('expect.js');

describe("Spooky provides Casper's then* functions", function () {
    var context = {};
    var hooks = require('../util/hooks');
    var FIXTURE_URL = hooks.FIXTURE_URL;

    beforeEach(hooks.before(context));

    describe('spooky.then', function () {
        it('throws if passed something that is not a function',
            function (done) {
                context.spooky.swallowErrors = true;
                context.spooky.once('error', function (e) {
                    expect(e.message.toLowerCase()).to.
                        contain('cannot parse function');
                    done();
                });

                context.spooky.then('I am not a valid function');
            });

        it('adds a new navigation step', function (done) {
            var out = [];

            context.spooky.start();

            context.spooky.then(function () {
                this.echo('First');
            });

            context.spooky.then(function () {
                this.echo('Second');
            });

            function onConsole(line) {
                if (line === 'Second') {
                    expect(out).to.contain('First');
                    context.spooky.removeListener('console', onConsole);
                    done();
                    return;
                }

                out.push(line);
            }
            context.spooky.on('console', onConsole);

            context.spooky.run();
        });

        it('accepts a function tuple', function (done) {
            var out = [];

            context.spooky.start();

            context.spooky.then([{
                foo: 'bar'
            }, function () {
                this.echo(foo);
            }]);

            function onConsole(line) {
                if (line === 'bar') {
                    context.spooky.removeListener('console', onConsole);
                    done();
                    return;
                }

                out.push(line);
            }
            context.spooky.on('console', onConsole);

            context.spooky.run();
        });
    });

    describe('spooky.thenClick', function () {
        it('adds a new navigation step to click a given selection',
            function (done) {
                context.spooky.start(FIXTURE_URL + '/index.html');

                context.spooky.thenClick('a');

                context.spooky.waitFor(function () {
                    return this.getTitle() === 'One';
                });

                context.spooky.then(function () {
                    this.echo('done');
                });

                function onConsole(line) {
                    if (line === 'done') {
                        context.spooky.removeListener('console', onConsole);
                        done();
                        return;
                    }
                }
                context.spooky.on('console', onConsole);

                context.spooky.run();
            });
    });

    describe('spooky.thenEvaluate', function () {
        it('throws if passed something that is not a function',
            function (done) {
                context.spooky.swallowErrors = true;
                context.spooky.once('error', function (e) {
                    expect(e.message.toLowerCase()).to.
                        contain('cannot parse function');
                    done();
                });

                context.spooky.thenEvaluate('I am not a valid function');
            });

        it('adds a new step to evaluate code in the current page',
            function (done) {
                context.spooky.start(FIXTURE_URL + '/1.html');

                context.spooky.thenEvaluate(function () {
                    window.__evaluated = true;
                });

                context.spooky.then(function () {
                    this.echo(this.evaluate(function () {
                        return window.__evaluated === true ?
                            'pass' : 'fail';
                    }));
                });

                function onConsole(line) {
                    if (line === 'pass' || line === 'fail') {
                        context.spooky.removeListener('console', onConsole);
                        expect(line).to.be('pass');
                        done();
                        return;
                    }
                }
                context.spooky.on('console', onConsole);

                context.spooky.run();
            });

        it('accepts an optional arguments object',
            function (done) {
                context.spooky.start(FIXTURE_URL + '/1.html');

                context.spooky.thenEvaluate(function (foo) {
                    window.__foo = foo;
                }, { foo: 'bar' });

                context.spooky.waitFor(function () {
                    return this.evaluate(function () {
                        return window.__foo === 'bar';
                    });
                });

                context.spooky.then(function () {
                    this.echo('done');
                });

                function onConsole(line) {
                    if (line === 'done') {
                        context.spooky.removeListener('console', onConsole);
                        done();
                        return;
                    }
                }
                context.spooky.on('console', onConsole);

                context.spooky.run();
            });

        // TODO: Figure out how to test the optional settings object
    });

    describe('spooky.thenOpen', function () {
        it('adds a new navigation step that opens a new location',
            function (done) {
                context.spooky.start();

                context.spooky.thenOpen(FIXTURE_URL + '/1.html');

                context.spooky.waitFor(function () {
                    return this.getTitle() === 'One';
                });

                context.spooky.then(function () {
                    this.echo('done');
                });

                function onConsole(line) {
                    if (line === 'done') {
                        context.spooky.removeListener('console', onConsole);
                        done();
                        return;
                    }
                }
                context.spooky.on('console', onConsole);

                context.spooky.run();
            });
        });

    describe('spooky.thenOpenAndEvaluate', function () {
        it('throws if passed something that is not a function',
            function (done) {
                context.spooky.swallowErrors = true;
                context.spooky.once('error', function (e) {
                    expect(e.message.toLowerCase()).to.
                        contain('cannot parse function');
                    done();
                });

                context.spooky.thenOpenAndEvaluate(FIXTURE_URL + '/1.html',
                    'I am not a valid function');
            });

        it('adds a new step to evaluate code in the current page',
            function (done) {
                context.spooky.start();

                context.spooky.thenOpenAndEvaluate(FIXTURE_URL + '/1.html',
                    function () {
                        window.__evaluated = true;
                    });

                context.spooky.then(function () {
                    this.echo(this.evaluate(function () {
                        return window.__evaluated === true ?
                            'pass' : 'fail';
                    }));
                });

                function onConsole(line) {
                    if (line === 'pass' || line === 'fail') {
                        context.spooky.removeListener('console', onConsole);
                        expect(line).to.be('pass');
                        done();
                        return;
                    }
                }
                context.spooky.on('console', onConsole);

                context.spooky.run();
            });

        it('accepts an optional arguments object',
            function (done) {
                context.spooky.start();

                context.spooky.thenOpenAndEvaluate(FIXTURE_URL + '/1.html',
                    function (foo) {
                        window.__foo = foo;
                    }, { foo: 'bar' });

                context.spooky.waitFor(function () {
                    return this.evaluate(function () {
                        return window.__foo === 'bar';
                    });
                });

                context.spooky.then(function () {
                    this.echo('done');
                });

                function onConsole(line) {
                    if (line === 'done') {
                        context.spooky.removeListener('console', onConsole);
                        done();
                        return;
                    }
                }
                context.spooky.on('console', onConsole);

                context.spooky.run();
            });

        // TODO: Figure out how to test the optional settings object
    });

    afterEach(hooks.after(context));
});

