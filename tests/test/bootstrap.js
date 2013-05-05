var expect = require('expect.js');
var spawn = require('child_process').spawn;
var carrier = require('carrier');
var BufferedStream = require('../../lib/spooky/buffered-stream');

describe('the PhantomJS bootstrap script', function () {
    it('hooks phantom.onError to emit an error event and exit non-zero',
        function (done) {
            // run the bootstrap script
            var options = {
                command: /^win/.test(process.platform) ?
                    'casperjs.bat' : 'casperjs',
                script: __dirname + '/../../lib/bootstrap.js',
                spooky_lib: __dirname + '/../../',
                transport: 'stdio',
                bufferSize: 16 * 1024 // 16KB
            };
            var args = [ options.script ];
            var child;

            options.spooky_lib = 'invalid';

            for (var k in options) {
                if (k !== 'script') {
                    args.push('--' + k + '=' + options[k]);
                }
            }

            child = spawn(options.command, args);
            child.stdout.setEncoding('utf8');
            var stdout = carrier.carry(child.stdout);

            var stdin = child.stdin;
            child.stdin = new BufferedStream(options.bufferSize);
            child.stdin.pipe(stdin);

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
            stdout.once('line', function (line) {
                var message = JSON.parse(line);

                expect(message.params[0]).to.be('error');
                emitted = true;

                if (exited) {
                    done();
                }
            });
        });
});

