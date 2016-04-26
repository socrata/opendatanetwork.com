
$(document).ready(function() {

    // Search page controller
    //
    new SearchPageController(_params, _searchResultsRegions);

    // Main search box
    //
    const autosuggest = multiComplete('#q', '.region-list');
    autosuggest.listen();

    // QuickLinks
    //
    const quickLinks = new QuickLinks();
    quickLinks.onShow = () => autosuggest.results.hide();

    // Selected category (yellow box)
    //
    $('.fa-close').click(() => {
        $('.current-category').fadeOut();
    });

    // Tooltip
    //
    $('.info-icon').mouseenter(() => {
        $('.info-tooltip').fadeIn();
    });

    $('.info-icon').mouseleave(() => {
        $('.info-tooltip').fadeOut();
    });
});
