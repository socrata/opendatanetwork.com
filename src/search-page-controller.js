
class SearchPageController {
    constructor(params) {
        this.params = params;
        this.fetching = false;
        this.fetchedAll = false;
        const self = this;

        // Refine menus
        //
        $('.refine-link').mouseenter(function() {

            $(this).addClass('refine-link-selected');
            $(this).children('span').children('i').removeClass('fa-caret-down').addClass('fa-caret-up');
            $(this).children('ul').slideDown(100);
        });

        $('.refine-link').mouseleave(function() {

            $(this).removeClass('refine-link-selected');
            $(this).children('span').children('i').removeClass('fa-caret-up').addClass('fa-caret-down');
            $(this).children('ul').slideUp(100);
        });

        // Categories
        //
        this.attachCategoriesClickHandlers();

        $('#refine-menu-categories-view-more').click(function() {
            d3.promise.json('/categories.json').then(data => {
                const rg = data.map(result => '<li><i class="fa ' + result.metadata.icon + '"></i>' + result.category + '</li>');
                const s = rg.join('');

                $('#refine-menu-categories').html(s);
                self.attachCategoriesClickHandlers();
            }, console.error);
        });

        // Domains
        //
        this.attachDomainsClickHandlers();

        $('#refine-menu-domains-view-more').click(function() {
            d3.promise.json('https://api.us.socrata.com/api/catalog/v1/domains').then(data => {
                const rg = data.results.map(result => '<li>' + result.domain + '</li>');
                const s = rg.join('');

                $('#refine-menu-domains').html(s);
                self.attachDomainsClickHandlers();
            }, console.error);
        });

        // Standards
        //
        this.attachTagsClickHandlers();

        // Tokens
        //
        $('.region-token .fa-times-circle').click(function() {

            self.removeRegion($(this).parent().index());
            self.navigate();
        });

        $('.category-token .fa-times-circle').click(function() {

            self.toggleCategory($(this).parent().text().toLowerCase().trim());
            self.navigate();
        });

        $('.domain-token .fa-times-circle').click(function() {

            self.toggleDomain($(this).parent().text().toLowerCase().trim());
            self.navigate();
        });

        $('.standard-token .fa-times-circle').click(function() {

            self.toggleTag($(this).parent().text().toLowerCase().trim());
            self.navigate();
        });

        // Infinite scroll search results
        //
        $(window).on('scroll', function() {

            const bottomOffsetToBeginRequest = 1000;

            if ($(window).scrollTop() >= $(document).height() - $(window).height() - bottomOffsetToBeginRequest) {
                self.fetchNextPage();
            }

        }).scroll();

        // Add location
        //
        function selectRegion(option) {

            RegionLookup.byID(option.id)
                .then(region => {
                    self.setAutoSuggestedRegion({ id : region.id, name : region.name }, false);
                    self.navigate();
                }, error => { throw error; });
        }

        const sources = regionsWithData(this.params.vector, selectRegion);
        const autosuggest = new Autosuggest('.add-region-results', sources);

        autosuggest.listen('.add-region-input');

        $('.add-region .fa-plus').click(function() {

            $('.add-region input[type="text"]').focus();
        });

        // Chart column
        //
        const regions = this.params.regions;
        const vector = this.params.vector || 'population';

        if (regions.length > 0) {
            if (vector in MAP_SOURCES) {
                const mapSource = MAP_SOURCES[vector];
                MapView.create(mapSource, regions, this.params).then(view => {
                    view.show('#map');
                }, error => console.warn(error));

            } else {
                console.warn(`no map source found for vector: ${vector}`);
            }

            if (vector in SOURCES_BY_VECTOR) {
                const source = SOURCES_BY_VECTOR[vector];
                new Tab(source).render(d3.select('div.charts'), regions);
            } else {
                console.warn(`no source found for vector: ${vector}`);
            }
        }

        $('.map-summary-more').click(() => {
            $('.map-summary-links').slideToggle(100);
            $('.map-summary-more').text($('.map-summary-more').text() == 'More Information' ? 'Less Information' : 'More Information');
        });
    }

    attachCategoriesClickHandlers() {

        const self = this;

        $('#refine-menu-categories li:not(.refine-view-more)').click(function() {

            self.toggleCategory($(this).text().toLowerCase().trim());
            self.navigate();
        });
    }

    attachDomainsClickHandlers() {

        const self = this;

        $('#refine-menu-domains li:not(.refine-view-more)').click(function() {

            const domain = $(this).text().toLowerCase().trim();

            self.toggleDomain(domain);
            self.navigate();
        });
    }

    attachTagsClickHandlers() {

        const self = this;

        $('#refine-menu-tags li').click(function() {

            const tag = $(this).text().toLowerCase().trim();

            self.toggleTag(tag);
            self.navigate();
        });
    }

    fetchNextPage() {
        if (this.fetching || this.fetchedAll) return;
        this.fetching = true;
        this.params.page++;

        const path = this.params.regions.length > 0 ?
            `${window.location.pathname}/search-results` :
            `/search/search-results`;
        const search = window.location.search === '' ? '?' : window.location.search;
        const url = `${path}${search}&page=${this.params.page}`;

        $.ajax(url).done((data, textStatus, jqXHR) => {
            if (jqXHR.status == 204) { // no content
                this.params.page--;
                this.fetchedAll = true;
            } else {
                $('.datasets').append(data);
            }

            this.fetching = false;
        });
    }

    navigate() {
        const params = ['q', 'page', 'categories', 'domains', 'tags']
            .map(name => [name, this.params[name]])
            .filter(([name, value]) => (value && (value.constructor != Array || value.length > 0)));
        window.location.search = `?${$.param(_.object(params), true)}`;
    }

    removeRegion(regionIndex) {

        this.params.regions.splice(regionIndex, 1); // remove at index i
        this.params.page = 0;

        if (this.params.regions.length === 0) // when the last region is removed so should the vector be removed.
            this.params.vector = '';
    }

    setAutoSuggestedRegion(region, resetRegions) {

        this.params.autoSuggestedRegion = region;
        this.params.resetRegions = resetRegions;
        this.params.page = 0;
    }

    toggleCategory(category) {

        const i = this.params.categories.indexOf(category);

        if (i > -1)
            this.params.categories.splice(i, 1); // remove at index i
        else
            this.params.categories.push(category);

        this.params.page = 0;
    }

    toggleDomain(domain) {

        const i = this.params.domains.indexOf(domain);

        if (i > -1)
            this.params.domains.splice(i, 1); // remove at index i
        else
            this.params.domains.push(domain);

        this.params.page = 0;
    }

    toggleTag(tag) {

        // Selecting a standard (tag) resets any other search filter
        //
        const i = this.params.tags.indexOf(tag);

        if (i > -1)
            this.params.tags.splice(i, 1); // remove at index i
        else
            this.params.tags = [tag];

        this.params.page = 0;
        this.params.categories = [];
        this.params.domains = [];
        this.params.q = '';
        this.params.regions = [];
        this.params.vector = '';
    }
}
