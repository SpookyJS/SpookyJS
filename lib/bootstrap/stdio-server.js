var STDIN_POLL_INTERVAL = 10;
var stdin = require('system').stdin;

// NOTE(jeresig): If the following methods are run then stop attempting to
// readLine and begin intialization.
var startMethods = ['run', 'exec'];

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
    var line = stdin.readLine();

    try {
        var method = JSON.parse(line).method;

        // NOTE(jeresig): Only attempt to read another line of input if one of
        // the startMethods has not been detected.
        if (startMethods.indexOf(method) < 0) {
            setTimeout(loop, STDIN_POLL_INTERVAL);
        }

        if (line !== '') {
            stream.emit('data', line);
        }
    // NOTE(jeresig): Ignore malformed JSON strings
    } catch(e) {
    	throw new Error('Could not parse "' + line + '" as JSON');
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
