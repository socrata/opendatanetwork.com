$(document).ready(function() {

    // Communities menu
    //
    $('#menu-item-communities').mouseenter(function() {

        $('#menu-communities').slideToggle(100); 
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

    // Search menu controller
    //
    new SearchMenuController();
});

// Search menu controller
function SearchMenuController() {

    this.categories = this.getParameterByName('categories').split2(',');
    var self = this;

    // Attach handler to the search menu button
    //
    $('.search-options-link').click(function() { $('.search-options-menu').slideToggle(100); });

    // Attach handlers to the all categories link
    //
    $('.search-options-menu-all').click(function() { self.clearCategories(); });

    // Attach handlers to the individual category links
    //
    $('.search-options-menu li a').click(function() { self.toggleCategory($(this)); });

    this.updateMenuState();
}

// Public methods
//
SearchMenuController.prototype.clearCategories = function() {

    this.categories = [];

    $('#categories').val('');
    console.log($('#categories').val());

    this.updateMenuState();
};

SearchMenuController.prototype.getParameterByName = function(name) {

    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    var results = regex.exec(location.search);

    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

SearchMenuController.prototype.toggleCategory = function(o) {

    var category = o.text().toLowerCase().trim();
    var i = this.categories.indexOf(category);

    if (i > -1)
        this.categories.splice(i, 1); // remove at index i
    else
        this.categories.push(category);

    $('#categories').val(this.categories.join(','));
    console.log($('#categories').val());

    this.updateMenuState();
};

SearchMenuController.prototype.updateMenuState = function() {

    var self = this;

    // Update the all categories checkbox
    //
    if (this.categories.length == 0)
        $('.search-options-menu-all .fa-check').show();
    else
        $('.search-options-menu-all .fa-check').hide();

    // Update the individual category checkboxes
    //
    $('.search-options-menu li a').each(function() {

        if (self.categories.includes($(this).text().toLowerCase().trim()))
            $(this).children('.fa-check').show();
        else
            $(this).children('.fa-check').hide();
    });
};

// Extensions
//
String.prototype.split2 = function(s) {

    var rg = this.split(s);

    if ((rg.length == 1) && (rg[0] == ''))
        return [];

    return rg;
};

Array.prototype.includes = function(s) {

    return this.indexOf(s) > -1;
};
