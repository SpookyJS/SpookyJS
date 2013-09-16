var _ = require('underscore');
var util = require('util');
var Spooky = require('../../lib/spooky');

function setup (context, done) {
    var spooky;

    try {
        spooky = context.spooky = new Spooky(context.config, onCreated);
    } catch (e) {
        console.log(util.inspect(e, false, 3));
        console.log(e.stack);
        console.trace('Spooky.listen failed');
    }

    spooky.debug = !!process.env.TEST_DEBUG;

    // track errors
    spooky.errors = [];
    spooky.on('error', function (error) {
        error = error.data ? error.data : error;
        spooky.errors.push(error);

        if (!spooky.swallowErrors) {
            if (spooky.debug) {
                console.error('spooky error', util.inspect(error));
            }
            throw new Error(error.message);
        }
    });

    spooky.console = [];
    spooky.on('console', function (line) {
        spooky.console.push(line);
        if (spooky.debug) {
            console.log(line);
        }
    });

    spooky.on('log', function (entry) {
        if (!spooky.debug) { return; }
        var message = entry.message;
        var event = (message.event || '').toLowerCase();

        if (event === 'request') {
            console.log('%s: %s %s',
                spooky.options.port, message.method, message.request.url);
            console.log(' Headers: %s',
                util.inspect(message.request.headers));
            console.log(' Payload: %s',
                util.inspect(JSON.parse(message.request.post)));
        } else if (event === 'response') {
            console.log('%s: %s %s',
                spooky.options.port, message.code,
                util.inspect(JSON.parse(message.body)));
        } else {
            console.log(spooky.options.port + ':');
            console.dir(entry);
        }
    });

    function onCreated(error, response) {
        if (error) {
            console.trace(error);
            console.dir(error);
            throw new Error('Failed to initialize context.spooky: ' +
                error.code + ' - '  + error.message);
        }

        done();
    }
}

module.exports.FIXTURE_URL = 'http://localhost:8080';

module.exports.before = function (context) {
    context.config = _.defaults(context.config || {}, {
        child: {
            port: 8081,
            script: 'lib/bootstrap.js',
            spooky_lib: process.cwd() + '/',
            transport: process.env.TEST_TRANSPORT || 'stdio'
        },
        casper: {
            verbose: true,
            logLevel: 'debug'
        }
    });

    return function (done) {
        setup(context, done);
    };
};

module.exports.after = function (context) {
    return function (done) {
        context.spooky.removeAllListeners();
        context.spooky.destroy();
        done();
    };
};
