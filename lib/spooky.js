var spawn = require('child_process').spawn;
var _ = require('underscore');
var http = require('http');
var async = require('async');
var EventEmitter = require('events').EventEmitter;

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

    if (callback) {
        server.stdout.once('data', function () {
            callback();
        });
    }

    this._servers[[options.script, options.port].join(' ')] = server;

    return server;
};

Spooky.create = function (options, callback) {
    return new Spooky(options, callback);
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

function call(method, callback, options, params) {
    options = _.defaults(options || {}, requestDefaults);
    callback = callback || defaultCallback;
    var packet = _.defaults({ method: method, params: params }, rpcDefaults);
    var req;

    packet.id = getNextRpcId();
    for (var k in packet.params) {
        if (_.isFunction(packet.params[k])) {
            packet.params[k] = packet.params[k].toString();
        }
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
