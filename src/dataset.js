'use strict';

$(document).ready(function() {
    // Autosuggest
    //
    const autosuggest = new Autosuggest('.region-list');
    autosuggest.listen('.search-bar-input');
    
    // Show captcha before displaying dataset information
    showCaptchaForDataset();
});

/**
 * Show captcha before displaying dataset information
 */
function showCaptchaForDataset() {
    // Hide dataset content initially
    $('.dataset-content').hide();
    
    // Show the captcha
    window.ODNCaptcha.show(function() {
        // After captcha completion, show dataset content and init UI elements
        $('.dataset-content').fadeIn();
        
        // Truncate on word boundaries and add ellipsis using jquery.dotdotdot
        $('.dotdotdot').dotdotdot({
            ellipsis : '...',
            wrap : 'word',
            fallbackToLetter : true,
            height: 20
        });
    });
}
