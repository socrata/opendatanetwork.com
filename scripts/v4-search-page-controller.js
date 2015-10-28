function SearchPageController(params) {

    this.params = params;
    this.fetching = false;
    this.fetchedAll = false;

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
        s += '<th>' + this.params.regions[i].name + '</th>';
    }

    // At least bachelor's
    //
    s += '</tr><tr><td>At Least Bachelor\'s Degree</td>';

    for (var i = 0; i < regionIds.length; i++) {
        s += '<td>' + data[i].percent_bachelors_degree_or_higher + '%</td>';
        
        
        // START RIGHT HERE: calculate and display the rank (95th percentile or whatever)
        
        
    }

    // At least high school diploma
    //
    s += '</tr><tr><td>At Least High School Diploma</td>';

    for (var i = 0; i < regionIds.length; i++) {
        s += '<td>' + data[i].percent_high_school_graduate_or_higher + '%</td>';
    }

    s += '</tr>';

    $('#education-table').html(s);
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

    var years = [];
    var year;

    // Header
    //
    var header = ['Year'];

    for (var i = 0; i < regionIds.length; i++) {
        header[i + 1] = this.params.regions[i].name;
    }

    years.push(header);

    // Data
    //
    for (var i = 0; i < data.length; i++) {

        var m = (i % regionIds.length);

        if (m == 0) {

            year = [];
            year[0] = data[i].year;
            years.push(year);
        }

        year[m + 1] = parseInt(data[i].population);
    }

    SearchPageController.prototype.drawLineChart('population-chart', years, {

        curveType : 'function',
        legend : { position : 'bottom' },
        pointShape : 'square',
        pointSize : 8,
        title : 'Population',
    });
};

SearchPageController.prototype.drawPopulationChangeChart = function(regionIds, data) {

    var years = [];
    var year;

    // Header
    //
    var header = ['Year'];

    for (var i = 0; i < regionIds.length; i++) {
        header[i + 1] = this.params.regions[i].name;
    }

    years.push(header);

    // Data
    //
    for (var i = 0; i < data.length; i++) {

        var m = (i % regionIds.length);

        if (m == 0) {

            year = [];
            year[0] = data[i].year;
            years.push(year);
        }

        year[m + 1] = parseFloat(data[i].population_percent_change) / 100;
    }

    SearchPageController.prototype.drawLineChart('population-change-chart', years, {

        curveType : 'function',
        legend : { position : 'bottom' },
        pointShape : 'square',
        pointSize : 8,
        title : 'Population Change',
        vAxis : { format : 'percent' },
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
