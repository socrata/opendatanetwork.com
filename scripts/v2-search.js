$(document).ready(function() {

    // Search box
    //
    $('.search-link').click(function() {

        var text = $('#q').val().trim();

        if (text.length == 0)
            $('#q').focus();
        else
            $('#form').submit();
    });
});

function clear() {

    _controller.clearCategories();
    _controller.navigate();
}

function toggle(category) {

    _controller.toggleCategory(category);
    _controller.navigate();
}

// SearchPageController
//
function SearchPageController(params) {

    this.params = params;
};

// Public methods
//
SearchPageController.prototype.clearCategories = function() {

    this.params.categories = [];
}

SearchPageController.prototype.getSearchUrl = function() {

    var searchUrl = window.location.href.split('?')[0];
    var url = searchUrl + '?q=' + encodeURIComponent($('#q').val()) + 
        '&offset=' + this.params.offset + 
        '&limit=' + this.params.limit;

    if (this.params.categories.length > 0)
        url += '&categories=' + encodeURIComponent(this.params.categories.join(','));

    if (this.params.domains.length > 0)
        url += '&domains=' + encodeURIComponent(this.params.domains.join(','));

    console.log(url);

    return url;
};

SearchPageController.prototype.navigate = function() {

    window.location.href = this.getSearchUrl();
};

SearchPageController.prototype.toggleCategory = function(category) {

    var i = this.params.categories.indexOf(category);

    if (i > -1)
        this.params.categories.splice(i, 1); // remove at index i
    else 
        this.params.categories.push(category);
};
