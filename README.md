# SpookyJS

Drive [CasperJS](http://casperjs.org/) from Node.js.

## Installation

### Prerequisites

* [Node.js](http://nodejs.org)
* [PhantomJS](http://phantomjs.org/)
* [CasperJS](http://casperjs.org/)

SpookyJS is available from npm.

``` shell
$ npm install spooky
```

## Usage

``` javascript
var Spooky = require('spooky');

var spooky = new Spooky(null, function (err, error, response) {
        var e;
        if (err || error) {
            e = new Error('Failed to initialize SpookyJS');
            e.details = err || error;
            throw e;
        }

        spooky.on('error', function (e) {
            console.error(e);
        });

        spooky.on('console', function (line) {
            console.log(line);
        });

        spooky.start();
        spooky.then(function () {
            this.echo('Hello, SpookyJS');
        });
        spooky.run();
    });
```

A minimal example can be found in `examples`.

``` shell
$ node examples/hello.js
```

See `tests/util/hooks.js` for an example of how to use SpookyJS with [Mocha](http://visionmedia.github.com/mocha). 

See `tests/features/` for an example using SpookyJS with Cucumber.js.

## Development

### Running the tests

SpookyJS includes a suite of unit tests, driven by [Mocha](http://visionmedia.github.com/mocha). To run the tests:

``` shell
$ make test
```

The following parameters are supported (defaults are in parentheses):

* `TEST_REPORTER` the [Mocha reporter](http://visionmedia.github.com/mocha/#reporters) to use (dot)
* `TEST_PORT` the port to run the fixture web server on (8080)
* `TEST_TIMEOUT` threshold in ms to timeout a test (4000)
* `TEST_SLOW` threshold in ms to say a test is slow (2000)
* `TEST_ARGS` Additional [arguments](http://visionmedia.github.com/mocha/#usage) to pass through to Mocha

## License

SpookyJS is made available under the [MIT License](http://opensource.org/licenses/mit-license.php).

## Acknowledgements and Attribution

The image `tests/fixtures/fail-road.jpeg` is the work [Fail
Road](http://www.flickr.com/photos/fireflythegreat/2845637227/) and is
copyright (c) 2007
[fireflythegreat](http://www.flickr.com/photos/fireflythegreat/) and made
available under an [Attribution 2.0
Generic](http://creativecommons.org/licenses/by/2.0/deed.en) license.
