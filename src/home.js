
$(document).ready(function() {

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
    multiComplete('#q', '.region-list').listen();

    // Search button
    //
    $('#search-button').click(() => {
        window.location.href = '/search?q=' + encodeURIComponent($('#q').val());
    });

    // Communities menu
    //
    $('#menu-item-communities').mouseenter(function() {

        $('#menu-communities').slideToggle(100);
        $('#menu-item-communities').addClass('selected');
    });

    $('#menu-item-communities').mouseleave(function() {

        $('#menu-communities').hide(100);
        $('#menu-item-communities').removeClass('selected');
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
