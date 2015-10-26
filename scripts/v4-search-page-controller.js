function SearchPageController(params) {

    this.params = params;

    var self = this;

    // Refine
    //
    $('section.refine .fa-times-circle').click(function() { 

        self.removeRegion($(this).parent().index());
        self.navigate();
    });

    // Infinite scroll search results
    //
    $(window).on('scroll', function() {

        var bottomOffsetToBeginRequest = 1000;

        if ($(window).scrollTop() >= $(document).height() - $(window).height() - bottomOffsetToBeginRequest) {
            self.fetchNextPage();
        }

    }).scroll();

    $('.fa-search').click(function() {

        $('.summary').toggle();
        $('.text-entry').toggle();
        $('.text-entry input').select();

        // Toggle the search icon from highlighted to highlight on hover
        //
        var o = $('.fa-search');
        o.hasClass('selected') ? o.removeClass('selected') : o.addClass('selected');
    });
}

// Public methods
//
SearchPageController.prototype.decrementPage = function() {

    this.params.page--;
};

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

        $('.datasets').append(data);
        self.fetching = false;
    });
};

SearchPageController.prototype.getSearchPageUrl = function() {

    var url;

    if ((this.params.regions.length > 0) || (this.params.autoCompletedRegion != null)) {

        url = '/';

        var regionNames = this.params.regions.map(function(region) {
            return region.name.replace(/,/g, '').replace(/ /g, '_');
        });
        
        if (this.params.autoCompletedRegion != null) {
        
        console.log(this.params.autoCompletedRegion);
            regionNames.push(this.params.autoCompletedRegion.replace(/,/g, '').replace(/ /g, '_'));
        }

        url += regionNames.join('_vs_');
    }
    else {

        url = '/v4-search';
    }

    url +=  this.getSearchQueryString();

    return url;
};

SearchPageController.prototype.getSearchResultsUrl = function() {

    var searchResultsUrl = './v4-search-results'; 
    var url = searchResultsUrl + this.getSearchQueryString(); 

    return url;
};

SearchPageController.prototype.getSearchQueryString = function() {

    var url = '?q=' + encodeURIComponent(this.params.q);

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

SearchPageController.prototype.incrementPage = function() {

    this.params.page++;
};

SearchPageController.prototype.navigate = function() {

    window.location.href = this.getSearchPageUrl();
};

SearchPageController.prototype.removeRegion = function(regionIndex) {

    this.params.regions.splice(regionIndex, 1); // remove at index i
    this.params.page = 1;
};

SearchPageController.prototype.setAutoCompletedRegion = function(region) {

    this.params.autoCompletedRegion = region;
    this.params.page = 1;
};
