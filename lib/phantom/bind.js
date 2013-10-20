/**
 * Polyfill Function.prototype.bind
 * 
 * Based on the implementation found here:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
 */
Function.prototype.bind = function (oThis) {
  if (typeof this !== 'function') {
    // closest thing possible to the ECMAScript 5 internal IsCallable function
    throw new TypeError(
      'Function.prototype.bind - what is trying to be bound is not callable');
  }

  var aArgs = Array.prototype.slice.call(arguments, 1),
    fToBind = this,
    FnNOP = function () {},
    fBound = function () {
      return fToBind.apply(this instanceof FnNOP && oThis ?
        this : oThis,
        aArgs.concat(Array.prototype.slice.call(arguments)));
    };

  FnNOP.prototype = this.prototype;
  fBound.prototype = new FnNOP();

  return fBound;
};

