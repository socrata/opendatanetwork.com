
$(document).ready(function() {

    // Autosuggest
    //
    const autosuggest = new Autosuggest('.region-list');
    autosuggest.listen('.search-bar-input');

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
