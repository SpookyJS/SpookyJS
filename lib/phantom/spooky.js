(function (global) {
  'use strict';

  var emit;

  // before emit is available, print errors to the console and then exit(1)
  phantom.onError = function (msg, trace) {
    console.error('Could not initialize PhantomJS server:\n',
      msg, JSON.stringify(trace));
    phantom.exit(1);
  };

  if (typeof Function.prototype.bind !== 'function') {
    require('./bind');
  }

  emit = require('./emit');

  // emit errors and then exit(1)
  phantom.onError = function (msg, trace) {
    emit.emit('error', msg, trace);
    phantom.exit(1);
  };

  // get options (need a simple option parser and env var thing)
  var options = {}; // FIXME

  emit.emit('spooky.start'); // FIXME: include options
  /*
    emit('log', {
        level: 'debug',
        space: 'spooky.server',
        message: {
            event: 'response',
            code: code,
            body: body
        }
    });
    */

  // check options for transport (stdio by default)
  // then try to require it as inputStream
  var transport = options.transport || 'stdio';
  /*
   * Transports:
   * - stdio
   * - local http (http in, stdout out)
   * - longpoll or sse http? (http in/out)
   *   this may not make sense, as they can just put a node server in front of
   *   spooky and avoid the whole problem
   * - websocket?
   */

  // set up the JSON-RPC server, with the given inputStream

  // register core methods
  //
  // exit(code, reason) - call phantom.exit
  // eval(string, upvars) - evaluate a string of JS with the given upvars
  // execFn(fn, upvars) - execute a function with the given upvars then return
  //                      the result
  // execFnAsync(fn, upvars) - execute a function with the given upvars then
  //                           callback with the result
  // 
  // We may want to solve the problem of whether or not to listen for another
  // request here. Actually, I think the right answer is to always provide a
  // spooky upvar that provides a listen method they can call

  // listen

  phantom.exit();
}(this));
