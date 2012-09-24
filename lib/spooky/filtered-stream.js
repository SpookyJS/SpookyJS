var Stream = require('stream');

function nopFilter(data) {
    return data;
}

function FilteredStream(stream, filter) {
    this.readable = true;
    this.filter = filter || nopFilter;
    stream.on('data', this._onData.bind(this));
}

FilteredStream.prototype = new Stream();
FilteredStream.prototype.constructor = FilteredStream;

FilteredStream.prototype._onData = function onData(data) {
    if (this.filter(data) === true) {
        this.emit('data', data);
    }
};

module.exports = FilteredStream;
