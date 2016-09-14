
function testAutosuggest(test, suggestInput, suggestResults, suggestResult) {
    suggestInput = suggestInput || '.search-bar-input';
    suggestResults = suggestResults || '.region-list';
    suggestResult = suggestResults + ' ' + (suggestResult || '.autocomplete-option');

    test.assertVisible(suggestInput);
    test.assertExists(suggestResults);

    casper.sendKeys(suggestInput, 'seattle', {keepFocus: true});

    casper.waitUntilVisible(suggestResults, function () {
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

