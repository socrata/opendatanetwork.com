$(document).ready(function() {

    // Region controller
    //
    new RegionController();

    // Search menu controller
    //
    var searchMenu = new SearchMenuController();

    // Communities menu
    //
    $('#menu-item-communities').mouseenter(function() {

        $('#menu-communities').slideToggle(100); 
        $('#menu-item-communities').addClass('selected');

        searchMenu.hideOptionsMenu();
    });

    $('#menu-item-communities').mouseleave(function() {

        $('#menu-communities').hide(100);
        $('#menu-item-communities').removeClass('selected');
    });
});

// Region controller
//
function RegionController() {

    var baseUrl = 'https://federal.demo.socrata.com/views/7g2b-8brv';
    var autoCompleteNameSuggestUrl = baseUrl + '/columns/autocomplete_name/suggest/{0}?size=10&fuzz=0';

    $('#q').keyup(function() {

        var searchTerm = $('#q').val().trim();
        
        if (searchTerm.length == 0) {

            $('.region-list').slideUp(100);
            return;
        }

        var url = autoCompleteNameSuggestUrl.format(encodeURIComponent(searchTerm));

        $.getJSON(url, function(data) {

            var regionList = $('.region-list'); 

            if (data.options.length == 0) {
    
                regionList.slideUp(100);
                return;
            }

            var items = data.options.map(function(item) {
                return '<li>' + item.text + '</li>'; 
            });

            regionList.html(items.join(''));

            $('.region-list li').click(function(e) {

                $('#region').val($(this).text());
                regionList.slideUp();
            });

            regionList.slideDown(100);
        });
    });
}

// Search menu controller
//
function SearchMenuController() {

    this.categories = this.getParameterByName('categories').split2(',');
    var self = this;

    // Attach handler to the search text box
    //
    $('#q').focusin(function() { $('.search-textbox-tip').fadeOut(); });

    // Attach handler to the search button
    //
    $('.search-link').click(function() {

        var text = $('#q').val().trim();

        if (text.length == 0)
            $('#q').focus();
        else
            $('#form').submit();
    });

    // Attach handler to the search options button
    //
    $('.search-options-link').click(function() { 

        $('.search-options-menu').slideToggle(100);
        $('.search-dropdown-tip').fadeOut();
    });

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

SearchMenuController.prototype.hideOptionsMenu = function() {
    
    $('.search-options-menu').fadeOut();
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

String.prototype.format = function() {

    var args = arguments;

    return this.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
};
