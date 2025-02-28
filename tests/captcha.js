var testCaptcha = require('./lib/test-captcha');
var casper = require('casper').create();

casper.options.viewportSize = {width: 1600, height: 900};

casper.test.begin('captcha functionality', function(test) {
    // Test captcha on search page
    casper.start('http://localhost:3000/search?q=seattle', function() {
        testCaptcha(test, function() {
            // After successful captcha completion, ensure results appear
            test.assertExists('.search-results', 'Search results appear after captcha completion');
            test.assertSelectorHasText('.search-results-header-label', 'datasets for "seattle"');
        });
    });
    
    // Test captcha on dataset page
    casper.thenOpen('http://localhost:3000/dataset/data.seattle.gov/pu5n-trf4', function() {
        testCaptcha(test, function() {
            // After successful captcha completion, ensure dataset content appears
            test.assertExists('.dataset-content', 'Dataset content appears after captcha completion');
        });
    });
    
    casper.run(function() {
        test.done();
    });
});