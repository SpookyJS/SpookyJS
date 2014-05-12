/**
 * Create a function from a string
 */
var evalFunction = (function () {
    /* jshint unused: false */
    // shadow global symbols
    var evalFunction;
    var createFunction;

    return function (contextSrc, functionSrc) {
        /* jshint evil: true */
        var src = '(function () {\n' +
                contextSrc +
                'return ' + functionSrc + ';' +
            '}())';

        return eval(src);
    };
}());


var createFunction = (function () {
    /**
     * Check that we can create a single function from the passed source and
     * return checked source.
     *
     * This function is intended to prevent this sort of thing:
     *     createFunction('function yo() { } foo()')
     * which would run foo in our context.
     *
     * This check is intended to find mistakes, not defend against malice.
     */
    function getCleanSource(src) {
        var crToken = '_!cr!_';
        var lfToken = '_!lf!_';
        var crTokenPattern = new RegExp(crToken, 'g');
        var lfTokenPattern = new RegExp(lfToken, 'g');
        var newlineTokenPattern = new RegExp(newlineToken, 'g');
        var parsed, name, args, body;

        // parse the function source into name, arguments, and body
        // currently, names must by alphanumeric.

        parsed = src.
          replace(new RegExp('\r', 'g'), crToken).
          replace(new RegExp('\n', 'g'), lfToken).
          match(/^function\s+([a-zA-Z_]\w*)?\s*\(([^)]*)\)\s*\{(.*)\}$/);

        if (!parsed) {
            throw 'Cannot parse function: ' +
                src.
                replace(crTokenPattern, '\r').
                replace(lfTokenPattern, '\n');
        }

        name = parsed[1] || '';
        args = parsed[2].split(/\s*,\s*/);
        body = parsed[3].
          replace(crTokenPattern, '\r').
          replace(lfTokenPattern, '\n');

        return ['function', name, '(', args.join(', '), ')', '{', body, '}'].join(' ');
    }

    function parseFunction(fnSource) {
        var context = {};
        var contextSource = '';

        if (fnSource instanceof Array) {
            context = fnSource[0];
            fnSource = fnSource[1];
        }

        for (var k in context) {
            contextSource += [
                'var', k, '=', JSON.stringify(context[k]) + ';\n'
            ].join(' ');
        }

        fnSource = getCleanSource(fnSource);

        return evalFunction(contextSource, fnSource);
    }

    return function (fn) {
        return fn ? parseFunction(fn) : void undefined;
    };
}());

module.exports = createFunction;
