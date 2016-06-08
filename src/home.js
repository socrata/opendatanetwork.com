
$(document).ready(function() {

    const controller = new HomePageController();
    controller.beginSampleQuestions();

    // Mobile categories
    //
    $('.categories-dropdown-mobile').click(() => {

        if ($('.categories-list-mobile').is(':visible'))
            $('.categories-dropdown-mobile .fa').removeClass('fa-caret-up').addClass('fa-caret-down');
        else
            $('.categories-dropdown-mobile .fa').removeClass('fa-caret-down').addClass('fa-caret-up');

        $('.categories-list-mobile').slideToggle();
    });

    // Mobile regions
    //
    $('.state-expand-mobile').click(function() {

        const regionId = $(this).attr('region-id');

        if ($('.sub-regions-container-' + regionId + '-mobile').is(':visible'))
            $(this).removeClass('fa-minus').addClass('fa-plus');
        else
            $(this).removeClass('fa-plus').addClass('fa-minus');

        $('.sub-regions-container-' + regionId + '-mobile').slideToggle();
    });

    // Slider
    //
    $('.slider').slick({
        arrows: false,
        autoplay: true,
        autoplaySpeed: 2000,
        slidesToScroll: 1,
        slidesToShow: 5,
    });

    // Autocomplete
    //
    const headerAutoSuggest = multiComplete('#q', '.region-list');
    headerAutoSuggest.listen();

    const heroAutoSuggest = multiComplete('.home-search-bar-controls #q', '.home-search-bar-controls .region-list');
    heroAutoSuggest.listen();

    // QuickLinks
    //
    const quickLinks = new QuickLinks();

    quickLinks.onShow = () => {
        headerAutoSuggest.results.hide();
        heroAutoSuggest.results.hide();
    };

    // Search button
    //
    $('#search-button').click(() => {
        window.location.href = '/search?q=' + encodeURIComponent($('#q').val());
    });

    // Locations by state
    //
    $('.more-subregions-link').click(function() {

       $(this).parent().removeClass('state-collapsed');
       $(this).hide();
    });

    $('.more-regions-link').click(function() {

       $('.states-list').removeClass('states-list-collapsed');
       $(this).hide();
    });
});
