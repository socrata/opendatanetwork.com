$(document).ready(function() {

    // SearchPageController
    //
    new SearchPageController(_params);
});

// SearchPageController
//
function SearchPageController(params) {

    this.params = params;
    this.fetching = false;
    this.fetchedAll = false;

    var self = this;

    // Results bar applied filters
    //
    $('.applied-filter-category').click(function() {

        self.toggleCategory($(this).text());
        self.navigate();
    });

    $('.applied-filter-domain').click(function() {

        self.toggleDomain($(this).text());
        self.navigate();
    });

    $('.applied-filter-tag').click(function() {
       
        self.toggleTag($(this).text());
        self.navigate();
    });

    // Filter bar applied filters
    //
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
    
    // View more anchors
    //
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

    // Selected category (yellow box)
    //
    $('.fa-close').click(function() {

        $('.current-category').fadeOut();
        setCookie('current-category-hidden', '1');
    });

    // Infinite scroll search results
    //
    $(window).on('scroll', function() {

        var bottomOffsetToBeginRequest = 1000;

        if ($(window).scrollTop() >= $(document).height() - $(window).height() - bottomOffsetToBeginRequest) {
            self.fetchNextPage();
        }

    }).scroll();
}

// Public methods
//
SearchPageController.prototype.fetchNextPage = function() {

    if (this.fetching || this.fetchedAll)
        return;

    this.fetching = true;
    this.incrementPage();

    var self = this;

    $.ajax(this.getSearchResultsUrl()).done(function(data, textStatus, jqXHR) {

        console.log(jqXHR.status + ' ' + textStatus);

        if (jqXHR.status == 204) { // no content

            self.decrementPage();
            self.fetching = false;
            self.fetchedAll = true;
            return;
        }

        $('.search-results-pane ul').append(data);
        self.fetching = false;
    });
};

SearchPageController.prototype.decrementPage = function() {

    this.params.page--;
};

SearchPageController.prototype.incrementPage = function() {

    this.params.page++;
};

SearchPageController.prototype.getSearchResultsUrl = function() {

    var searchResultsUrl = './search-results'; 
    var url = searchResultsUrl + this.getSearchQueryString(); 

    console.log(url);

    return url;
};

SearchPageController.prototype.getSearchUrl = function() {

    var searchUrl = './search';
    var url = searchUrl + this.getSearchQueryString();

    console.log(url);

    return url;
};

SearchPageController.prototype.getSearchQueryString = function() {

    var url = '?q=' + encodeURIComponent($('#q').val());

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

    domain = domain.toLowerCase().trim();
    var i = this.params.domains.indexOf(domain);

    if (i > -1)
        this.params.domains.splice(i, 1); // remove at index i
    else 
        this.params.domains.push(domain);

    this.params.page = 1;
};

SearchPageController.prototype.toggleTag = function(tag) {

    tag = tag.toLowerCase().trim();
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

// Private functions
//
function setCookie(key, value) {

    var expires = new Date();
    expires.setTime(expires.getTime() + (365 * 24 * 60 * 60 * 1000)); // one year
    document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
}

function getCookie(key) {

    var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
}
