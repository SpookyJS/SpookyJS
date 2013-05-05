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

var options = phantom.casperArgs.options;
phantom.requireBase = options.spooky_lib + 'node_modules/';
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
