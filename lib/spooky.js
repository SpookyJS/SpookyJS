var spawn = require('child_process').spawn;
var util = require('util');
var _ = require('underscore');
var http = require('http');
var async = require('async');
var carrier = require('carrier');
var EventEmitter = require('events').EventEmitter;
var JsonRpcServer = require('tiny-jsonrpc').Server;

var defaults = {
    child: {
        command: 'casperjs',
        port: 8081,
        script: './node_modules/spooky/lib/bootstrap.js',
        spooky_lib: './node_modules/spooky/node_modules'
    },
    casper: {
        /*
        verbose: true,
        logLevel: 'debug'
        */
    }
};

function Spooky(options, callback) {
    this.options = options = _.defaults(_.clone(options || {}), defaults);

    for (var k in defaults) {
        if (defaults[k] && _.isObject(defaults[k]) && !_.isArray(defaults[k])) {
            this.options[k] =
                _.defaults(_.clone(options[k] || {}), defaults[k]);
        }
    }

    this._rpcserver = new JsonRpcServer();
    this._rpcserver.provide({
        emit: (function (event) {
            this.emit.apply(this, arguments);

            return true;
        }).bind(this)
    });

    this._q = async.queue(this._callWorker.bind(this), 1);

    this._spawnChild();

    this.once('ready', (function () {
        this._call('create',
            this._onCreate.bind(this, callback),
            options.casper
        );
    }).bind(this));
}

Spooky.prototype = new EventEmitter();
Spooky.prototype.constructor = Spooky;

Spooky._instances = {};

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

    child = this._child = spawn('casperjs', args);

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

    child.stdout.setEncoding('utf8');

    carrier.carry(child.stdout).on('line', this._onLine.bind(this));

    Spooky._instances[options.port] = child;
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
        response = JSON.parse(this._rpcserver.respond(line));
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

    args = args.slice(0, 2);
    args.push(params);

    this._q.push({ params: args });
};

Spooky.prototype._callWorker = function (args, callback) {
    var params = args.params;
    var userCallback = params[1];

    params[1] = (function (err, error, response) {
        if (userCallback) {
            userCallback.apply(this, arguments);
        }

        if (err || error) {
            this.emit('error', err || error);
        }

        callback(err, error, response);
    }).bind(this);

    call.apply(this, params);
};

Spooky.prototype._onCreate = function (callback, err, error, response) {
    var e;

    if (!(err || error)) {
        response.methods.forEach(function (method) {
                this[method] =
                    this.constructor.prototype._call.bind(this, method, null);
            }, this);
    }

    if (callback) {
        callback(err, error, response);
    } else if (err || error) {
        e = new Error('Could not create Spooky instance');
        e.details = err || error;
        throw e;
    }
};

var requestDefaults = {
    host: 'localhost',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

var rpcDefaults = {
    jsonrpc: '2.0'
};

var getNextRpcId = (function () {
    var nextId = 0;

    return function () {
        var id = nextId;
        nextId++;
        return id;
    }
}());

function defaultCallback(err, error, response) {
    console.log(err, error, response);
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

function call(method, callback, params) {
    callback = callback || defaultCallback;
    var options = _.defaults(this.options || {}, requestDefaults);
    var packet = _.defaults({ method: method, params: params }, rpcDefaults);
    var req;

    packet.id = getNextRpcId();
    for (var k in packet.params) {
        packet.params[k] = serializeFunctions(packet.params[k]);
    }
    packet = JSON.stringify(packet);

    options.port = options.child.port;
    options.headers['Content-Length'] = packet.length;
    
    req = http.request(options, onResponse.bind(this, callback));
    req.on('error', callback);
    req.end(packet);
}

function onResponse(callback, response) {
    var result = '';

    response.on('data', function (data) { result += data; });
    response.on('end', function () {
        var packet;

        try {
            packet = JSON.parse(result);
        } catch (e) {
            callback(e);
            return;
        }

        if (packet.error) {
            callback(null, packet.error);
        } else {
            callback(null, null, packet.result);
        }
    });
}

module.exports = Spooky;
