var spawn = require('child_process').spawn;
var util = require('util');

var _ = require('underscore');

var async = require('async');

var carrier = require('carrier');
var duplex = require('duplexer');

var EventEmitter = require('events').EventEmitter;
var Stream = require('stream');

var RequestStream = require('./spooky/request-stream');
var FilteredStream = require('./spooky/filtered-stream');

var tinyjsonrpc = require('tiny-jsonrpc');

var defaults = {
    transport: {
        http: {
            host: 'localhost'
        }
    },
    child: {
        command: 'casperjs',
        port: 8081,
        script: __dirname + '/bootstrap.js',
        spooky_lib: __dirname + '/../',
        transport: 'stdio',
        spawnOptions: {}
    },
    casper: {
        verbose: true,
        logLevel: 'debug'
    }
};

function isJsonRpcRequest(s) {
    try {
        s = JSON.parse(s);
        return s.jsonrpc === '2.0' && 'method' in s;
    } catch (e) { /* intentionally empty */ }
    return false;
}

function isJsonRpcResponse(s) {
    try {
        s = JSON.parse(s);
        return s.jsonrpc === '2.0' &&
            ('result' in s || 'error' in s);
    } catch (e) { /* intentionally empty */ }
    return false;
}

function Spooky(options, callback) {
    EventEmitter.call(this);
    this.options = options = _.defaults(_.clone(options || {}), defaults);

    for (var k in defaults) {
        if (defaults[k] && _.isObject(defaults[k]) && !_.isArray(defaults[k])) {
            this.options[k] =
                _.defaults(_.clone(options[k] || {}), defaults[k]);
        }
    }
    options.transport = _.defaults(options.transport, defaults.transport);

    this._q = async.queue(this._callWorker.bind(this), 1);

    serializeMethods(options.casper);

    if (options.child.transport === 'http') {
        this._child = Spooky._instances[options.port] = this._spawnChild();

        this._rpcClient = new tinyjsonrpc.StreamClient({
            server: new RequestStream({
                host: options.transport.http.host,
                port: options.child.port
            })
        });
    } else if (options.child.transport === 'stdio') {
        this._child =
            Spooky._instances['stdio' + Spooky._nextInstanceId++] =
                this._spawnChild();

        this._rpcClient = new tinyjsonrpc.StreamClient({
            server: duplex(this._child.stdin,
                new FilteredStream(this._child.stdout, isJsonRpcResponse))
        });

        // must terminate requests with a linefeed
        this._rpcClient._send = function _send (request) {
            var success;

            if (this._server.full) {
                this._server.buffer.push(request);
            } else {
                try {
                    request = JSON.stringify(request);
                } catch (e) {
                    throw 'Could not serialize request to JSON';
                }

                this._server.full = !this._server.stream.write(request + '\n');
            }
        };
    } else {
        throw new Error('Unknown transport ' + options.child.transport);
    }

    // listen for JSON-RPC requests from the child
    this._rpcServer = new tinyjsonrpc.StreamServer();
    this._rpcServer.listen(duplex(
            this._child.stdin,
            new FilteredStream(this._child.stdout, isJsonRpcRequest)));

    this._rpcServer.provide({
        emit: (function (event) {
            this.emit.apply(this, arguments);

            return true;
        }).bind(this)
    });

    this.once('ready', (function () {
        this._call('create',
            this._onCreate.bind(this, callback),
            options.casper
        );
    }).bind(this));
}

util.inherits(Spooky, EventEmitter);

Spooky._instances = {};
Spooky._nextInstanceId = 0;

// clean up if spooky dies
process.on('exit', function (code, signal) {
    _.each(Spooky._instances, function (server) {
        server.kill();
    });
});

Spooky.prototype._spawnChild = function () {
    var options = this.options.child;
    var args = [ options.script ];
    var child;

    for (var k in options) {
        if (k !== 'script') {
            args.push('--' + k + '=' + options[k]);
        }
    }

    if (Spooky._instances[options.port]) {
        throw new Error('Already running a server on port ' + options.port);
    }

    child = this._child = spawn(options.command, args, options.spawnOptions);

    var stdout = child.stdout;
    stdout.setEncoding('utf8');
    child.stdout = new Stream();
    carrier.carry(stdout).on('line', (function (line) {
        this.stdout.emit('data', line);
    }).bind(child));

    // emit anything that isn't JSON-RPC traffic as a console event
    (new FilteredStream(child.stdout, function (data) {
        return !isJsonRpcResponse(data) && !isJsonRpcRequest(data);
    })).on('data', (function (data) {
        this.emit('console', data.toString());
    }).bind(this));

    child.on('exit', (function (code, signal) {
        var e;

        if (code) {
            e = new Error('Child terminated with non-zero exit code ' + code);
            e.details = {
                code: code,
                signal: signal
            };
            this.emit('error', e);
        }
    }).bind(this));
    return child;
};

Spooky.prototype.destroy = function () {
    this._child.kill();
    delete Spooky._instances[this.options.child.port];
};

Spooky.create = function (options, callback) {
    return new Spooky(options, callback);
};

Spooky.prototype._onLine = function (line) {
    var response;

    try {
        response = JSON.parse(this._rpcServer.respond(line));
        if (response.result === true) {
            return;
        }
    } catch (e) { /* not JSON */ }
    // either the line was not valid JSON or not a valid JSON-RPC request

    this.emit('console', line);
};

Spooky.prototype._call = function (method, callback) {
    var args = _.toArray(arguments);
    var params = args.slice(2);

    for (var i = 0; i < params.length; i++) {
        params[i] =  serializeFunctions(params[i]);
    }

    this._q.push({
        method: method,
        callback: callback,
        params: params
    });
};

// FIXME: does `callback` ever get used?
Spooky.prototype._callWorker = function (options, callback) {
    var userCallback = options.callback;

    options.callback = (function (error, response) {
        if (userCallback) {
            userCallback.apply(this, arguments);
        }

        if (error) {
            this.emit('error', error);
        }

        callback(error, response);
    }).bind(this);

    //call.apply(this, params);
    this._rpcClient.request(options);
};

Spooky.prototype._onCreate = function (callback, error, response) {
    var e;

    if (!error) {
        response.methods.forEach(function (method) {
                this[method] =
                    this.constructor.prototype._call.bind(this, method, null);
            }, this);
    }

    if (callback) {
        callback(error, response);
    } else if (error) {
        e = new Error('Could not create Spooky instance');
        e.details = error;
        throw e;
    }
};

function defaultCallback(error, response) {
    console.log(error, response);
}

function isFunctionTuple(a) {
    return _.isArray(a) &&
        a.length === 2 &&
        _.isObject(a[0]) &&
        _.isFunction(a[1]);
}

function serializeFunctions(x) {
    if (_.isFunction(x)) {
        x = x.toString();
    } else if (isFunctionTuple(x)) {
        x[1] = x[1].toString();
    }

    return x;
}

// serialize function values recursively
function serializeMethods(o) {
    var v;

    for (var k in o) {
        v = o[k];

        if (_.isObject(v) && !_.isArray(v) && !_.isFunction(v)) {
            serializeMethods(v);
        } else {
            o[k] = serializeFunctions(v);
        }
    }
}

module.exports = Spooky;
