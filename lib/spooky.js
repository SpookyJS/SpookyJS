var spawn = require('child_process').spawn;
var _ = require('underscore');
var http = require('http');
var async = require('async');
var carrier = require('carrier');
var EventEmitter = require('events').EventEmitter;
var JsonRpcServer = require('tiny-jsonrpc').Server;

var defaults = {
    port: 8080,
    script: './lib/bootstrap.js',
    casper: {}
};

function Spooky(options, callback) {
    this.options = options = _.defaults(_.clone(options || {}), defaults);
    this._q = async.queue(this._callWorker, 1);

    options.casper.port = options.port;
    this._call('create', this._onCreate.bind(this, callback), options.casper);
}

Spooky.prototype = new EventEmitter();
Spooky.prototype.constructor = Spooky;

Spooky._servers = {};

Spooky.listen = function (options, callback) {
    options = _.defaults(options || {}, defaults);
    var server = spawn('casperjs', [ options.script, '--port=' + options.port ]);

    server.stdout.setEncoding('utf8');
    server._rpcserver = new JsonRpcServer();
    server._rpcserver.provide(function emit(instance, event) {
        var args = _.toArray(arguments).slice(1);

        if (_.isNumber(instance)) {
            instance = server._instances[instance];
            instance.emit.apply(instance, args);
        } else {
            server.emit.apply(server, args);
        }
        return true;
    });

    carrier.carry(server.stdout).
        on('line',Spooky._onLine.bind(server, options.port));
    if (callback) {
        server.once('ready', callback);
    }

    server._instances = {};
    this._servers[options.port] = server;

    return server;
};

Spooky.create = function (options, callback) {
    return new Spooky(options, callback);
};

Spooky._onLine = function (port, line) {
    var response;

    try {
        response = JSON.parse(this._rpcserver.respond(line));
        if (response.result === true) {
            return;
        }
    } catch (e) { /* not JSON */ }
    // either the line was not valid JSON or not a valid JSON-RPC request
    console.log(port + ': ' + line);
};

Spooky.prototype._call = function (method, callback, options) {
    var args = _.toArray(arguments);

    params = args.slice(3);
    if (_.isNumber(this._instance)) {
        params.unshift(this._instance);
    }

    args = args.slice(0, 3);
    args.push(params);

    this._q.push({ params: args });
};

Spooky.prototype._callWorker = function (args, callback) {
    var params = args.params;
    var userCallback = params[1];

    params[1] = function (err, error, response) {
        if (userCallback) {
            userCallback.apply(this, arguments);
        }
        callback();
    };

    call.apply(this, params);
};

Spooky.prototype._onCreate = function (callback, err, error, response) {
    if (err) {
        if (callback) {
            callback(err);
            return;
        } else {
            throw err;
        }
    }

    if (error && callback) {
        callback(undefined, error);
    } else {
        this._instance = response.instance;
        Spooky._servers[this.options.port]._instances[this._instance] = this;
        response.methods.forEach(function (method) {
            this[method] =
                this.constructor.prototype._call.
                    bind(this, method, null, { port: this.options.port });
        }, this);

        callback(undefined, undefined, response);
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

function call(method, callback, options, params) {
    options = _.defaults(options || {}, requestDefaults);
    callback = callback || defaultCallback;
    var packet = _.defaults({ method: method, params: params }, rpcDefaults);
    var req;

    packet.id = getNextRpcId();
    for (var k in packet.params) {
        packet.params[k] = serializeFunctions(packet.params[k]);
    }
    packet = JSON.stringify(packet);

    options.headers['Content-Length'] = packet.length;
    
    req = http.request(options, onResponse.bind(this, callback));
    req.on('error', callback);
    req.end(packet);
}

function onResponse(callback, response) {
    var result = '';

    response.on('data', function (data) { result += data; });
    response.on('end', function () {
        var packet = JSON.parse(result);

        if (packet.error) {
            callback(null, packet.error);
        } else {
            callback(null, null, packet.result);
        }
    });
}

module.exports = Spooky;
