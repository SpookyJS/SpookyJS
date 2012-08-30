module.exports = function () {
    var expect = require('expect.js');
    this.World = require('../support/world.js').World;

    this.Given('I go to "$path"', function (path, callback) {
        this.spooky.thenOpen(this.testUrl + path);
        callback();
    });

    this.Given('I go back', function (callback) {
        this.spooky.back();
        callback();
    });

    this.Given('I go forward', function (callback) {
        this.spooky.forward();
        callback();
    });

    this.When('I go back', function (callback) {
        this.spooky.back();
        callback();
    });

    this.When('I go forward', function (callback) {
        this.spooky.forward();
        callback();
    });

    this.Then('I should be on "$path"', function (path, callback) {
        this.spooky.then([{
            url: this.testUrl + path
        }, function () {
            this.test.assert(this.getCurrentUrl() === url);
        }]);
        callback();
    });
};
