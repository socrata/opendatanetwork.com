
var _ = require('lodash');
var testSuggest = require('./lib/test-suggest');
var testMainSuggest = require('./lib/test-main-suggest');
var assertLinksTo = require('./lib/assert-links-to');
var dump = require('utils').dump;

casper.options.viewportSize = {width: 1600, height: 950};

casper.test.begin('entity', function(test) {
    casper.start('http://localhost:3000/entity/1600000US5363000/Seattle_WA/demographics.population.count?year=2013', function() {
        test.assertTitle('Population Count Data for Seattle, WA - Population on the Open Data Network');

        testTopicMenu(test);
        testVariableMenu(test);
        testConstraintMenu(test);

        testEntityTokens(test);

        testMapSummary(test);

        testQuestions(test);

        testCompareSuggest(test);
        testCompareLinks(test);

        testParentLink(test);
        testSiblingLinks(test);

        testCharts(test);

        testMainSuggest(test);
    }).run(function() {
        test.done();
    });
});

function testCharts(test) {
    testPopulationCountChart(test);
    testPopulationChangeChart(test);
}

function testPopulationCountChart(test) {
    test.assertSelectorHasText('#demographics-population-count-chart h1', 'Population');
    test.assertExists('#chart-demographics-population-count-chart');

    casper.waitForSelector('#chart-demographics-population-count-chart svg', function() {
        test.assertExists('#chart-demographics-population-count-chart svg');
        test.assertSelectorHasText('#dataset-description-demographics-population-count-chart .forecast-descriptions p',
            'The last measured population count for Seattle, WA was 624,681 in 2013. Seattle, WA experienced an average growth rate of 1.29% from our first statistic recorded in 2009. If past trends continue, we forecast the population count to be 663,026 by 2018.');
    });
}

function testPopulationChangeChart(test) {
    test.assertSelectorHasText('#demographics-population-change-chart h1', 'Population');
    test.assertExists('#chart-demographics-population-change-chart');

    casper.waitForSelector('#chart-demographics-population-change-chart svg', function() {
        test.assertExists('#chart-demographics-population-change-chart svg');
    });

}

function testParentLink(test) {
    var assertLinksToParent = assertLinksTo(test, 'a.parent-link');
    assertLinksToParent('Washington', '/entity/0400000US53/Washington?ref=related-parent');
}

function testSiblingLinks(test) {
    var assertLinksToSibling = assertLinksTo(test, '#siblings .places-in-region-list li a');
    assertLinksToSibling('Spokane, WA', '/entity/1600000US5367000/Spokane_WA/demographics.population.count?year=2013&ref=related-sibling');
    assertLinksToSibling('Tacoma, WA', '/entity/1600000US5370000/Tacoma_WA/demographics.population.count?year=2013&ref=related-sibling');
}

function testCompareLinks(test) {
    var assertLinksToPeer = assertLinksTo(test, '#similar-regions li a');
    assertLinksToPeer('Anchorage, AK', '/entity/1600000US0203000-1600000US5363000/Anchorage_AK-Seattle_WA/demographics.population.count?year=2013&ref=related-peer');
    assertLinksToPeer('Denver, CO', '/entity/1600000US0820000-1600000US5363000/Denver_CO-Seattle_WA/demographics.population.count?year=2013&ref=related-peer');
}

function testCompareSuggest(test) {
    var compareSuggest = testSuggest(test, '.add-region-input', '.add-region-results', '.autocomplete-option');

    testCompareSuggestSeattle(compareSuggest);
}

function testCompareSuggestSeattle(compareSuggest) {
    compareSuggest('seattle', [
        {
            name: 'Seattle Metro Area (WA)',
            href: '/entity/310M200US42660-1600000US5363000/Seattle_Metro_Area_WA-Seattle_WA/demographics.population.count?year=2013&ref=compare-entity'
        }
    ]);
}

function testEntityTokens(test) {
    test.assertSelectorHasText('.region-token', 'Seattle, WA');
}

function testQuestions(test) {
    var assertLinksToQuestion = assertLinksTo(test, '#sidebar-questions li a', function(variable) {
    });

    assertLinksToQuestion('What is the Population Rate of Change?',
            questionURL('demographics.population.change'));
    assertLinksToQuestion('What is the Percent who did not finish the 9th grade?',
            questionURL('education.graduation_rates.percent_less_than_9th_grade'));

    test.assertSelectorHasText('a.more', 'show more');
    test.assertExists('.question.collapsed');
    casper.click('a.more');

    casper.waitWhileSelector('.question.collapsed', function () {
        test.assertDoesntExist('.question.collapsed');
        test.assertSelectorHasText('a.more', 'show less');
    });
}

function testMapSummary(test) {
    test.assertSelectorHasText('p#map-summary', 'The population count of Seattle, WA was 624,681 in 2013.');
}

function testTopicMenu(test) {
    test.assertSelectorHasText('.chart-tabs li.selected', 'Demographics');

    var assertLinksToTopic = assertLinksTo(test, '.chart-tabs li a');
    assertLinksToTopic('Demographics', topicURL('demographics'));
    assertLinksToTopic('Education', topicURL('education'));
    assertLinksToTopic('Jobs', topicURL('jobs'));
    assertLinksToTopic('Public Safety', topicURL('crime'));
}

function testVariableMenu(test) {
    test.assertSelectorHasText('#map-variable-text .refine-menu-header-mobile', 'Population Count');

    var assertLinksToVariable = assertLinksTo(test, '#map-variable-list li a');
    assertLinksToVariable('Population Count', variableURL('count'));
    assertLinksToVariable('Population Rate of Change', variableURL('change'));
}

function testConstraintMenu(test) {
    test.assertSelectorHasText('.map-variable-year-link', '2013');

    var selector = '.map-variable-year-container .chart-sub-nav-menu li a';
    var assertLinksToYear = assertLinksTo(test, selector);
    _.range(2009, 2014).forEach(function (year) {
        assertLinksToYear(year, yearURL(year));
    });
}

function topicURL(topic) {
    return '/entity/1600000US5363000/Seattle_WA/' + topic + '?';
}

function variableURL(variable) {
    return topicURL('demographics.population.' + variable);
}

function yearURL(year) {
    return variableURL('count') + 'year=' + year;
}

function questionURL(variable) {
    return topicURL(variable) + 'ref=entity-question';
}

