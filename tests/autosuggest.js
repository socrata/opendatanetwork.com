
var suggestInput = '.search-bar-input';
var suggestResults = '.region-list';
var suggestResult = '.region-list .autocomplete-option';

function testAutosuggest(test) {
    test.assertExists(suggestInput);
    test.assertExists(suggestResults);

    casper.sendKeys(suggestInput, 'seattle', {keepFocus: true});

    casper.waitForSelectorTextChange(suggestResults, function () {
        test.assertVisible(suggestResults);

        // entities
        test.assertSelectorHasText(suggestResult, 'Seattle Metro Area (WA)');
        test.assertSelectorHasText(suggestResult, 'Seattle, WA');

        // datasets
        test.assertSelectorHasText(suggestResult, 'Bus Ridership');

        // publishers
        test.assertSelectorHasText(suggestResult, 'data.seattle.gov');

        // questions
        test.assertSelectorHasText(suggestResult, 'median earnings of Seattle Metro Area (WA)');

        // API
        test.assertSelectorHasText(suggestResult, 'Suggestions API Documentation');
    });
}

module.exports = testAutosuggest;

