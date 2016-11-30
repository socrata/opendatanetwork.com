
var assertLinksTo = require('./lib/assert-links-to');
var testMainSuggest = require('./lib/test-main-suggest');
var testQuestions = require('./lib/test-questions');

casper.options.viewportSize = {width: 1600, height: 900};

casper.test.begin('search', function(test) {
    casper.start('http://localhost:3000/search?q=seattle', function() {
        test.assertTitle('Data on the Open Data Network');

        testSearchEntities(test);
        testSearchQuestions(test);
        testSearchDatasets(test);

        testMainSuggest(test);
    }).run(function() {
        test.done();
    });
});

function testSearchEntities(test) {
    var assertLinksToEntity = assertLinksTo(test, '.search-results-regions h2 a');
    assertLinksToEntity('Seattle Metro Area (WA)', '/entity/310M200US42660/Seattle_Metro_Area_WA?ref=search-entity');
    assertLinksToEntity('Seattle, WA', '/entity/1600000US5363000/Seattle_WA?ref=search-entity');
}

function testSearchQuestions(test) {
    testQuestions(test, '#search-questions li a', [
        {
            name: 'What is the annual change in GDP of Seattle Metro Area (WA)?',
            href: '/region/310M200US42660/Seattle_Metro_Area_WA/gdp/annual_change_in_gdp'
        },
        {
            name: 'What is the healthcare employment rate of Seattle Metro Area (WA)?',
            href: '/region/310M200US42660/Seattle_Metro_Area_WA/occupations/healthcare'
        }
    ]);
}

function testSearchDatasets(test) {
    test.assertSelectorHasText('.search-results-header-label', 'Found');
    test.assertSelectorHasText('.search-results-header-label', 'datasets for "seattle"');

    test.assertSelectorHasText('.search-results.datasets li a', 'Seattle');

    testInfiniteScroll(test);
}

function testInfiniteScroll(test) {
    casper.scrollToBottom();
    casper.waitForText('Seattle Federal Jobs', function() {
        test.assertSelectorHasText('.search-results.datasets li a', 'Seattle Federal Jobs');
    });
}


