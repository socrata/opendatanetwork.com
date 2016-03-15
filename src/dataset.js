
$(document).ready(function() {

    // Multi-complete
    //
    const autosuggest = multiComplete('#q', '.region-list');
    autosuggest.listen();

    // QuickLinks
    //
    const quickLinks = new QuickLinks();
    quickLinks.onShow = () => autosuggest.results.hide();

    // Truncate on word boundaries and add ellipsis using jquery.dotdotdot
    //
    $('.dotdotdot').dotdotdot({
        ellipsis : '...',
        wrap : 'word',
        fallbackToLetter : true,
        height: 20
    });
});
