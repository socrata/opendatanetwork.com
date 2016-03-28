
casper.test.begin('homepage-quicklinks', function checkHomepage(test) {

    casper.start('http://localhost:3002');

    casper.then(function() {
        casper.clickLabel('infrastructure');
    });
    
    casper.then(function() {
        test.assertUrlMatch(/search\?categories=infrastructure&ref=hp/);
        casper.back();
    });
    
    casper.then(function() {
        casper.clickLabel('California');
    });

    casper.then(function() {
        test.assertUrlMatch(/region\/0400000US06\/California\/population\/population\/2013/);
        casper.back();
    });
    
    casper.then(function() {
        casper.clickLabel('2014bonds.cityofws.org');
    });

    casper.then(function() {
        test.assertUrlMatch(/search\?domains=2014bonds.cityofws.org&ref=hp/);
        casper.back();
    });
    
    casper.then(function() {
        casper.clickLabel('BLDS');
    });

    casper.then(function() {
        test.assertUrlMatch(/search\?tags=blds&ref=hp/);
    });

    casper.run(function() {
        test.done();
    });
});

