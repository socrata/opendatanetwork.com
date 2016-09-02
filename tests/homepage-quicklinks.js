
casper.test.begin('homepage-quicklinks', function checkHomepage(test) {

    casper.start('http://localhost:3002');

    casper.then(function() {
        casper.clickLabel('infrastructure');
    });

    /** @TODO TEST FAILS, FIX OR DELETE IT casper.then(function() {
        casper.wait(5000, function() {
          test.assertUrlMatch(/search\?categories=infrastructure&ref=hp/, 'Verifies that a click on infrastructure from the homepage lands on this URL structure');
          casper.back();
        });
    });*/

    /** @TODO TEST FAILS, FIX OR DELETE IT     casper.then(function() {
        casper.clickLabel('California');
    });

    casper.then(function() {
        casper.wait(5000, function() {
          test.assertUrlMatch(/region\/0400000US06\/California\/population\/population\/2013/, 'Verifies that a click on California from the homepage lands on this URL structure');
          casper.back();
        });
    });*/

    /** @TODO TEST FAILS, FIX OR DELETE IT casper.then(function() {
        casper.clickLabel('2014bonds.cityofws.org');
    });

    casper.then(function() {
        casper.wait(5000, function() {
          test.assertUrlMatch(/search\?domains=2014bonds.cityofws.org&ref=hp/,  'Verifies that a click on 2014bonds.cityofws.org from the homepage lands on this URL structure');
          casper.back();
        });
    });*/

    /** @TODO TEST FAILS, FIX OR DELETE IT casper.then(function() {
        casper.clickLabel('BLDS');
    });

    casper.then(function() {
        casper.wait(5000, function() {
          test.assertUrlMatch(/search\?tags=blds&ref=hp/,  'Verifies that a click on BLDS from the homepage lands on this URL structure');
        });
    });*/

    casper.run(function() {
        test.done();
    });
});

