
var testSuggest = require('./test-suggest');

function testMainSuggest(test, input, results, result) {
    input = input || '.search-bar-input';
    results = results || '.region-list';
    result = result || '.autocomplete-option';
    var mainSuggest = testSuggest(test, input, results, result);

    testSeattle(mainSuggest);
}

function testSeattle(mainSuggest) {
    mainSuggest('seattle', [
        {
            name: 'Seattle Metro Area (WA)',
            href: '/entity/310M200US42660/Seattle_Metro_Area_WA?ref=suggest-entity'
        },
        {
            name: 'Seattle, WA',
            href: '/entity/1600000US5363000/Seattle_WA?ref=suggest-entity'
        },
        {
            name: 'data.seattle.gov',
            href: '/search?domains=data.seattle.gov'
        },
        {
            name: '2010 Human Services Contracts with the City of Seattle',
            href: '/dataset/data.seattle.gov/brq5-i26y'
        },
        {
            name: 'What is the business and finance employment rate of Seattle Metro Area (WA)?',
            href: '/region/310M200US42660/Seattle_Metro_Area_WA/occupations/business_and_finance'
        },
        {
            name: 'Suggestions API Documentation',
            href: 'http://docs.odn.apiary.io/#reference/0/suggestions/get-suggestions'
        }
    ]);
}

module.exports = testMainSuggest;

