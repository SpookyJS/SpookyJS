var createFunction = require('./lib/bootstrap/create-function').createFunction;

var options = phantom.casperArgs.options;
var port = options.port || 8080;
var system = require('system');
var utils = require('utils');

var JsonRpcServer =
    require(options.spooky_lib + '/tiny-jsonrpc/lib/tiny-jsonrpc').Server;

var server = new JsonRpcServer();
require('./lib/bootstrap/casper').provideAll(server);

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
