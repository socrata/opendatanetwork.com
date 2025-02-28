'use strict';

$(document).ready(function() {

    // Attach handler to the search button
    //
    $('header .search-link').click(() => {

        var text = $('header .search-bar-input').val().trim();

        if (text.length === 0)
            $('header .search-bar-input').focus();
        else
            $('header .search-bar-form').submit();
    });
    
    // Intercept clicks on data access links to enforce captcha verification
    interceptDataAccessLinks();
});

/**
 * Intercept clicks on data access links to enforce captcha verification
 */
function interceptDataAccessLinks() {
    $(document).on('click', 'a', function(e) {
        const $link = $(this);
        const href = $link.attr('href');
        
        if (!href) return;
        
        // Check if this is an API link or data download link
        const isDataLink = href.match(/\/(api|data|download|dataset)\//i) || 
                          $link.hasClass('api-link') || 
                          $link.data('api-link') ||
                          $link.closest('.dataset-column-list').length > 0;
                          
        if (isDataLink) {
            // Prevent default link behavior
            e.preventDefault();
            
            // Show captcha before navigating
            window.ODNCaptcha.show(href);
        }
    });
}

// Array extensions
//
Array.prototype.includes = function(s) {

    return this.indexOf(s) > -1;
};

// String extensions
//
String.prototype.format = function() {

    var args = arguments;

    return this.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
};

String.prototype.split2 = function(s) {

    var rg = this.split(s);

    if ((rg.length == 1) && (rg[0] === ''))
        return [];

    return rg;
};
