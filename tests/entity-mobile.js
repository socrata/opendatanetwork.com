
var _ = require('lodash');

var testSuggest = require('./lib/test-suggest');
var testMainSuggest = require('./lib/test-main-suggest');
var assertLinksTo = require('./lib/assert-links-to');
var assertToggles = require('./lib/assert-toggles');

casper.options.viewportSize = {width: 375, height: 667};

casper.test.begin('entity mobile', function(test) {
    casper.start('http://localhost:3000/entity/1600000US5363000/Seattle_WA/demographics.population.count?year=2013', function() {
        test.assertTitle('Population Count Data for Seattle, WA - Population on the Open Data Network');

        testRefine(test);

        testMainSuggest(test);
    }).run(function() {
        test.done();
    });
});

function testRefine(test) {
    var button = '.refine-results-link-mobile';
    var popup = '.refine-popup-mobile-container';

    test.assertVisible(button);

    casper.click(button);
    casper.waitWhileVisible(button, function() {
        test.assertNotVisible(button);
        test.assertVisible(popup);

        test.assertSelectorHasText(popup, 'Data for');

        testEntityTokens(test);
        testQuestions(test);

        testTopicMenu(test);
    });
}

function testEntityTokens(test) {
    test.assertSelectorHasText('.displayed-regions-list-mobile .region-token', 'Seattle, WA');
}

function testQuestions(test) {
    test.assertSelectorHasText('#question-mobile', 'Questions about Seattle, WA');
    assertToggles(test, '#question-mobile', '.questions-mobile ul');

    var assertLinksToQuestion = assertLinksTo(test, '.questions-mobile ul li a');
    assertLinksToQuestion('What is the Population Rate of Change?',
            questionURL('demographics.population.change'));
    assertLinksToQuestion('What is the Percent who did not finish the 9th grade?',
            questionURL('education.graduation_rates.percent_less_than_9th_grade'));
}

function testTopicMenu(test) {
    var button = '.refine-menu-list-item-topics-mobile .refine-menu-header-mobile';
    var list = '.refine-menu-list-item-topics-mobile ul';
    test.assertSelectorHasText(button, 'Demographics');

    var assertLinksToTopic = assertLinksTo(test, list + ' li a');
    assertLinksToTopic('Demographics', topicURL('demographics'));
    assertLinksToTopic('Education', topicURL('education'));
    assertLinksToTopic('Jobs', topicURL('jobs'));
    assertLinksToTopic('Public Safety', topicURL('crime'));

    assertToggles(test, button, list);
}

function topicURL(topic) {
    return '/entity/1600000US5363000/Seattle_WA/' + topic + '?';
}

function questionURL(variable) {
    return topicURL(variable) + 'ref=entity-question';
}

