var util = require('util');
var expect = require('expect.js');

describe("Test Executing a CasperJS File From SpookyJS", function () {
    var hooks = require('../util/hooks');
    var FIXTURE_URL = hooks.FIXTURE_URL;

    var context = {
        config: {
            // Set up the config to execute the CasperJS script with the
            // specified FIXTURE_URL.
            exec: {
                file: "./tests/util/exec-casper.js",
                options: { FIXTURE_URL: FIXTURE_URL }
            }
        }
    };

    describe('exec(capser.forward)', function () {
        it("moves forward a step in the browser's history", function (done) {
            // We call hooks.before(context) in here to make sure that the
            // console event handler is bound as soon as possible (before the
            // file is executed).
            hooks.before(context)(function() {
                context.spooky.on('console', function onConsole(line) {
                    if (line === FIXTURE_URL + '/2.html') {
                        context.spooky.removeListener('console', onConsole);
                        done();
                        return;
                    }
                });
            });
        });
    });

    afterEach(hooks.after(context));
});

