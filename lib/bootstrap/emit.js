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
    var args = ['console'];

    if (level) {
        args.push(level);
    }

    return function () {
        var args = (level ? [level] : []).
            concat(Array.prototype.slice.apply(arguments));
        emit('console', args.join(' '));
    };
}

module.exports.console = {
    debug: getConsoleFn('debug'),
    info: getConsoleFn('info'),
    log: getConsoleFn(),
    warn: getConsoleFn('warn'),
    error: getConsoleFn('error')
};
