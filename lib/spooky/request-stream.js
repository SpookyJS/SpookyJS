var http = require('http');
var Stream = require('stream');
var _ = require('underscore');

var defaults = {
    host: 'localhost',
    port: 8080,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

function RequestStream(options) {
    this._pending = {};
    this.readable = true;
    this.writeable = true;
    this.options = _.defaults(options || {}, defaults);
}

RequestStream.prototype = new Stream();
RequestStream.prototype.constructor = RequestStream;

RequestStream.prototype.write = function write(packet, callback) {
    var options = _.clone(this.options);
    options.headers['Content-Length'] = packet.length;
    
    var req = http.request(options, this._onResponse.bind(this, callback));
    req.on('error', this._onError.bind(this, callback));
    req.end(packet);

    return true;
};

RequestStream.prototype._onError = function onError(callback, error) {
    if (callback) {
        callback(error);
    }
};

RequestStream.prototype._onResponse = function onResponse(callback, response) {
    var result = '';

    response.on('data', function (data) { result += data; });
    response.on('end', (function () {
        //console.log(result);
        this.emit('data', result);
    }).bind(this));
};

RequestStream.prototype.end = function end(string) {
    if (string) {
        this.write(string);
    }
    this.writable = false;
};

RequestStream.prototype.destroy = function destroy() {
    this.writable = false;
    this.emit('close');
};

RequestStream.prototype.destroySoon = function destroySoon() {
    this.destroy();
};

module.exports = RequestStream;
