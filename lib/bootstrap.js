/**
 * Create a function from a string
 */
var evalFunction = (function () {
    // shadow global symbols
    var evalFunction;
    var createFunction;

    return function (contextSrc, functionSrc) {
        var src = '(function () {\n' +
                contextSrc +
                'return ' + functionSrc + ';' +
            '}())'

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
        var newlineToken = '_!crlf!_';
        var newlineTokenPattern = new RegExp(newlineToken, 'g');
        var parsed, name, args, body;

        // parse the function source into name, arguments, and body
        // currently, names must by alphanumeric.
        parsed = src.replace(/\n/g, newlineToken).
            match(/^function\s+([a-zA-Z_]\w*)?\s*\(([^)]*)\)\s*\{(.*)\}$/);
        if (!parsed) {
            throw 'Cannot parse function: ' +
                src.replace(newlineTokenPattern, '\n');
        }
        name = parsed[1] || '';
        args = parsed[2].split(/\s*,\s*/);
        body = parsed[3].replace(newlineTokenPattern, '\n');

        var fn = Function.apply(null, args.concat(body));
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
    }
}());

// Due diligence to minimize side effects from createFunction
(function () {
var options = phantom.casperArgs.options;
var port = options.port || 8080;
var casper = require('casper');
var system = require('system');
var utils = require('utils');

var JsonRpcServer =
    require(options.spooky_lib + '/tiny-jsonrpc/lib/tiny-jsonrpc').Server;

var server = new JsonRpcServer();
var instance;

/**
 * Create a new CasperJS instance
 */
server.provide(function create(options) {
    options = options || {};

    for (var k in options) {
        if (k.indexOf('on') === 0) {
            options[k] = createFunction(options[k]);
        }
    }

    instance = casper.create(options);
    instance.emit = function () {
        var args = Array.prototype.slice.apply(arguments);
        try {
            emit.apply(this, arguments);
        } catch (e) {
            emit.call(this, 'log', e.message, args[1].location);
        }
        this.constructor.prototype.emit.apply(this, args.slice());
    };

    return {
        methods: server.provides()
    };
});

var methodsToProvide = {
    back: [],
    echo: ['message', 'style'],
    forward: [],
    open: ['location', 'settings'],
    run: [function onComplete () {}, 'time'],
    start: ['url', function then () {}],
    then: [function fn () {}],
    thenEvaluate: [function fn () {}, 'replacements'],
    thenOpen: ['location', 'options'],
    thenOpenAndEvaluate: ['location', function fn () {}, 'replacements'],
    wait: ['timeout', function then () {}],
    waitFor: [
        function testFn () {}, function then () {},
        function onTimeout () {}, 'timeout'
    ],
    waitForResource: [
        'resource', function then () {},
        function onTimeout () {}, 'timeout'
    ],
    waitForSelector: [
        'selector', function then () {},
        function onTimeout () {}, 'timeout'
    ],
    waitUntilVisible: [
        'selector', function then () {},
        function onTimeout () {}, 'timeout'
    ],
    waitWhileSelector: [
        'selector', function then () {},
        function onTimeout () {}, 'timeout'
    ],
    waitWhileVisible: [
        'selector', function then () {},
        function onTimeout () {}, 'timeout'
    ]
};

function callMethod(method, spec) {
    var args = Array.prototype.slice.call(arguments, 2);

    if (args.length > spec.length) {
        throw [
            'Expected maximum of', spec.length,
            'arguments, but got', args.length
        ].join(' ');
    }

    for (var i = 0; i < args.length; i++) {
        if (typeof spec[i] === 'function') {
            args[i] = createFunction(args[i]);
        }
    }

    instance[method].apply(instance, args);

    return true;
};

var methods = {};
for (var k in methodsToProvide) {
    methods[k] = (function (method, spec) {
        return function () {
            var args = [method, spec].
                concat(Array.prototype.slice.call(arguments));

            return callMethod.apply(null, args);
        }
    })(k, methodsToProvide[k]);
}

server.provide(methods);

function respond(response, code, body) {
    emit('log', {
        level: 'debug',
        space: 'spooky.server',
        message: {
            event: 'response',
            code: code,
            body: body
        }
    });
    response.statusCode = code;
    response.write(body);
    response.close();
}

var service = require('webserver').create().
    listen(port, function (request, response) {
        var method = request.method.toUpperCase();

        emit('log', {
            level: 'debug',
            space: 'spooky.server',
            message: {
                event: 'request',
                method: method,
                request: request
            }
        });

        if (method !== 'POST') {
            respond(response, 405, 'Requests must be POSTs');
            return;
        } else if (request.headers['Content-Type'] !== 'application/json' &&
            request.headers['content-type'] !== 'application/json'
        ) {
            respond(response, 415, 'Request entity must be JSON');
            return;
        }

        var result = JSON.parse(server.respond(request.post));

        if (result.error) {
            respond(response, 400, JSON.stringify(result));
        } else {
            respond(response, 200, JSON.stringify(result));
        }
    });

function emit(event) {
    var args = Array.prototype.slice.call(arguments);

    console.log(JSON.stringify({
        jsonrpc: '2.0',
        method: 'emit',
        params: args
    }));
}

emit('ready');
}());
