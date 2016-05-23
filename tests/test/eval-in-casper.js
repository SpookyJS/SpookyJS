var expect = require('expect.js');

//This feature does not work on stdio TRANSPORT
if (process.env.TEST_TRANSPORT !== 'http') {
  return;
}

describe('Spooky evaluates in Casper context', function () {
    var context = {};
    var hooks = require('../util/hooks');
    var FIXTURE_URL = hooks.FIXTURE_URL;

    beforeEach(hooks.before(context));

    it('it should get variable from evaluateInCasper while waiting', function (done) {
      var fromNode = 'hello';
      context.spooky.start();

      context.spooky.then(function () {
        console.log(window);
      });
      context.spooky.waitFor(function () {
        return window.varFromNode === 'hello';
      });

      context.spooky.run(function () {
        this.emit('done', window.varFromNode);
      });

      context.spooky.evaluateInCasper(function () {
        window.varFromNode = 'hello';
      });

      context.spooky.on('error', function (e) {
        done(e);
      });

      context.spooky.on('done', function (caspersFromNode) {
        expect(caspersFromNode).to.be(fromNode);
        expect(caspersFromNode).to.be('hello');
        done();
      });
    });

    afterEach(hooks.after(context));
});
