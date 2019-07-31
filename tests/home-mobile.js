
var title = 'Open Data Network';

var testMainSuggest = require('./lib/test-main-suggest');
var assertToggles = require('./lib/assert-toggles');
var assertLinksTo = require('./lib/assert-links-to');

casper.options.viewportSize = {width: 375, height: 667};

casper.test.begin('homepage mobile', function(test) {
    casper.start('http://localhost:3000/', function() {
        test.assertTitle(title);
        test.assertSelectorHasText('.logo', title);

        testQuestionsList(test);
        testCategoryList(test);

        testMainSuggest(test);
    }).run(function() {
        test.done();
    });
});

function testQuestionsList(test) {
    assertToggles(test, '.questions-dropdown', '.questions-list-container');
}

function testCategoryList(test) {
    assertToggles(test, '.categories-dropdown-mobile', '.categories-list-mobile');

    var assertLinksToCategory = assertLinksTo(test, '.categories-list-mobile li a');
    assertLinksToCategory('Finance', categoryURL('finance'));
    assertLinksToCategory('Infrastructure', categoryURL('infrastructure'));
    assertLinksToCategory('Demographics', categoryURL('demographics'));
}

function categoryURL(category) {
    return '/search?categories=' + category;
}

