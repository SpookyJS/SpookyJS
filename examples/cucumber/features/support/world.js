var util = require('util');
var Spooky = require('../../../../lib/spooky');

var World = function World(callback) {
    var spooky;
    var world = this;

    this.baseUrl = 'http://localhost:' + process.env.TEST_PORT;

    try {
        spooky = world.spooky = new Spooky({
            casper: {
                verbose: true,
                logLevel: 'debug'
            },
            child: {
                port: 8081,
                spooky_lib: './',
                script: './lib/bootstrap.js'
            }
        }, onCreated);
    } catch (e) {
        console.dir(e);
        console.trace('Spooky.listen failed');
    }

    //spooky.debug = true;

    // track errors
    spooky.errors = [];
    spooky.on('error', function (error) {
        error = error.data ? error.data : error;
        spooky.errors.push(error);
        if (spooky.debug) {
            console.error('spooky error', util.inspect(error));
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
            console.dir(error);
            throw new Error('Failed to initialize context.spooky: ' +
                error.code + ' - '  + error.message);
        }

        callback(world);
    }
};

module.exports.World = World;
