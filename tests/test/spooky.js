var _ = require('underscore');
var Spooky = require('../../lib/spooky');
var expect = require('expect.js');

describe('the Spooky constructor', function () {
    var context = {};
    var hooks = require('../util/hooks');
    var FIXTURE_URL = hooks.FIXTURE_URL;

    describe('accepts an options object', function () {
        describe('options.casper', function () {
            it('serializes function values', function (done) {
                var setupFn;
                
                context = {
                    config: {
                        casper: {
                            verbose: true,
                            logLevel: 'debug',
                            onResourceRequested: function () {
                                this.emit('done');
                            }
                        }
                    }
                };
                setupFn = hooks.before(context);

                setupFn(function () {
                    var spooky = context.spooky;

                    spooky.on('done', done);
                    spooky.start(FIXTURE_URL + '/index.html');
                    spooky.run();
                });
            });

            it('serializes function tuple values', function (done) {
                var setupFn;
                
                context = {
                    config: {
                        casper: {
                            verbose: true,
                            logLevel: 'debug',
                            onResourceRequested: [{
                                done: 'done'
                            }, function () {
                                this.emit(done);
                            }]
                        }
                    }
                };
                setupFn = hooks.before(context);

                setupFn(function () {
                    var spooky = context.spooky;

                    spooky.on('done', done);
                    spooky.start(FIXTURE_URL + '/index.html');
                    spooky.run();
                });
            });

            it('serializes nested function values', function (done) {
                var setupFn;
                
                context = {
                    config: {
                        casper: {
                            verbose: true,
                            logLevel: 'debug',
                            httpStatusHandlers: {
                                200: function () {
                                    this.emit('done');
                                }
                            }
                        }
                    }
                };
                setupFn = hooks.before(context);

                setupFn(function () {
                    var spooky = context.spooky;

                    spooky.on('done', done);
                    spooky.start(FIXTURE_URL + '/index.html');
                    spooky.run();
                });
            });

            it('serializes nested function tuple values', function (done) {
                var setupFn;

                context = {
                    config: {
                        casper: {
                            verbose: true,
                            logLevel: 'debug',
                            httpStatusHandlers: {
                                200: [{
                                    done: 'done'
                                }, function () {
                                    this.emit(done);
                                }]
                            }
                        }
                    }
                };
                setupFn = hooks.before(context);

                setupFn(function () {
                    var spooky = context.spooky;

                    spooky.on('done', done);
                    spooky.start(FIXTURE_URL + '/index.html');
                    spooky.run();
                });
            });
        });

        describe('options.child', function () {
            it('accepts a spawnOptions to pass to child_process.spawn',
                function (done) {
                    var setupFn;

                    context = {
                        config: {
                            child: {
                                spawnOptions: {
                                    env: _.defaults({
                                        done: 'done'
                                    }, process.env)
                                }
                            }
                        }
                    };
                    setupFn = hooks.before(context);

                    setupFn(function () {
                        var spooky = context.spooky;

                        spooky.on('done', done);
                        spooky.start(FIXTURE_URL + '/index.html');
                        spooky.then(function () {
                            this.emit(require('system').env.done);
                        });
                        spooky.run();
                    });
                });
        });
    });
});
