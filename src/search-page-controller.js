
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

            const controller = new ApiController();

            controller.getCategories()
                .then(data => {

                    const rg = data.results.map(result => '<li><i class="fa ' + result.metadata.icon + '"></i>' + result.category + '</li>');
                    const s = rg.join('');

                    $('#refine-menu-categories').html(s);
                    self.attachCategoriesClickHandlers();
                })
                .catch(error => console.error(error));
        });

        // Domains
        //
        this.attachDomainsClickHandlers();

        $('#refine-menu-domains-view-more').click(function() {

            const controller = new ApiController();

            controller.getDomains()
                .then(data => {

                    const rg = data.results.map(result => '<li>' + result.domain + '</li>');
                    const s = rg.join('');

                    $('#refine-menu-domains').html(s);
                    self.attachDomainsClickHandlers();
                })
                .catch(error => console.error(error));
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
        if (this.params.regions.length > 0) {

            switch (this.params.vector) {

                case 'cost_of_living': this.drawCostOfLivingData(); break;
                case 'earnings': this.drawEarningsData(); break;
                case 'education': this.drawEducationData(); break;
                case 'gdp': this.drawGdpData(); break;
                case 'health': this.drawHealthData(); break;
                case 'occupations': this.drawOccupationsData(); break;
                case 'population': this.drawPopulationData(); break;
                default: this.drawPopulationData(); break;
            }
        }

        // Map summary
        //
        $('.map-summary-more').click(() => {

            $('.map-summary-links').slideToggle(100);
            $('.map-summary-more').text($('.map-summary-more').text() == 'More Information' ? 'Less Information' : 'More Information');
        })
    }

    // Public methods
    //
    drawMap(source, onDisplay) {

        const selector = '#map';
        const regions = this.params.regions;

        _.extend(source, { selectedIndices : this.mapVariables });

        MapView.create(source, regions, onDisplay)
            .then(view => view.show(selector), error => console.warn(error));
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

    // Cost of living
    //
    drawCostOfLivingData() {
        this.drawMap(MapSources.rpp, (variable, year) => this.onDrawCostOfLivingMap(variable, year));
        new Tab(costOfLiving).render(d3.select('div.charts'), this.params.regions);
    }

    onDrawCostOfLivingMap(variable, year) {

        this.updateAddressBarUrl(variable.metric, year);

        $('.map-summary').text(
            MapSummary.getCostOfLivingSummaryString(
                this.params.regions,
                this.tableData,
                variable,
                year,
                value => (year == value.year)));

        this.drawMapSummaryLinks(MapSources.rpp, variable,year);
    }

    // Earnings
    //
    drawEarningsData() {
        this.drawMap(MapSources.earnings, (variable, year) => this.onDrawEarningsMap(variable, year));
        new Tab(earnings).render(d3.select('div.charts'), this.params.regions);
    }

    onDrawEarningsMap(variable, year) {

        this.updateAddressBarUrl(variable.metric, year);

        $('.map-summary').text(
            MapSummary.getSummaryString(
                this.params.regions,
                this.tableData,
                variable,
                year,
                value => (year == value.year)));

        this.drawMapSummaryLinks(MapSources.earnings, variable, year);
    }

    // Health
    //
    drawHealthData() {
        this.drawMap(MapSources.health, (variable, year) => this.onDrawHealthMap(variable, year));
    }

    onDrawHealthMap(variable, year) {
        this.updateAddressBarUrl(variable.metric, year);

        $('.map-summary').text(
            MapSummary.getSummaryString(
                this.params.regions,
                this.tableData,
                variable,
                year,
                value => (year == value.year)));

        this.drawMapSummaryLinks(MapSources.health, variable, year);
    }

    // Education
    //
    drawEducationData() {

        this.drawMap(MapSources.education, (variable, year) => this.onDrawEducationMap(variable, year));
        const tab = new Tab(education).render(d3.select('div.charts'), this.params.regions);
    }

    onDrawEducationMap(variable, year) {

        this.updateAddressBarUrl(variable.metric, year);

        $('.map-summary').text(
            MapSummary.getSummaryString(
                this.params.regions,
                this.tableData,
                variable,
                year,
                value => (year == value.year)));

        this.drawMapSummaryLinks(MapSources.education, variable, year);
    }

    // GDP data
    //
    drawGdpData() {
        this.drawMap(MapSources.gdp, (variable, year) => this.onDrawGdpMap(variable, year));
        new Tab(gdp).render(d3.select('div.charts'), this.params.regions);

    }

    onDrawGdpMap(variable, year) {

        this.updateAddressBarUrl(variable.metric, year);

        $('.map-summary').text(
            MapSummary.getSummaryString(
                this.params.regions,
                this.tableData,
                variable,
                year,
                value => (year == value.year)));

        this.drawMapSummaryLinks(MapSources.gdp, variable, year);
    }

    // Occupations
    //
    drawOccupationsData() {
        this.drawMap(MapSources.occupations, (variable, year) => this.onDrawOccupationsMap(variable, year));
        new Tab(occupations).render(d3.select('div.charts'), this.params.regions);
    }

    onDrawOccupationsMap(variable, year) {

        this.updateAddressBarUrl(variable.metric, year);

        $('.map-summary').text(
            MapSummary.getOccupationsSummaryString(
                this.params.regions,
                this.tableData,
                variable,
                year,
                value => (year == value.year) && (variable.name == value.occupation)));

        this.drawMapSummaryLinks(MapSources.occupations, variable, year);
    }

    // Population
    //
    drawPopulationData() {
        this.drawMap(MapSources.population, (variable, year) => this.onDrawPopulationMap(variable, year));
        new Tab(demographics).render(d3.select('div.charts'), this.params.regions);
    }

    onDrawPopulationMap(variable, year) {

        this.updateAddressBarUrl(variable.metric, year);

        $('.map-summary').text(
            MapSummary.getSummaryString(
                this.params.regions,
                this.tableData,
                variable,
                year,
                value => (year == value.year)));

        this.drawMapSummaryLinks(MapSources.population, variable, year);
    }

    ensureVisibleWithOrientation(selector, orientation) {

        var o = $(selector);

        if (!o.is(':visible'))
            o.show();

        return o.hasClass(orientation);
    }

    // Draw charts
    //
    drawLineChart(chartId, dataTable, options) {
        const chart = new google.visualization.LineChart(document.getElementById(chartId));

        this.applyStandardOptions(options);

        console.log(options);

        chart.draw(dataTable, options);
    }

    drawSteppedAreaChart(chartId, dataTable, options) {

        const chart = new google.visualization.SteppedAreaChart(document.getElementById(chartId));
        this.applyStandardOptions(options);
        chart.draw(dataTable, options);
    }

    applyStandardOptions(options) {

        options.series = {
            0: { color: '#2980b9' },
            1: { color: '#ee3b3b' },
            2: { color: '#3bdbee' },
            3: { color: '#ff9900' },
            4: { color: '#109618' },
            5: { color: '#0099c6' },
            6: { color: '#dd4477' },
            7: { color: '#66aa00' },
            8: { color: '#b82e2e' },
            9: { color: '#316395' },
        };

        options.legend = {
            position: 'top',
            maxLines: 4,
            textStyle: {
                color: '#222',
                fontSize: 14
            }
        };
    }

    drawMarkersForPlaces(map, places) {

        places.forEach(place => {

            const feature = {
                "type": "Feature",
                "properties": {
                    "name": place.name
                },
                "geometry": {
                    "coordinates": place.location.coordinates,
                    "type": "Point",
                }
            };

            L.geoJson(feature).addTo(map);
        });
    }

    getPlacesForRegion(data) {

        const places = [];

        data.forEach(place => {

            this.params.regions.forEach(region => {

                if (place.id == region.id)
                    places.push(place);
            })
        });

        return places;
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

                const parts = regionNames.map(regionName => regionName.replace(/ /g, '_').replace(/\//g, '_').replace(/,/g, ''))
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

            if (this.params.resetRegions == false) {

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

        if (this.params.regions.length == 0) // when the last region is removed so should the vector be removed.
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

        const url = this.getSearchPageUrl(false, metric, year)
        history.replaceState(null, null, url);
    }
}
