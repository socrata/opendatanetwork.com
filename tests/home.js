
var title = 'Open Data Network';

var testMainSuggest = require('./lib/test-main-suggest');

casper.options.viewportSize = {width: 1600, height: 900};

casper.test.begin('homepage', function(test) {
    casper.start('http://localhost:3000/', function() {
        test.assertTitle(title);
        test.assertSelectorHasText('.logo', title);
        test.assertSelectorHasText('.hero-section', title);

        testMainSuggest(test, '.home-search-bar-controls .search-bar-input', '.home-search-bar-controls .region-list');
    }).run(function() {
        test.done();
    });
});

