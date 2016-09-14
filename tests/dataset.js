
var assertLinksTo = require('./lib/assert-links-to');
var testMainSuggest = require('./lib/test-main-suggest');

casper.options.viewportSize = {width: 1600, height: 900};

casper.test.begin('dataset', function(test) {
    casper.start('http://localhost:3000/dataset/data.seattle.gov/brq5-i26y', function() {
        var title = '2010 Human Services Contracts with the City of Seattle';
        test.assertTitle(title);
        test.assertSelectorHasText('.title-container h1', title);

        assertLinksTo(test, 'a.publisher')('data.seattle.gov', 'http://data.seattle.gov');
        assertLinksTo(test, 'a.blue-button')('View API', 'http://dev.socrata.com/foundry/data.seattle.gov/brq5-i26y');
        assertLinksTo(test, 'a.orange-button')('View Data', 'https://data.seattle.gov/d/brq5-i26y');

        test.assertSelectorHasText('.description', 'This data set provides the Human Services Department division, agency, contract amounts for 2009 for agencies that contract with the City of Seattle for human services.');

        testMainSuggest(test);
    }).run(function() {
        test.done();
    });
});

