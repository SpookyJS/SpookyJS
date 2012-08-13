module.exports = function () {
    var expect = require('expect.js');
    this.World = require('../support/world.js').World;

    this.When('I pass a string to a method expecting a function',
        function (callback) {
            this.spooky.then('not a function');
            callback();
        });

    this.Then('Spooky should raise an error', function (callback) {
        var world = this;

        if (this.errors.length < 1) {
            this.spooky.on('error', function (e) {
                expect(world.errors.length).to.be(1);
                callback();
            });
        } else {
            expect(this.errors.length).to.be(1);
            callback();
        }
    });
};
