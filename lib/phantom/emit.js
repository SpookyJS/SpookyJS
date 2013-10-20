(function (global) {
'use strict';

/**
 * Emit an event via JSON-RPC
 */
function emit(event) {
    var args = [event].concat(Array.prototype.slice.call(arguments, 1));

    console.log(JSON.stringify({
        jsonrpc: '2.0',
        method: 'emit',
        params: args
    }));
}

module.exports.emit = emit;

module.exports.console = {
    log: emit.bind(null, 'console', 'log'),
    debug: emit.bind(null, 'console', 'debug'),
    info: emit.bind(null, 'console', 'info'),
    warn: emit.bind(null, 'console', 'warn'),
    error: emit.bind(null, 'console', 'error')
};
}(this));
