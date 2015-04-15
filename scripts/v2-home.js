$(document).ready(function() {

    // Search box
    //
    $(".search-link").click(function() {

        var text = $("#q").val().trim();

        if (text.length == 0)
            $("#q").focus();
        else
            $("#form").submit();
    });

    // Slider 
    //
    $(".slider").slick({
        arrows: false,
        autoplay: true,
        autoplaySpeed: 2000,
        slidesToScroll: 1,
        slidesToShow: 5,
    });
});
