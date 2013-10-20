(function (global) {
'use strict';

if (typeof Function.prototype.bind !== 'function') {
  require('./bind');
}

var emit = require('./emit');

phantom.onError = function spookyOnError(msg, trace) {
  emit.emit('error', msg, trace);
  phantom.exit(1);
};

phantom.exit();
}(this));
