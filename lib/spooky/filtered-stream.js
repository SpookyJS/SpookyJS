var stream = require('readable-stream');

FilteredStream.prototype = Object.create(stream.Transform.prototype, {
        constructor: { value: FilteredStream }
    });

function FilteredStream(source, filter, options) {
    options = options || {};

    source.pipe(this);
    this.filter = filter || nopFilter;

    options.decodeStrings = false;
    stream.Transform.call(this, options);
}

FilteredStream.prototype._transform = function(chunk, encoding, callback) {
    if (this.filter(chunk) === true) {
        this.push(chunk);
    }
    callback();
};

module.exports = FilteredStream;
