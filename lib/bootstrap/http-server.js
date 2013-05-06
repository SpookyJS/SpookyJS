var emit = require(options.spooky_lib + 'lib/bootstrap/emit').emit;
var port = options.port || 8080;

var JsonRpcServer = require(options.spooky_lib +
    'node_modules/tiny-jsonrpc/lib/tiny-jsonrpc').Server;

var server = new JsonRpcServer();

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

        try {
            JSON.parse(request.post);
        } catch (e) {
            throw new Error('Could not parse "' + request.post + '" as JSON');
        }

        var result = JSON.parse(server.respond(request.post));

        if (result.error) {
            respond(response, 400, JSON.stringify(result));
        } else {
            respond(response, 200, JSON.stringify(result));
        }
    });

module.exports = server;
