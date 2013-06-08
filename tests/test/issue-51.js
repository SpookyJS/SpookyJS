var Spooky = require('../../lib/spooky');
var expect = require('expect.js');

describe('Spooky instances', function () {
    it('do not share events', function () {
        var called = false;
        var x = new Spooky({});
        var y = new Spooky({});

        x.on('test', function () { called = true; });
        y.emit('test');

        expect(called).not.to.be(true);
    });
});
