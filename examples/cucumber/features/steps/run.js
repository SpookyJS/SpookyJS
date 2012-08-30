module.exports = function () {
    this.World = require('../support/world.js').World;

    this.Then('run', function (callback) {
        var world = this;

        this.spooky.then(function () {
            this.emit('tests.complete', this.test.testResults);
        });

        this.spooky.once('tests.complete', (function (results) {
            if (results.failed) {
                callback.fail(results.failures.map(function (failure) {
                    return 'Failed: ' + failure.message;
                }).join('\n'));
            } else {
                callback();
            }
        }).bind(this));

        this.spooky.run();
    });
};
