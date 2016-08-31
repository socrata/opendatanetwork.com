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
});

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
