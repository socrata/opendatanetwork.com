$(document).ready(function() {

    // Communities menu
    //
    $('#menu-item-communities').mouseenter(function() {

        $('#menu-communities').show(); 
        $('#menu-item-communities').addClass('selected');
    });

    $('#menu-item-communities').mouseleave(function() {

        $('#menu-communities').hide(); 
        $('#menu-item-communities').removeClass('selected');
    });

    // Search icon in header
    //
    $('.fa-search').click(function() {
        $('html, body').animate({
            scrollTop: 0
        }, 
        400);
    });

    // Search menu
    //
    var controller = new SearchMenuController();
});

// SearchMenuController
//
function SearchMenuController() {

    var self = this;

    this.categories = this.getParameterByName('categories').split2(',');

    $('#searchCategoryHealth')
        .change(function() { self.toggleCategory('Health'); })
        .prop('checked', this.categories.includes('Health'));

    $('#searchCategoryTransportation')
        .change(function() { self.toggleCategory('Transportation'); })
        .prop('checked', this.categories.includes('Transportation'));

    $('#searchCategoryFinance')
        .change(function() { self.toggleCategory('Finance'); })
        .prop('checked', this.categories.includes('Finance'));

    $('#searchCategorySocialServices')
        .change(function() { self.toggleCategory('Social Services'); })
        .prop('checked', this.categories.includes('Social Services'));

    $('#searchCategoryEnvironment')
        .change(function() { self.toggleCategory('Environment'); })
        .prop('checked', this.categories.includes('Environment'));

    $('#searchCategoryPublicSafety')
        .change(function() { self.toggleCategory('Public Safety'); })
        .prop('checked', this.categories.includes('Public Safety'));

    $('#searchCategoryHousingAndDevelopment')
        .change(function() { self.toggleCategory('Housing & Development'); })
        .prop('checked', this.categories.includes('Housing & Development'));

    $('#searchCategoryInfrastructure')
        .change(function() { self.toggleCategory('Infrastructure'); })
        .prop('checked', this.categories.includes('Infrastructure'));

    $('#searchCategoryEducation')
        .change(function() { self.toggleCategory('Education'); })
        .prop('checked', this.categories.includes('Education'));

    $('#searchCategoryRecreation')
        .change(function() { self.toggleCategory('Recreation'); })
        .prop('checked', this.categories.includes('Recreation'));

    $('#search-categories-menu-open').click(function() { $('#search-categories-menu').toggle(100); });
    $('#search-categories-menu-close').click(function() { $('#search-categories-menu').hide(100); });
};

// Public methods
//
SearchMenuController.prototype.getParameterByName = function(name) {

    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    var results = regex.exec(location.search);

    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

SearchMenuController.prototype.toggleCategory = function(category) {

    var i = this.categories.indexOf(category);

    if (i > -1)
        this.categories.splice(i, 1); // remove at index i
    else 
        this.categories.push(category);

    $('#categories').val(this.categories.join(','));

    console.log($('#categories').val());
}

// Extensions
//
String.prototype.split2 = function(s) {

    var rg = this.split(s);

    if ((rg.length == 1) && (rg[0] == ''))
        return [];

    return rg;
}

Array.prototype.includes = function(s) {

    return this.indexOf(s) > -1;
}
