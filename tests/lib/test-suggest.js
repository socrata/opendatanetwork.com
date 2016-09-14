
var assertLinksTo = require('./assert-links-to');

function testSuggest(test, input, results, result) {
    result = results + ' ' + result;

    test.assertExists(input);
    test.assertVisible(input);
    test.assertExists(results);

    return function(keys, expectedOptions) {
        casper.sendKeys(input, 'seattle', {keepFocus: true});

        casper.waitUntilVisible(results, function() {
            test.assertVisible(results);
            test.assertExists(result);

            var assertLinksToOption = assertLinksTo(test, results + ' li a');

            expectedOptions.forEach(function(option) {
                assertLinksToOption(option.name, option.href);
            });

            casper.sendKeys(input, '', {reset: true});
        });
    };
}

module.exports = testSuggest;

