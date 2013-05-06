var expect = require('expect.js');
var spawnChild = require('../util/spawn');

describe('the PhantomJS bootstrap script', function () {
    it('hooks phantom.onError to emit an error event and exit non-zero',
        function (done) {
            var child = spawnChild({
                spooky_lib: 'invalid'
            });

            // expect child to exit non-zero
            var exited = false;
            child.on('exit', function (code, signal) {
                expect(code).not.to.be(0);
                exited = true;

                if (emitted) {
                    done();
                }
            });
            
            // expect child to emit an error event
            var emitted = false;
            child.stdout.once('line', function (line) {
                var message = JSON.parse(line);

                expect(message.params[0]).to.be('error');
                emitted = true;

                if (exited) {
                    done();
                }
            });
        });

    it('crashes if passed an unknown transport', function (done) {
        var child = spawnChild({
            transport: 'invalid'
        });

        // expect child to exit non-zero
        var exited = false;
        child.on('exit', function (code, signal) {
            expect(code).not.to.be(0);
            exited = true;

            if (emitted) {
                done();
            }
        });

        // expect child to emit an error event
        var emitted = false;
        child.stdout.once('line', function (line) {
            var message = JSON.parse(line);

            expect(message.params[0]).to.be('error');
            emitted = true;

            if (exited) {
                done();
            }
        });
    });
});

