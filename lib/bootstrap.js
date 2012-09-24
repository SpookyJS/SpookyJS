var options = phantom.casperArgs.options;
phantom.requireBase = options.spooky_lib;
var system = require('system');
var utils = require('utils');
var transport = (options.transport || '').toLowerCase();
var server;

if (transport === 'http') {
    server = require('./lib/bootstrap/http-server');
} else if (transport === 'stdio') {
    server = require('./lib/bootstrap/stdio-server');
} else {
    console.error('Unknown transport: ' + transport);
    phantom.exit(1);
}

require('./lib/bootstrap/casper').provideAll(server);

function emit(event) {
    var args = Array.prototype.slice.call(arguments);

    console.log(JSON.stringify({
        jsonrpc: '2.0',
        method: 'emit',
        params: args
    }));
}

emit('ready');
