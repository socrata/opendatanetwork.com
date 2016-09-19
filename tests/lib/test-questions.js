
var assertLinksTo = require('./assert-links-to');

function testQuestions(test, selector, questions) {
    var assertLinksToQuestion = assertLinksTo(test, selector);
    questions.forEach(function(question) {
        assertLinksToQuestion(question.name, question.href);
    });

    test.assertSelectorHasText('a.more', 'show more');
    test.assertExists('.question.collapsed');
    casper.click('a.more');

    casper.waitWhileSelector('.question.collapsed', function () {
        test.assertDoesntExist('.question.collapsed');
        test.assertSelectorHasText('a.more', 'show less');
    });
}


module.exports = testQuestions;

