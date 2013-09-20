var util = require('util');
var expect = require('expect.js');

describe("Spooky provides Casper's wait* functions", function () {
    var context = {};
    var hooks = require('../util/hooks');
    var FIXTURE_URL = hooks.FIXTURE_URL;

    beforeEach(hooks.before(context));

    describe('spooky.wait', function () {
        it('throws if passed something that is not a function',
            function (done) {
                context.spooky.swallowErrors = true;
                context.spooky.once('error', function (e) {
                    expect(e.message.toLowerCase()).to.
                        contain('cannot parse function');
                    done();
                });

                context.spooky.wait(100, 'I am not a valid function');
            });

        it('pause step execution for a given amount of time',
            function (done) {
                var out = [];

                context.spooky.start();

                context.spooky.then(function () {
                    this.__time = Date.now();
                });

                context.spooky.wait(500);

                context.spooky.then(function () {
                    this.echo(Date.now() - this.__time >= 500 ?
                        'pass' : 'fail');
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

        it('optionally executes a step on done',
            function (done) {
                var out = [];

                context.spooky.start();

                context.spooky.wait(500, function () {
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

        it('accepts a function tuple', function (done) {
            var out = [];

            context.spooky.start();

            context.spooky.wait(500, [{
                done: 'done'
            }, function () {
                this.echo(done);
            }]);

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

    describe('spooky.waitFor', function () {
        it('throws if passed a test that is not a function',
            function (done) {
                context.spooky.swallowErrors = true;
                context.spooky.once('error', function (e) {
                    expect(e.message.toLowerCase()).to.
                        contain('cannot parse function');
                    done();
                });

                context.spooky.waitFor('I am not a valid function');
            });

        it('throws if passed a next step that is not a function',
            function (done) {
                context.spooky.swallowErrors = true;
                context.spooky.once('error', function (e) {
                    expect(e.message.toLowerCase()).to.
                        contain('cannot parse function');
                    done();
                });

                context.spooky.waitFor(function testFn() {},
                    'I am not a valid function');
            });

        it('throws if passed a timeout callback that is not a function',
            function (done) {
                context.spooky.swallowErrors = true;
                context.spooky.once('error', function (e) {
                    expect(e.message.toLowerCase()).to.
                        contain('cannot parse function');
                    done();
                });

                context.spooky.waitFor(function testFn() {},
                    function then() {},
                    'I am not a valid function');
            });

        it('waits until the test returns true to run the next step',
            function (done) {
                var out = [];

                context.spooky.start();

                context.spooky.then(function () {
                    this.__time = Date.now();
                });

                context.spooky.waitFor(function () {
                    return Date.now() - this.__time >= 500;
                });

                context.spooky.then(function () {
                    this.echo(Date.now() - this.__time >= 500 ?
                        'pass' : 'fail');
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

        it('accepts an optional next step', function (done) {
            context.spooky.start();

            context.spooky.waitFor(function () {
                return true;
            }, function () {
                this.__yup = true;
            });

            context.spooky.then(function () {
                this.echo(this.__yup === true ? 'pass' : 'fail');
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

        it('accepts an optional timeout callback', function (done) {
            context.spooky.start();

            context.spooky.waitFor(function () {
                return false;
            }, null, function () {
                this.echo('done');
            }, 100);

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

        it('accepts an optional timeout', function (done) {
            context.spooky.start();

            context.spooky.then(function () {
                this.__time = Date.now();
            });

            context.spooky.waitFor(function () {
                return false;
            }, null, function () {
                this.echo(Date.now() - this.__time >= 500 ?
                    'pass' : 'fail');
            }, 500);

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
    });

    describe('spooky.waitForPopup', function () {
        it('throws if passed a next step that is not a function',
            function (done) {
                context.spooky.swallowErrors = true;
                context.spooky.once('error', function (e) {
                    expect(e.message.toLowerCase()).to.
                        contain('cannot parse function');
                    done();
                });

                context.spooky.waitForPopup('',
                    'I am not a valid function');
            });

        it('throws if passed a timeout callback that is not a function',
            function (done) {
                context.spooky.swallowErrors = true;
                context.spooky.once('error', function (e) {
                    expect(e.message.toLowerCase()).to.
                        contain('cannot parse function');
                    done();
                });

                context.spooky.waitForPopup('',
                    function then() {},
                    'I am not a valid function');
            });

        it('waits until the popup is opened to run the next step',
            function (done) {
                context.spooky.start(FIXTURE_URL + '/popup.html');

                context.spooky.then(function () {
                    if (this.popups.length > 0) {
                        throw new Error('Found unexpected open popup');
                    }
                });

                context.spooky.thenClick('#popup1');
                context.spooky.waitForPopup('1.html');

                context.spooky.then(function () {
                    if (this.popups.length !== 1) {
                        throw new Error('Expected one popup but saw ' +
                            this.popups.length);
                    }
                    this.emit('done');
                });

                context.spooky.on('done', done);

                context.spooky.run();
            });

        it('accepts an optional next step', function (done) {
            context.spooky.start(FIXTURE_URL + '/popup.html');

            context.spooky.thenClick('#popup1');
            context.spooky.waitForPopup('1.html', function () {
                this.emit('done');
            });

            context.spooky.on('done', done);

            context.spooky.run();
        });

        it('accepts an optional timeout callback', function (done) {
            context.spooky.start(FIXTURE_URL + '/popup.html');

            context.spooky.waitForPopup('not-gonna-match', null, function () {
                this.emit('done');
            }, 100);

            context.spooky.on('done', done);

            context.spooky.run();
        });

        it('accepts an optional timeout', function (done) {
            context.spooky.start(FIXTURE_URL + '/popup.html');

            context.spooky.then(function () {
                this.__time = Date.now();
            });

            context.spooky.waitForPopup('not-gonna-match', null, function () {
                this.emit('done', Date.now() - this.__time);
            }, 500);

            context.spooky.on('done', function (time) {
                expect(time).to.be.greaterThan(500);
                done();
            });

            context.spooky.run();
        });
    });


    describe('spooky.waitForSelector', function () {
        it('throws if passed a next step that is not a function',
            function (done) {
                context.spooky.swallowErrors = true;
                context.spooky.once('error', function (e) {
                    expect(e.message.toLowerCase()).to.
                        contain('cannot parse function');
                    done();
                });

                context.spooky.waitForSelector('',
                    'I am not a valid function');
            });

        it('throws if passed a timeout callback that is not a function',
            function (done) {
                context.spooky.swallowErrors = true;
                context.spooky.once('error', function (e) {
                    expect(e.message.toLowerCase()).to.
                        contain('cannot parse function');
                    done();
                });

                context.spooky.waitForSelector('',
                    function then() {},
                    'I am not a valid function');
            });

        it('waits until the selector matches to run the next step',
            function (done) {
                var out = [];

                context.spooky.start(FIXTURE_URL + '/1.html');

                context.spooky.then(function () {
                    this.__time = Date.now();
                    this.evaluate(function () {
                        setTimeout(function () {
                            document.querySelector('#one').className = 'foo';
                        }, 500);
                    });
                });

                context.spooky.waitForSelector('.foo');

                context.spooky.then(function () {
                    this.echo(Date.now() - this.__time >= 500 ?
                        'pass' : 'fail');
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

        it('accepts an optional next step', function (done) {
            context.spooky.start(FIXTURE_URL + '/1.html');

            context.spooky.waitForSelector('#one', function () {
                this.__yup = true;
            });

            context.spooky.then(function () {
                this.echo(this.__yup === true ? 'pass' : 'fail');
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

        it('accepts an optional timeout callback', function (done) {
            context.spooky.start(FIXTURE_URL + '/1.html');

            context.spooky.waitForSelector('#not-gonna-match', null, function () {
                this.echo('done');
            }, 100);

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

        it('accepts an optional timeout', function (done) {
            context.spooky.start(FIXTURE_URL + '/1.html');

            context.spooky.then(function () {
                this.__time = Date.now();
            });

            context.spooky.waitForSelector('#not-gonna-match', null, function () {
                this.echo(Date.now() - this.__time >= 500 ?
                    'pass' : 'fail');
            }, 500);

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
    });

    describe('spooky.waitWhileSelector', function () {
        it('throws if passed a next step that is not a function',
            function (done) {
                context.spooky.swallowErrors = true;
                context.spooky.once('error', function (e) {
                    expect(e.message.toLowerCase()).to.
                        contain('cannot parse function');
                    done();
                });

                context.spooky.waitWhileSelector('',
                    'I am not a valid function');
            });

        it('throws if passed a timeout callback that is not a function',
            function (done) {
                context.spooky.swallowErrors = true;
                context.spooky.once('error', function (e) {
                    expect(e.message.toLowerCase()).to.
                        contain('cannot parse function');
                    done();
                });

                context.spooky.waitWhileSelector('',
                    function then() {},
                    'I am not a valid function');
            });

        it('waits until the selector does not match to run the next step',
            function (done) {
                var out = [];

                context.spooky.start(FIXTURE_URL + '/1.html');

                context.spooky.then(function () {
                    this.__time = Date.now();
                    this.evaluate(function () {
                        document.querySelector('#one').className = 'foo';
                        setTimeout(function () {
                            document.querySelector('#one').className = '';
                        }, 500);
                    });
                });

                context.spooky.waitWhileSelector('.foo');

                context.spooky.then(function () {
                    this.echo(Date.now() - this.__time >= 500 ?
                        'pass' : 'fail');
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

        it('accepts an optional next step', function (done) {
            context.spooky.start(FIXTURE_URL + '/1.html');

            context.spooky.waitWhileSelector('#not-gonna-match', function () {
                this.__yup = true;
            });

            context.spooky.then(function () {
                this.echo(this.__yup === true ? 'pass' : 'fail');
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

        it('accepts an optional timeout callback', function (done) {
            context.spooky.start(FIXTURE_URL + '/1.html');

            context.spooky.waitWhileSelector('#one', null, function () {
                this.echo('done');
            }, 100);

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

        it('accepts an optional timeout', function (done) {
            context.spooky.start(FIXTURE_URL + '/1.html');

            context.spooky.then(function () {
                this.__time = Date.now();
            });

            context.spooky.waitWhileSelector('#one', null, function () {
                this.echo(Date.now() - this.__time >= 500 ?
                    'pass' : 'fail');
            }, 500);

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
    });

    describe('spooky.waitForResource', function () {
        it('throws if passed a next step that is not a function',
            function (done) {
                context.spooky.swallowErrors = true;
                context.spooky.once('error', function (e) {
                    expect(e.message.toLowerCase()).to.
                        contain('cannot parse function');
                    done();
                });

                context.spooky.waitForResource('',
                    'I am not a valid function');
            });

        it('throws if passed a timeout callback that is not a function',
            function (done) {
                context.spooky.swallowErrors = true;
                context.spooky.once('error', function (e) {
                    expect(e.message.toLowerCase()).to.
                        contain('cannot parse function');
                    done();
                });

                context.spooky.waitForResource('',
                    function then() {},
                    'I am not a valid function');
            });

        it('waits until a resource is loaded to run the next step',
            function (done) {
                var out = [];

                context.spooky.start(FIXTURE_URL + '/1.html');

                context.spooky.then(function () {
                    this.__time = Date.now();
                    this.evaluate(function () {
                        setTimeout(function () {
                            document.querySelector('body').
                                style.background = 'url(fail-road.jpeg)';
                        }, 500);
                    });
                });

                context.spooky.waitForResource('fail-road.jpeg');

                context.spooky.then(function () {
                    this.echo(Date.now() - this.__time >= 500 ?
                        'pass' : 'fail');
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

        it('accepts an optional next step', function (done) {
            context.spooky.start(FIXTURE_URL + '/1.html');

            context.spooky.thenEvaluate(function () {
                document.querySelector('body').
                    style.background = 'url(fail-road.jpeg)';
            });

            context.spooky.waitForResource('fail-road.jpeg', function () {
                this.__yup = true;
            });

            context.spooky.then(function () {
                this.echo(this.__yup === true ? 'pass' : 'fail');
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

        it('accepts an optional timeout callback', function (done) {
            context.spooky.start(FIXTURE_URL + '/1.html');

            context.spooky.waitForResource('fail-road.jpeg', null, function () {
                this.echo('done');
            }, 100);

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

        it('accepts an optional timeout', function (done) {
            context.spooky.start(FIXTURE_URL + '/1.html');

            context.spooky.then(function () {
                this.__time = Date.now();
            });

            context.spooky.waitForResource('fail-road.jpeg', null, function () {
                this.echo(Date.now() - this.__time >= 500 ?
                    'pass' : 'fail');
            }, 500);

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
    });

    describe('spooky.waitUntilVisible', function () {
        it('throws if passed a next step that is not a function',
            function (done) {
                context.spooky.swallowErrors = true;
                context.spooky.once('error', function (e) {
                    expect(e.message.toLowerCase()).to.
                        contain('cannot parse function');
                    done();
                });

                context.spooky.waitUntilVisible('',
                    'I am not a valid function');
            });

        it('throws if passed a timeout callback that is not a function',
            function (done) {
                context.spooky.swallowErrors = true;
                context.spooky.once('error', function (e) {
                    expect(e.message.toLowerCase()).to.
                        contain('cannot parse function');
                    done();
                });

                context.spooky.waitUntilVisible('',
                    function then() {},
                    'I am not a valid function');
            });

        it('waits until the selector matches a visible element to run the next step',
            function (done) {
                var out = [];

                context.spooky.start(FIXTURE_URL + '/1.html');

                context.spooky.then(function () {
                    this.__time = Date.now();
                    this.evaluate(function () {
                        document.querySelector('#one').style.display = 'none';
                        setTimeout(function () {
                            document.querySelector('#one').style.display = 'block';
                        }, 500);
                    });
                });

                context.spooky.waitUntilVisible('#one');

                context.spooky.then(function () {
                    this.echo(Date.now() - this.__time >= 500 ?
                        'pass' : 'fail');
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

        it('accepts an optional next step', function (done) {
            context.spooky.start(FIXTURE_URL + '/1.html');

            context.spooky.waitUntilVisible('#one', function () {
                this.__yup = true;
            });

            context.spooky.then(function () {
                this.echo(this.__yup === true ? 'pass' : 'fail');
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

        it('accepts an optional timeout callback', function (done) {
            context.spooky.start(FIXTURE_URL + '/1.html');

            context.spooky.thenEvaluate(function () {
                document.querySelector('#one').style.display = 'none';
            });

            context.spooky.waitUntilVisible('#one', null, function () {
                this.echo('done');
            }, 100);

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

        it('accepts an optional timeout', function (done) {
            context.spooky.start();

            context.spooky.then(function () {
                this.__time = Date.now();
            });

            context.spooky.thenEvaluate(function () {
                document.querySelector('#one').style.display = 'none';
            });

            context.spooky.waitUntilVisible('#one', null, function () {
                this.echo(Date.now() - this.__time >= 500 ?
                    'pass' : 'fail');
            }, 500);

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
    });

    describe('spooky.waitWhileVisible', function () {
        it('throws if passed a next step that is not a function',
            function (done) {
                context.spooky.swallowErrors = true;
                context.spooky.once('error', function (e) {
                    expect(e.message.toLowerCase()).to.
                        contain('cannot parse function');
                    done();
                });

                context.spooky.waitWhileVisible('',
                    'I am not a valid function');
            });

        it('throws if passed a timeout callback that is not a function',
            function (done) {
                context.spooky.swallowErrors = true;
                context.spooky.once('error', function (e) {
                    expect(e.message.toLowerCase()).to.
                        contain('cannot parse function');
                    done();
                });

                context.spooky.waitWhileVisible('',
                    function then() {},
                    'I am not a valid function');
            });

        it('waits until the selector does not match a visible element to run the next step',
            function (done) {
                var out = [];

                context.spooky.start(FIXTURE_URL + '/1.html');

                context.spooky.then(function () {
                    this.__time = Date.now();
                    this.evaluate(function () {
                        setTimeout(function () {
                            document.querySelector('#one').style.display = 'none';
                        }, 500);
                    });
                });

                context.spooky.waitWhileVisible('#one');

                context.spooky.then(function () {
                    this.echo(Date.now() - this.__time >= 500 ?
                        'pass' : 'fail');
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

        it('accepts an optional next step', function (done) {
            context.spooky.start(FIXTURE_URL + '/1.html');

            context.spooky.thenEvaluate(function () {
                document.querySelector('#one').style.display = 'none';
            });

            context.spooky.waitWhileVisible('#one', function () {
                this.__yup = true;
            });

            context.spooky.then(function () {
                this.echo(this.__yup === true ? 'pass' : 'fail');
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

        it('accepts an optional timeout callback', function (done) {
            context.spooky.start(FIXTURE_URL + '/1.html');

            context.spooky.waitWhileVisible('#one', null, function () {
                this.echo('done');
            }, 100);

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

        it('accepts an optional timeout', function (done) {
            context.spooky.start(FIXTURE_URL + '/1.html');

            context.spooky.then(function () {
                this.__time = Date.now();
            });

            context.spooky.waitWhileVisible('#one', null, function () {
                this.echo(Date.now() - this.__time >= 500 ?
                    'pass' : 'fail');
            }, 500);

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
    });

    afterEach(hooks.after(context));
});

