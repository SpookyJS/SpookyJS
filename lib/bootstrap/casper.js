var createFunction =
    require(options.spooky_lib + 'lib/bootstrap/create-function');
var casper = require('casper');
var emit = require(options.spooky_lib + 'lib/bootstrap/emit').emit;
var instance;

var methodsToProvide = {
    back: [],
    echo: ['message', 'style'],
    forward: [],
    open: ['location', 'settings'],
    run: [function onComplete () {}, 'time'],
    start: ['url', function then () {}],
    then: [function fn () {}],
    thenClick: ['selector', function fn () {}],
    thenEvaluate: [function fn () {}, 'replacements'],
    thenOpen: ['location', 'options'],
    thenOpenAndEvaluate: ['location', function fn () {}, 'replacements'],
    userAgent: ['agent'],
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

function getCreateFn(server) {
    /**
     * Create a new CasperJS instance
     */
    return function create (options) {
        options = options || {};

        for (var k in options) {
            if (k.indexOf('on') === 0) {
                options[k] = createFunction(options[k]);
            }
        }

        server._instance = instance = casper.create(options);
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
    };
}

/*
 * exec(code): Execute the specified code within the CasperJS context, a
 *             `Casper` instance is contained within the variable `casper`.
 * Arguments:
 *  - code: A string of JavaScript to run in Casper/Phantom.
 *  - options: An object to make available to the eval'd code, optional.
 *
 * NOTE(jeresig): Added 2013-04-21
 */
methods.exec = function(code, options) {
    try {
        // Attempt to evaluate the code
        // Note that we also redefine the `instance` variable to be
        // `casper` in the context of this code, which makes more sense.
        eval("(function(casper){\n" + code + "\n})(instance);");

    } catch(e) {
        // Report any evaluation errors back to SpookyJS
        instance.emit('log', e.message);
    }

    return true;
};

function provideAll(server) {
    server.provide(getCreateFn(server));
    server.provide(methods);
}

exports.provideAll = provideAll;
