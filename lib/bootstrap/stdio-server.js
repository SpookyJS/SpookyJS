var STDIN_POLL_INTERVAL = 10;
var fs = require('fs');
var stdin = fs.open('/dev/stdin', 'r');
var line;
var emptyLines = 0;
var start = Date.now();

var Stream = require(options.spooky_lib + 'lib/stream');
var stream = new Stream();

stream.write = function (s) {
    console.log(s);
    return true;
};

function timestamp() {
    return (new Date()).toISOString();
}

function loop() {
    stdin.flush();

    line = stdin.readLine();

    line = line.replace(/\0/g, '');

    if (JSON.parse(line).method !== 'run') {
        setTimeout(loop, STDIN_POLL_INTERVAL);
    }

    if (line !== '') {
        stream.emit('data', line);
    }
}

var StreamServer = require(options.spooky_lib +
    'node_modules/tiny-jsonrpc/lib/tiny-jsonrpc').StreamServer;

var server = new StreamServer();
server.listen(stream);

// stdin.readLine blocks until input is available, so we must wait until setup
// is complete before checking for input. Otherwise, the module will never
// finish executing.
setTimeout(loop, 0);
module.exports = server;
