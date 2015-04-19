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

function prev() {

    if (_controller.tryChangePage(-1))
        _controller.navigate();
}

function next() {

    if (_controller.tryChangePage(1))
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
    var url = searchUrl + 
        '?q=' + encodeURIComponent($('#q').val());

    if (this.params.page > 1)
        url += '&page=' + this.params.page;

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

    this.params.page = 1;
};

SearchPageController.prototype.tryChangePage = function(diff) {

    if ((this.params.page + diff) < 1)
        return false;

    if ((this.params.page + diff) > this.params.totalPages)
        return false;
    
    this.params.page = this.params.page + diff;
    return true;
};
