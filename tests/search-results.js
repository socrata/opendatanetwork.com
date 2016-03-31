
casper.test.begin('search-results', function checkHomepage(test) {

    casper.start('http://localhost:3002/search?categories=construction&domains=2014bonds.cityofws.org&q=seattle');

    casper.then(function() {

        test.assertVisible('.refine-bar', 'refine-bar is visible');
        test.assertSelectorHasText('.search-results-header-label', 'No datasets for "seattle"');
    });

    casper.run(function() {
        test.done();
    });
});

