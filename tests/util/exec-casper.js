casper.start();

casper.thenOpen(options.FIXTURE_URL + '/1.html');
casper.thenOpen(options.FIXTURE_URL + '/2.html');
casper.thenOpen(options.FIXTURE_URL + '/3.html');
casper.back();
casper.back();
casper.forward();

casper.then(function () {
    this.echo(this.getCurrentUrl());
});

casper.run();