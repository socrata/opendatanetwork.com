$(document).ready(function() {

    // Communities menu
    //
    $('#menu-item-communities').mouseenter(function() {

        $('#menu-communities').show(100); 
        $('#menu-item-communities').addClass('selected');
    });

    $('#menu-item-communities').mouseleave(function() {

        $('#menu-communities').hide(100);
        $('#menu-item-communities').removeClass('selected');
    });

    // Search box
    //
    $('.search-link').click(function() {

        var text = $('#q').val().trim();

        if (text.length == 0)
            $('#q').focus();
        else
            $('#form').submit();
    });
});
