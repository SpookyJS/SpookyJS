var STDIN_POLL_INTERVAL = 10;
var stdin = require('system').stdin;

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
    var message;

    if (line) {
      try {
          message = JSON.parse(line);
      } catch (e) {
          throw new Error('Could not parse "' + line + '" as JSON');
      }

      stream.emit('data', line);

      if (message.method === 'run') {
          return;
      }
    }

    setTimeout(loop, STDIN_POLL_INTERVAL);
}

var StreamServer = require(options.spooky_lib +
    'node_modules/tiny-jsonrpc/lib/tiny-jsonrpc').StreamServer;

var server = new StreamServer();
server.listen(stream);

var loopTimer;
server.start = function() {
  // stdin.readLine blocks until input is available, so we must wait until setup
  // is complete before checking for input. Otherwise, the module will never
  // finish executing.
  loopTimer = setTimeout(loop, 0);
};
server.stop = function() {
  clearTimeout(loopTimer);
};

server.start();

module.exports = server;
