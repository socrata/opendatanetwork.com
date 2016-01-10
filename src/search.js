
$(document).ready(function() {

    // Search page controller
    //
    new SearchPageController(_params, _tableData);

    // Main search box
    //
    multiComplete('#q', '.region-list').listen();

    // Selected category (yellow box)
    //
    $('.fa-close').click(function() {
        $('.current-category').fadeOut();
    });

    // Tooltip
    //
    $('.info-icon').mouseenter(function() {
        $('.info-tooltip').fadeIn();
    });

    $('.info-icon').mouseleave(function() {
        $('.info-tooltip').fadeOut();
    });
});
