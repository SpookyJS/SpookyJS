var stream = require('readable-stream');

function nopFilter() {
    return true;
}

function FilteredStream(source, filter, options) {
    options = options || {};

    source.pipe(this);
    this.filter = filter || nopFilter;

    options.decodeStrings = false;
    stream.Transform.call(this, options);
}

FilteredStream.prototype = Object.create(stream.Transform.prototype, {
        constructor: { value: FilteredStream }
    });

FilteredStream.prototype._transform = function(chunk, encoding, callback) {
    if (this.filter(chunk) === true) {
        this.push(chunk);
    }
    callback();
};

module.exports = FilteredStream;
