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
});
