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

var spooky = new Spooky({
        casper: {
            logLevel: 'debug',
            verbose: true
        }
    }, function (err, error, response) {
        var e;
        if (err || error) {
            e = new Error('Failed to initialize SpookyJS');
            e.details = err || error;
            throw e;
        }

        spooky.on('error', function (e) {
            console.error(e);
        });

        /*
        // Uncomment this block to see all of the things Casper has to say.
        // There are a lot.
        // He has opinions.
        spooky.on('console', function (line) {
            console.log(line);
        });
        */

        spooky.on('log', function (log) {
            if (log.space === 'remote') {
                console.log(log.message.replace(/ \- .*/, ''));
            }
        });

        spooky.start(
            'http://en.wikipedia.org/wiki/Spooky_the_Tuff_Little_Ghost');
        spooky.thenEvaluate(function () {
            console.log('Hello, from', document.title);
        });
        spooky.run();
    });
```

A minimal example can be found in the repo under `examples`. Run it like this:

``` shell
$ node examples/hello.js
```

A small example [Cucumber.js](https://github.com/cucumber/cucumber-js/) test suite can be found in the repo under `examples/cucumber`. To run the suite:

``` shell
$ make cucumber.js
```

You may change the port that the fixture server runs on by setting the `TEST_PORT` make parameter.

See the tests for an example of how to use SpookyJS with [Mocha](http://visionmedia.github.com/mocha). 

## Development

### Running the tests

SpookyJS includes a suite of unit tests, driven by [Mocha](http://visionmedia.github.com/mocha). To run the tests:

``` shell
$ make test
```

The following make parameters are supported (defaults are in parentheses):

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
