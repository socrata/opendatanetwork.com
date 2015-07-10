$(document).ready(function() {

    // SearchPageController
    //
    new SearchPageController(_params);
});

// SearchPageController
//
function SearchPageController(params) {

    var self = this;
    this.params = params;

    $('.filter-pane-categories li a').click(function() { 

        self.toggleCategory($(this).text());
        self.navigate();
    });

    $('.filter-pane-domains li a').click(function() { 

        self.toggleDomain($(this).text());
        self.navigate();
    });

    $('.filter-pane-tags li a').click(function() { 

        self.toggleTag($(this).text());
        self.navigate();
    });
}

// Public methods
//
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

    if (this.params.tags.length > 0)
        url += '&tags=' + encodeURIComponent(this.params.tags.join(','));

    console.log(url);

    return url;
};

SearchPageController.prototype.navigate = function() {

    window.location.href = this.getSearchUrl();
};

SearchPageController.prototype.toggleCategory = function(category) {

    category = category.toLowerCase();
    var i = this.params.categories.indexOf(category);

    if (i > -1)
        this.params.categories.splice(i, 1); // remove at index i
    else 
        this.params.categories.push(category);

    this.params.page = 1;
};

SearchPageController.prototype.toggleDomain = function(domain) {

    var i = this.params.domains.indexOf(domain);

    if (i > -1)
        this.params.domains.splice(i, 1); // remove at index i
    else 
        this.params.domains.push(domain);

    this.params.page = 1;
};

SearchPageController.prototype.toggleTag = function(tag) {

    var i = this.params.tags.indexOf(tag);

    if (i > -1)
        this.params.tags.splice(i, 1); // remove at index i
    else 
        this.params.tags.push(tag);

    this.params.page = 1;
};
