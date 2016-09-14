
var title = 'Open Data Network';

var testSuggest = require('./lib/suggest');

casper.options.viewportSize = {width: 1600, height: 900};

casper.test.begin('homepage', function(test) {
    casper.start('http://localhost:3000/', function() {
        test.assertTitle(title);
        test.assertSelectorHasText('.logo', title);
        test.assertSelectorHasText('.hero-section', title);

        testSuggest(test, '.home-search-bar-controls .search-bar-input', '.home-search-bar-controls .region-list');
    }).run(function() {
        test.done();
    });
});

