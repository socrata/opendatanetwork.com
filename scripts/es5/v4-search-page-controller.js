'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SearchPageController = (function () {
    function SearchPageController(params) {
        _classCallCheck(this, SearchPageController);

        this.MAP_INITIAL_CENTER = [37.1669, -95.9669];
        this.MAP_INITIAL_ZOOM = 4.0;

        this.params = params;
        this.fetching = false;
        this.fetchedAll = false;
        this.mostSimilar = [];

        var self = this;

        // Refine menus
        //
        $('.refine-link').mouseenter(function () {

            $(this).addClass('refine-link-selected');
            $(this).children('span').children('i').removeClass('fa-caret-down').addClass('fa-caret-up');
            $(this).children('ul').slideDown(100);
        });

        $('.refine-link').mouseleave(function () {

            $(this).removeClass('refine-link-selected');
            $(this).children('span').children('i').removeClass('fa-caret-up').addClass('fa-caret-down');
            $(this).children('ul').slideUp(100);
        });

        // Categories
        //
        this.attachCategoriesClickHandlers();

        $('#refine-menu-categories-view-more').click(function () {

            var controller = new ApiController();
            controller.getCategories(function (data) {

                var s = data.results.map(function (result) {
                    return '<li><i class="fa ' + result.metadata.icon + '"></i>' + result.category + '</li>';
                });

                $('#refine-menu-categories').html(s);
                self.attachCategoriesClickHandlers();
            });
        });

        // Domains
        //
        this.attachDomainsClickHandlers();

        $('#refine-menu-domains-view-more').click(function () {

            var controller = new ApiController();
            controller.getDomains(function (data) {

                var s = data.results.map(function (result) {
                    return '<li>' + result.domain + '</li>';
                });

                $('#refine-menu-domains').html(s);
                self.attachDomainsClickHandlers();
            });
        });

        // Standards
        //
        this.attachStandardsClickHandlers();

        // Tokens
        //
        $('.region-token .fa-times-circle').click(function () {

            self.removeRegion($(this).parent().index());
            self.navigate();
        });

        $('.category-token .fa-times-circle').click(function () {

            self.toggleCategory($(this).parent().text().toLowerCase().trim());
            self.navigate();
        });

        $('.domain-token .fa-times-circle').click(function () {

            self.toggleDomain($(this).parent().text().toLowerCase().trim());
            self.navigate();
        });

        $('.standard-token .fa-times-circle').click(function () {

            self.toggleStandard($(this).parent().text().toLowerCase().trim());
            self.navigate();
        });

        // Infinite scroll search results
        //
        $(window).on('scroll', function () {

            var bottomOffsetToBeginRequest = 1000;

            if ($(window).scrollTop() >= $(document).height() - $(window).height() - bottomOffsetToBeginRequest) {
                self.fetchNextPage();
            }
        }).scroll();

        // Add location
        //
        new AutoSuggestRegionController('.add-region input[type="text"]', '.add-region ul', function (region) {

            self.setAutoSuggestedRegion(region, false);
            self.navigate();
        });

        $('.add-region .fa-plus').click(function () {

            $('.add-region input[type="text"]').focus();
        });

        // Similar regions
        //
        this.drawSimilarRegions(function (region) {

            self.setAutoSuggestedRegion(region, false);
            self.navigate();
        });

        // Places in region
        //
        this.drawPlacesInRegion(function (region) {

            self.setAutoSuggestedRegion(region, false);
            self.navigate();
        });
    }

    // Public methods
    //

    _createClass(SearchPageController, [{
        key: 'attachCategoriesClickHandlers',
        value: function attachCategoriesClickHandlers() {

            var self = this;

            $('#refine-menu-categories li:not(.refine-view-more)').click(function () {

                self.toggleCategory($(this).text().toLowerCase().trim());
                self.navigate();
            });
        }
    }, {
        key: 'attachDomainsClickHandlers',
        value: function attachDomainsClickHandlers() {

            var self = this;

            $('#refine-menu-domains li:not(.refine-view-more)').click(function () {

                var domain = $(this).text().toLowerCase().trim();

                self.toggleDomain(domain);
                self.navigate();
            });
        }
    }, {
        key: 'attachStandardsClickHandlers',
        value: function attachStandardsClickHandlers() {

            var self = this;

            $('#refine-menu-standards li').click(function () {

                var standard = $(this).text().toLowerCase().trim();

                self.toggleStandard(standard);
                self.navigate();
            });
        }
    }, {
        key: 'decrementPage',
        value: function decrementPage() {

            this.params.page--;
        }

        // Cost of living
        //

    }, {
        key: 'drawCostOfLivingData',
        value: function drawCostOfLivingData() {

            var self = this;

            google.setOnLoadCallback(function () {

                var regionIds = self.params.regions.map(function (region) {
                    return region.id;
                });
                var controller = new ApiController();

                controller.getCostOfLivingData(regionIds, function (data) {

                    self.drawCostOfLivingChart(regionIds, data);
                    self.drawCostOfLivingTable(regionIds, data);
                });
            });
        }
    }, {
        key: 'drawCostOfLivingChart',
        value: function drawCostOfLivingChart(regionIds, data) {

            this.drawCostOfLivingChartForComponent('cost-of-living-all-chart', 'All', regionIds, data);
            this.drawCostOfLivingChartForComponent('cost-of-living-goods-chart', 'Goods', regionIds, data);
            this.drawCostOfLivingChartForComponent('cost-of-living-rents-chart', 'Rents', regionIds, data);
            this.drawCostOfLivingChartForComponent('cost-of-living-other-chart', 'Other', regionIds, data);
        }
    }, {
        key: 'drawCostOfLivingChartForComponent',
        value: function drawCostOfLivingChartForComponent(id, component, regionIds, data) {

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

                if (data[i].component != component) continue;

                if (o[data[i].year] == undefined) {
                    o[data[i].year] = [data[i].year];
                }

                o[data[i].year].push(parseFloat(data[i].index));
            }

            for (var key in o) {
                chartData.push(o[key]);
            }

            this.drawLineChart(id, chartData, {

                curveType: 'function',
                legend: { position: 'bottom' },
                pointShape: 'square',
                pointSize: 8,
                title: component
            });
        }
    }, {
        key: 'drawCostOfLivingTable',
        value: function drawCostOfLivingTable(regionIds, data) {

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
                        index: o != null ? parseFloat(o.index) : 'NA',
                        percentile: o != null ? this.getPercentile(o.rank, o.total_ranks) : 'NA'
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
        }
    }, {
        key: 'getPercentile',
        value: function getPercentile(rank, totalRanks) {

            var totalRanks = parseInt(totalRanks);
            var rank = parseInt(rank);
            var percentile = parseInt((totalRanks - rank) / totalRanks * 100);

            return numeral(percentile).format('0o');
        }
    }, {
        key: 'getLatestCostOfLiving',
        value: function getLatestCostOfLiving(data, regionId, component) {

            var datum = null;

            for (var i = 0; i < data.length; i++) {

                if (data[i].id != regionId) continue;

                if (data[i].component != component) continue;

                if (datum == null) {

                    datum = data[i];
                    continue;
                }

                if (parseInt(data[i].year) <= parseInt(datum.year)) continue;

                datum = data[i];
            }

            return datum;
        }

        // Earnings
        //

    }, {
        key: 'drawEarningsData',
        value: function drawEarningsData() {

            var self = this;

            google.setOnLoadCallback(function () {

                var regionIds = self.params.regions.map(function (region) {
                    return region.id;
                });
                var controller = new ApiController();

                controller.getEarningsData(regionIds, function (data) {

                    self.drawEarningsChart(regionIds, data);
                    self.drawEarningsTable(regionIds, data);
                });
            });
        }
    }, {
        key: 'drawEarningsChart',
        value: function drawEarningsChart(regionIds, data) {

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

            this.drawSteppedAreaChart('earnings-chart', earnings, {

                areaOpacity: 0,
                connectSteps: true,
                curveType: 'function',
                focusTarget: 'category',
                legend: { position: 'bottom' },
                title: 'Earnings by Education Level',
                vAxis: { format: 'currency' }
            });
        }
    }, {
        key: 'drawEarningsTable',
        value: function drawEarningsTable(regionIds, data) {

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
        }

        // Education
        //

    }, {
        key: 'drawEducationData',
        value: function drawEducationData() {

            var self = this;

            google.setOnLoadCallback(function () {

                var regionIds = self.params.regions.map(function (region) {
                    return region.id;
                });
                var controller = new ApiController();

                controller.getEducationData(regionIds, function (data) {

                    self.drawEducationTable(regionIds, data);
                });
            });
        }
    }, {
        key: 'drawEducationTable',
        value: function drawEducationTable(regionIds, data) {

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
                var percentile = parseInt((totalRanks - rank) / totalRanks * 100);

                s += '<td>' + data[i].percent_bachelors_degree_or_higher + '%</td>';
                s += '<td>' + numeral(percentile).format('0o') + '</td>';
            }

            // At least high school diploma
            //
            s += '</tr><tr><td>At Least High School Diploma</td>';

            for (var i = 0; i < regionIds.length; i++) {

                var totalRanks = parseInt(data[i].total_ranks);
                var rank = parseInt(data[i].percent_high_school_graduate_or_higher);
                var percentile = parseInt((totalRanks - rank) / totalRanks * 100);

                s += '<td>' + data[i].percent_high_school_graduate_or_higher + '%</td>';
                s += '<td>' + numeral(percentile).format('0o') + '</td>';
            }

            s += '</tr>';

            $('#education-table').html(s);
        }

        // GDP data
        //

    }, {
        key: 'drawGdpData',
        value: function drawGdpData() {

            var self = this;

            google.setOnLoadCallback(function () {

                var regionIds = self.params.regions.map(function (region) {
                    return region.id;
                });
                var controller = new ApiController();

                controller.getGdpData(regionIds, function (data) {

                    self.drawGdpChart(regionIds, data);
                    self.drawGdpChangeChart(regionIds, data);
                });
            });
        }
    }, {
        key: 'drawGdpChart',
        value: function drawGdpChart(regionIds, data) {

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
            this.drawLineChart('per-capita-gdp-chart', chartData, {

                curveType: 'function',
                legend: { position: 'bottom' },
                pointShape: 'square',
                pointSize: 8,
                title: 'Per Capita Real GDP over Time'
            });
        }
    }, {
        key: 'drawGdpChangeChart',
        value: function drawGdpChangeChart(regionIds, data) {

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
            this.drawLineChart('per-capita-gdp-change-chart', chartData, {

                curveType: 'function',
                legend: { position: 'bottom' },
                pointShape: 'square',
                pointSize: 8,
                title: 'Annual Change in Per Capita GDP over Time',
                vAxis: { format: '#.#%' }
            });
        }

        // Occupations
        //

    }, {
        key: 'drawOccupationsData',
        value: function drawOccupationsData() {

            var self = this;

            google.setOnLoadCallback(function () {

                var regionIds = self.params.regions.map(function (region) {
                    return region.id;
                });
                var controller = new ApiController();

                controller.getOccupationsData(regionIds, function (data) {

                    self.drawOccupationsTable(regionIds, data);
                });
            });
        }
    }, {
        key: 'drawOccupationsTable',
        value: function drawOccupationsTable(regionIds, data) {

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

                if (i % regionIds.length == 0) s += '</tr><tr><td>' + data[i].occupation + '</td>';

                var totalRanks = parseInt(data[i].total_ranks);
                var rank = parseInt(data[i].percent_employed_rank);
                var percentile = parseInt((totalRanks - rank) / totalRanks * 100);

                s += '<td>' + numeral(data[i].percent_employed).format('0.0') + '%</td>';
                s += '<td>' + numeral(percentile).format('0o') + '</td>';
            }

            s += '</tr>';

            $('#occupations-table').html(s);
        }

        // Population
        //

    }, {
        key: 'drawPopulationData',
        value: function drawPopulationData() {

            var self = this;

            google.setOnLoadCallback(function () {

                var regionIds = self.params.regions.map(function (region) {
                    return region.id;
                });
                var controller = new ApiController();

                controller.getPopulationData(regionIds, function (data) {

                    self.drawPopulationMap();
                    self.drawPopulationChart(regionIds, data);
                    self.drawPopulationChangeChart(regionIds, data);
                });
            });
        }
    }, {
        key: 'drawPopulationChart',
        value: function drawPopulationChart(regionIds, data) {

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

                var m = i % regionIds.length;

                if (m == 0) {

                    year = [];
                    year[0] = data[i].year;
                    chartData.push(year);
                }

                year[m + 1] = parseInt(data[i].population);
            }

            this.drawLineChart('population-chart', chartData, {

                curveType: 'function',
                legend: { position: 'bottom' },
                pointShape: 'square',
                pointSize: 8,
                title: 'Population'
            });
        }
    }, {
        key: 'drawPopulationChangeChart',
        value: function drawPopulationChangeChart(regionIds, data) {

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

                var m = i % regionIds.length;

                if (m == 0) {

                    year = [];
                    year[0] = data[i].year;
                    chartData.push(year);
                }

                year[m + 1] = parseFloat(data[i].population_percent_change) / 100;
            }

            this.drawLineChart('population-change-chart', chartData, {

                curveType: 'function',
                legend: { position: 'bottom' },
                pointShape: 'square',
                pointSize: 8,
                title: 'Population Change',
                vAxis: { format: '#.#%' }
            });
        }
    }, {
        key: 'drawPopulationMap',
        value: function drawPopulationMap() {

            var map = L.map('map').setView([51.505, -0.09], 13);
            map.setView(this.MAP_INITIAL_CENTER, this.MAP_INITIAL_ZOOM);

            var myLines = [{
                "type": "LineString",
                "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
            }, {
                "type": "LineString",
                "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
            }];

            var myStyle = {
                "color": "#ff7800",
                "weight": 5,
                "opacity": 0.65
            };

            L.geoJson(myLines, {
                style: myStyle
            }).addTo(map);

            L.tileLayer('https://a.tiles.mapbox.com/v3/socrata-apps.ibp0l899/{z}/{x}/{y}.png').addTo(map);
        }

        // Places in region
        //

    }, {
        key: 'drawPlacesInRegion',
        value: function drawPlacesInRegion(onClickRegion) {

            if (this.params.regions.length == 0) return;

            var region = this.params.regions[0];

            var controller = new ApiController();
            var self = this;

            controller.getPlacesInRegion(region.id, function (data) {

                if (data.length == 0) return;

                $('#places-in-region-header').text('Places in {0}'.format(region.name));
                $('#places-in-region-header').slideToggle(100);

                self.drawPlacesInRegionList(data, onClickRegion);
            });
        }
    }, {
        key: 'drawPlacesInRegionList',
        value: function drawPlacesInRegionList(data, onClickRegion) {

            var s = '';

            if (data.length == 0) return;

            for (var i = 0; i < data.length; i++) {

                s += '<li><a href="';
                s += this.getSearchPageForRegionsAndVectorUrl(data[i].child_name) + '">';
                s += data[i].child_name;
                s += '</a></li>';
            }

            $('#places-in-region').html(s);
            $('#places-in-region').slideToggle(100);
        }

        // Similar regions
        //

    }, {
        key: 'drawSimilarRegions',
        value: function drawSimilarRegions(onClickRegion) {

            if (this.params.regions.length == 0) return;

            var region = this.params.regions[0];
            var controller = new ApiController();
            var self = this;

            controller.getSimilarRegions(region.id, function (data) {

                self.drawSimilarRegionsList(data, onClickRegion);
            });
        }
    }, {
        key: 'drawSimilarRegionsList',
        value: function drawSimilarRegionsList(data, onClickRegion) {

            var s = '';

            if (data.most_similar == undefined) return;

            for (var i = 0; i < data.most_similar.length; i++) {

                s += '<li><a><i class="fa fa-plus"></i>' + data.most_similar[i].name + '</a></li>';
            }

            $('#similar-regions').html(s);
            $('#similar-regions').slideToggle(100);

            $('#similar-regions li a').click(function () {

                var index = $(this).parent().index();
                onClickRegion(data.most_similar[index].name);
            });
        }

        // Draw charts
        //

    }, {
        key: 'drawLineChart',
        value: function drawLineChart(chartId, data, options) {

            var dataTable = google.visualization.arrayToDataTable(data);
            var chart = new google.visualization.LineChart(document.getElementById(chartId));

            chart.draw(dataTable, options);
        }
    }, {
        key: 'drawSteppedAreaChart',
        value: function drawSteppedAreaChart(chartId, data, options) {

            var dataTable = google.visualization.arrayToDataTable(data);
            var chart = new google.visualization.SteppedAreaChart(document.getElementById(chartId));

            chart.draw(dataTable, options);
        }

        // Paging
        //

    }, {
        key: 'fetchNextPage',
        value: function fetchNextPage() {

            if (this.fetching || this.fetchedAll) return;

            this.fetching = true;
            this.incrementPage();

            var self = this;

            $.ajax(this.getSearchResultsUrl()).done(function (data, textStatus, jqXHR) {

                console.log(jqXHR.status + ' ' + textStatus);

                if (jqXHR.status == 204) {
                    // no content

                    self.decrementPage();
                    self.fetching = false;
                    self.fetchedAll = true;
                    return;
                }

                $('.datasets').append(data);
                self.fetching = false;
            });
        }
    }, {
        key: 'getSearchPageForRegionsAndVectorUrl',
        value: function getSearchPageForRegionsAndVectorUrl(regions, vector, queryString) {

            var url = '/';

            if (typeof regions === 'string') {

                url += regions.replace(/,/g, '').replace(/ /g, '_');
            } else if (Array.isArray(regions)) {

                var regionNames = [];

                regionNames = regions.map(function (region) {
                    return region.replace(/,/g, '').replace(/ /g, '_');
                });

                url += regionNames.join('_vs_');
            } else {

                url += 'search';
            }

            if (vector) url += '/' + vector;

            if (queryString) url += queryString;

            return url;
        }
    }, {
        key: 'getSearchPageUrl',
        value: function getSearchPageUrl() {

            if (this.params.regions.length > 0 || this.params.autoSuggestedRegion) {

                var regionNames = [];

                if (this.params.resetRegions == false) {

                    regionNames = this.params.regions.map(function (region) {
                        return region.name;
                    });
                }

                if (this.params.autoSuggestedRegion) regionNames.push(this.params.autoSuggestedRegion);

                return this.getSearchPageForRegionsAndVectorUrl(regionNames, this.params.vector, this.getSearchQueryString());
            } else {

                return this.getSearchPageForRegionsAndVectorUrl(null, this.params.vector, this.getSearchQueryString());
            }
        }
    }, {
        key: 'getSearchResultsUrl',
        value: function getSearchResultsUrl() {

            var searchResultsUrl = this.params.regions.length == 0 ? '/search-results' : './search-results';
            var url = searchResultsUrl + this.getSearchQueryString();

            return url;
        }
    }, {
        key: 'getSearchQueryString',
        value: function getSearchQueryString() {

            var url = '?q=' + encodeURIComponent(this.params.q);

            if (this.params.page > 1) url += '&page=' + this.params.page;

            if (this.params.categories.length > 0) url += '&categories=' + encodeURIComponent(this.params.categories.join(','));

            if (this.params.domains.length > 0) url += '&domains=' + encodeURIComponent(this.params.domains.join(','));

            if (this.params.standards.length > 0) url += '&standards=' + encodeURIComponent(this.params.standards.join(','));

            return url;
        }
    }, {
        key: 'incrementPage',
        value: function incrementPage() {

            this.params.page++;
        }
    }, {
        key: 'navigate',
        value: function navigate() {

            window.location.href = this.getSearchPageUrl();
        }
    }, {
        key: 'removeRegion',
        value: function removeRegion(regionIndex) {

            this.params.regions.splice(regionIndex, 1); // remove at index i
            this.params.page = 1;
        }
    }, {
        key: 'setAutoSuggestedRegion',
        value: function setAutoSuggestedRegion(region, resetRegions) {

            this.params.autoSuggestedRegion = region;
            this.params.resetRegions = resetRegions;
            this.params.page = 1;
        }
    }, {
        key: 'toggleCategory',
        value: function toggleCategory(category) {

            var i = this.params.categories.indexOf(category);

            if (i > -1) this.params.categories.splice(i, 1); // remove at index i
            else this.params.categories.push(category);
        }
    }, {
        key: 'toggleDomain',
        value: function toggleDomain(domain) {

            var i = this.params.domains.indexOf(domain);

            if (i > -1) this.params.domains.splice(i, 1); // remove at index i
            else this.params.domains.push(domain);
        }
    }, {
        key: 'toggleStandard',
        value: function toggleStandard(standard) {

            var i = this.params.standards.indexOf(standard);

            if (i > -1) this.params.standards.splice(i, 1); // remove at index i
            else this.params.standards.push(standard);
        }
    }]);

    return SearchPageController;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Y0LXNlYXJjaC1wYWdlLWNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBQU0sb0JBQW9CO0FBRXRCLGFBRkUsb0JBQW9CLENBRVYsTUFBTSxFQUFFOzhCQUZsQixvQkFBb0I7O0FBSWxCLFlBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzlDLFlBQUksQ0FBQyxnQkFBZ0IsR0FBRyxHQUFHLENBQUM7O0FBRTVCLFlBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLFlBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0FBQ3RCLFlBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO0FBQ3hCLFlBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDOztBQUV0QixZQUFJLElBQUksR0FBRyxJQUFJOzs7O0FBQUMsQUFJaEIsU0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxZQUFXOztBQUVwQyxhQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDekMsYUFBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUM1RixhQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN6QyxDQUFDLENBQUM7O0FBRUgsU0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxZQUFXOztBQUVwQyxhQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDNUMsYUFBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFB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QUM7U0FDNUM7OztXQWxsQ0Msb0JBQW9CIiwiZmlsZSI6InY0LXNlYXJjaC1wYWdlLWNvbnRyb2xsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBTZWFyY2hQYWdlQ29udHJvbGxlciB7XG5cbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMpIHtcblxuICAgICAgICB0aGlzLk1BUF9JTklUSUFMX0NFTlRFUiA9IFszNy4xNjY5LCAtOTUuOTY2OV07XG4gICAgICAgIHRoaXMuTUFQX0lOSVRJQUxfWk9PTSA9IDQuMDtcbiAgICAgICAgXG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zO1xuICAgICAgICB0aGlzLmZldGNoaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZmV0Y2hlZEFsbCA9IGZhbHNlO1xuICAgICAgICB0aGlzLm1vc3RTaW1pbGFyID0gW107XG4gICAgXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBcbiAgICAgICAgLy8gUmVmaW5lIG1lbnVzXG4gICAgICAgIC8vXG4gICAgICAgICQoJy5yZWZpbmUtbGluaycpLm1vdXNlZW50ZXIoZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdyZWZpbmUtbGluay1zZWxlY3RlZCcpO1xuICAgICAgICAgICAgJCh0aGlzKS5jaGlsZHJlbignc3BhbicpLmNoaWxkcmVuKCdpJykucmVtb3ZlQ2xhc3MoJ2ZhLWNhcmV0LWRvd24nKS5hZGRDbGFzcygnZmEtY2FyZXQtdXAnKTtcbiAgICAgICAgICAgICQodGhpcykuY2hpbGRyZW4oJ3VsJykuc2xpZGVEb3duKDEwMCk7XG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICAkKCcucmVmaW5lLWxpbmsnKS5tb3VzZWxlYXZlKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygncmVmaW5lLWxpbmstc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgICQodGhpcykuY2hpbGRyZW4oJ3NwYW4nKS5jaGlsZHJlbignaScpLnJlbW92ZUNsYXNzKCdmYS1jYXJldC11cCcpLmFkZENsYXNzKCdmYS1jYXJldC1kb3duJyk7XG4gICAgICAgICAgICAkKHRoaXMpLmNoaWxkcmVuKCd1bCcpLnNsaWRlVXAoMTAwKTtcbiAgICAgICAgfSk7XG4gICAgXG4gICAgICAgIC8vIENhdGVnb3JpZXNcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5hdHRhY2hDYXRlZ29yaWVzQ2xpY2tIYW5kbGVycygpO1xuICAgIFxuICAgICAgICAkKCcjcmVmaW5lLW1lbnUtY2F0ZWdvcmllcy12aWV3LW1vcmUnKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICBcbiAgICAgICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcbiAgICAgICAgICAgIGNvbnRyb2xsZXIuZ2V0Q2F0ZWdvcmllcyhmdW5jdGlvbihkYXRhKSB7XG4gICAgXG4gICAgICAgICAgICAgICAgdmFyIHMgPSBkYXRhLnJlc3VsdHMubWFwKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJzxsaT48aSBjbGFzcz1cImZhICcgKyByZXN1bHQubWV0YWRhdGEuaWNvbiArICdcIj48L2k+JyArIHJlc3VsdC5jYXRlZ29yeSArICc8L2xpPic7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICAgICAgICAgJCgnI3JlZmluZS1tZW51LWNhdGVnb3JpZXMnKS5odG1sKHMpO1xuICAgICAgICAgICAgICAgIHNlbGYuYXR0YWNoQ2F0ZWdvcmllc0NsaWNrSGFuZGxlcnMoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgLy8gRG9tYWluc1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLmF0dGFjaERvbWFpbnNDbGlja0hhbmRsZXJzKCk7XG4gICAgXG4gICAgICAgICQoJyNyZWZpbmUtbWVudS1kb21haW5zLXZpZXctbW9yZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgICAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuICAgICAgICAgICAgY29udHJvbGxlci5nZXREb21haW5zKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBcbiAgICAgICAgICAgICAgICB2YXIgcyA9IGRhdGEucmVzdWx0cy5tYXAoZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnPGxpPicgKyByZXN1bHQuZG9tYWluICsgJzwvbGk+JztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgICAgICAgICAkKCcjcmVmaW5lLW1lbnUtZG9tYWlucycpLmh0bWwocyk7XG4gICAgICAgICAgICAgICAgc2VsZi5hdHRhY2hEb21haW5zQ2xpY2tIYW5kbGVycygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gU3RhbmRhcmRzXG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuYXR0YWNoU3RhbmRhcmRzQ2xpY2tIYW5kbGVycygpO1xuICAgIFxuICAgICAgICAvLyBUb2tlbnNcbiAgICAgICAgLy9cbiAgICAgICAgJCgnLnJlZ2lvbi10b2tlbiAuZmEtdGltZXMtY2lyY2xlJykuY2xpY2soZnVuY3Rpb24oKSB7IFxuICAgIFxuICAgICAgICAgICAgc2VsZi5yZW1vdmVSZWdpb24oJCh0aGlzKS5wYXJlbnQoKS5pbmRleCgpKTtcbiAgICAgICAgICAgIHNlbGYubmF2aWdhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICQoJy5jYXRlZ29yeS10b2tlbiAuZmEtdGltZXMtY2lyY2xlJykuY2xpY2soZnVuY3Rpb24oKSB7IFxuICAgIFxuICAgICAgICAgICAgc2VsZi50b2dnbGVDYXRlZ29yeSgkKHRoaXMpLnBhcmVudCgpLnRleHQoKS50b0xvd2VyQ2FzZSgpLnRyaW0oKSk7XG4gICAgICAgICAgICBzZWxmLm5hdmlnYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICAkKCcuZG9tYWluLXRva2VuIC5mYS10aW1lcy1jaXJjbGUnKS5jbGljayhmdW5jdGlvbigpIHsgXG4gICAgXG4gICAgICAgICAgICBzZWxmLnRvZ2dsZURvbWFpbigkKHRoaXMpLnBhcmVudCgpLnRleHQoKS50b0xvd2VyQ2FzZSgpLnRyaW0oKSk7XG4gICAgICAgICAgICBzZWxmLm5hdmlnYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICAkKCcuc3RhbmRhcmQtdG9rZW4gLmZhLXRpbWVzLWNpcmNsZScpLmNsaWNrKGZ1bmN0aW9uKCkgeyBcbiAgICBcbiAgICAgICAgICAgIHNlbGYudG9nZ2xlU3RhbmRhcmQoJCh0aGlzKS5wYXJlbnQoKS50ZXh0KCkudG9Mb3dlckNhc2UoKS50cmltKCkpO1xuICAgICAgICAgICAgc2VsZi5uYXZpZ2F0ZSgpO1xuICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgLy8gSW5maW5pdGUgc2Nyb2xsIHNlYXJjaCByZXN1bHRzXG4gICAgICAgIC8vXG4gICAgICAgICQod2luZG93KS5vbignc2Nyb2xsJywgZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgYm90dG9tT2Zmc2V0VG9CZWdpblJlcXVlc3QgPSAxMDAwO1xuICAgIFxuICAgICAgICAgICAgaWYgKCQod2luZG93KS5zY3JvbGxUb3AoKSA+PSAkKGRvY3VtZW50KS5oZWlnaHQoKSAtICQod2luZG93KS5oZWlnaHQoKSAtIGJvdHRvbU9mZnNldFRvQmVnaW5SZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgc2VsZi5mZXRjaE5leHRQYWdlKCk7XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgIH0pLnNjcm9sbCgpO1xuICAgIFxuICAgICAgICAvLyBBZGQgbG9jYXRpb25cbiAgICAgICAgLy9cbiAgICAgICAgbmV3IEF1dG9TdWdnZXN0UmVnaW9uQ29udHJvbGxlcignLmFkZC1yZWdpb24gaW5wdXRbdHlwZT1cInRleHRcIl0nLCAnLmFkZC1yZWdpb24gdWwnLCBmdW5jdGlvbihyZWdpb24pIHtcbiAgICBcbiAgICAgICAgICAgIHNlbGYuc2V0QXV0b1N1Z2dlc3RlZFJlZ2lvbihyZWdpb24sIGZhbHNlKTtcbiAgICAgICAgICAgIHNlbGYubmF2aWdhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICQoJy5hZGQtcmVnaW9uIC5mYS1wbHVzJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICAgICAgICAkKCcuYWRkLXJlZ2lvbiBpbnB1dFt0eXBlPVwidGV4dFwiXScpLmZvY3VzKCk7XG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICAvLyBTaW1pbGFyIHJlZ2lvbnNcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5kcmF3U2ltaWxhclJlZ2lvbnMoZnVuY3Rpb24ocmVnaW9uKSB7XG4gICAgXG4gICAgICAgICAgICBzZWxmLnNldEF1dG9TdWdnZXN0ZWRSZWdpb24ocmVnaW9uLCBmYWxzZSk7XG4gICAgICAgICAgICBzZWxmLm5hdmlnYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICAvLyBQbGFjZXMgaW4gcmVnaW9uXG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuZHJhd1BsYWNlc0luUmVnaW9uKGZ1bmN0aW9uKHJlZ2lvbikge1xuICAgIFxuICAgICAgICAgICAgc2VsZi5zZXRBdXRvU3VnZ2VzdGVkUmVnaW9uKHJlZ2lvbiwgZmFsc2UpO1xuICAgICAgICAgICAgc2VsZi5uYXZpZ2F0ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBQdWJsaWMgbWV0aG9kc1xuICAgIC8vXG4gICAgYXR0YWNoQ2F0ZWdvcmllc0NsaWNrSGFuZGxlcnMoKSB7XG4gICAgXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBcbiAgICAgICAgJCgnI3JlZmluZS1tZW51LWNhdGVnb3JpZXMgbGk6bm90KC5yZWZpbmUtdmlldy1tb3JlKScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgICAgICAgICAgc2VsZi50b2dnbGVDYXRlZ29yeSgkKHRoaXMpLnRleHQoKS50b0xvd2VyQ2FzZSgpLnRyaW0oKSk7XG4gICAgICAgICAgICBzZWxmLm5hdmlnYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBhdHRhY2hEb21haW5zQ2xpY2tIYW5kbGVycygpIHtcbiAgICBcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBcbiAgICAgICAgJCgnI3JlZmluZS1tZW51LWRvbWFpbnMgbGk6bm90KC5yZWZpbmUtdmlldy1tb3JlKScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgICAgICAgICAgdmFyIGRvbWFpbiA9ICQodGhpcykudGV4dCgpLnRvTG93ZXJDYXNlKCkudHJpbSgpO1xuICAgIFxuICAgICAgICAgICAgc2VsZi50b2dnbGVEb21haW4oZG9tYWluKTtcbiAgICAgICAgICAgIHNlbGYubmF2aWdhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGF0dGFjaFN0YW5kYXJkc0NsaWNrSGFuZGxlcnMoKSB7XG4gICAgXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgXG4gICAgICAgICQoJyNyZWZpbmUtbWVudS1zdGFuZGFyZHMgbGknKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICBcbiAgICAgICAgICAgIHZhciBzdGFuZGFyZCA9ICQodGhpcykudGV4dCgpLnRvTG93ZXJDYXNlKCkudHJpbSgpO1xuICAgIFxuICAgICAgICAgICAgc2VsZi50b2dnbGVTdGFuZGFyZChzdGFuZGFyZCk7XG4gICAgICAgICAgICBzZWxmLm5hdmlnYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBkZWNyZW1lbnRQYWdlKCkge1xuICAgIFxuICAgICAgICB0aGlzLnBhcmFtcy5wYWdlLS07XG4gICAgfVxuICAgIFxuICAgIC8vIENvc3Qgb2YgbGl2aW5nXG4gICAgLy9cbiAgICBkcmF3Q29zdE9mTGl2aW5nRGF0YSgpIHtcbiAgICBcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIFxuICAgICAgICBnb29nbGUuc2V0T25Mb2FkQ2FsbGJhY2soZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgcmVnaW9uSWRzID0gc2VsZi5wYXJhbXMucmVnaW9ucy5tYXAoZnVuY3Rpb24ocmVnaW9uKSB7IHJldHVybiByZWdpb24uaWQ7IH0pO1xuICAgICAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuICAgIFxuICAgICAgICAgICAgY29udHJvbGxlci5nZXRDb3N0T2ZMaXZpbmdEYXRhKHJlZ2lvbklkcywgZnVuY3Rpb24oZGF0YSkgeyBcbiAgICBcbiAgICAgICAgICAgICAgICBzZWxmLmRyYXdDb3N0T2ZMaXZpbmdDaGFydChyZWdpb25JZHMsIGRhdGEpO1xuICAgICAgICAgICAgICAgIHNlbGYuZHJhd0Nvc3RPZkxpdmluZ1RhYmxlKHJlZ2lvbklkcywgZGF0YSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRyYXdDb3N0T2ZMaXZpbmdDaGFydChyZWdpb25JZHMsIGRhdGEpIHtcbiAgICBcbiAgICAgICAgdGhpcy5kcmF3Q29zdE9mTGl2aW5nQ2hhcnRGb3JDb21wb25lbnQoJ2Nvc3Qtb2YtbGl2aW5nLWFsbC1jaGFydCcsICdBbGwnLCByZWdpb25JZHMsIGRhdGEpO1xuICAgICAgICB0aGlzLmRyYXdDb3N0T2ZMaXZpbmdDaGFydEZvckNvbXBvbmVudCgnY29zdC1vZi1saXZpbmctZ29vZHMtY2hhcnQnLCAnR29vZHMnLCByZWdpb25JZHMsIGRhdGEpO1xuICAgICAgICB0aGlzLmRyYXdDb3N0T2ZMaXZpbmdDaGFydEZvckNvbXBvbmVudCgnY29zdC1vZi1saXZpbmctcmVudHMtY2hhcnQnLCAnUmVudHMnLCByZWdpb25JZHMsIGRhdGEpO1xuICAgICAgICB0aGlzLmRyYXdDb3N0T2ZMaXZpbmdDaGFydEZvckNvbXBvbmVudCgnY29zdC1vZi1saXZpbmctb3RoZXItY2hhcnQnLCAnT3RoZXInLCByZWdpb25JZHMsIGRhdGEpO1xuICAgIH1cbiAgICBcbiAgICBkcmF3Q29zdE9mTGl2aW5nQ2hhcnRGb3JDb21wb25lbnQoaWQsIGNvbXBvbmVudCwgcmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIHZhciBjaGFydERhdGEgPSBbXVxuICAgIFxuICAgICAgICAvLyBIZWFkZXJcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGhlYWRlciA9IFsnWWVhciddO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaGVhZGVyW2kgKyAxXSA9IHRoaXMucGFyYW1zLnJlZ2lvbnNbaV0ubmFtZTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBjaGFydERhdGEucHVzaChoZWFkZXIpO1xuICAgIFxuICAgICAgICAvLyBGb3JtYXQgdGhlIGRhdGFcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIG8gPSB7fTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICBpZiAoZGF0YVtpXS5jb21wb25lbnQgIT0gY29tcG9uZW50KVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgIFxuICAgICAgICAgICAgaWYgKG9bZGF0YVtpXS55ZWFyXSA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBvW2RhdGFbaV0ueWVhcl0gPSBbZGF0YVtpXS55ZWFyXTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIG9bZGF0YVtpXS55ZWFyXS5wdXNoKHBhcnNlRmxvYXQoZGF0YVtpXS5pbmRleCkpO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvKSB7XG4gICAgICAgICAgICBjaGFydERhdGEucHVzaChvW2tleV0pO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIHRoaXMuZHJhd0xpbmVDaGFydChpZCwgY2hhcnREYXRhLCB7XG4gICAgXG4gICAgICAgICAgICBjdXJ2ZVR5cGUgOiAnZnVuY3Rpb24nLFxuICAgICAgICAgICAgbGVnZW5kIDogeyBwb3NpdGlvbiA6ICdib3R0b20nIH0sXG4gICAgICAgICAgICBwb2ludFNoYXBlIDogJ3NxdWFyZScsXG4gICAgICAgICAgICBwb2ludFNpemUgOiA4LFxuICAgICAgICAgICAgdGl0bGUgOiBjb21wb25lbnQsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBkcmF3Q29zdE9mTGl2aW5nVGFibGUocmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIC8vIEZvcm1hdCB0aGUgZGF0YVxuICAgICAgICAvL1xuICAgICAgICB2YXIgY29tcG9uZW50cyA9IFsnQWxsJywgJ0dvb2RzJywgJ090aGVyJywgJ1JlbnRzJ107XG4gICAgICAgIHZhciByb3dzID0gW107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29tcG9uZW50cy5sZW5ndGg7IGkrKykge1xuICAgIFxuICAgICAgICAgICAgdmFyIGNvbXBvbmVudCA9IGNvbXBvbmVudHNbaV07XG4gICAgICAgICAgICB2YXIgcm93ID0gW2NvbXBvbmVudF07XG4gICAgXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHJlZ2lvbklkcy5sZW5ndGg7IGorKykge1xuICAgIFxuICAgICAgICAgICAgICAgIHZhciBvID0gdGhpcy5nZXRMYXRlc3RDb3N0T2ZMaXZpbmcoZGF0YSwgcmVnaW9uSWRzW2pdLCBjb21wb25lbnQpO1xuICAgIFxuICAgICAgICAgICAgICAgIHJvdy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggOiAobyAhPSBudWxsKSA/IHBhcnNlRmxvYXQoby5pbmRleCkgOiAnTkEnLFxuICAgICAgICAgICAgICAgICAgICBwZXJjZW50aWxlIDogKG8gIT0gbnVsbCkgPyB0aGlzLmdldFBlcmNlbnRpbGUoby5yYW5rLCBvLnRvdGFsX3JhbmtzKSA6ICdOQScsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICByb3dzLnB1c2gocm93KTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvLyBIZWFkZXJcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIHMgPSAnPHRyPjx0aD48L3RoPic7XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzICs9ICc8dGggY29sc3Bhbj1cXCcyXFwnPicgKyB0aGlzLnBhcmFtcy5yZWdpb25zW2ldLm5hbWUgKyAnPC90aD4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8vIFN1YiBoZWFkZXJcbiAgICAgICAgLy9cbiAgICAgICAgcyArPSAnPC90cj48dHI+PHRkIGNsYXNzPVxcJ2NvbHVtbi1oZWFkZXJcXCc+PC90ZD4nO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcyArPSAnPHRkIGNsYXNzPVxcJ2NvbHVtbi1oZWFkZXJcXCc+VmFsdWU8L3RkPjx0ZCBjbGFzcz1cXCdjb2x1bW4taGVhZGVyXFwnPlBlcmNlbnRpbGU8L3RkPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgcyArPSAnPC90cj4nO1xuICAgICAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb3dzLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgcm93ID0gcm93c1tpXTtcbiAgICBcbiAgICAgICAgICAgIHMgKz0gJzx0cj4nO1xuICAgICAgICAgICAgcyArPSAnPHRkPicgKyByb3dbMF0gKyAnPC90ZD4nO1xuICAgIFxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDE7IGogPCByb3cubGVuZ3RoOyBqKyspIHtcbiAgICBcbiAgICAgICAgICAgICAgICBzICs9ICc8dGQ+JyArIHJvd1tqXS5pbmRleCArICc8L3RkPic7XG4gICAgICAgICAgICAgICAgcyArPSAnPHRkPicgKyByb3dbal0ucGVyY2VudGlsZSArICc8L3RkPic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHMgKz0gJzwvdHI+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAkKCcjY29zdC1vZi1saXZpbmctdGFibGUnKS5odG1sKHMpO1xuICAgIH1cbiAgICBcbiAgICBnZXRQZXJjZW50aWxlKHJhbmssIHRvdGFsUmFua3MpIHtcbiAgICBcbiAgICAgICAgdmFyIHRvdGFsUmFua3MgPSBwYXJzZUludCh0b3RhbFJhbmtzKTtcbiAgICAgICAgdmFyIHJhbmsgPSBwYXJzZUludChyYW5rKTtcbiAgICAgICAgdmFyIHBlcmNlbnRpbGUgPSBwYXJzZUludCgoKHRvdGFsUmFua3MgLSByYW5rKSAvIHRvdGFsUmFua3MpICogMTAwKTtcbiAgICBcbiAgICAgICAgcmV0dXJuIG51bWVyYWwocGVyY2VudGlsZSkuZm9ybWF0KCcwbycpO1xuICAgIH1cbiAgICBcbiAgICBnZXRMYXRlc3RDb3N0T2ZMaXZpbmcoZGF0YSwgcmVnaW9uSWQsIGNvbXBvbmVudCkge1xuICAgIFxuICAgICAgICB2YXIgZGF0dW0gPSBudWxsO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgIGlmIChkYXRhW2ldLmlkICE9IHJlZ2lvbklkKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgIFxuICAgICAgICAgICAgaWYgKGRhdGFbaV0uY29tcG9uZW50ICE9IGNvbXBvbmVudClcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICBcbiAgICAgICAgICAgIGlmIChkYXR1bSA9PSBudWxsKSB7XG4gICAgXG4gICAgICAgICAgICAgICAgZGF0dW0gPSBkYXRhW2ldO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgaWYgKHBhcnNlSW50KGRhdGFbaV0ueWVhcikgPD0gcGFyc2VJbnQoZGF0dW0ueWVhcikpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgXG4gICAgICAgICAgICBkYXR1bSA9IGRhdGFbaV07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBkYXR1bTtcbiAgICB9XG4gICAgXG4gICAgLy8gRWFybmluZ3NcbiAgICAvL1xuICAgIGRyYXdFYXJuaW5nc0RhdGEoKSB7XG4gICAgXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBcbiAgICAgICAgZ29vZ2xlLnNldE9uTG9hZENhbGxiYWNrKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgICAgICAgICAgdmFyIHJlZ2lvbklkcyA9IHNlbGYucGFyYW1zLnJlZ2lvbnMubWFwKGZ1bmN0aW9uKHJlZ2lvbikgeyByZXR1cm4gcmVnaW9uLmlkOyB9KTtcbiAgICAgICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcbiAgICBcbiAgICAgICAgICAgIGNvbnRyb2xsZXIuZ2V0RWFybmluZ3NEYXRhKHJlZ2lvbklkcywgZnVuY3Rpb24oZGF0YSkgeyBcbiAgICBcbiAgICAgICAgICAgICAgICBzZWxmLmRyYXdFYXJuaW5nc0NoYXJ0KHJlZ2lvbklkcywgZGF0YSk7XG4gICAgICAgICAgICAgICAgc2VsZi5kcmF3RWFybmluZ3NUYWJsZShyZWdpb25JZHMsIGRhdGEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBkcmF3RWFybmluZ3NDaGFydChyZWdpb25JZHMsIGRhdGEpIHtcbiAgICBcbiAgICAgICAgdmFyIGVhcm5pbmdzID0gW107XG4gICAgXG4gICAgICAgIC8vIEhlYWRlclxuICAgICAgICAvL1xuICAgICAgICB2YXIgaGVhZGVyID0gWydFZHVjYXRpb24gTGV2ZWwnXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGhlYWRlcltpICsgMV0gPSB0aGlzLnBhcmFtcy5yZWdpb25zW2ldLm5hbWU7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgZWFybmluZ3MucHVzaChoZWFkZXIpO1xuICAgIFxuICAgICAgICAvLyBMZXNzIHRoYW4gaGlnaCBzY2hvb2xcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIHNvbWVIaWdoU2Nob29sRWFybmluZ3MgPSBbJ1NvbWUgSGlnaCBTY2hvb2wnXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHNvbWVIaWdoU2Nob29sRWFybmluZ3NbaSArIDFdID0gcGFyc2VJbnQoZGF0YVtpXS5tZWRpYW5fZWFybmluZ3NfbGVzc190aGFuX2hpZ2hfc2Nob29sKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBlYXJuaW5ncy5wdXNoKHNvbWVIaWdoU2Nob29sRWFybmluZ3MpO1xuICAgIFxuICAgICAgICAvLyBIaWdoIHNjaG9vbFxuICAgICAgICAvL1xuICAgICAgICB2YXIgaGlnaFNjaG9vbEVhcm5pbmdzID0gWydIaWdoIFNjaG9vbCddO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaGlnaFNjaG9vbEVhcm5pbmdzW2kgKyAxXSA9IHBhcnNlSW50KGRhdGFbaV0ubWVkaWFuX2Vhcm5pbmdzX2hpZ2hfc2Nob29sKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBlYXJuaW5ncy5wdXNoKGhpZ2hTY2hvb2xFYXJuaW5ncyk7XG4gICAgXG4gICAgICAgIC8vIFNvbWUgY29sbGVnZVxuICAgICAgICAvL1xuICAgICAgICB2YXIgc29tZUNvbGxlZ2VFYXJuaW5ncyA9IFsnU29tZSBDb2xsZWdlJ107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzb21lQ29sbGVnZUVhcm5pbmdzW2kgKyAxXSA9IHBhcnNlSW50KGRhdGFbaV0ubWVkaWFuX2Vhcm5pbmdzX3NvbWVfY29sbGVnZV9vcl9hc3NvY2lhdGVzKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBlYXJuaW5ncy5wdXNoKHNvbWVDb2xsZWdlRWFybmluZ3MpO1xuICAgIFxuICAgICAgICAvLyBCYWNoZWxvcidzXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBiYWNoZWxvcnNFYXJuaW5ncyA9IFsnQmFjaGVsb3JcXCdzJ107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBiYWNoZWxvcnNFYXJuaW5nc1tpICsgMV0gPSBwYXJzZUludChkYXRhW2ldLm1lZGlhbl9lYXJuaW5nc19iYWNoZWxvcl9kZWdyZWUpO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGVhcm5pbmdzLnB1c2goYmFjaGVsb3JzRWFybmluZ3MpO1xuICAgIFxuICAgICAgICAvLyBHcmFkdWF0ZSBkZWdyZWVcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGdyYWR1YXRlRGVncmVlRWFybmluZ3MgPSBbJ0dyYWR1YXRlIERlZ3JlZSddO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZ3JhZHVhdGVEZWdyZWVFYXJuaW5nc1tpICsgMV0gPSBwYXJzZUludChkYXRhW2ldLm1lZGlhbl9lYXJuaW5nc19ncmFkdWF0ZV9vcl9wcm9mZXNzaW9uYWxfZGVncmVlKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBlYXJuaW5ncy5wdXNoKGdyYWR1YXRlRGVncmVlRWFybmluZ3MpO1xuICAgIFxuICAgICAgICB0aGlzLmRyYXdTdGVwcGVkQXJlYUNoYXJ0KCdlYXJuaW5ncy1jaGFydCcsIGVhcm5pbmdzLCB7XG4gICAgXG4gICAgICAgICAgICBhcmVhT3BhY2l0eSA6IDAsXG4gICAgICAgICAgICBjb25uZWN0U3RlcHM6IHRydWUsXG4gICAgICAgICAgICBjdXJ2ZVR5cGUgOiAnZnVuY3Rpb24nLFxuICAgICAgICAgICAgZm9jdXNUYXJnZXQgOiAnY2F0ZWdvcnknLFxuICAgICAgICAgICAgbGVnZW5kIDogeyBwb3NpdGlvbiA6ICdib3R0b20nIH0sXG4gICAgICAgICAgICB0aXRsZSA6ICdFYXJuaW5ncyBieSBFZHVjYXRpb24gTGV2ZWwnLFxuICAgICAgICAgICAgdkF4aXMgOiB7IGZvcm1hdCA6ICdjdXJyZW5jeScgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRyYXdFYXJuaW5nc1RhYmxlKHJlZ2lvbklkcywgZGF0YSkge1xuICAgIFxuICAgICAgICB2YXIgcyA9ICcnO1xuICAgIFxuICAgICAgICBzICs9ICc8dHI+PHRoPjwvdGg+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0aD4nICsgdGhpcy5wYXJhbXMucmVnaW9uc1tpXS5uYW1lICsgJzwvdGg+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvLyBNZWRpYW4gZWFybmluZ3MgYWxsXG4gICAgICAgIC8vXG4gICAgICAgIHMgKz0gJzwvdHI+PHRyPjx0ZD5NZWRpYW4gRWFybmluZ3MgKEFsbCBXb3JrZXJzKTwvdGQ+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgbnVtZXJhbChkYXRhW2ldLm1lZGlhbl9lYXJuaW5ncykuZm9ybWF0KCckMCwwJykgKyAnPC90ZD4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8vIE1lZGlhbiBlYXJuaW5ncyBmZW1hbGVcbiAgICAgICAgLy9cbiAgICAgICAgcyArPSAnPC90cj48dHI+PHRkPk1lZGlhbiBGZW1hbGUgRWFybmluZ3MgKEZ1bGwgVGltZSk8L3RkPic7XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzICs9ICc8dGQ+JyArIG51bWVyYWwoZGF0YVtpXS5mZW1hbGVfZnVsbF90aW1lX21lZGlhbl9lYXJuaW5ncykuZm9ybWF0KCckMCwwJykgKyAnPC90ZD4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8vIE1lZGlhbiBlYXJuaW5ncyBtYWxlXG4gICAgICAgIC8vXG4gICAgICAgIHMgKz0gJzwvdHI+PHRyPjx0ZD5NZWRpYW4gTWFsZSBFYXJuaW5ncyAoRnVsbCBUaW1lKTwvdGQ+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgbnVtZXJhbChkYXRhW2ldLm1hbGVfZnVsbF90aW1lX21lZGlhbl9lYXJuaW5ncykuZm9ybWF0KCckMCwwJykgKyAnPC90ZD4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIHMgKz0gJzwvdHI+JztcbiAgICBcbiAgICAgICAgJCgnI2Vhcm5pbmdzLXRhYmxlJykuaHRtbChzKTtcbiAgICB9XG4gICAgXG4gICAgLy8gRWR1Y2F0aW9uXG4gICAgLy9cbiAgICBkcmF3RWR1Y2F0aW9uRGF0YSgpIHtcbiAgICBcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIFxuICAgICAgICBnb29nbGUuc2V0T25Mb2FkQ2FsbGJhY2soZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgcmVnaW9uSWRzID0gc2VsZi5wYXJhbXMucmVnaW9ucy5tYXAoZnVuY3Rpb24ocmVnaW9uKSB7IHJldHVybiByZWdpb24uaWQ7IH0pO1xuICAgICAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuICAgIFxuICAgICAgICAgICAgY29udHJvbGxlci5nZXRFZHVjYXRpb25EYXRhKHJlZ2lvbklkcywgZnVuY3Rpb24oZGF0YSkgeyBcbiAgICBcbiAgICAgICAgICAgICAgICBzZWxmLmRyYXdFZHVjYXRpb25UYWJsZShyZWdpb25JZHMsIGRhdGEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBkcmF3RWR1Y2F0aW9uVGFibGUocmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIHZhciBzID0gJyc7XG4gICAgXG4gICAgICAgIC8vIEhlYWRlclxuICAgICAgICAvL1xuICAgICAgICBzICs9ICc8dHI+PHRoPjwvdGg+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0aCBjb2xzcGFuPVxcJzJcXCc+JyArIHRoaXMucGFyYW1zLnJlZ2lvbnNbaV0ubmFtZSArICc8L3RoPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgLy8gU3ViIGhlYWRlclxuICAgICAgICAvL1xuICAgICAgICBzICs9ICc8L3RyPjx0cj48dGQgY2xhc3M9XFwnY29sdW1uLWhlYWRlclxcJz48L3RkPic7XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzICs9ICc8dGQgY2xhc3M9XFwnY29sdW1uLWhlYWRlclxcJz5QZXJjZW50PC90ZD48dGQgY2xhc3M9XFwnY29sdW1uLWhlYWRlclxcJz5QZXJjZW50aWxlPC90ZD4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8vIEF0IGxlYXN0IGJhY2hlbG9yJ3NcbiAgICAgICAgLy9cbiAgICAgICAgcyArPSAnPC90cj48dHI+PHRkPkF0IExlYXN0IEJhY2hlbG9yXFwncyBEZWdyZWU8L3RkPic7XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgdG90YWxSYW5rcyA9IHBhcnNlSW50KGRhdGFbaV0udG90YWxfcmFua3MpO1xuICAgICAgICAgICAgdmFyIHJhbmsgPSBwYXJzZUludChkYXRhW2ldLnBlcmNlbnRfYmFjaGVsb3JzX2RlZ3JlZV9vcl9oaWdoZXJfcmFuayk7XG4gICAgICAgICAgICB2YXIgcGVyY2VudGlsZSA9IHBhcnNlSW50KCgodG90YWxSYW5rcyAtIHJhbmspIC8gdG90YWxSYW5rcykgKiAxMDApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBzICs9ICc8dGQ+JyArIGRhdGFbaV0ucGVyY2VudF9iYWNoZWxvcnNfZGVncmVlX29yX2hpZ2hlciArICclPC90ZD4nO1xuICAgICAgICAgICAgcyArPSAnPHRkPicgKyBudW1lcmFsKHBlcmNlbnRpbGUpLmZvcm1hdCgnMG8nKSArICc8L3RkPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgLy8gQXQgbGVhc3QgaGlnaCBzY2hvb2wgZGlwbG9tYVxuICAgICAgICAvL1xuICAgICAgICBzICs9ICc8L3RyPjx0cj48dGQ+QXQgTGVhc3QgSGlnaCBTY2hvb2wgRGlwbG9tYTwvdGQ+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgIHZhciB0b3RhbFJhbmtzID0gcGFyc2VJbnQoZGF0YVtpXS50b3RhbF9yYW5rcyk7XG4gICAgICAgICAgICB2YXIgcmFuayA9IHBhcnNlSW50KGRhdGFbaV0ucGVyY2VudF9oaWdoX3NjaG9vbF9ncmFkdWF0ZV9vcl9oaWdoZXIpO1xuICAgICAgICAgICAgdmFyIHBlcmNlbnRpbGUgPSBwYXJzZUludCgoKHRvdGFsUmFua3MgLSByYW5rKSAvIHRvdGFsUmFua3MpICogMTAwKTtcbiAgICBcbiAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgZGF0YVtpXS5wZXJjZW50X2hpZ2hfc2Nob29sX2dyYWR1YXRlX29yX2hpZ2hlciArICclPC90ZD4nO1xuICAgICAgICAgICAgcyArPSAnPHRkPicgKyBudW1lcmFsKHBlcmNlbnRpbGUpLmZvcm1hdCgnMG8nKSArICc8L3RkPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgcyArPSAnPC90cj4nO1xuICAgIFxuICAgICAgICAkKCcjZWR1Y2F0aW9uLXRhYmxlJykuaHRtbChzKTtcbiAgICB9XG4gICAgXG4gICAgLy8gR0RQIGRhdGFcbiAgICAvL1xuICAgIGRyYXdHZHBEYXRhKCkge1xuICAgIFxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgXG4gICAgICAgIGdvb2dsZS5zZXRPbkxvYWRDYWxsYmFjayhmdW5jdGlvbigpIHtcbiAgICBcbiAgICAgICAgICAgIHZhciByZWdpb25JZHMgPSBzZWxmLnBhcmFtcy5yZWdpb25zLm1hcChmdW5jdGlvbihyZWdpb24pIHsgcmV0dXJuIHJlZ2lvbi5pZDsgfSk7XG4gICAgICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG4gICAgXG4gICAgICAgICAgICBjb250cm9sbGVyLmdldEdkcERhdGEocmVnaW9uSWRzLCBmdW5jdGlvbihkYXRhKSB7IFxuICAgIFxuICAgICAgICAgICAgICAgIHNlbGYuZHJhd0dkcENoYXJ0KHJlZ2lvbklkcywgZGF0YSk7XG4gICAgICAgICAgICAgICAgc2VsZi5kcmF3R2RwQ2hhbmdlQ2hhcnQocmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZHJhd0dkcENoYXJ0KHJlZ2lvbklkcywgZGF0YSkge1xuICAgIFxuICAgICAgICB2YXIgY2hhcnREYXRhID0gW107XG4gICAgXG4gICAgICAgIC8vIEhlYWRlclxuICAgICAgICAvL1xuICAgICAgICB2YXIgaGVhZGVyID0gWydZZWFyJ107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBoZWFkZXJbaSArIDFdID0gdGhpcy5wYXJhbXMucmVnaW9uc1tpXS5uYW1lO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGNoYXJ0RGF0YS5wdXNoKGhlYWRlcik7XG4gICAgXG4gICAgICAgIC8vIEZvcm1hdCB0aGUgZGF0YVxuICAgICAgICAvL1xuICAgICAgICB2YXIgbyA9IHt9O1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgIGlmIChvW2RhdGFbaV0ueWVhcl0gPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgb1tkYXRhW2ldLnllYXJdID0gW2RhdGFbaV0ueWVhcl07XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICBvW2RhdGFbaV0ueWVhcl0ucHVzaChwYXJzZUZsb2F0KGRhdGFbaV0ucGVyX2NhcGl0YV9nZHApKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gbykge1xuICAgICAgICAgICAgY2hhcnREYXRhLnB1c2gob1trZXldKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvLyBEcmF3IGNoYXJ0XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuZHJhd0xpbmVDaGFydCgncGVyLWNhcGl0YS1nZHAtY2hhcnQnLCBjaGFydERhdGEsIHtcbiAgICBcbiAgICAgICAgICAgIGN1cnZlVHlwZSA6ICdmdW5jdGlvbicsXG4gICAgICAgICAgICBsZWdlbmQgOiB7IHBvc2l0aW9uIDogJ2JvdHRvbScgfSxcbiAgICAgICAgICAgIHBvaW50U2hhcGUgOiAnc3F1YXJlJyxcbiAgICAgICAgICAgIHBvaW50U2l6ZSA6IDgsXG4gICAgICAgICAgICB0aXRsZSA6ICdQZXIgQ2FwaXRhIFJlYWwgR0RQIG92ZXIgVGltZScsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBkcmF3R2RwQ2hhbmdlQ2hhcnQocmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIHZhciBjaGFydERhdGEgPSBbXTtcbiAgICBcbiAgICAgICAgLy8gSGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBoZWFkZXIgPSBbJ1llYXInXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGhlYWRlcltpICsgMV0gPSB0aGlzLnBhcmFtcy5yZWdpb25zW2ldLm5hbWU7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgY2hhcnREYXRhLnB1c2goaGVhZGVyKTtcbiAgICBcbiAgICAgICAgLy8gRm9ybWF0IHRoZSBkYXRhXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBvID0ge307XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIFxuICAgICAgICAgICAgaWYgKG9bZGF0YVtpXS55ZWFyXSA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBvW2RhdGFbaV0ueWVhcl0gPSBbZGF0YVtpXS55ZWFyXTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIG9bZGF0YVtpXS55ZWFyXS5wdXNoKHBhcnNlRmxvYXQoZGF0YVtpXS5wZXJfY2FwaXRhX2dkcF9wZXJjZW50X2NoYW5nZSkgLyAxMDApO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvKSB7XG4gICAgICAgICAgICBjaGFydERhdGEucHVzaChvW2tleV0pO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8vIERyYXcgY2hhcnRcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5kcmF3TGluZUNoYXJ0KCdwZXItY2FwaXRhLWdkcC1jaGFuZ2UtY2hhcnQnLCBjaGFydERhdGEsIHtcbiAgICBcbiAgICAgICAgICAgIGN1cnZlVHlwZSA6ICdmdW5jdGlvbicsXG4gICAgICAgICAgICBsZWdlbmQgOiB7IHBvc2l0aW9uIDogJ2JvdHRvbScgfSxcbiAgICAgICAgICAgIHBvaW50U2hhcGUgOiAnc3F1YXJlJyxcbiAgICAgICAgICAgIHBvaW50U2l6ZSA6IDgsXG4gICAgICAgICAgICB0aXRsZSA6ICdBbm51YWwgQ2hhbmdlIGluIFBlciBDYXBpdGEgR0RQIG92ZXIgVGltZScsXG4gICAgICAgICAgICB2QXhpcyA6IHsgZm9ybWF0IDogJyMuIyUnIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICAvLyBPY2N1cGF0aW9uc1xuICAgIC8vXG4gICAgZHJhd09jY3VwYXRpb25zRGF0YSgpIHtcbiAgICBcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIFxuICAgICAgICBnb29nbGUuc2V0T25Mb2FkQ2FsbGJhY2soZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgcmVnaW9uSWRzID0gc2VsZi5wYXJhbXMucmVnaW9ucy5tYXAoZnVuY3Rpb24ocmVnaW9uKSB7IHJldHVybiByZWdpb24uaWQ7IH0pO1xuICAgICAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuICAgIFxuICAgICAgICAgICAgY29udHJvbGxlci5nZXRPY2N1cGF0aW9uc0RhdGEocmVnaW9uSWRzLCBmdW5jdGlvbihkYXRhKSB7IFxuICAgIFxuICAgICAgICAgICAgICAgIHNlbGYuZHJhd09jY3VwYXRpb25zVGFibGUocmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZHJhd09jY3VwYXRpb25zVGFibGUocmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIHZhciBzID0gJzx0cj48dGg+PC90aD4nO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcyArPSAnPHRoIGNvbHNwYW49XFwnMlxcJz4nICsgdGhpcy5wYXJhbXMucmVnaW9uc1tpXS5uYW1lICsgJzwvdGg+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvLyBTdWIgaGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHMgKz0gJzwvdHI+PHRyPjx0ZCBjbGFzcz1cXCdjb2x1bW4taGVhZGVyXFwnPjwvdGQ+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0ZCBjbGFzcz1cXCdjb2x1bW4taGVhZGVyXFwnPlBlcmNlbnQ8L3RkPjx0ZCBjbGFzcz1cXCdjb2x1bW4taGVhZGVyXFwnPlBlcmNlbnRpbGU8L3RkPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICBpZiAoKGkgJSByZWdpb25JZHMubGVuZ3RoKSA9PSAwKVxuICAgICAgICAgICAgICAgIHMgKz0gJzwvdHI+PHRyPjx0ZD4nICsgZGF0YVtpXS5vY2N1cGF0aW9uICsgJzwvdGQ+JzsgXG4gICAgXG4gICAgICAgICAgICB2YXIgdG90YWxSYW5rcyA9IHBhcnNlSW50KGRhdGFbaV0udG90YWxfcmFua3MpO1xuICAgICAgICAgICAgdmFyIHJhbmsgPSBwYXJzZUludChkYXRhW2ldLnBlcmNlbnRfZW1wbG95ZWRfcmFuayk7XG4gICAgICAgICAgICB2YXIgcGVyY2VudGlsZSA9IHBhcnNlSW50KCgodG90YWxSYW5rcyAtIHJhbmspIC8gdG90YWxSYW5rcykgKiAxMDApO1xuICAgIFxuICAgICAgICAgICAgcyArPSAnPHRkPicgKyBudW1lcmFsKGRhdGFbaV0ucGVyY2VudF9lbXBsb3llZCkuZm9ybWF0KCcwLjAnKSArICclPC90ZD4nO1xuICAgICAgICAgICAgcyArPSAnPHRkPicgKyBudW1lcmFsKHBlcmNlbnRpbGUpLmZvcm1hdCgnMG8nKSArICc8L3RkPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgcyArPSAnPC90cj4nO1xuICAgIFxuICAgICAgICAkKCcjb2NjdXBhdGlvbnMtdGFibGUnKS5odG1sKHMpO1xuICAgIH1cbiAgICBcbiAgICAvLyBQb3B1bGF0aW9uXG4gICAgLy9cbiAgICBkcmF3UG9wdWxhdGlvbkRhdGEoKSB7XG4gICAgXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBcbiAgICAgICAgZ29vZ2xlLnNldE9uTG9hZENhbGxiYWNrKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgICAgICAgICAgdmFyIHJlZ2lvbklkcyA9IHNlbGYucGFyYW1zLnJlZ2lvbnMubWFwKGZ1bmN0aW9uKHJlZ2lvbikgeyByZXR1cm4gcmVnaW9uLmlkOyB9KTtcbiAgICAgICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcbiAgICBcbiAgICAgICAgICAgIGNvbnRyb2xsZXIuZ2V0UG9wdWxhdGlvbkRhdGEocmVnaW9uSWRzLCBmdW5jdGlvbihkYXRhKSB7IFxuICAgIFxuICAgICAgICAgICAgICAgIHNlbGYuZHJhd1BvcHVsYXRpb25NYXAoKTtcbiAgICAgICAgICAgICAgICBzZWxmLmRyYXdQb3B1bGF0aW9uQ2hhcnQocmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgICAgICAgICBzZWxmLmRyYXdQb3B1bGF0aW9uQ2hhbmdlQ2hhcnQocmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZHJhd1BvcHVsYXRpb25DaGFydChyZWdpb25JZHMsIGRhdGEpIHtcbiAgICBcbiAgICAgICAgdmFyIGNoYXJ0RGF0YSA9IFtdO1xuICAgICAgICB2YXIgeWVhcjtcbiAgICBcbiAgICAgICAgLy8gSGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBoZWFkZXIgPSBbJ1llYXInXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGhlYWRlcltpICsgMV0gPSB0aGlzLnBhcmFtcy5yZWdpb25zW2ldLm5hbWU7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgY2hhcnREYXRhLnB1c2goaGVhZGVyKTtcbiAgICBcbiAgICAgICAgLy8gRGF0YVxuICAgICAgICAvL1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgIHZhciBtID0gKGkgJSByZWdpb25JZHMubGVuZ3RoKTtcbiAgICBcbiAgICAgICAgICAgIGlmIChtID09IDApIHtcbiAgICBcbiAgICAgICAgICAgICAgICB5ZWFyID0gW107XG4gICAgICAgICAgICAgICAgeWVhclswXSA9IGRhdGFbaV0ueWVhcjtcbiAgICAgICAgICAgICAgICBjaGFydERhdGEucHVzaCh5ZWFyKTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIHllYXJbbSArIDFdID0gcGFyc2VJbnQoZGF0YVtpXS5wb3B1bGF0aW9uKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICB0aGlzLmRyYXdMaW5lQ2hhcnQoJ3BvcHVsYXRpb24tY2hhcnQnLCBjaGFydERhdGEsIHtcbiAgICBcbiAgICAgICAgICAgIGN1cnZlVHlwZSA6ICdmdW5jdGlvbicsXG4gICAgICAgICAgICBsZWdlbmQgOiB7IHBvc2l0aW9uIDogJ2JvdHRvbScgfSxcbiAgICAgICAgICAgIHBvaW50U2hhcGUgOiAnc3F1YXJlJyxcbiAgICAgICAgICAgIHBvaW50U2l6ZSA6IDgsXG4gICAgICAgICAgICB0aXRsZSA6ICdQb3B1bGF0aW9uJyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRyYXdQb3B1bGF0aW9uQ2hhbmdlQ2hhcnQocmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIHZhciBjaGFydERhdGEgPSBbXTtcbiAgICAgICAgdmFyIHllYXI7XG4gICAgXG4gICAgICAgIC8vIEhlYWRlclxuICAgICAgICAvL1xuICAgICAgICB2YXIgaGVhZGVyID0gWydZZWFyJ107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBoZWFkZXJbaSArIDFdID0gdGhpcy5wYXJhbXMucmVnaW9uc1tpXS5uYW1lO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGNoYXJ0RGF0YS5wdXNoKGhlYWRlcik7XG4gICAgXG4gICAgICAgIC8vIERhdGFcbiAgICAgICAgLy9cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgbSA9IChpICUgcmVnaW9uSWRzLmxlbmd0aCk7XG4gICAgXG4gICAgICAgICAgICBpZiAobSA9PSAwKSB7XG4gICAgXG4gICAgICAgICAgICAgICAgeWVhciA9IFtdO1xuICAgICAgICAgICAgICAgIHllYXJbMF0gPSBkYXRhW2ldLnllYXI7XG4gICAgICAgICAgICAgICAgY2hhcnREYXRhLnB1c2goeWVhcik7XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICB5ZWFyW20gKyAxXSA9IHBhcnNlRmxvYXQoZGF0YVtpXS5wb3B1bGF0aW9uX3BlcmNlbnRfY2hhbmdlKSAvIDEwMDtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICB0aGlzLmRyYXdMaW5lQ2hhcnQoJ3BvcHVsYXRpb24tY2hhbmdlLWNoYXJ0JywgY2hhcnREYXRhLCB7XG4gICAgXG4gICAgICAgICAgICBjdXJ2ZVR5cGUgOiAnZnVuY3Rpb24nLFxuICAgICAgICAgICAgbGVnZW5kIDogeyBwb3NpdGlvbiA6ICdib3R0b20nIH0sXG4gICAgICAgICAgICBwb2ludFNoYXBlIDogJ3NxdWFyZScsXG4gICAgICAgICAgICBwb2ludFNpemUgOiA4LFxuICAgICAgICAgICAgdGl0bGUgOiAnUG9wdWxhdGlvbiBDaGFuZ2UnLFxuICAgICAgICAgICAgdkF4aXMgOiB7IGZvcm1hdCA6ICcjLiMlJyB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZHJhd1BvcHVsYXRpb25NYXAoKSB7XG4gICAgXG4gICAgICAgIHZhciBtYXAgPSBMLm1hcCgnbWFwJykuc2V0VmlldyhbNTEuNTA1LCAtMC4wOV0sIDEzKTtcbiAgICAgICAgbWFwLnNldFZpZXcodGhpcy5NQVBfSU5JVElBTF9DRU5URVIsIHRoaXMuTUFQX0lOSVRJQUxfWk9PTSk7XG5cbiAgICAgICAgdmFyIG15TGluZXMgPSBbe1xuICAgICAgICAgICAgXCJ0eXBlXCI6IFwiTGluZVN0cmluZ1wiLFxuICAgICAgICAgICAgXCJjb29yZGluYXRlc1wiOiBbWy0xMDAsIDQwXSwgWy0xMDUsIDQ1XSwgWy0xMTAsIDU1XV1cbiAgICAgICAgfSwge1xuICAgICAgICAgICAgXCJ0eXBlXCI6IFwiTGluZVN0cmluZ1wiLFxuICAgICAgICAgICAgXCJjb29yZGluYXRlc1wiOiBbWy0xMDUsIDQwXSwgWy0xMTAsIDQ1XSwgWy0xMTUsIDU1XV1cbiAgICAgICAgfV07XG4gICAgICAgIFxuICAgICAgICB2YXIgbXlTdHlsZSA9IHtcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjZmY3ODAwXCIsXG4gICAgICAgICAgICBcIndlaWdodFwiOiA1LFxuICAgICAgICAgICAgXCJvcGFjaXR5XCI6IDAuNjVcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIEwuZ2VvSnNvbihteUxpbmVzLCB7XG4gICAgICAgICAgICBzdHlsZTogbXlTdHlsZVxuICAgICAgICB9KS5hZGRUbyhtYXApO1xuICAgICAgICBcbiAgICAgICAgTC50aWxlTGF5ZXIoJ2h0dHBzOi8vYS50aWxlcy5tYXBib3guY29tL3YzL3NvY3JhdGEtYXBwcy5pYnAwbDg5OS97en0ve3h9L3t5fS5wbmcnKS5hZGRUbyhtYXApO1xuICAgIH1cbiAgICBcbiAgICAvLyBQbGFjZXMgaW4gcmVnaW9uXG4gICAgLy9cbiAgICBkcmF3UGxhY2VzSW5SZWdpb24ob25DbGlja1JlZ2lvbikge1xuICAgIFxuICAgICAgICBpZiAodGhpcy5wYXJhbXMucmVnaW9ucy5sZW5ndGggPT0gMCkgXG4gICAgICAgICAgICByZXR1cm47XG4gICAgXG4gICAgICAgIHZhciByZWdpb24gPSB0aGlzLnBhcmFtcy5yZWdpb25zWzBdO1xuICAgIFxuICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBcbiAgICAgICAgY29udHJvbGxlci5nZXRQbGFjZXNJblJlZ2lvbihyZWdpb24uaWQsIGZ1bmN0aW9uKGRhdGEpIHsgXG4gICAgXG4gICAgICAgICAgICBpZiAoZGF0YS5sZW5ndGggPT0gMClcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgXG4gICAgICAgICAgICAkKCcjcGxhY2VzLWluLXJlZ2lvbi1oZWFkZXInKS50ZXh0KCdQbGFjZXMgaW4gezB9Jy5mb3JtYXQocmVnaW9uLm5hbWUpKTtcbiAgICAgICAgICAgICQoJyNwbGFjZXMtaW4tcmVnaW9uLWhlYWRlcicpLnNsaWRlVG9nZ2xlKDEwMCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHNlbGYuZHJhd1BsYWNlc0luUmVnaW9uTGlzdChkYXRhLCBvbkNsaWNrUmVnaW9uKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRyYXdQbGFjZXNJblJlZ2lvbkxpc3QoZGF0YSwgb25DbGlja1JlZ2lvbikge1xuICAgIFxuICAgICAgICB2YXIgcyA9ICcnO1xuICAgIFxuICAgICAgICBpZiAoZGF0YS5sZW5ndGggPT0gMClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICBzICs9ICc8bGk+PGEgaHJlZj1cIic7XG4gICAgICAgICAgICBzICs9IHRoaXMuZ2V0U2VhcmNoUGFnZUZvclJlZ2lvbnNBbmRWZWN0b3JVcmwoZGF0YVtpXS5jaGlsZF9uYW1lKSArICdcIj4nO1xuICAgICAgICAgICAgcyArPSBkYXRhW2ldLmNoaWxkX25hbWU7XG4gICAgICAgICAgICBzICs9ICc8L2E+PC9saT4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgICQoJyNwbGFjZXMtaW4tcmVnaW9uJykuaHRtbChzKTtcbiAgICAgICAgJCgnI3BsYWNlcy1pbi1yZWdpb24nKS5zbGlkZVRvZ2dsZSgxMDApO1xuICAgIH1cbiAgICBcbiAgICAvLyBTaW1pbGFyIHJlZ2lvbnNcbiAgICAvL1xuICAgIGRyYXdTaW1pbGFyUmVnaW9ucyhvbkNsaWNrUmVnaW9uKSB7XG4gICAgXG4gICAgICAgIGlmICh0aGlzLnBhcmFtcy5yZWdpb25zLmxlbmd0aCA9PSAwKSBcbiAgICAgICAgICAgIHJldHVybjtcbiAgICBcbiAgICAgICAgdmFyIHJlZ2lvbiA9IHRoaXMucGFyYW1zLnJlZ2lvbnNbMF07XG4gICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIFxuICAgICAgICBjb250cm9sbGVyLmdldFNpbWlsYXJSZWdpb25zKHJlZ2lvbi5pZCwgZnVuY3Rpb24oZGF0YSkgeyBcbiAgICBcbiAgICAgICAgICAgIHNlbGYuZHJhd1NpbWlsYXJSZWdpb25zTGlzdChkYXRhLCBvbkNsaWNrUmVnaW9uKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRyYXdTaW1pbGFyUmVnaW9uc0xpc3QoZGF0YSwgb25DbGlja1JlZ2lvbikge1xuICAgICAgICBcbiAgICAgICAgdmFyIHMgPSAnJztcbiAgICAgICAgXG4gICAgICAgIGlmIChkYXRhLm1vc3Rfc2ltaWxhciA9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5tb3N0X3NpbWlsYXIubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgIHMgKz0gJzxsaT48YT48aSBjbGFzcz1cImZhIGZhLXBsdXNcIj48L2k+JyArIGRhdGEubW9zdF9zaW1pbGFyW2ldLm5hbWUgKyAnPC9hPjwvbGk+J1xuICAgICAgICB9XG4gICAgXG4gICAgICAgICQoJyNzaW1pbGFyLXJlZ2lvbnMnKS5odG1sKHMpO1xuICAgICAgICAkKCcjc2ltaWxhci1yZWdpb25zJykuc2xpZGVUb2dnbGUoMTAwKTtcbiAgICAgICAgXG4gICAgICAgICQoJyNzaW1pbGFyLXJlZ2lvbnMgbGkgYScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgICAgICAgICAgdmFyIGluZGV4ID0gJCh0aGlzKS5wYXJlbnQoKS5pbmRleCgpO1xuICAgICAgICAgICAgb25DbGlja1JlZ2lvbihkYXRhLm1vc3Rfc2ltaWxhcltpbmRleF0ubmFtZSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICAvLyBEcmF3IGNoYXJ0c1xuICAgIC8vXG4gICAgZHJhd0xpbmVDaGFydChjaGFydElkLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgXG4gICAgICAgIHZhciBkYXRhVGFibGUgPSBnb29nbGUudmlzdWFsaXphdGlvbi5hcnJheVRvRGF0YVRhYmxlKGRhdGEpO1xuICAgICAgICB2YXIgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uTGluZUNoYXJ0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNoYXJ0SWQpKTtcbiAgICBcbiAgICAgICAgY2hhcnQuZHJhdyhkYXRhVGFibGUsIG9wdGlvbnMpO1xuICAgIH1cbiAgICBcbiAgICBkcmF3U3RlcHBlZEFyZWFDaGFydChjaGFydElkLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgXG4gICAgICAgIHZhciBkYXRhVGFibGUgPSBnb29nbGUudmlzdWFsaXphdGlvbi5hcnJheVRvRGF0YVRhYmxlKGRhdGEpO1xuICAgICAgICB2YXIgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uU3RlcHBlZEFyZWFDaGFydChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjaGFydElkKSk7XG4gICAgXG4gICAgICAgIGNoYXJ0LmRyYXcoZGF0YVRhYmxlLCBvcHRpb25zKTtcbiAgICB9XG4gICAgXG4gICAgLy8gUGFnaW5nXG4gICAgLy9cbiAgICBmZXRjaE5leHRQYWdlKCkge1xuICAgIFxuICAgICAgICBpZiAodGhpcy5mZXRjaGluZyB8fCB0aGlzLmZldGNoZWRBbGwpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgXG4gICAgICAgIHRoaXMuZmV0Y2hpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLmluY3JlbWVudFBhZ2UoKTtcbiAgICBcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIFxuICAgICAgICAkLmFqYXgodGhpcy5nZXRTZWFyY2hSZXN1bHRzVXJsKCkpLmRvbmUoZnVuY3Rpb24oZGF0YSwgdGV4dFN0YXR1cywganFYSFIpIHtcbiAgICBcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGpxWEhSLnN0YXR1cyArICcgJyArIHRleHRTdGF0dXMpO1xuICAgIFxuICAgICAgICAgICAgaWYgKGpxWEhSLnN0YXR1cyA9PSAyMDQpIHsgLy8gbm8gY29udGVudFxuICAgIFxuICAgICAgICAgICAgICAgIHNlbGYuZGVjcmVtZW50UGFnZSgpO1xuICAgICAgICAgICAgICAgIHNlbGYuZmV0Y2hpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBzZWxmLmZldGNoZWRBbGwgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgICQoJy5kYXRhc2V0cycpLmFwcGVuZChkYXRhKTtcbiAgICAgICAgICAgIHNlbGYuZmV0Y2hpbmcgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGdldFNlYXJjaFBhZ2VGb3JSZWdpb25zQW5kVmVjdG9yVXJsKHJlZ2lvbnMsIHZlY3RvciwgcXVlcnlTdHJpbmcpIHtcbiAgICBcbiAgICAgICAgdmFyIHVybCA9ICcvJztcbiAgICBcbiAgICAgICAgaWYgKHR5cGVvZihyZWdpb25zKSA9PT0gJ3N0cmluZycpIHtcbiAgICBcbiAgICAgICAgICAgIHVybCArPSByZWdpb25zLnJlcGxhY2UoLywvZywgJycpLnJlcGxhY2UoLyAvZywgJ18nKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJlZ2lvbnMpKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgcmVnaW9uTmFtZXMgPSBbXTtcbiAgICBcbiAgICAgICAgICAgIHJlZ2lvbk5hbWVzID0gcmVnaW9ucy5tYXAoZnVuY3Rpb24ocmVnaW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlZ2lvbi5yZXBsYWNlKC8sL2csICcnKS5yZXBsYWNlKC8gL2csICdfJyk7XG4gICAgICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgICAgIHVybCArPSByZWdpb25OYW1lcy5qb2luKCdfdnNfJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgXG4gICAgICAgICAgICB1cmwgKz0gJ3NlYXJjaCc7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgaWYgKHZlY3RvcilcbiAgICAgICAgICAgIHVybCArPSAnLycgKyB2ZWN0b3I7XG4gICAgXG4gICAgICAgIGlmIChxdWVyeVN0cmluZykgXG4gICAgICAgICAgICB1cmwgKz0gcXVlcnlTdHJpbmc7XG4gICAgXG4gICAgICAgIHJldHVybiB1cmw7XG4gICAgfVxuICAgIFxuICAgIGdldFNlYXJjaFBhZ2VVcmwoKSB7XG4gICAgXG4gICAgICAgIGlmICgodGhpcy5wYXJhbXMucmVnaW9ucy5sZW5ndGggPiAwKSB8fCB0aGlzLnBhcmFtcy5hdXRvU3VnZ2VzdGVkUmVnaW9uKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgcmVnaW9uTmFtZXMgPSBbXTtcbiAgICBcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmFtcy5yZXNldFJlZ2lvbnMgPT0gZmFsc2UpIHtcbiAgICBcbiAgICAgICAgICAgICAgICByZWdpb25OYW1lcyA9IHRoaXMucGFyYW1zLnJlZ2lvbnMubWFwKGZ1bmN0aW9uKHJlZ2lvbikgeyBcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlZ2lvbi5uYW1lOyBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmFtcy5hdXRvU3VnZ2VzdGVkUmVnaW9uKVxuICAgICAgICAgICAgICAgIHJlZ2lvbk5hbWVzLnB1c2godGhpcy5wYXJhbXMuYXV0b1N1Z2dlc3RlZFJlZ2lvbik7XG4gICAgXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRTZWFyY2hQYWdlRm9yUmVnaW9uc0FuZFZlY3RvclVybChyZWdpb25OYW1lcywgdGhpcy5wYXJhbXMudmVjdG9yLCB0aGlzLmdldFNlYXJjaFF1ZXJ5U3RyaW5nKCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgIFxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U2VhcmNoUGFnZUZvclJlZ2lvbnNBbmRWZWN0b3JVcmwobnVsbCwgdGhpcy5wYXJhbXMudmVjdG9yLCB0aGlzLmdldFNlYXJjaFF1ZXJ5U3RyaW5nKCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGdldFNlYXJjaFJlc3VsdHNVcmwoKSB7XG4gICAgXG4gICAgICAgIHZhciBzZWFyY2hSZXN1bHRzVXJsID0gdGhpcy5wYXJhbXMucmVnaW9ucy5sZW5ndGggPT0gMCA/ICcvc2VhcmNoLXJlc3VsdHMnIDogJy4vc2VhcmNoLXJlc3VsdHMnOyBcbiAgICAgICAgdmFyIHVybCA9IHNlYXJjaFJlc3VsdHNVcmwgKyB0aGlzLmdldFNlYXJjaFF1ZXJ5U3RyaW5nKCk7IFxuICAgIFxuICAgICAgICByZXR1cm4gdXJsO1xuICAgIH1cbiAgICBcbiAgICBnZXRTZWFyY2hRdWVyeVN0cmluZygpIHtcbiAgICBcbiAgICAgICAgdmFyIHVybCA9ICc/cT0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMucGFyYW1zLnEpO1xuICAgIFxuICAgICAgICBpZiAodGhpcy5wYXJhbXMucGFnZSA+IDEpXG4gICAgICAgICAgICB1cmwgKz0gJyZwYWdlPScgKyB0aGlzLnBhcmFtcy5wYWdlO1xuICAgIFxuICAgICAgICBpZiAodGhpcy5wYXJhbXMuY2F0ZWdvcmllcy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgdXJsICs9ICcmY2F0ZWdvcmllcz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMucGFyYW1zLmNhdGVnb3JpZXMuam9pbignLCcpKTtcbiAgICBcbiAgICAgICAgaWYgKHRoaXMucGFyYW1zLmRvbWFpbnMubGVuZ3RoID4gMClcbiAgICAgICAgICAgIHVybCArPSAnJmRvbWFpbnM9JyArIGVuY29kZVVSSUNvbXBvbmVudCh0aGlzLnBhcmFtcy5kb21haW5zLmpvaW4oJywnKSk7XG4gICAgXG4gICAgICAgIGlmICh0aGlzLnBhcmFtcy5zdGFuZGFyZHMubGVuZ3RoID4gMClcbiAgICAgICAgICAgIHVybCArPSAnJnN0YW5kYXJkcz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMucGFyYW1zLnN0YW5kYXJkcy5qb2luKCcsJykpO1xuICAgIFxuICAgICAgICByZXR1cm4gdXJsO1xuICAgIH1cbiAgICBcbiAgICBpbmNyZW1lbnRQYWdlKCkge1xuICAgIFxuICAgICAgICB0aGlzLnBhcmFtcy5wYWdlKys7XG4gICAgfVxuICAgIFxuICAgIG5hdmlnYXRlKCkge1xuICAgIFxuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHRoaXMuZ2V0U2VhcmNoUGFnZVVybCgpO1xuICAgIH1cbiAgICBcbiAgICByZW1vdmVSZWdpb24ocmVnaW9uSW5kZXgpIHtcbiAgICBcbiAgICAgICAgdGhpcy5wYXJhbXMucmVnaW9ucy5zcGxpY2UocmVnaW9uSW5kZXgsIDEpOyAvLyByZW1vdmUgYXQgaW5kZXggaVxuICAgICAgICB0aGlzLnBhcmFtcy5wYWdlID0gMTtcbiAgICB9XG4gICAgXG4gICAgc2V0QXV0b1N1Z2dlc3RlZFJlZ2lvbihyZWdpb24sIHJlc2V0UmVnaW9ucykge1xuICAgIFxuICAgICAgICB0aGlzLnBhcmFtcy5hdXRvU3VnZ2VzdGVkUmVnaW9uID0gcmVnaW9uO1xuICAgICAgICB0aGlzLnBhcmFtcy5yZXNldFJlZ2lvbnMgPSByZXNldFJlZ2lvbnM7XG4gICAgICAgIHRoaXMucGFyYW1zLnBhZ2UgPSAxO1xuICAgIH1cbiAgICBcbiAgICB0b2dnbGVDYXRlZ29yeShjYXRlZ29yeSkge1xuICAgIFxuICAgICAgICB2YXIgaSA9IHRoaXMucGFyYW1zLmNhdGVnb3JpZXMuaW5kZXhPZihjYXRlZ29yeSk7XG4gICAgXG4gICAgICAgIGlmIChpID4gLTEpXG4gICAgICAgICAgICB0aGlzLnBhcmFtcy5jYXRlZ29yaWVzLnNwbGljZShpLCAxKTsgLy8gcmVtb3ZlIGF0IGluZGV4IGlcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5wYXJhbXMuY2F0ZWdvcmllcy5wdXNoKGNhdGVnb3J5KTtcbiAgICB9XG4gICAgXG4gICAgdG9nZ2xlRG9tYWluKGRvbWFpbikge1xuICAgIFxuICAgICAgICB2YXIgaSA9IHRoaXMucGFyYW1zLmRvbWFpbnMuaW5kZXhPZihkb21haW4pO1xuICAgIFxuICAgICAgICBpZiAoaSA+IC0xKVxuICAgICAgICAgICAgdGhpcy5wYXJhbXMuZG9tYWlucy5zcGxpY2UoaSwgMSk7IC8vIHJlbW92ZSBhdCBpbmRleCBpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMucGFyYW1zLmRvbWFpbnMucHVzaChkb21haW4pO1xuICAgIH1cbiAgICBcbiAgICB0b2dnbGVTdGFuZGFyZChzdGFuZGFyZCkge1xuICAgIFxuICAgICAgICB2YXIgaSA9IHRoaXMucGFyYW1zLnN0YW5kYXJkcy5pbmRleE9mKHN0YW5kYXJkKTtcbiAgICBcbiAgICAgICAgaWYgKGkgPiAtMSlcbiAgICAgICAgICAgIHRoaXMucGFyYW1zLnN0YW5kYXJkcy5zcGxpY2UoaSwgMSk7IC8vIHJlbW92ZSBhdCBpbmRleCBpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMucGFyYW1zLnN0YW5kYXJkcy5wdXNoKHN0YW5kYXJkKTtcbiAgICB9XG59Il19
//# sourceMappingURL=v4-search-page-controller.js.map
