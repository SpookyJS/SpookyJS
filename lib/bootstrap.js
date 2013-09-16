function emit(event) {
    var args = Array.prototype.slice.call(arguments);

    console.log(JSON.stringify({
        jsonrpc: '2.0',
        method: 'emit',
        params: args
    }));
}

phantom.onError = function bootstrapOnError(msg, trace) {
    emit('error', msg, trace);
    phantom.exit(1);
};

// source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
        // closest thing possible to the ECMAScript 5 internal IsCallable function
        throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function () {},
        fBound = function () {
            return fToBind.apply(this instanceof fNOP && oThis
                ? this
                : oThis,
                aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
};

var options = phantom.casperArgs.options;
phantom.requireBase = options.spooky_lib + 'node_modules/';
var emit = require(options.spooky_lib + 'lib/bootstrap/emit').emit;
var system = require('system');
var utils = require('utils');
var transport = (options.transport || '').toLowerCase();
var server;

if (transport === 'http') {
    server = require(options.spooky_lib + 'lib/bootstrap/http-server');
} else if (transport === 'stdio') {
    server = require(options.spooky_lib + 'lib/bootstrap/stdio-server');
} else {
    throw new Error('Unknown transport: ' + transport);
}

require(options.spooky_lib + 'lib/bootstrap/casper').provideAll(server);

emit('ready');
