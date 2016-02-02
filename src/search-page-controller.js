
class SearchPageController {

    constructor(params, tableData, mapVariables) {

        this.params = params;
        this.tableData = tableData;
        this.mapVariables = mapVariables;
        this.fetching = false;
        this.fetchedAll = false;
        this.mostSimilar = [];

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
                const rg = data.results.map(result => '<li><i class="fa ' + result.metadata.icon + '"></i>' + result.category + '</li>');
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
                mapSource.selectedIndices = this.mapVariables;

                const onDisplay = (variable, year) => {
                    this.updateAddressBarUrl(variable.metric, year);

                    const summary = MapSummary.getSummaryString(regions, this.tableData, variable, year, value => (year == value.year));
                    $('.map-summary').text(summary);

                    this.drawMapSummaryLinks(mapSource, variable, year);
                };

                MapView.create(mapSource, regions, onDisplay)
                    .then(view => view.show('#map'), error => console.warn(error));
            } else {
                console.warn(`no map source found for vector: ${vector}`);
            }

            if (vector in SOURCES) {
                const source = SOURCES[vector];
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

    drawMapSummaryLinks(source, variable, year) {

        const variables = _.filter(source.variables, item => item.name != variable.name);
        const list = $('.map-summary-links').empty();

        $.each(variables, i => {

            const item = variables[i];
            const li = $('<li/>').appendTo(list);

            $('<a/>')
                .attr('href', this.getSearchPageUrl(false, item.metric, year))
                .text(item.name)
                .appendTo(li);
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

    decrementPage() {
        this.params.page--;
    }

    // Paging
    //
    fetchNextPage() {

        if (this.fetching || this.fetchedAll)
            return;

        this.fetching = true;
        this.incrementPage();

        const self = this;

        $.ajax(this.getSearchResultsUrl()).done(function(data, textStatus, jqXHR) {

            if (jqXHR.status == 204) { // no content

                self.decrementPage();
                self.fetching = false;
                self.fetchedAll = true;
                return;
            }

            $('.datasets').append(data);
            self.fetching = false;
        });
    }

    getSearchPageForRegionVectorMetricYearUrl(regionIds, regionNames, vector, metric, year, isSearchResults, queryString) {

        var url = '';

        if (regionIds && (regionIds.length > 0)) {

            url += '/region/' + regionIds.join('-');

            if (regionNames && (regionNames.length > 0)) {

                const parts = regionNames.map(regionName => regionName.replace(/ /g, '_').replace(/\//g, '_').replace(/,/g, ''));
                url += '/' + parts.join('-');
            }
            else
                url += '/-';
        }
        else {

            url += '/search';
        }

        if (isSearchResults) {

            url += '/search-results';
        }
        else {

            if (vector) url += '/' + vector;
            if (metric) url += '/' + metric;
            if (year) url += '/' + year;
        }

        if (queryString)
            url += queryString;

        return url;
    }

    getSearchPageUrl(isSearchResults, metric, year) {

        if ((this.params.regions.length > 0) || this.params.autoSuggestedRegion) {

            var regionIds = [];
            var regionNames = [];

            if (this.params.resetRegions === false) {

                regionIds = this.params.regions.map(region => region.id);
                regionNames = this.params.regions.map(region => region.name);
            }

            if (this.params.autoSuggestedRegion) {

                regionIds.push(this.params.autoSuggestedRegion.id);
                regionNames.push(this.params.autoSuggestedRegion.name);
            }

            return this.getSearchPageForRegionVectorMetricYearUrl(
                regionIds,
                regionNames,
                this.params.vector || 'population',
                metric,
                year,
                isSearchResults,
                this.getSearchQueryString(isSearchResults));
        }
        else {

            return this.getSearchPageForRegionVectorMetricYearUrl(
                null,
                null,
                this.params.vector || 'population',
                metric,
                year,
                isSearchResults,
                this.getSearchQueryString(isSearchResults));
        }
    }

    getSearchResultsUrl() {

        return this.getSearchPageUrl(true);
    }

    getSearchQueryString(isSearchResults) {

        const parts = [];

        if (this.params.q.length > 0)
            parts.push('q=' + encodeURIComponent(this.params.q));

        if ((this.params.page > 1) && isSearchResults)
            parts.push('page=' + this.params.page);

        if (this.params.categories.length > 0)
            this.params.categories.forEach(category => parts.push('categories=' + encodeURIComponent(category)));

        if (this.params.domains.length > 0)
            this.params.domains.forEach(domain => parts.push('domains=' + encodeURIComponent(domain)));

        if (this.params.tags.length > 0)
            this.params.tags.forEach(tag => parts.push('tags=' + encodeURIComponent(tag)));

        return (parts.length > 0) ? '?' + parts.join('&') : '';
    }

    incrementPage() {

        this.params.page++;
    }

    navigate() {

        window.location.href = this.getSearchPageUrl();
    }

    removeRegion(regionIndex) {

        this.params.regions.splice(regionIndex, 1); // remove at index i
        this.params.page = 1;

        if (this.params.regions.length === 0) // when the last region is removed so should the vector be removed.
            this.params.vector = '';
    }

    setAutoSuggestedRegion(region, resetRegions) {

        this.params.autoSuggestedRegion = region;
        this.params.resetRegions = resetRegions;
        this.params.page = 1;
    }

    toggleCategory(category) {

        const i = this.params.categories.indexOf(category);

        if (i > -1)
            this.params.categories.splice(i, 1); // remove at index i
        else
            this.params.categories.push(category);

        this.params.page = 1;
    }

    toggleDomain(domain) {

        const i = this.params.domains.indexOf(domain);

        if (i > -1)
            this.params.domains.splice(i, 1); // remove at index i
        else
            this.params.domains.push(domain);

        this.params.page = 1;
    }

    toggleTag(tag) {

        // Selecting a standard (tag) resets any other search filter
        //
        const i = this.params.tags.indexOf(tag);

        if (i > -1)
            this.params.tags.splice(i, 1); // remove at index i
        else
            this.params.tags = [tag];

        this.params.page = 1;
        this.params.categories = [];
        this.params.domains = [];
        this.params.q = '';
        this.params.regions = [];
        this.params.vector = '';
    }

    updateAddressBarUrl(metric, year) {

        const url = this.getSearchPageUrl(false, metric, year);
        history.replaceState(null, null, url);
    }
}
