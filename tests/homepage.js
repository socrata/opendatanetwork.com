// Basic tests for the homepage on ODN staging
casper.test.begin('homepage', function checkHomepage(test) {
  casper.start('http://localhost:3002');

  casper.then(function() {
    // Check some basic stuff about the page
    test.assertTitleMatch(/^Open Data Network$/, 'browser title correct');
    test.assertSelectorHasText('.container h1', 'Open Data Network', 'h1 title correct');

    // Try filling in a city to see what we can search for
    casper.sendKeys('input#q', 'Seattle', { keepFocus: true });

    // Wait for the search results to come back
    casper.waitForSelectorTextChange('#form .region-list', function waitForAutocomplete() {
      test.assertVisible('#form .region-list', 'autocomplete is visible');

      // Datasets
      test.assertSelectorHasText('.autocomplete-category .autocomplete-title', 'Datasets', 'we match at least some datasets');
      test.assertSelectorHasText('.autocomplete-category .autocomplete-option', 'Bus Ridership', 'bus ridership datasets show up');

      // Regions
      test.assertSelectorHasText('.autocomplete-category .autocomplete-title', 'Regions', 'we match at least some regions');
      test.assertSelectorHasText('.autocomplete-category .autocomplete-option', 'Seattle Metro Area (WA)', 'seattle metro shows up');

      // Publishers
      test.assertSelectorHasText('.autocomplete-category .autocomplete-title', 'Publishers', 'we match at least some publishers');
      test.assertSelectorHasText('.autocomplete-category .autocomplete-option', 'data.seattle.gov', 'dsg shows up');
    });

    // Check if some of our highlighted regions show up
    test.assertSelectorHasText('.states-list h3', 'California', 'california shows up');
    test.assertSelectorHasText('.states-list .regions-list .region', 'Los Angeles, CA', 'los angeles shows up');
  });

  casper.run(function() {
    test.done();
  });
});
