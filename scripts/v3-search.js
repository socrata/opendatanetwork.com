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
    
    $('.applied-category').click(function() {
       
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
    
    $('.view-more-categories').click(function() {
       
       self.toggleCategoryFilters();
       self.navigate();
    });

    $('.view-more-domains').click(function() {
       
       self.toggleDomainFilters();
       self.navigate();
    });
    
    $('.view-more-tags').click(function() {
       
       self.toggleTagFilters();
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

    if (this.params.ec)
        url += '&ec=1';

    if (this.params.ed)
        url += '&ed=1';

    if (this.params.et)
        url += '&et=1';

    console.log(url);

    return url;
};

SearchPageController.prototype.navigate = function() {

    window.location.href = this.getSearchUrl();
};

SearchPageController.prototype.toggleCategory = function(category) {

    category = category.toLowerCase().trim();
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

SearchPageController.prototype.toggleCategoryFilters = function() {

    this.params.ec = !this.params.ec;
};

SearchPageController.prototype.toggleDomainFilters = function() {

    this.params.ed = !this.params.ed;
};

SearchPageController.prototype.toggleTagFilters = function() {

    this.params.et = !this.params.et;
};
