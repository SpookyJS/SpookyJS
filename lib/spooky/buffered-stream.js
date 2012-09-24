var Stream = require('stream');

function BufferedStream(size, encoding) {
    this._encoding = encoding || 'utf8';
    this.writable = true;
    this.readable = true;

    this._buffer = new Buffer(size);
    this.clear();
}

BufferedStream.prototype = new Stream();
BufferedStream.prototype.constructor = BufferedStream;

BufferedStream.prototype.flush = function flush() {
    var s = this._buffer.toString(this._encoding);

    this.emit('data', s);
    this.clear();
};

BufferedStream.prototype.clear = function clear() {
    this._buffer.fill('\0');
    this._offset = 0;
};

BufferedStream.prototype._onNextTick = function onNextTick() {
    this._hookedNextTick = false;
    this.flush();
};

BufferedStream.prototype.write = function write(what) {
    var len;
    if (Buffer.isBuffer(what)) {
        len = what.length;
    } else {
        len = Buffer.byteLength(what, this._encoding);
    }

    if (len > this._buffer.length) {
        throw new Error('Cannot write string of length ' + len +
            ' to BufferedStream of length ' + this._buffer.length);
    }

    // if we will overflow the buffer, flush it now
    if (len + this._offset > this._buffer.length) {
        this.flush();
    }

    // register to flush later
    if (!this._hookedNextTick) {
        this._hookedNextTick = true;
        process.nextTick(this._onNextTick.bind(this));
    }

    if (Buffer.isBuffer(what)) {
        what.copy(this._buffer, this._offset);
    } else {
        this._buffer.write(what, this._offset, len, this._encoding);
    }
    this._offset += len;

    return true;
};

BufferedStream.prototype.end = function end(string) {
    if (string) {
        this.write(string);
    }
    this.flush();
    this.writable = false;
};

BufferedStream.prototype.destroy = function destroy() {
    this.writable = false;
    delete this._buffer;
    this.emit('close');
};

BufferedStream.prototype.destroySoon = function destroySoon() {
    this.flush();
    this.destroy();
};

module.exports = BufferedStream;
