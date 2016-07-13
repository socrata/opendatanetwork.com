
class SearchPageController {

    constructor(params, searchResultsRegions) {

        this.maxMobileWidth = 800;
        this.params = params;
        this.searchResultsRegions = searchResultsRegions;
        this.fetching = false;
        this.fetchedAll = false;

        const self = this;

        if (params.debug) {
            console.log(_searchURL);
            console.log(_searchURL.replace(/[!'()*]/g, escape));
            console.log(decodeURI(_searchURL.split('?')[1]));
        }

        // API boxes
        //
        this.initApiBoxes([
            '#related-peer-info-box', 
            '#related-sibling-info-box', 
            '#related-child-region-info-box', 
            '#related-child-division-info-box', 
            '#related-child-state-info-box', 
            '#related-child-county-info-box', 
            '#related-child-msa-info-box', 
            '#related-child-place-info-box',
            '#data-availability-info-box',
            '#data-constraint-info-box'
            ]);

        // Questions controls
        //
        new Questions();
        new QuestionsMobile();

        // Refine controls for mobile
        //
        this.refineControlsMobile = new RefineControlsMobile();
        this.searchRefineControlsMobile = new SearchRefineControlsMobile();

        // Search results regions
        //
        if (this.params.regions.length == 0) {
            this.renderSearchResultsRegions();
            $(window).resize(() => { this.renderSearchResultsRegions(); });
        }

        // Refine menus
        //
        $('.refine-link').mouseenter(function() {
            $(this).addClass('refine-link-selected');
            $(this).children('span').children('i').removeClass('fa-caret-down').addClass('fa-caret-up');
            $(this).children('ul').show();
        });

        $('.refine-link').mouseleave(function() {
            $(this).removeClass('refine-link-selected');
            $(this).children('span').children('i').removeClass('fa-caret-up').addClass('fa-caret-down');
            $(this).children('ul').hide();
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

                // Filter out domains without datasets
                //
                const filteredResults = [];
                for (var i in data.results) {
                    var result = data.results[i];
                    if (result.count > 0) filteredResults.push(result);
                }
                data.results = filteredResults;

                const rg = data.results.map(result => '<li>' + result.domain + '</li>');
                const s = rg.join('');

                $('#refine-menu-domains').html(s);
                self.attachDomainsClickHandlers();
            }, console.error);
        });

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

        const sources = regionsWithData(this.params.vector, this.params.regions, option => {
            RegionLookup.byID(option.id).then(region => {
                this.params.regions.push(region);
                this.navigate();
            }, error => { throw error; });
        });

        // Autosuggest
        //
        const autosuggest = new Autosuggest('.add-region-results', sources);
        autosuggest.listen('.add-region-input');

        $('.add-region .fa-plus').click(function() {
            $('.add-region input[type="text"]').focus();
        });

        // Autosuggest mobile
        //
        const autosuggestMobile = new Autosuggest('.add-region-results-mobile', sources);
        autosuggestMobile.listen('.add-region-input-mobile');

        // Menus
        //
        const regions = this.params.regions;
        const vector = this.params.vector || 'population';
        const metric = this.params.metric || 'change';

        if (regions.length > 0) {

            const api = new OdnApi();

            // Get data availability
            //
            api.getDataAvailability(this.params.regions).then(dataAvailability => {

                function getDataset(data, vector) {
                    for (var topicKey in data.topics) {
                        var topic = data.topics[topicKey];
                        if (topic.datasets[vector])
                            return topic.datasets[vector];
                    }
                    return null;
                }

                const dataset = getDataset(dataAvailability, vector);

                if (dataset != null) {

                    console.log('vector: ' + vector);
                    console.log('metric: ' + metric);

                    const selectedVariable = dataset.variables[params.metric] || null;
                    const constraint = dataset.constraints[0]; 

                    // Get constraints for the dataset variable
                    //
                    api.getDataContraint(this.params.regions, selectedVariable, constraint).then(dataConstraints => {

                        const selectedConstraint = (this.params.year.length > 0) ?
                            _.find(dataConstraints.permutations, item => (item.constraint_value == this.params.year)) :
                            dataConstraints.permutations[0];

                        const datasetMenus = new DatasetMenus(
                            dataset.variables, 
                            selectedVariable, 
                            dataConstraints, 
                            selectedConstraint);

                        // Draw the variable and constraint menus
                        //
                        datasetMenus.drawMenus();

                    }, error => console.error(error));

                    // Get chart data for the dataset variables
                    //
                    const variablesArray = _.values(dataset.variables);
                    const chartPromises = variablesArray.map(variable => {
                        return api.getDataValues(this.params.regions, variable);
                    });
                    
                    const allPromise = Promise.all(chartPromises).then(data => {

console.log('variables: ' + JSON.stringify(dataset.variables));
console.log('variablesArray: ' + JSON.stringify(variablesArray));
console.log('data: ' + JSON.stringify(data));

                        // Render charts
                        //
                        const chart = new DatasetVariableChart();
                        const container = d3.select('#google-charts-container');

                        data.forEach((datum, index) => {

                            // Replace the entity ids in the data with the region names
                            //
                            for (var i = 1; i < datum.data[0].length; i++) {
                                var dataItem = datum.data[0][i];
                                this.params.regions.forEach(region => {
                                    if (dataItem == region.id)
                                        datum.data[0][i] = region.name;
                                });
                            }

                            // Build the chart HTML
                            //
                            const variable = variablesArray[index];
                            const containerId = variable.id.replace(/\./g, '-');
                            const chartId = 'chart-' + containerId;

                            const outerDiv = container.append('div')
                                .attr('id', containerId)
                                .attr('class', 'chart');
                        
                            outerDiv.append('h1')
                                .attr('class', 'chart-title')
                                .text(variable.name);

                            outerDiv.append('div')
                                .attr('id', chartId)
                                .attr('class', 'chart-container');

                            // Render the chart
                            //
                            chart.render(variable, datum.data, chartId);
                        })

                    }, error => console.error(error));

                }
            }, error => console.error(error));
        }

        // Chart column
        //
        if (regions.length > 0) {

            if (vector in DATASETS_BY_VECTOR) {
                const source = DATASETS_BY_VECTOR[vector];
                var tab = new Tab(source);

                tab.render(d3.select('div.charts'), regions);

                $(window).resize(() => {
                    tab.clearCharts();
                    tab.redrawCharts();
                });
            } else {
                console.warn(`no source found for vector: ${vector}`);
            }
        }

        $('.map-summary-more').click(() => {
            $('.map-summary-links').toggle();
            $('.map-summary-more').text($('.map-summary-more').text() == 'More Information' ? 'Less Information' : 'More Information');
        });

        // Map should display above charts on the desktop, below charts on mobile.
        //
        $(window).resize(() => this.moveMapNode());
        this.moveMapNode();
    }

    // Api description boxes
    //
    initApiBoxes(boxSelectors) {

        boxSelectors.forEach(boxSelector => {
            this.initApiBox(boxSelector);
        });
    }

    initApiBox(boxSelector) {

        $(boxSelector + '-button').click(() => {
            $(boxSelector).slideToggle();
        });

        $(boxSelector + ' .fa-close').click(() => {
            $(boxSelector).slideUp();
        });
    }

    moveMapNode() {

        if ($(document).width() > this.maxMobileWidth)
            $('#map-container-mobile #map-container').appendTo('#map-container-desktop');
        else
            $('#map-container-desktop #map-container').appendTo('#map-container-mobile');
    }

    renderSearchResultsRegions() {

        const columns = this.getColumns();
        const dataTable = this.getDataTable(this.searchResultsRegions, columns).slice(0, 2);
        const container = d3.select('.search-results-regions');

        container.html('');

        dataTable.forEach(dataRow => {

            var row = container.append('div').attr('class', 'search-results-regions-row');

            dataRow.forEach(region => {

                var cell = row.append('div');
                cell.append('h2')
                    .append('a')
                    .attr('href', this.getRegionUrl(region))
                    .text(region.name);

                if (columns == 3)
                    cell.attr('class', 'search-results-regions-cell w33');
                else if (columns == 2)
                    cell.attr('class', 'search-results-regions-cell w50');
                else
                    cell.attr('class', 'search-results-regions-cell');

                cell.append('div')
                    .attr('class', 'regionType')
                    .text(region.regionType);
            });
        });
    }

    getColumns() {

        const regionCount = this.searchResultsRegions.length;
        const width = $(document).width();
        const widthForThree = 1200;
        const widthForTwo = 800;

        var columns;

        if (regionCount >= 3) {

            if (width >= widthForThree)
                columns = 3;
            else if (width >= widthForTwo)
                columns = 2;
            else
                columns = 1;
        }
        else if (regionCount >= 2) {

            columns = (width >= widthForTwo) ? 2 : 1;
        }
        else {

            columns = 1;
        }

        return columns;
    }

    getRegionUrl(region) {

        const segment = this.regionToUrlSegment(region.name);
        return `/region/${region.id}/${segment}`;
    }

    regionToUrlSegment(name) {
        return name.replace(/ /g, '_').replace(/\//g, '_').replace(/,/g, '');
    }

    getDataTable(source, columns) {

        const table = [];
        var row;

        source.forEach((item, index) => {

            if ((index % columns) == 0) {
                row =[];
                table.push(row);
            }

            row.push(item);
        });

        return table;
    }

    attachCategoriesClickHandlers() {

        const self = this;

        $('#refine-menu-categories li:not(.refine-view-more), .search-refine-menu-list-item-categories-mobile li').click(function() {
            self.toggleCategory($(this).text().toLowerCase().trim());
            self.navigate();
        });
    }

    attachDomainsClickHandlers() {

        const self = this;

        $('#refine-menu-domains li:not(.refine-view-more), .search-refine-menu-list-item-domains-mobile li').click(function() {
            const domain = $(this).text().toLowerCase().trim();
            self.toggleDomain(domain);
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
        window.location.href = Navigate.url(this.params);
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

        const i = this.params.tags.indexOf(tag);

        if (i > -1)
            this.params.tags.splice(i, 1); // remove at index i
        else
            this.params.tags.push(tag);

        this.params.page = 0;
    }

/*
    subMenus() {

        $('.chart-sub-nav li').mouseenter(function() {

            if ($(this).children('ul').length) {

                $(this).addClass('selected');
                $(this).children('span').children('i').removeClass('fa-caret-down').addClass('fa-caret-up');
                $(this).children('ul').show();
            }
        });

        $('.chart-sub-nav li').mouseleave(function() {

            if ($(this).children('ul').length) {

                $(this).removeClass('selected');
                $(this).children('span').children('i').removeClass('fa-caret-up').addClass('fa-caret-down');
                $(this).children('ul').hide();
            }
        });

        this.refineControlsMobile.bindHeaderClickHandlers();
    }
*/
}
