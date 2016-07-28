
$(document).ready(function() {

    // Search page controller
    //
    new SearchPageController(_params, _searchResultsRegions);

    // Main search box
    //
    const autosuggest = multiComplete('.search-bar-input', '.region-list');
    autosuggest.listen();

    // QuickLinks
    //
    const quickLinks = new QuickLinks();
    quickLinks.onShow = () => autosuggest.results.hide();

    // Selected category (yellow box)
    //
    $('.current-category-info-box .fa-close').click(() => {
        $('.current-category-info-box').slideUp();
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
