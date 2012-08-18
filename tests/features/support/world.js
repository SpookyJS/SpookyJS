var util = require('util');
var casper;

var World = function World(callback) {
    var Spooky = this.Spooky = require('../../../lib/spooky');
    var world = this;
    var spooky;

    this.testUrl = 'http://spookytests:8888';


    this.errors = [];
    if (!casper) {
        casper = Spooky.listen({
            port: 8081,
            script: 'lib/bootstrap.js',
            spooky_lib: './node_modules'
        }, onReady);

        //casper.debug = true;

        // track errors
        casper.errors = [];
        casper.on('error', function (error) {
            casper.errors.push(error);
            if (casper.debug) {
                console.error('casper error', util.inspect(error));
            }
        });

        casper.console = [];
        casper.on('console', function (line) {
            casper.console.push(line);
            if (casper.debug) {
                console.log(line);
            }
        });

        casper.on('log', function (entry) {
            if (!casper.debug) { return; }
            var message = entry.message;
            var event = (message.event || '').toLowerCase();

            if (event === 'request') {
                console.log('%s: %s %s',
                    casper.options.port, message.method, message.request.url);
                console.log(' Headers: %s',
                    util.inspect(message.request.headers));
                console.log(' Payload: %s',
                    util.inspect(JSON.parse(message.request.post)));
            } else if (event === 'response') {
                console.log('%s: %s %s',
                    casper.options.port, message.code,
                    util.inspect(JSON.parse(message.body)));
            } else {
                console.log(casper.options.port + ':');
                console.dir(entry);
            }
        });
    } else {
        onReady();
    }

    function onReady(err) {
        if (err) {
            throw err;
        }
        world.spooky = spooky = Spooky.create({
            port: 8081,
            casper: !casper.debug ? {} : {
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
            throw new Error('Failed to initialize spooky: ' +
                error.code + ' - '  + error.message);
        }

        world.spooky.on('error', function (error) {
            world.errors.push(error);
            if (casper.debug) {
                console.error('spooky error', util.inspect(error));
            }
        });
        callback(world);
    }
};

module.exports.World = World;
