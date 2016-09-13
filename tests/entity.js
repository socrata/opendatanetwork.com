
var _ = require('lodash');
var testSuggest = require('./autosuggest');
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

        testSuggest(test);
    }).run(function() {
        test.done();
    });
});

function testEntityTokens(test) {
    test.assertSelectorHasText('.region-token', 'Seattle, WA');
}

function testQuestions(test) {
    var assertLinksToQuestion = assertLinksTo(test, '#sidebar-questions li a', function(variable) {
        return topicURL(variable) + 'ref=entity-question';
    });

    assertLinksToQuestion('What is the Population Rate of Change?', 'demographics.population.change');
    assertLinksToQuestion('What is the Percent who did not finish the 9th grade?', 'education.graduation_rates.percent_less_than_9th_grade');

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

    var assertLinksToTopic = assertLinksTo(test, '.chart-tabs li a', topicURL);
    assertLinksToTopic('Demographics');
    assertLinksToTopic('Education');
    assertLinksToTopic('Jobs');
    assertLinksToTopic('Public Safety', 'crime');
}

function testVariableMenu(test) {
    test.assertSelectorHasText('#map-variable-text .refine-menu-header-mobile', 'Population Count');

    var assertLinksToVariable = assertLinksTo(test, '#map-variable-list li a', variableURL);
    assertLinksToVariable('Population Count', 'count');
    assertLinksToVariable('Population Rate of Change', 'change');
}

function testConstraintMenu(test) {
    test.assertSelectorHasText('.map-variable-year-link', '2013');

    var selector = '.map-variable-year-container .chart-sub-nav-menu li a';
    var assertLinksToYear = assertLinksTo(test, selector, yearURL);
    _.range(2009, 2014).forEach(function (year) {
        assertLinksToYear(year);
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

function assertLinksTo(test, linkSelector, idToURL) {
    var links = getLinks(linkSelector);

    return function(name, id) {
        console.log(name);
        var href = idToURL(id || name.toString().toLowerCase());
        var description = 'Find link named "' + name + '" with href "' + href + '" in "' + linkSelector + '"';
        test.assert(contains(links, {name: name, href: href}), description);
    };
}

function contains(objects, object) {
    return _.any(objects, function(other) {
        return _.all(_.keys(object), function(key) {
            return key in other && object[key] == other[key];
        });
    });
}

function getLinks(selector) {
    return casper.getElementsInfo(selector).map(function(link) {
        return {
            href: link.attributes.href,
            name: link.text
        };
    });
}

