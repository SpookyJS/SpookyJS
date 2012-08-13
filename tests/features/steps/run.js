module.exports = function () {
    this.World = require('../support/world.js').World;

    this.When('I run spooky', function (callback) {
        this.spooky.run();
        callback();
    });
};
