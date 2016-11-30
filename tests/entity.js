
var _ = require('lodash');
var testSuggest = require('./lib/test-suggest');
var testMainSuggest = require('./lib/test-main-suggest');
var testQuestions = require('./lib/test-questions');
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


        testCompareSuggest(test);
        testCompareLinks(test);

        testParentLink(test);
        testSiblingLinks(test);

        testCharts(test);

        testMap(test);

        testDatasetSearch(test);

        testMainSuggest(test);
    }).run(function() {
        test.done();
    });
});

function testSidebarQuestions(test) {
    testQuestions(test, '#sidebar-questions li a', [
        {
            name: 'What is the Population Rate of Change?',
            href: questionURL('demographics.population.change')
        },
        {
            name: 'What is the Percent who did not finish the 9th grade?',
            href: questionURL('education.graduation_rates.percent_less_than_9th_grade')
        }
    ]);
}

function testDatasetSearch(test) {
    test.assertSelectorHasText('.search-results-header h2', 'Demographics and Population Datasets Involving Seattle, WA');
    test.assertSelectorHasText('.search-results li h2 a', 'Directory Of Unsheltered Street Homeless To General Population Ratio 2010');
}

function testMap(test) {
    casper.waitForSelector('.leaflet-container', function() {
        casper.waitForSelector('.leaflet-popup-content', function() {
            test.assertSelectorHasText('.leaflet-popup-content .name', 'Seattle, WA');
            test.assertSelectorHasText('.leaflet-popup-content .value', 'Population Count');
            test.assertSelectorHasText('.leaflet-popup-content .value', '(2013)');
            test.assertSelectorHasText('.leaflet-popup-content .value', '624,681');
        });

        casper.waitForSelector('.legend-container', function() {
            test.assertSelectorHasText('.legend-container .tick-label', 'maximum');
            test.assertSelectorHasText('.legend-container .tick-value', '8,268,999');
            test.assertSelectorHasText('.legend-container .tick-label', 'upper quartile');
            test.assertSelectorHasText('.legend-container .tick-value', '4,082');
            test.assertSelectorHasText('.legend-container .tick-label', 'median');
            test.assertSelectorHasText('.legend-container .tick-value', '1,106');
            test.assertSelectorHasText('.legend-container .tick-label', 'lower quartile');
            test.assertSelectorHasText('.legend-container .tick-value', '338');
            test.assertSelectorHasText('.legend-container .tick-label', 'minimum');
            test.assertSelectorHasText('.legend-container .tick-value', '0');
        });
    });
}

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
            'The last measured population count for Seattle, WA was 637,850 in 2014. Seattle, WA experienced an average growth rate of 1.48% from our first statistic recorded in 2009. If past trends continue, we forecast the population count to be 681,695 by 2019.');
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

