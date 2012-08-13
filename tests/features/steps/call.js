module.exports = function () {
    this.World = require('../support/world.js').World;

    this.When('I call "$method" with "$args"', function (method, args, callback) {
        args = args.split(',');
        this.spooky[method].apply(this.spooky, args);
        callback();
    });
};
