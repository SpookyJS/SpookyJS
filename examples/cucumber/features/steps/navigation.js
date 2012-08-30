module.exports = function () {
    this.World = require('../support/world.js').World;

    function go(url, callback) {
        this.spooky.thenOpen(this.baseUrl + url);
        callback();
    }

    function goBack(callback) {
        this.spooky.back();
        callback();
    }

    function goForward(callback) {
        this.spooky.forward();
        callback();
    }

    this.Given('I go to "$url"', go);
    this.When('I go to "$url"', go);

    this.Given('I go back', goBack);
    this.When('I go back', goBack);

    this.Given('I go forward', goForward);
    this.When('I go forward', goForward);

    this.Then('I should be on "$url"', function shouldBeOn(url, callback) {
        this.spooky.then([{
            url: url
        }, function () {
            this.echo(this.getCurrentUrl());
            this.test.assertUrlMatch(new RegExp(url));
        }]);
        callback();
    });
};

