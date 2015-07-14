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

    // Search button
    //
    $('.search-link').click(function() {

        var text = $('#q').val().trim();

        if (text.length == 0)
            $('#q').focus();
        else
            $('#form').submit();
    });

    // Tooltips
    //
    setCookie('tooltips-shown');
});

// Private functions
//
function setCookie(key, value) {
    
    var expires = new Date();
    expires.setTime(expires.getTime() + (365 * 24 * 60 * 60 * 1000)); // one year
    document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
}

function getCookie(key) {
    
    var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
}