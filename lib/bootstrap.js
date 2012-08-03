/**
 * Create a function from a string
 *
 * This function attempts to prevent typos from clobbering the
 */
var createFunction = (function () {
    function parseFunction(fnSource) {
        var newlineToken = '_!crlf!_';
        var newlineTokenPattern = new RegExp(newlineToken, 'g');
        var parsed, name, args, body;

        // parse the function source into name, arguments, and body
        parsed = fnSource.replace(/\n/g, newlineToken).match(/^function\s+([^(]+)?\(([^)]*)\)\s*\{(.*)\}/);
        if (!parsed) {
            throw 'Cannot parse function: ' + fnSource.replace(newlineTokenPattern, '\n');
        }
        name = parsed[1] || '';
        args = parsed[2].split(',');
        body = parsed[3].replace(newlineTokenPattern, '\n');

        var fn = Function.apply(null, args.concat(body));

        return eval('(function ' + name + '(' + args.join() + ') { return fn.apply(this, [' + args.join() + ']); })');
    }

    return function (fn) {
        return fn ? parseFunction(fn) : void undefined;
    }
}());

// Due diligence to minimize side effects from createFunction
(function () {
var casper = require('casper');
var system = require('system');
var JsonRpcServer = require('./node_modules/tiny-jsonrpc/lib/tiny-jsonrpc').Server;

var server = new JsonRpcServer();

var instances = {};
var instanceCount = 0;
var nextInstanceId = 0;
function createInstance(options) {
    var id = nextInstanceId;
    nextInstanceId++;
    instanceCount++;

    for (var k in options) {
        if (k.indexOf('on') === 0) {
            options[k] = createFunction(options[k]);
        }
    }

    instances[id] = casper.create(options);
    return {
        instance: id,
        methods: server.provides()
    };
}

/**
 * Create a new CasperJS instance and return its instance id.
 */
server.provide(function create(options) {
    return createInstance(options);
});

server.provide(function echo(message, style) {
    instance = instances[instance];

    instance.echo(message, style);

    return true;
});

server.provide(function run(instance, onComplete, time) {
    instance = instances[instance];

    instance.run(createFunction(onComplete), time);

    return true;
});

server.provide(function open(instance, location, settings) {
    instance = instances[instance];

    instance.open(location, settings);

    return true;
});

server.provide(function start(instance, url, then) {
    instance = instances[instance];

    instance.start(url, createFunction(then));

    return true;
});

server.provide(function then(instance, fn) {
    instance = instances[instance];

    instance.then(createFunction(fn));

    return true;
});

server.provide(function thenEvaluate(instance, fn, replacements) {
    instance = instances[instance];

    instance.thenEvaluate(createFunction(fn), replacements);

    return true;
});

server.provide(function waitFor(testFn, then, onTimeout, timeout) {
    instance = instances[instance];

    instance.thenEvaluate(createFunction(testFn), createFunction(then), createFunction(onTimeout), timeout);

    return true;
});

function respond(response, code, body) {
    //console.log('< ' + code + ' ' + body);
    response.statusCode = code;
    response.write(body);
    response.close();
}

var port = 8080;
var arg;
for (var i = 1; i < system.args.length; i++) {
    arg = system.args[i];
    if (arg.indexOf('--port') === 0) {
        if (arg.indexOf('=') > -1) {
            port = arg.split('=')[1];
        } else {
            port = system.args[i + 1];
        }
        port = parseInt(port, 10);
        break;
    }
}

var service = require('webserver').create().listen(port, function (request, response) {
    //console.log('> ' + JSON.stringify(request));
    //console.log('> ' + request.post);
    if (request.method.toUpperCase() !== 'POST') {
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

console.log('Ready');
console.log(system.args.join(' '));
}());
