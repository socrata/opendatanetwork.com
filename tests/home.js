
var title = 'Open Data Network';

var testSuggest = require('./autosuggest');

casper.test.begin('homepage', function(test) {
    casper.start('http://localhost:3000/', function() {
        test.assertTitle(title);
        test.assertSelectorHasText('.logo', title);
        test.assertSelectorHasText('.hero-section', title);

        testSuggest(test);
    }).run(function() {
        test.done();
    });
});

