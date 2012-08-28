var Spooky = require('../lib/spooky');

var spooky = new Spooky({
        child: {
            port: 8081,
            script: './lib/bootstrap.js',
            spooky_lib: './node_modules'
        }
    }, function (err, error) {
        spooky.on('console', function (line) {
            console.log(line);
        });

        spooky.start();
        spooky.then(function () {
            this.echo('Hello, SpookyJS');
        });
        spooky.run();
    });
