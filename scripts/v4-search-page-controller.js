function SearchPageController(params) {

    this.params = params;
    this.fetching = false;
    this.fetchedAll = false;
    this.mostSimilar = [];

    var self = this;

    // Search bar icon
    //
    $('.fa-search').click(function() {

        $('.summary').toggle();
        $('.text-entry').toggle();
        $('.text-entry input').select();

        // Toggle the search icon from highlighted to highlight on hover
        //
        $('.fa-search').toggleClass('selected-icon');
    });

    // Region tokens
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

    // Add location
    //
    new AutoSuggestRegionController('.add-region input[type="text"]', '.add-region ul', function(region) {

        self.setAutoSuggestedRegion(region);
        self.navigate();
    });

    $('.add-region .fa-plus').click(function() {

        $('.add-region input[type="text"]').focus();
    });

    // Similar regions
    //
    this.drawSimilarRegions(function(region) {

        self.setAutoSuggestedRegion(region);
        self.navigate();
    });
}

// Public methods
//
SearchPageController.prototype.decrementPage = function() {

    this.params.page--;
};

// Cost of living
//
SearchPageController.prototype.drawCostOfLivingData = function() {

    var self = this;

    google.setOnLoadCallback(function() {

        var regionIds = self.params.regions.map(function(region) { return region.id; });
        var controller = new ApiController();

        controller.getCostOfLivingData(regionIds, function(data) { 

            self.drawCostOfLivingChart(regionIds, data);
            self.drawCostOfLivingTable(regionIds, data);
        });
    });
};

SearchPageController.prototype.drawCostOfLivingChart = function(regionIds, data) {

    this.drawCostOfLivingChartForComponent('cost-of-living-all-chart', 'All', regionIds, data);
    this.drawCostOfLivingChartForComponent('cost-of-living-goods-chart', 'Goods', regionIds, data);
    this.drawCostOfLivingChartForComponent('cost-of-living-rents-chart', 'Rents', regionIds, data);
    this.drawCostOfLivingChartForComponent('cost-of-living-other-chart', 'Other', regionIds, data);
}

SearchPageController.prototype.drawCostOfLivingChartForComponent = function(id, component, regionIds, data) {

    var chartData = []

    // Header
    //
    var header = ['Year'];

    for (var i = 0; i < regionIds.length; i++) {
        header[i + 1] = this.params.regions[i].name;
    }

    chartData.push(header);

    // Format the data
    //
    var o = {};

    for (var i = 0; i < data.length; i++) {

        if (data[i].component != component)
            continue;

        if (o[data[i].year] == undefined) {
            o[data[i].year] = [data[i].year];
        }

        o[data[i].year].push(parseFloat(data[i].index));
    }

    for (var key in o) {
        chartData.push(o[key]);
    }

    SearchPageController.prototype.drawLineChart(id, chartData, {

        curveType : 'function',
        legend : { position : 'bottom' },
        pointShape : 'square',
        pointSize : 8,
        title : component,
    });
}

SearchPageController.prototype.drawCostOfLivingTable = function(regionIds, data) {

    // Format the data
    //
    var components = ['All', 'Goods', 'Other', 'Rents'];
    var rows = [];

    for (var i = 0; i < components.length; i++) {

        var component = components[i];
        var row = [component];

        for (var j = 0; j < regionIds.length; j++) {

            var o = this.getLatestCostOfLiving(data, regionIds[j], component);

            row.push({
                index : (o != null) ? parseFloat(o.index) : 'NA',
                percentile : (o != null) ? this.getPercentile(o.rank, o.total_ranks) : 'NA',
            });
        }

        rows.push(row);
    }

    // Header
    //
    var s = '<tr><th></th>';

    for (var i = 0; i < regionIds.length; i++) {
        s += '<th colspan=\'2\'>' + this.params.regions[i].name + '</th>';
    }

    // Sub header
    //
    s += '</tr><tr><td class=\'column-header\'></td>';

    for (var i = 0; i < regionIds.length; i++) {
        s += '<td class=\'column-header\'>Value</td><td class=\'column-header\'>Percentile</td>';
    }

    s += '</tr>';
    
    for (var i = 0; i < rows.length; i++) {

        var row = rows[i];

        s += '<tr>';
        s += '<td>' + row[0] + '</td>';

        for (var j = 1; j < row.length; j++) {

            s += '<td>' + row[j].index + '</td>';
            s += '<td>' + row[j].percentile + '</td>';
        }
        
        s += '</tr>';
    }

    $('#cost-of-living-table').html(s);
};

SearchPageController.prototype.getPercentile = function(rank, totalRanks) {

    var totalRanks = parseInt(totalRanks);
    var rank = parseInt(rank);
    var percentile = parseInt(((totalRanks - rank) / totalRanks) * 100);

    return numeral(percentile).format('0o');
};

SearchPageController.prototype.getLatestCostOfLiving = function(data, regionId, component) {

    var datum = null;

    for (var i = 0; i < data.length; i++) {

        if (data[i].id != regionId)
            continue;

        if (data[i].component != component)
            continue;

        if (datum == null) {

            datum = data[i];
            continue;
        }

        if (parseInt(data[i].year) <= parseInt(datum.year))
            continue;

        datum = data[i];
    }
    
    return datum;
};

// Earnings
//
SearchPageController.prototype.drawEarningsData = function() {

    var self = this;

    google.setOnLoadCallback(function() {

        var regionIds = self.params.regions.map(function(region) { return region.id; });
        var controller = new ApiController();

        controller.getEarningsData(regionIds, function(data) { 

            self.drawEarningsChart(regionIds, data);
            self.drawEarningsTable(regionIds, data);
        });
    });
};

SearchPageController.prototype.drawEarningsChart = function(regionIds, data) {

    var earnings = [];

    // Header
    //
    var header = ['Education Level'];

    for (var i = 0; i < regionIds.length; i++) {
        header[i + 1] = this.params.regions[i].name;
    }

    earnings.push(header);

    // Less than high school
    //
    var someHighSchoolEarnings = ['Some High School'];

    for (var i = 0; i < regionIds.length; i++) {
        someHighSchoolEarnings[i + 1] = parseInt(data[i].median_earnings_less_than_high_school);
    }

    earnings.push(someHighSchoolEarnings);

    // High school
    //
    var highSchoolEarnings = ['High School'];

    for (var i = 0; i < regionIds.length; i++) {
        highSchoolEarnings[i + 1] = parseInt(data[i].median_earnings_high_school);
    }

    earnings.push(highSchoolEarnings);

    // Some college
    //
    var someCollegeEarnings = ['Some College'];

    for (var i = 0; i < regionIds.length; i++) {
        someCollegeEarnings[i + 1] = parseInt(data[i].median_earnings_some_college_or_associates);
    }

    earnings.push(someCollegeEarnings);

    // Bachelor's
    //
    var bachelorsEarnings = ['Bachelor\'s'];

    for (var i = 0; i < regionIds.length; i++) {
        bachelorsEarnings[i + 1] = parseInt(data[i].median_earnings_bachelor_degree);
    }

    earnings.push(bachelorsEarnings);

    // Graduate degree
    //
    var graduateDegreeEarnings = ['Graduate Degree'];

    for (var i = 0; i < regionIds.length; i++) {
        graduateDegreeEarnings[i + 1] = parseInt(data[i].median_earnings_graduate_or_professional_degree);
    }

    earnings.push(graduateDegreeEarnings);

    SearchPageController.prototype.drawSteppedAreaChart('earnings-chart', earnings, {

        areaOpacity : 0,
        connectSteps: true,
        curveType : 'function',
        focusTarget : 'category',
        legend : { position : 'bottom' },
        title : 'Earnings by Education Level',
        vAxis : { format : 'currency' },
    });
};

SearchPageController.prototype.drawEarningsTable = function(regionIds, data) {

    var s = '';

    s += '<tr><th></th>';

    for (var i = 0; i < regionIds.length; i++) {
        s += '<th>' + this.params.regions[i].name + '</th>';
    }

    // Median earnings all
    //
    s += '</tr><tr><td>Median Earnings (All Workers)</td>';

    for (var i = 0; i < regionIds.length; i++) {
        s += '<td>' + numeral(data[i].median_earnings).format('$0,0') + '</td>';
    }

    // Median earnings female
    //
    s += '</tr><tr><td>Median Female Earnings (Full Time)</td>';

    for (var i = 0; i < regionIds.length; i++) {
        s += '<td>' + numeral(data[i].female_full_time_median_earnings).format('$0,0') + '</td>';
    }

    // Median earnings male
    //
    s += '</tr><tr><td>Median Male Earnings (Full Time)</td>';

    for (var i = 0; i < regionIds.length; i++) {
        s += '<td>' + numeral(data[i].male_full_time_median_earnings).format('$0,0') + '</td>';
    }

    s += '</tr>';

    $('#earnings-table').html(s);
};

// Education
//
SearchPageController.prototype.drawEducationData = function() {

    var self = this;

    google.setOnLoadCallback(function() {

        var regionIds = self.params.regions.map(function(region) { return region.id; });
        var controller = new ApiController();

        controller.getEducationData(regionIds, function(data) { 

            self.drawEducationTable(regionIds, data);
        });
    });
};

SearchPageController.prototype.drawEducationTable = function(regionIds, data) {

    var s = '';

    // Header
    //
    s += '<tr><th></th>';

    for (var i = 0; i < regionIds.length; i++) {
        s += '<th colspan=\'2\'>' + this.params.regions[i].name + '</th>';
    }

    // Sub header
    //
    s += '</tr><tr><td class=\'column-header\'></td>';

    for (var i = 0; i < regionIds.length; i++) {
        s += '<td class=\'column-header\'>Percent</td><td class=\'column-header\'>Percentile</td>';
    }

    // At least bachelor's
    //
    s += '</tr><tr><td>At Least Bachelor\'s Degree</td>';

    for (var i = 0; i < regionIds.length; i++) {

        var totalRanks = parseInt(data[i].total_ranks);
        var rank = parseInt(data[i].percent_bachelors_degree_or_higher_rank);
        var percentile = parseInt(((totalRanks - rank) / totalRanks) * 100);
        
        s += '<td>' + data[i].percent_bachelors_degree_or_higher + '%</td>';
        s += '<td>' + numeral(percentile).format('0o') + '</td>';
    }

    // At least high school diploma
    //
    s += '</tr><tr><td>At Least High School Diploma</td>';

    for (var i = 0; i < regionIds.length; i++) {

        var totalRanks = parseInt(data[i].total_ranks);
        var rank = parseInt(data[i].percent_high_school_graduate_or_higher);
        var percentile = parseInt(((totalRanks - rank) / totalRanks) * 100);

        s += '<td>' + data[i].percent_high_school_graduate_or_higher + '%</td>';
        s += '<td>' + numeral(percentile).format('0o') + '</td>';
    }

    s += '</tr>';

    $('#education-table').html(s);
};

// GDP data
//
SearchPageController.prototype.drawGdpData = function() {

    var self = this;

    google.setOnLoadCallback(function() {

        var regionIds = self.params.regions.map(function(region) { return region.id; });
        var controller = new ApiController();

        controller.getGdpData(regionIds, function(data) { 

            self.drawGdpChart(regionIds, data);
            self.drawGdpChangeChart(regionIds, data);
        });
    });
};

SearchPageController.prototype.drawGdpChart = function(regionIds, data) {

    var chartData = [];

    // Header
    //
    var header = ['Year'];

    for (var i = 0; i < regionIds.length; i++) {
        header[i + 1] = this.params.regions[i].name;
    }

    chartData.push(header);

    // Format the data
    //
    var o = {};

    for (var i = 0; i < data.length; i++) {

        if (o[data[i].year] == undefined) {
            o[data[i].year] = [data[i].year];
        }

        o[data[i].year].push(parseFloat(data[i].per_capita_gdp));
    }

    for (var key in o) {
        chartData.push(o[key]);
    }

    // Draw chart
    //
    SearchPageController.prototype.drawLineChart('per-capita-gdp-chart', chartData, {

        curveType : 'function',
        legend : { position : 'bottom' },
        pointShape : 'square',
        pointSize : 8,
        title : 'Per Capita Real GDP over Time',
    });
};

SearchPageController.prototype.drawGdpChangeChart = function(regionIds, data) {

    var chartData = [];

    // Header
    //
    var header = ['Year'];

    for (var i = 0; i < regionIds.length; i++) {
        header[i + 1] = this.params.regions[i].name;
    }

    chartData.push(header);

    // Format the data
    //
    var o = {};

    for (var i = 0; i < data.length; i++) {

        if (o[data[i].year] == undefined) {
            o[data[i].year] = [data[i].year];
        }

        o[data[i].year].push(parseFloat(data[i].per_capita_gdp_percent_change) / 100);
    }

    for (var key in o) {
        chartData.push(o[key]);
    }

    // Draw chart
    //
    SearchPageController.prototype.drawLineChart('per-capita-gdp-change-chart', chartData, {

        curveType : 'function',
        legend : { position : 'bottom' },
        pointShape : 'square',
        pointSize : 8,
        title : 'Annual Change in Per Capita GDP over Time',
        vAxis : { format : '#.#%' },
    });
};

// Occupations
//
SearchPageController.prototype.drawOccupationsData = function() {

    var self = this;

    google.setOnLoadCallback(function() {

        var regionIds = self.params.regions.map(function(region) { return region.id; });
        var controller = new ApiController();

        controller.getOccupationsData(regionIds, function(data) { 

            self.drawOccupationsTable(regionIds, data);
        });
    });
};

SearchPageController.prototype.drawOccupationsTable = function(regionIds, data) {

    var s = '<tr><th></th>';

    for (var i = 0; i < regionIds.length; i++) {
        s += '<th colspan=\'2\'>' + this.params.regions[i].name + '</th>';
    }

    // Sub header
    //
    s += '</tr><tr><td class=\'column-header\'></td>';

    for (var i = 0; i < regionIds.length; i++) {
        s += '<td class=\'column-header\'>Percent</td><td class=\'column-header\'>Percentile</td>';
    }

    for (var i = 0; i < data.length; i++) {

        if ((i % regionIds.length) == 0)
            s += '</tr><tr><td>' + data[i].occupation + '</td>'; 

        var totalRanks = parseInt(data[i].total_ranks);
        var rank = parseInt(data[i].percent_employed_rank);
        var percentile = parseInt(((totalRanks - rank) / totalRanks) * 100);

        s += '<td>' + numeral(data[i].percent_employed).format('0.0') + '%</td>';
        s += '<td>' + numeral(percentile).format('0o') + '</td>';
    }

    s += '</tr>';

    $('#occupations-table').html(s);
};


// Population
//
SearchPageController.prototype.drawPopulationData = function() {

    var self = this;

    google.setOnLoadCallback(function() {

        var regionIds = self.params.regions.map(function(region) { return region.id; });
        var controller = new ApiController();

        controller.getPopulationData(regionIds, function(data) { 

            self.drawPopulationChart(regionIds, data);
            self.drawPopulationChangeChart(regionIds, data);
        });
    });
}

SearchPageController.prototype.drawPopulationChart = function(regionIds, data) {

    var chartData = [];
    var year;

    // Header
    //
    var header = ['Year'];

    for (var i = 0; i < regionIds.length; i++) {
        header[i + 1] = this.params.regions[i].name;
    }

    chartData.push(header);

    // Data
    //
    for (var i = 0; i < data.length; i++) {

        var m = (i % regionIds.length);

        if (m == 0) {

            year = [];
            year[0] = data[i].year;
            chartData.push(year);
        }

        year[m + 1] = parseInt(data[i].population);
    }

    SearchPageController.prototype.drawLineChart('population-chart', chartData, {

        curveType : 'function',
        legend : { position : 'bottom' },
        pointShape : 'square',
        pointSize : 8,
        title : 'Population',
    });
};

SearchPageController.prototype.drawPopulationChangeChart = function(regionIds, data) {

    var chartData = [];
    var year;

    // Header
    //
    var header = ['Year'];

    for (var i = 0; i < regionIds.length; i++) {
        header[i + 1] = this.params.regions[i].name;
    }

    chartData.push(header);

    // Data
    //
    for (var i = 0; i < data.length; i++) {

        var m = (i % regionIds.length);

        if (m == 0) {

            year = [];
            year[0] = data[i].year;
            chartData.push(year);
        }

        year[m + 1] = parseFloat(data[i].population_percent_change) / 100;
    }

    SearchPageController.prototype.drawLineChart('population-change-chart', chartData, {

        curveType : 'function',
        legend : { position : 'bottom' },
        pointShape : 'square',
        pointSize : 8,
        title : 'Population Change',
        vAxis : { format : '#.#%' },
    });
};

// Similar regions
//
SearchPageController.prototype.drawSimilarRegions = function(onClickRegion) {

    if (this.params.length == 0) 
        return;

    var region = null;

    for (var i = 0; i < this.params.regions.length; i++) {

        if (this.params.regions[i].type != 'msa') {

            region = this.params.regions[i];
            break;
        }
    }

    if (region == null)
        return;

    var controller = new ApiController();
    var self = this;

    controller.getSimilarRegions(region.id, function(data) { 

        self.drawSimilarRegionsList(data, onClickRegion);
    });
};

SearchPageController.prototype.drawSimilarRegionsList = function(data, onClickRegion) {
    
    var s = '';
    
    if (data.most_similar == undefined)
        return;

    this.mostSimilar = data.most_similar;

    for (var i = 0; i < this.mostSimilar.length; i++) {

        s += '<li><span><i class="fa"></i></span>' + this.mostSimilar[i].name + '</li>'
    }

    $('.similar-regions').html(s);
    $('.similar-regions').slideToggle(100);

    var self = this;

    $('.similar-regions li span').click(function() {

        $(this).children(":first").addClass('fa-check');

        var index = $(this).parent().index();

        onClickRegion(self.mostSimilar[index].name);
    });
};

// Draw charts
//
SearchPageController.prototype.drawLineChart = function(chartId, data, options) {

    var dataTable = google.visualization.arrayToDataTable(data);
    var chart = new google.visualization.LineChart(document.getElementById(chartId));

    chart.draw(dataTable, options);
};

SearchPageController.prototype.drawSteppedAreaChart = function(chartId, data, options) {

    var dataTable = google.visualization.arrayToDataTable(data);
    var chart = new google.visualization.SteppedAreaChart(document.getElementById(chartId));

    chart.draw(dataTable, options);
};

// Paging
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

        $('.datasets').append(data);
        self.fetching = false;
    });
};

SearchPageController.prototype.getSearchPageUrl = function() {

    var url;

    if ((this.params.regions.length > 0) || (this.params.autoSuggestedRegion != null)) {

        url = '/';

        var regionNames = this.params.regions.map(function(region) {
            return region.name.replace(/,/g, '').replace(/ /g, '_');
        });

        if (this.params.autoSuggestedRegion != null) {
            regionNames.push(this.params.autoSuggestedRegion.replace(/,/g, '').replace(/ /g, '_'));
        }

        url += regionNames.join('_vs_');

        if (this.params.vector)
            url += '/' + this.params.vector;
    }
    else {

        url = '/search';
    }

    url += this.getSearchQueryString();

    return url;
};

SearchPageController.prototype.getSearchResultsUrl = function() {

    var searchResultsUrl = this.params.regions.length == 0 ? '/search-results' : './search-results'; 
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

SearchPageController.prototype.setAutoSuggestedRegion = function(region) {

    this.params.autoSuggestedRegion = region;
    this.params.page = 1;
};
