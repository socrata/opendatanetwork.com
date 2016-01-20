
$(document).ready(function() {

    // Search page controller
    //
    new SearchPageController(_params, _tableData, _mapVariables);

    // Main search box
    //
    multiComplete('#q', '.region-list').listen();

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
