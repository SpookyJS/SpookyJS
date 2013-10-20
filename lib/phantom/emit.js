(function (global) {
'use strict';

function emit(event) {
    var args = Array.prototype.slice.call(arguments);

    console.log(JSON.stringify({
        jsonrpc: '2.0',
        method: 'emit',
        params: args
    }));
}

module.exports.emit = emit;

function getConsoleFn(level) {
    return function () {
        var args = Array.prototype.slice.apply(arguments);
        emit('console', args.join(' '));
    };
}

module.exports.console = {
    log: emit.bind(null, 'console', 'log'),
    debug: emit.bind(null, 'console', 'debug'),
    info: emit.bind(null, 'console', 'info'),
    warn: emit.bind(null, 'console', 'warn'),
    error: emit.bind(null, 'console', 'error')
};
}(this));
