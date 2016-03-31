
casper.test.begin('search-results-redirects', function checkHomepage(test) {

    casper.start('http://localhost:3002/search?q=98117');

    casper.then(function() {
        test.assertUrlMatch(/region\/8600000US98117\/98117_ZIP_Code/, 'Redirected correctly to region page.');
    });

    casper.run(function() {
        test.done();
    });
});

