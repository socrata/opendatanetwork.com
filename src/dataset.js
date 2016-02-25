
$(document).ready(function() {

    // Multi-complete
    //
    multiComplete('#q', '.region-list').listen();

    // Truncate on word boundaries and add ellipsis using jquery.dotdotdot
    //
    $('.dotdotdot').dotdotdot({
        ellipsis : '...',
        wrap : 'word',
        fallbackToLetter : true,
        height: 20
    });
});
