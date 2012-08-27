var _ = require('underscore');
var util = require('util');
var Spooky = require('../../lib/spooky');

/*
 * TODO: rename before and after to connect and disconnect or something like
 * that. Then provide a start function as well.
 *
 * We need to be able to spin up and tear down a server, and also to start and
 * then run that server.
 */
function setup (context, done) {
    try {
        context.casper = Spooky.listen(context.config, onReady);
    } catch (e) {
        console.dir(e)
        console.trace('Spooky.listen failed');
    }

    //context.casper.debug = true;

    // track errors
    context.casper.errors = [];
    context.casper.on('error', function (error) {
        context.casper.errors.push(error);
        if (context.casper.debug) {
            console.error('context.casper error', util.inspect(error));
        }
    });

    context.casper.console = [];
    context.casper.on('console', function (line) {
        context.casper.console.push(line);
        if (context.casper.debug) {
            console.log(line);
        }
    });

    context.casper.on('log', function (entry) {
        if (!context.casper.debug) { return; }
        var message = entry.message;
        var event = (message.event || '').toLowerCase();

        if (event === 'request') {
            console.log('%s: %s %s',
                context.casper.options.port, message.method, message.request.url);
            console.log(' Headers: %s',
                util.inspect(message.request.headers));
            console.log(' Payload: %s',
                util.inspect(JSON.parse(message.request.post)));
        } else if (event === 'response') {
            console.log('%s: %s %s',
                context.casper.options.port, message.code,
                util.inspect(JSON.parse(message.body)));
        } else {
            console.log(context.casper.options.port + ':');
            console.dir(entry);
        }
    });

    function onReady(err) {
        if (err) {
            throw err;
        }

        context.spooky = Spooky.create({
            port: 8081,
            casper: {
                verbose: true,
                logLevel: 'debug'
            }
        }, onCreated);
    }

    function onCreated(err, error, response) {
        if (err) {
            throw err;
        } else if (error) {
            console.dir(error);
            throw new Error('Failed to initialize context.spooky: ' +
                error.code + ' - '  + error.message);
        }

        context.spooky.on('error', function (error) {
            error = error.data ? error.data : error;
            context.casper.errors.push(error);
            if (context.casper.debug) {
                console.error('context.spooky error', util.inspect(error));
            }
        });
        done();
    }
}

module.exports.FIXTURE_URL = 'http://localhost:8080';

module.exports.before = function (context) {
    context.config = _.defaults(context.config || {}, {
        port: 8081,
        script: 'lib/bootstrap.js',
        spooky_lib: './node_modules',
    });

    return function (done) {
        //this.timeout(10000);
        setup(context, done);
    };
};

module.exports.after = function (context) {
    return function (done) {
        context.spooky.removeAllListeners();
        context.casper.removeAllListeners();
        Spooky.unlisten(context.config.port);
        done();
    };
};
