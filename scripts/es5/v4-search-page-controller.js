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

            controller.getCategories().then(function (data) {

                var rg = data.results.map(function (result) {
                    return '<li><i class="fa ' + result.metadata.icon + '"></i>' + result.category + '</li>';
                });

                var s = rg.join('');

                $('#refine-menu-categories').html(s);
                self.attachCategoriesClickHandlers();
            }).catch(function (error) {
                return console.error(error);
            });
        });

        // Domains
        //
        this.attachDomainsClickHandlers();

        $('#refine-menu-domains-view-more').click(function () {

            var controller = new ApiController();

            controller.getDomains().then(function (data) {

                var rg = data.results.map(function (result) {
                    return '<li>' + result.domain + '</li>';
                });

                var s = rg.join('');

                $('#refine-menu-domains').html(s);
                self.attachDomainsClickHandlers();
            }).catch(function (error) {
                return console.error(error);
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
        this.drawPlacesInRegion();
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
            var _this = this;

            google.setOnLoadCallback(function () {

                var regionIds = _this.params.regions.map(function (region) {
                    return region.id;
                });
                var controller = new ApiController();

                controller.getPopulationData(regionIds, function (data) {

                    _this.drawPopulationMap();
                    _this.drawPopulationChart(regionIds, data);
                    _this.drawPopulationChangeChart(regionIds, data);
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

            var map = L.map('map', {
                zoomControl: false
            });

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
        value: function drawPlacesInRegion() {
            var _this2 = this;

            if (this.params.regions.length == 0) return;

            var region = this.params.regions[0];

            switch (region.type) {

                case 'nation':
                    return;

                case 'state':

                    this.drawPlacesInStateForRegion(region.id, region) // the region is a state
                    .then(function (response) {

                        if (response.length == 0) return;

                        $('#places-in-region-header').text('Places in {0}'.format(region.name));
                        $('#places-in-region-header').slideToggle(100);

                        _this2.drawPlacesInRegionList(response);
                    }).catch(function (error) {
                        return console.error(error);
                    });

                default:

                    var controller = new ApiController();

                    controller.getParentState(region).then(function (response) {

                        if (response.length == 0) return;

                        var state = response[0];

                        _this2.drawPlacesInStateForRegion(state.parent_id, region).then(function (response) {

                            if (response.length == 0) return;

                            $('#places-in-region-header').text('Places in {0}'.format(state.parent_name));
                            $('#places-in-region-header').slideToggle(100);

                            _this2.drawPlacesInRegionList(response);
                        }).catch(function (error) {
                            return console.error(error);
                        });
                    });
            }
        }
    }, {
        key: 'drawPlacesInStateForRegion',
        value: function drawPlacesInStateForRegion(stateId, region) {

            var controller = new ApiController();

            switch (region.type) {

                case 'county':
                    return controller.getCountiesInState(stateId);
                case 'msa':
                    return controller.getMetrosInState(stateId);
                case 'place':
                    return controller.getPlacesInState(stateId);
                case 'state':

                    var placesPromise = controller.getPlacesInState(stateId);
                    var countiesPromise = controller.getCountiesInState(stateId);

                    return Promise.all([placesPromise, countiesPromise]).then(function (values) {
                        return Promise.resolve(values[0].concat(values[1]));
                    }).catch(function (error) {
                        return console.error(error);
                    });

                default:
                    return Promise.resolve([]);
            }
        }
    }, {
        key: 'drawPlacesInRegionList',
        value: function drawPlacesInRegionList(data) {

            var s = '';

            if (data.length == 0) return;

            var count = 0;

            for (var i = 0; i < data.length; i++) {

                if (this.isRegionIdContainedInCurrentRegions(data[i].child_id)) continue;

                s += '<li><a href="';
                s += this.getSearchPageForRegionsAndVectorUrl(data[i].child_name) + '">';
                s += data[i].child_name;
                s += '</a></li>';

                if (count == 4) break;

                count++;
            }

            $('#places-in-region').html(s);
            $('#places-in-region').slideToggle(100);
        }
    }, {
        key: 'isRegionIdContainedInCurrentRegions',
        value: function isRegionIdContainedInCurrentRegions(regionId) {

            for (var j = 0; j < this.params.regions.length; j++) {

                if (regionId == this.params.regions[j].id) return true;
            }

            return false;
        }

        // Similar regions
        //

    }, {
        key: 'drawSimilarRegions',
        value: function drawSimilarRegions(onClickRegion) {
            var _this3 = this;

            if (this.params.regions.length == 0) return;

            var region = this.params.regions[0];
            var controller = new ApiController();

            controller.getSimilarRegions(region.id).then(function (data) {
                return _this3.drawSimilarRegionsList(data, onClickRegion);
            }).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'drawSimilarRegionsList',
        value: function drawSimilarRegionsList(data, onClickRegion) {

            var s = '';

            if (data.most_similar == undefined) return;

            var count = 0;

            for (var i = 0; i < data.most_similar.length; i++) {

                if (this.isRegionIdContainedInCurrentRegions(data.most_similar[i].id)) continue;

                s += '<li><a><i class="fa fa-plus"></i>' + data.most_similar[i].name + '</a></li>';

                if (count == 4) break;

                count++;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Y0LXNlYXJjaC1wYWdlLWNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBQU0sb0JBQW9CO0FBRXRCLGFBRkUsb0JBQW9CLENBRVYsTUFBTSxFQUFFOzhCQUZsQixvQkFBb0I7O0FBSWxCLFlBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzlDLFlBQUksQ0FBQyxnQkFBZ0IsR0FBRyxHQUFHLENBQUM7O0FBRTVCLFlBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLFlBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0FBQ3RCLFlBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO0FBQ3hCLFlBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDOztBQUV0QixZQUFJLElBQUksR0FBRyxJQUFJOzs7O0FBQUMsQUFJaEIsU0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxZQUFXOztBQUVwQyxhQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDekMsYUFBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUM1RixhQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN6QyxDQUFDLENBQUM7O0FBRUgsU0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxZQUFXOztBQUVwQyxhQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDNUMsYUFBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFB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QUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFNUMsZ0JBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQUMsaUJBRWpDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUN4Qzs7O3VDQUVjLFFBQVEsRUFBRTs7QUFFckIsZ0JBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFaEQsZ0JBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQUMsaUJBRW5DLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUM1Qzs7O1dBL3FDQyxvQkFBb0IiLCJmaWxlIjoidjQtc2VhcmNoLXBhZ2UtY29udHJvbGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFNlYXJjaFBhZ2VDb250cm9sbGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuXG4gICAgICAgIHRoaXMuTUFQX0lOSVRJQUxfQ0VOVEVSID0gWzM3LjE2NjksIC05NS45NjY5XTtcbiAgICAgICAgdGhpcy5NQVBfSU5JVElBTF9aT09NID0gNC4wO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBwYXJhbXM7XG4gICAgICAgIHRoaXMuZmV0Y2hpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5mZXRjaGVkQWxsID0gZmFsc2U7XG4gICAgICAgIHRoaXMubW9zdFNpbWlsYXIgPSBbXTtcbiAgICBcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIFxuICAgICAgICAvLyBSZWZpbmUgbWVudXNcbiAgICAgICAgLy9cbiAgICAgICAgJCgnLnJlZmluZS1saW5rJykubW91c2VlbnRlcihmdW5jdGlvbigpIHtcbiAgICBcbiAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3JlZmluZS1saW5rLXNlbGVjdGVkJyk7XG4gICAgICAgICAgICAkKHRoaXMpLmNoaWxkcmVuKCdzcGFuJykuY2hpbGRyZW4oJ2knKS5yZW1vdmVDbGFzcygnZmEtY2FyZXQtZG93bicpLmFkZENsYXNzKCdmYS1jYXJldC11cCcpO1xuICAgICAgICAgICAgJCh0aGlzKS5jaGlsZHJlbigndWwnKS5zbGlkZURvd24oMTAwKTtcbiAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICQoJy5yZWZpbmUtbGluaycpLm1vdXNlbGVhdmUoZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdyZWZpbmUtbGluay1zZWxlY3RlZCcpO1xuICAgICAgICAgICAgJCh0aGlzKS5jaGlsZHJlbignc3BhbicpLmNoaWxkcmVuKCdpJykucmVtb3ZlQ2xhc3MoJ2ZhLWNhcmV0LXVwJykuYWRkQ2xhc3MoJ2ZhLWNhcmV0LWRvd24nKTtcbiAgICAgICAgICAgICQodGhpcykuY2hpbGRyZW4oJ3VsJykuc2xpZGVVcCgxMDApO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBDYXRlZ29yaWVzXG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuYXR0YWNoQ2F0ZWdvcmllc0NsaWNrSGFuZGxlcnMoKTtcblxuICAgICAgICAkKCcjcmVmaW5lLW1lbnUtY2F0ZWdvcmllcy12aWV3LW1vcmUnKS5jbGljayhmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuXG4gICAgICAgICAgICBjb250cm9sbGVyLmdldENhdGVnb3JpZXMoKVxuICAgICAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciByZyA9IGRhdGEucmVzdWx0cy5tYXAoZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJzxsaT48aSBjbGFzcz1cImZhICcgKyByZXN1bHQubWV0YWRhdGEuaWNvbiArICdcIj48L2k+JyArIHJlc3VsdC5jYXRlZ29yeSArICc8L2xpPic7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBzID0gcmcuam9pbignJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgJCgnI3JlZmluZS1tZW51LWNhdGVnb3JpZXMnKS5odG1sKHMpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmF0dGFjaENhdGVnb3JpZXNDbGlja0hhbmRsZXJzKCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBEb21haW5zXG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuYXR0YWNoRG9tYWluc0NsaWNrSGFuZGxlcnMoKTtcblxuICAgICAgICAkKCcjcmVmaW5lLW1lbnUtZG9tYWlucy12aWV3LW1vcmUnKS5jbGljayhmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuXG4gICAgICAgICAgICBjb250cm9sbGVyLmdldERvbWFpbnMoKVxuICAgICAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciByZyA9IGRhdGEucmVzdWx0cy5tYXAoZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJzxsaT4nICsgcmVzdWx0LmRvbWFpbiArICc8L2xpPic7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBzID0gcmcuam9pbignJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgJCgnI3JlZmluZS1tZW51LWRvbWFpbnMnKS5odG1sKHMpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmF0dGFjaERvbWFpbnNDbGlja0hhbmRsZXJzKCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIFN0YW5kYXJkc1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLmF0dGFjaFN0YW5kYXJkc0NsaWNrSGFuZGxlcnMoKTtcbiAgICBcbiAgICAgICAgLy8gVG9rZW5zXG4gICAgICAgIC8vXG4gICAgICAgICQoJy5yZWdpb24tdG9rZW4gLmZhLXRpbWVzLWNpcmNsZScpLmNsaWNrKGZ1bmN0aW9uKCkgeyBcbiAgICBcbiAgICAgICAgICAgIHNlbGYucmVtb3ZlUmVnaW9uKCQodGhpcykucGFyZW50KCkuaW5kZXgoKSk7XG4gICAgICAgICAgICBzZWxmLm5hdmlnYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICAkKCcuY2F0ZWdvcnktdG9rZW4gLmZhLXRpbWVzLWNpcmNsZScpLmNsaWNrKGZ1bmN0aW9uKCkgeyBcbiAgICBcbiAgICAgICAgICAgIHNlbGYudG9nZ2xlQ2F0ZWdvcnkoJCh0aGlzKS5wYXJlbnQoKS50ZXh0KCkudG9Mb3dlckNhc2UoKS50cmltKCkpO1xuICAgICAgICAgICAgc2VsZi5uYXZpZ2F0ZSgpO1xuICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgJCgnLmRvbWFpbi10b2tlbiAuZmEtdGltZXMtY2lyY2xlJykuY2xpY2soZnVuY3Rpb24oKSB7IFxuICAgIFxuICAgICAgICAgICAgc2VsZi50b2dnbGVEb21haW4oJCh0aGlzKS5wYXJlbnQoKS50ZXh0KCkudG9Mb3dlckNhc2UoKS50cmltKCkpO1xuICAgICAgICAgICAgc2VsZi5uYXZpZ2F0ZSgpO1xuICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgJCgnLnN0YW5kYXJkLXRva2VuIC5mYS10aW1lcy1jaXJjbGUnKS5jbGljayhmdW5jdGlvbigpIHsgXG4gICAgXG4gICAgICAgICAgICBzZWxmLnRvZ2dsZVN0YW5kYXJkKCQodGhpcykucGFyZW50KCkudGV4dCgpLnRvTG93ZXJDYXNlKCkudHJpbSgpKTtcbiAgICAgICAgICAgIHNlbGYubmF2aWdhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgXG4gICAgICAgIC8vIEluZmluaXRlIHNjcm9sbCBzZWFyY2ggcmVzdWx0c1xuICAgICAgICAvL1xuICAgICAgICAkKHdpbmRvdykub24oJ3Njcm9sbCcsIGZ1bmN0aW9uKCkge1xuICAgIFxuICAgICAgICAgICAgdmFyIGJvdHRvbU9mZnNldFRvQmVnaW5SZXF1ZXN0ID0gMTAwMDtcbiAgICBcbiAgICAgICAgICAgIGlmICgkKHdpbmRvdykuc2Nyb2xsVG9wKCkgPj0gJChkb2N1bWVudCkuaGVpZ2h0KCkgLSAkKHdpbmRvdykuaGVpZ2h0KCkgLSBib3R0b21PZmZzZXRUb0JlZ2luUmVxdWVzdCkge1xuICAgICAgICAgICAgICAgIHNlbGYuZmV0Y2hOZXh0UGFnZSgpO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICB9KS5zY3JvbGwoKTtcbiAgICBcbiAgICAgICAgLy8gQWRkIGxvY2F0aW9uXG4gICAgICAgIC8vXG4gICAgICAgIG5ldyBBdXRvU3VnZ2VzdFJlZ2lvbkNvbnRyb2xsZXIoJy5hZGQtcmVnaW9uIGlucHV0W3R5cGU9XCJ0ZXh0XCJdJywgJy5hZGQtcmVnaW9uIHVsJywgZnVuY3Rpb24ocmVnaW9uKSB7XG4gICAgXG4gICAgICAgICAgICBzZWxmLnNldEF1dG9TdWdnZXN0ZWRSZWdpb24ocmVnaW9uLCBmYWxzZSk7XG4gICAgICAgICAgICBzZWxmLm5hdmlnYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICAkKCcuYWRkLXJlZ2lvbiAuZmEtcGx1cycpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgICAgICAgICAgJCgnLmFkZC1yZWdpb24gaW5wdXRbdHlwZT1cInRleHRcIl0nKS5mb2N1cygpO1xuICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgLy8gU2ltaWxhciByZWdpb25zXG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuZHJhd1NpbWlsYXJSZWdpb25zKGZ1bmN0aW9uKHJlZ2lvbikge1xuICAgIFxuICAgICAgICAgICAgc2VsZi5zZXRBdXRvU3VnZ2VzdGVkUmVnaW9uKHJlZ2lvbiwgZmFsc2UpO1xuICAgICAgICAgICAgc2VsZi5uYXZpZ2F0ZSgpO1xuICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgLy8gUGxhY2VzIGluIHJlZ2lvblxuICAgICAgICAvL1xuICAgICAgICB0aGlzLmRyYXdQbGFjZXNJblJlZ2lvbigpO1xuICAgIH1cblxuICAgIC8vIFB1YmxpYyBtZXRob2RzXG4gICAgLy9cbiAgICBhdHRhY2hDYXRlZ29yaWVzQ2xpY2tIYW5kbGVycygpIHtcbiAgICBcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIFxuICAgICAgICAkKCcjcmVmaW5lLW1lbnUtY2F0ZWdvcmllcyBsaTpub3QoLnJlZmluZS12aWV3LW1vcmUpJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICAgICAgICBzZWxmLnRvZ2dsZUNhdGVnb3J5KCQodGhpcykudGV4dCgpLnRvTG93ZXJDYXNlKCkudHJpbSgpKTtcbiAgICAgICAgICAgIHNlbGYubmF2aWdhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGF0dGFjaERvbWFpbnNDbGlja0hhbmRsZXJzKCkge1xuICAgIFxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIFxuICAgICAgICAkKCcjcmVmaW5lLW1lbnUtZG9tYWlucyBsaTpub3QoLnJlZmluZS12aWV3LW1vcmUpJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgZG9tYWluID0gJCh0aGlzKS50ZXh0KCkudG9Mb3dlckNhc2UoKS50cmltKCk7XG4gICAgXG4gICAgICAgICAgICBzZWxmLnRvZ2dsZURvbWFpbihkb21haW4pO1xuICAgICAgICAgICAgc2VsZi5uYXZpZ2F0ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgYXR0YWNoU3RhbmRhcmRzQ2xpY2tIYW5kbGVycygpIHtcbiAgICBcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBcbiAgICAgICAgJCgnI3JlZmluZS1tZW51LXN0YW5kYXJkcyBsaScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgICAgICAgICAgdmFyIHN0YW5kYXJkID0gJCh0aGlzKS50ZXh0KCkudG9Mb3dlckNhc2UoKS50cmltKCk7XG4gICAgXG4gICAgICAgICAgICBzZWxmLnRvZ2dsZVN0YW5kYXJkKHN0YW5kYXJkKTtcbiAgICAgICAgICAgIHNlbGYubmF2aWdhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRlY3JlbWVudFBhZ2UoKSB7XG4gICAgXG4gICAgICAgIHRoaXMucGFyYW1zLnBhZ2UtLTtcbiAgICB9XG4gICAgXG4gICAgLy8gQ29zdCBvZiBsaXZpbmdcbiAgICAvL1xuICAgIGRyYXdDb3N0T2ZMaXZpbmdEYXRhKCkge1xuICAgIFxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgXG4gICAgICAgIGdvb2dsZS5zZXRPbkxvYWRDYWxsYmFjayhmdW5jdGlvbigpIHtcbiAgICBcbiAgICAgICAgICAgIHZhciByZWdpb25JZHMgPSBzZWxmLnBhcmFtcy5yZWdpb25zLm1hcChmdW5jdGlvbihyZWdpb24pIHsgcmV0dXJuIHJlZ2lvbi5pZDsgfSk7XG4gICAgICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG4gICAgXG4gICAgICAgICAgICBjb250cm9sbGVyLmdldENvc3RPZkxpdmluZ0RhdGEocmVnaW9uSWRzLCBmdW5jdGlvbihkYXRhKSB7IFxuICAgIFxuICAgICAgICAgICAgICAgIHNlbGYuZHJhd0Nvc3RPZkxpdmluZ0NoYXJ0KHJlZ2lvbklkcywgZGF0YSk7XG4gICAgICAgICAgICAgICAgc2VsZi5kcmF3Q29zdE9mTGl2aW5nVGFibGUocmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZHJhd0Nvc3RPZkxpdmluZ0NoYXJ0KHJlZ2lvbklkcywgZGF0YSkge1xuICAgIFxuICAgICAgICB0aGlzLmRyYXdDb3N0T2ZMaXZpbmdDaGFydEZvckNvbXBvbmVudCgnY29zdC1vZi1saXZpbmctYWxsLWNoYXJ0JywgJ0FsbCcsIHJlZ2lvbklkcywgZGF0YSk7XG4gICAgICAgIHRoaXMuZHJhd0Nvc3RPZkxpdmluZ0NoYXJ0Rm9yQ29tcG9uZW50KCdjb3N0LW9mLWxpdmluZy1nb29kcy1jaGFydCcsICdHb29kcycsIHJlZ2lvbklkcywgZGF0YSk7XG4gICAgICAgIHRoaXMuZHJhd0Nvc3RPZkxpdmluZ0NoYXJ0Rm9yQ29tcG9uZW50KCdjb3N0LW9mLWxpdmluZy1yZW50cy1jaGFydCcsICdSZW50cycsIHJlZ2lvbklkcywgZGF0YSk7XG4gICAgICAgIHRoaXMuZHJhd0Nvc3RPZkxpdmluZ0NoYXJ0Rm9yQ29tcG9uZW50KCdjb3N0LW9mLWxpdmluZy1vdGhlci1jaGFydCcsICdPdGhlcicsIHJlZ2lvbklkcywgZGF0YSk7XG4gICAgfVxuICAgIFxuICAgIGRyYXdDb3N0T2ZMaXZpbmdDaGFydEZvckNvbXBvbmVudChpZCwgY29tcG9uZW50LCByZWdpb25JZHMsIGRhdGEpIHtcbiAgICBcbiAgICAgICAgdmFyIGNoYXJ0RGF0YSA9IFtdXG4gICAgXG4gICAgICAgIC8vIEhlYWRlclxuICAgICAgICAvL1xuICAgICAgICB2YXIgaGVhZGVyID0gWydZZWFyJ107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBoZWFkZXJbaSArIDFdID0gdGhpcy5wYXJhbXMucmVnaW9uc1tpXS5uYW1lO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGNoYXJ0RGF0YS5wdXNoKGhlYWRlcik7XG4gICAgXG4gICAgICAgIC8vIEZvcm1hdCB0aGUgZGF0YVxuICAgICAgICAvL1xuICAgICAgICB2YXIgbyA9IHt9O1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgIGlmIChkYXRhW2ldLmNvbXBvbmVudCAhPSBjb21wb25lbnQpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgXG4gICAgICAgICAgICBpZiAob1tkYXRhW2ldLnllYXJdID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG9bZGF0YVtpXS55ZWFyXSA9IFtkYXRhW2ldLnllYXJdO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgb1tkYXRhW2ldLnllYXJdLnB1c2gocGFyc2VGbG9hdChkYXRhW2ldLmluZGV4KSk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgZm9yICh2YXIga2V5IGluIG8pIHtcbiAgICAgICAgICAgIGNoYXJ0RGF0YS5wdXNoKG9ba2V5XSk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgdGhpcy5kcmF3TGluZUNoYXJ0KGlkLCBjaGFydERhdGEsIHtcbiAgICBcbiAgICAgICAgICAgIGN1cnZlVHlwZSA6ICdmdW5jdGlvbicsXG4gICAgICAgICAgICBsZWdlbmQgOiB7IHBvc2l0aW9uIDogJ2JvdHRvbScgfSxcbiAgICAgICAgICAgIHBvaW50U2hhcGUgOiAnc3F1YXJlJyxcbiAgICAgICAgICAgIHBvaW50U2l6ZSA6IDgsXG4gICAgICAgICAgICB0aXRsZSA6IGNvbXBvbmVudCxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRyYXdDb3N0T2ZMaXZpbmdUYWJsZShyZWdpb25JZHMsIGRhdGEpIHtcbiAgICBcbiAgICAgICAgLy8gRm9ybWF0IHRoZSBkYXRhXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBjb21wb25lbnRzID0gWydBbGwnLCAnR29vZHMnLCAnT3RoZXInLCAnUmVudHMnXTtcbiAgICAgICAgdmFyIHJvd3MgPSBbXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb21wb25lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgY29tcG9uZW50ID0gY29tcG9uZW50c1tpXTtcbiAgICAgICAgICAgIHZhciByb3cgPSBbY29tcG9uZW50XTtcbiAgICBcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcmVnaW9uSWRzLmxlbmd0aDsgaisrKSB7XG4gICAgXG4gICAgICAgICAgICAgICAgdmFyIG8gPSB0aGlzLmdldExhdGVzdENvc3RPZkxpdmluZyhkYXRhLCByZWdpb25JZHNbal0sIGNvbXBvbmVudCk7XG4gICAgXG4gICAgICAgICAgICAgICAgcm93LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBpbmRleCA6IChvICE9IG51bGwpID8gcGFyc2VGbG9hdChvLmluZGV4KSA6ICdOQScsXG4gICAgICAgICAgICAgICAgICAgIHBlcmNlbnRpbGUgOiAobyAhPSBudWxsKSA/IHRoaXMuZ2V0UGVyY2VudGlsZShvLnJhbmssIG8udG90YWxfcmFua3MpIDogJ05BJyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIHJvd3MucHVzaChyb3cpO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8vIEhlYWRlclxuICAgICAgICAvL1xuICAgICAgICB2YXIgcyA9ICc8dHI+PHRoPjwvdGg+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0aCBjb2xzcGFuPVxcJzJcXCc+JyArIHRoaXMucGFyYW1zLnJlZ2lvbnNbaV0ubmFtZSArICc8L3RoPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgLy8gU3ViIGhlYWRlclxuICAgICAgICAvL1xuICAgICAgICBzICs9ICc8L3RyPjx0cj48dGQgY2xhc3M9XFwnY29sdW1uLWhlYWRlclxcJz48L3RkPic7XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzICs9ICc8dGQgY2xhc3M9XFwnY29sdW1uLWhlYWRlclxcJz5WYWx1ZTwvdGQ+PHRkIGNsYXNzPVxcJ2NvbHVtbi1oZWFkZXJcXCc+UGVyY2VudGlsZTwvdGQ+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBzICs9ICc8L3RyPic7XG4gICAgICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJvd3MubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgIHZhciByb3cgPSByb3dzW2ldO1xuICAgIFxuICAgICAgICAgICAgcyArPSAnPHRyPic7XG4gICAgICAgICAgICBzICs9ICc8dGQ+JyArIHJvd1swXSArICc8L3RkPic7XG4gICAgXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMTsgaiA8IHJvdy5sZW5ndGg7IGorKykge1xuICAgIFxuICAgICAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgcm93W2pdLmluZGV4ICsgJzwvdGQ+JztcbiAgICAgICAgICAgICAgICBzICs9ICc8dGQ+JyArIHJvd1tqXS5wZXJjZW50aWxlICsgJzwvdGQ+JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcyArPSAnPC90cj4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgICQoJyNjb3N0LW9mLWxpdmluZy10YWJsZScpLmh0bWwocyk7XG4gICAgfVxuICAgIFxuICAgIGdldFBlcmNlbnRpbGUocmFuaywgdG90YWxSYW5rcykge1xuICAgIFxuICAgICAgICB2YXIgdG90YWxSYW5rcyA9IHBhcnNlSW50KHRvdGFsUmFua3MpO1xuICAgICAgICB2YXIgcmFuayA9IHBhcnNlSW50KHJhbmspO1xuICAgICAgICB2YXIgcGVyY2VudGlsZSA9IHBhcnNlSW50KCgodG90YWxSYW5rcyAtIHJhbmspIC8gdG90YWxSYW5rcykgKiAxMDApO1xuICAgIFxuICAgICAgICByZXR1cm4gbnVtZXJhbChwZXJjZW50aWxlKS5mb3JtYXQoJzBvJyk7XG4gICAgfVxuICAgIFxuICAgIGdldExhdGVzdENvc3RPZkxpdmluZyhkYXRhLCByZWdpb25JZCwgY29tcG9uZW50KSB7XG4gICAgXG4gICAgICAgIHZhciBkYXR1bSA9IG51bGw7XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIFxuICAgICAgICAgICAgaWYgKGRhdGFbaV0uaWQgIT0gcmVnaW9uSWQpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgXG4gICAgICAgICAgICBpZiAoZGF0YVtpXS5jb21wb25lbnQgIT0gY29tcG9uZW50KVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgIFxuICAgICAgICAgICAgaWYgKGRhdHVtID09IG51bGwpIHtcbiAgICBcbiAgICAgICAgICAgICAgICBkYXR1bSA9IGRhdGFbaV07XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICBpZiAocGFyc2VJbnQoZGF0YVtpXS55ZWFyKSA8PSBwYXJzZUludChkYXR1bS55ZWFyKSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICBcbiAgICAgICAgICAgIGRhdHVtID0gZGF0YVtpXTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGRhdHVtO1xuICAgIH1cbiAgICBcbiAgICAvLyBFYXJuaW5nc1xuICAgIC8vXG4gICAgZHJhd0Vhcm5pbmdzRGF0YSgpIHtcbiAgICBcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIFxuICAgICAgICBnb29nbGUuc2V0T25Mb2FkQ2FsbGJhY2soZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgcmVnaW9uSWRzID0gc2VsZi5wYXJhbXMucmVnaW9ucy5tYXAoZnVuY3Rpb24ocmVnaW9uKSB7IHJldHVybiByZWdpb24uaWQ7IH0pO1xuICAgICAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuICAgIFxuICAgICAgICAgICAgY29udHJvbGxlci5nZXRFYXJuaW5nc0RhdGEocmVnaW9uSWRzLCBmdW5jdGlvbihkYXRhKSB7IFxuICAgIFxuICAgICAgICAgICAgICAgIHNlbGYuZHJhd0Vhcm5pbmdzQ2hhcnQocmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgICAgICAgICBzZWxmLmRyYXdFYXJuaW5nc1RhYmxlKHJlZ2lvbklkcywgZGF0YSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRyYXdFYXJuaW5nc0NoYXJ0KHJlZ2lvbklkcywgZGF0YSkge1xuICAgIFxuICAgICAgICB2YXIgZWFybmluZ3MgPSBbXTtcbiAgICBcbiAgICAgICAgLy8gSGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBoZWFkZXIgPSBbJ0VkdWNhdGlvbiBMZXZlbCddO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaGVhZGVyW2kgKyAxXSA9IHRoaXMucGFyYW1zLnJlZ2lvbnNbaV0ubmFtZTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBlYXJuaW5ncy5wdXNoKGhlYWRlcik7XG4gICAgXG4gICAgICAgIC8vIExlc3MgdGhhbiBoaWdoIHNjaG9vbFxuICAgICAgICAvL1xuICAgICAgICB2YXIgc29tZUhpZ2hTY2hvb2xFYXJuaW5ncyA9IFsnU29tZSBIaWdoIFNjaG9vbCddO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc29tZUhpZ2hTY2hvb2xFYXJuaW5nc1tpICsgMV0gPSBwYXJzZUludChkYXRhW2ldLm1lZGlhbl9lYXJuaW5nc19sZXNzX3RoYW5faGlnaF9zY2hvb2wpO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGVhcm5pbmdzLnB1c2goc29tZUhpZ2hTY2hvb2xFYXJuaW5ncyk7XG4gICAgXG4gICAgICAgIC8vIEhpZ2ggc2Nob29sXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBoaWdoU2Nob29sRWFybmluZ3MgPSBbJ0hpZ2ggU2Nob29sJ107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBoaWdoU2Nob29sRWFybmluZ3NbaSArIDFdID0gcGFyc2VJbnQoZGF0YVtpXS5tZWRpYW5fZWFybmluZ3NfaGlnaF9zY2hvb2wpO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGVhcm5pbmdzLnB1c2goaGlnaFNjaG9vbEVhcm5pbmdzKTtcbiAgICBcbiAgICAgICAgLy8gU29tZSBjb2xsZWdlXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBzb21lQ29sbGVnZUVhcm5pbmdzID0gWydTb21lIENvbGxlZ2UnXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHNvbWVDb2xsZWdlRWFybmluZ3NbaSArIDFdID0gcGFyc2VJbnQoZGF0YVtpXS5tZWRpYW5fZWFybmluZ3Nfc29tZV9jb2xsZWdlX29yX2Fzc29jaWF0ZXMpO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGVhcm5pbmdzLnB1c2goc29tZUNvbGxlZ2VFYXJuaW5ncyk7XG4gICAgXG4gICAgICAgIC8vIEJhY2hlbG9yJ3NcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGJhY2hlbG9yc0Vhcm5pbmdzID0gWydCYWNoZWxvclxcJ3MnXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGJhY2hlbG9yc0Vhcm5pbmdzW2kgKyAxXSA9IHBhcnNlSW50KGRhdGFbaV0ubWVkaWFuX2Vhcm5pbmdzX2JhY2hlbG9yX2RlZ3JlZSk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgZWFybmluZ3MucHVzaChiYWNoZWxvcnNFYXJuaW5ncyk7XG4gICAgXG4gICAgICAgIC8vIEdyYWR1YXRlIGRlZ3JlZVxuICAgICAgICAvL1xuICAgICAgICB2YXIgZ3JhZHVhdGVEZWdyZWVFYXJuaW5ncyA9IFsnR3JhZHVhdGUgRGVncmVlJ107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBncmFkdWF0ZURlZ3JlZUVhcm5pbmdzW2kgKyAxXSA9IHBhcnNlSW50KGRhdGFbaV0ubWVkaWFuX2Vhcm5pbmdzX2dyYWR1YXRlX29yX3Byb2Zlc3Npb25hbF9kZWdyZWUpO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGVhcm5pbmdzLnB1c2goZ3JhZHVhdGVEZWdyZWVFYXJuaW5ncyk7XG4gICAgXG4gICAgICAgIHRoaXMuZHJhd1N0ZXBwZWRBcmVhQ2hhcnQoJ2Vhcm5pbmdzLWNoYXJ0JywgZWFybmluZ3MsIHtcbiAgICBcbiAgICAgICAgICAgIGFyZWFPcGFjaXR5IDogMCxcbiAgICAgICAgICAgIGNvbm5lY3RTdGVwczogdHJ1ZSxcbiAgICAgICAgICAgIGN1cnZlVHlwZSA6ICdmdW5jdGlvbicsXG4gICAgICAgICAgICBmb2N1c1RhcmdldCA6ICdjYXRlZ29yeScsXG4gICAgICAgICAgICBsZWdlbmQgOiB7IHBvc2l0aW9uIDogJ2JvdHRvbScgfSxcbiAgICAgICAgICAgIHRpdGxlIDogJ0Vhcm5pbmdzIGJ5IEVkdWNhdGlvbiBMZXZlbCcsXG4gICAgICAgICAgICB2QXhpcyA6IHsgZm9ybWF0IDogJ2N1cnJlbmN5JyB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZHJhd0Vhcm5pbmdzVGFibGUocmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIHZhciBzID0gJyc7XG4gICAgXG4gICAgICAgIHMgKz0gJzx0cj48dGg+PC90aD4nO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcyArPSAnPHRoPicgKyB0aGlzLnBhcmFtcy5yZWdpb25zW2ldLm5hbWUgKyAnPC90aD4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8vIE1lZGlhbiBlYXJuaW5ncyBhbGxcbiAgICAgICAgLy9cbiAgICAgICAgcyArPSAnPC90cj48dHI+PHRkPk1lZGlhbiBFYXJuaW5ncyAoQWxsIFdvcmtlcnMpPC90ZD4nO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcyArPSAnPHRkPicgKyBudW1lcmFsKGRhdGFbaV0ubWVkaWFuX2Vhcm5pbmdzKS5mb3JtYXQoJyQwLDAnKSArICc8L3RkPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgLy8gTWVkaWFuIGVhcm5pbmdzIGZlbWFsZVxuICAgICAgICAvL1xuICAgICAgICBzICs9ICc8L3RyPjx0cj48dGQ+TWVkaWFuIEZlbWFsZSBFYXJuaW5ncyAoRnVsbCBUaW1lKTwvdGQ+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgbnVtZXJhbChkYXRhW2ldLmZlbWFsZV9mdWxsX3RpbWVfbWVkaWFuX2Vhcm5pbmdzKS5mb3JtYXQoJyQwLDAnKSArICc8L3RkPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgLy8gTWVkaWFuIGVhcm5pbmdzIG1hbGVcbiAgICAgICAgLy9cbiAgICAgICAgcyArPSAnPC90cj48dHI+PHRkPk1lZGlhbiBNYWxlIEVhcm5pbmdzIChGdWxsIFRpbWUpPC90ZD4nO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcyArPSAnPHRkPicgKyBudW1lcmFsKGRhdGFbaV0ubWFsZV9mdWxsX3RpbWVfbWVkaWFuX2Vhcm5pbmdzKS5mb3JtYXQoJyQwLDAnKSArICc8L3RkPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgcyArPSAnPC90cj4nO1xuICAgIFxuICAgICAgICAkKCcjZWFybmluZ3MtdGFibGUnKS5odG1sKHMpO1xuICAgIH1cbiAgICBcbiAgICAvLyBFZHVjYXRpb25cbiAgICAvL1xuICAgIGRyYXdFZHVjYXRpb25EYXRhKCkge1xuICAgIFxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgXG4gICAgICAgIGdvb2dsZS5zZXRPbkxvYWRDYWxsYmFjayhmdW5jdGlvbigpIHtcbiAgICBcbiAgICAgICAgICAgIHZhciByZWdpb25JZHMgPSBzZWxmLnBhcmFtcy5yZWdpb25zLm1hcChmdW5jdGlvbihyZWdpb24pIHsgcmV0dXJuIHJlZ2lvbi5pZDsgfSk7XG4gICAgICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG4gICAgXG4gICAgICAgICAgICBjb250cm9sbGVyLmdldEVkdWNhdGlvbkRhdGEocmVnaW9uSWRzLCBmdW5jdGlvbihkYXRhKSB7IFxuICAgIFxuICAgICAgICAgICAgICAgIHNlbGYuZHJhd0VkdWNhdGlvblRhYmxlKHJlZ2lvbklkcywgZGF0YSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRyYXdFZHVjYXRpb25UYWJsZShyZWdpb25JZHMsIGRhdGEpIHtcbiAgICBcbiAgICAgICAgdmFyIHMgPSAnJztcbiAgICBcbiAgICAgICAgLy8gSGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHMgKz0gJzx0cj48dGg+PC90aD4nO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcyArPSAnPHRoIGNvbHNwYW49XFwnMlxcJz4nICsgdGhpcy5wYXJhbXMucmVnaW9uc1tpXS5uYW1lICsgJzwvdGg+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvLyBTdWIgaGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHMgKz0gJzwvdHI+PHRyPjx0ZCBjbGFzcz1cXCdjb2x1bW4taGVhZGVyXFwnPjwvdGQ+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0ZCBjbGFzcz1cXCdjb2x1bW4taGVhZGVyXFwnPlBlcmNlbnQ8L3RkPjx0ZCBjbGFzcz1cXCdjb2x1bW4taGVhZGVyXFwnPlBlcmNlbnRpbGU8L3RkPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgLy8gQXQgbGVhc3QgYmFjaGVsb3Inc1xuICAgICAgICAvL1xuICAgICAgICBzICs9ICc8L3RyPjx0cj48dGQ+QXQgTGVhc3QgQmFjaGVsb3JcXCdzIERlZ3JlZTwvdGQ+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgIHZhciB0b3RhbFJhbmtzID0gcGFyc2VJbnQoZGF0YVtpXS50b3RhbF9yYW5rcyk7XG4gICAgICAgICAgICB2YXIgcmFuayA9IHBhcnNlSW50KGRhdGFbaV0ucGVyY2VudF9iYWNoZWxvcnNfZGVncmVlX29yX2hpZ2hlcl9yYW5rKTtcbiAgICAgICAgICAgIHZhciBwZXJjZW50aWxlID0gcGFyc2VJbnQoKCh0b3RhbFJhbmtzIC0gcmFuaykgLyB0b3RhbFJhbmtzKSAqIDEwMCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgZGF0YVtpXS5wZXJjZW50X2JhY2hlbG9yc19kZWdyZWVfb3JfaGlnaGVyICsgJyU8L3RkPic7XG4gICAgICAgICAgICBzICs9ICc8dGQ+JyArIG51bWVyYWwocGVyY2VudGlsZSkuZm9ybWF0KCcwbycpICsgJzwvdGQ+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvLyBBdCBsZWFzdCBoaWdoIHNjaG9vbCBkaXBsb21hXG4gICAgICAgIC8vXG4gICAgICAgIHMgKz0gJzwvdHI+PHRyPjx0ZD5BdCBMZWFzdCBIaWdoIFNjaG9vbCBEaXBsb21hPC90ZD4nO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgIFxuICAgICAgICAgICAgdmFyIHRvdGFsUmFua3MgPSBwYXJzZUludChkYXRhW2ldLnRvdGFsX3JhbmtzKTtcbiAgICAgICAgICAgIHZhciByYW5rID0gcGFyc2VJbnQoZGF0YVtpXS5wZXJjZW50X2hpZ2hfc2Nob29sX2dyYWR1YXRlX29yX2hpZ2hlcik7XG4gICAgICAgICAgICB2YXIgcGVyY2VudGlsZSA9IHBhcnNlSW50KCgodG90YWxSYW5rcyAtIHJhbmspIC8gdG90YWxSYW5rcykgKiAxMDApO1xuICAgIFxuICAgICAgICAgICAgcyArPSAnPHRkPicgKyBkYXRhW2ldLnBlcmNlbnRfaGlnaF9zY2hvb2xfZ3JhZHVhdGVfb3JfaGlnaGVyICsgJyU8L3RkPic7XG4gICAgICAgICAgICBzICs9ICc8dGQ+JyArIG51bWVyYWwocGVyY2VudGlsZSkuZm9ybWF0KCcwbycpICsgJzwvdGQ+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBzICs9ICc8L3RyPic7XG4gICAgXG4gICAgICAgICQoJyNlZHVjYXRpb24tdGFibGUnKS5odG1sKHMpO1xuICAgIH1cbiAgICBcbiAgICAvLyBHRFAgZGF0YVxuICAgIC8vXG4gICAgZHJhd0dkcERhdGEoKSB7XG4gICAgXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBcbiAgICAgICAgZ29vZ2xlLnNldE9uTG9hZENhbGxiYWNrKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgICAgICAgICAgdmFyIHJlZ2lvbklkcyA9IHNlbGYucGFyYW1zLnJlZ2lvbnMubWFwKGZ1bmN0aW9uKHJlZ2lvbikgeyByZXR1cm4gcmVnaW9uLmlkOyB9KTtcbiAgICAgICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcbiAgICBcbiAgICAgICAgICAgIGNvbnRyb2xsZXIuZ2V0R2RwRGF0YShyZWdpb25JZHMsIGZ1bmN0aW9uKGRhdGEpIHsgXG4gICAgXG4gICAgICAgICAgICAgICAgc2VsZi5kcmF3R2RwQ2hhcnQocmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgICAgICAgICBzZWxmLmRyYXdHZHBDaGFuZ2VDaGFydChyZWdpb25JZHMsIGRhdGEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBkcmF3R2RwQ2hhcnQocmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIHZhciBjaGFydERhdGEgPSBbXTtcbiAgICBcbiAgICAgICAgLy8gSGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBoZWFkZXIgPSBbJ1llYXInXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGhlYWRlcltpICsgMV0gPSB0aGlzLnBhcmFtcy5yZWdpb25zW2ldLm5hbWU7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgY2hhcnREYXRhLnB1c2goaGVhZGVyKTtcbiAgICBcbiAgICAgICAgLy8gRm9ybWF0IHRoZSBkYXRhXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBvID0ge307XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIFxuICAgICAgICAgICAgaWYgKG9bZGF0YVtpXS55ZWFyXSA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBvW2RhdGFbaV0ueWVhcl0gPSBbZGF0YVtpXS55ZWFyXTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIG9bZGF0YVtpXS55ZWFyXS5wdXNoKHBhcnNlRmxvYXQoZGF0YVtpXS5wZXJfY2FwaXRhX2dkcCkpO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvKSB7XG4gICAgICAgICAgICBjaGFydERhdGEucHVzaChvW2tleV0pO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8vIERyYXcgY2hhcnRcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5kcmF3TGluZUNoYXJ0KCdwZXItY2FwaXRhLWdkcC1jaGFydCcsIGNoYXJ0RGF0YSwge1xuICAgIFxuICAgICAgICAgICAgY3VydmVUeXBlIDogJ2Z1bmN0aW9uJyxcbiAgICAgICAgICAgIGxlZ2VuZCA6IHsgcG9zaXRpb24gOiAnYm90dG9tJyB9LFxuICAgICAgICAgICAgcG9pbnRTaGFwZSA6ICdzcXVhcmUnLFxuICAgICAgICAgICAgcG9pbnRTaXplIDogOCxcbiAgICAgICAgICAgIHRpdGxlIDogJ1BlciBDYXBpdGEgUmVhbCBHRFAgb3ZlciBUaW1lJyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRyYXdHZHBDaGFuZ2VDaGFydChyZWdpb25JZHMsIGRhdGEpIHtcbiAgICBcbiAgICAgICAgdmFyIGNoYXJ0RGF0YSA9IFtdO1xuICAgIFxuICAgICAgICAvLyBIZWFkZXJcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGhlYWRlciA9IFsnWWVhciddO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaGVhZGVyW2kgKyAxXSA9IHRoaXMucGFyYW1zLnJlZ2lvbnNbaV0ubmFtZTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBjaGFydERhdGEucHVzaChoZWFkZXIpO1xuICAgIFxuICAgICAgICAvLyBGb3JtYXQgdGhlIGRhdGFcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIG8gPSB7fTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICBpZiAob1tkYXRhW2ldLnllYXJdID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG9bZGF0YVtpXS55ZWFyXSA9IFtkYXRhW2ldLnllYXJdO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgb1tkYXRhW2ldLnllYXJdLnB1c2gocGFyc2VGbG9hdChkYXRhW2ldLnBlcl9jYXBpdGFfZ2RwX3BlcmNlbnRfY2hhbmdlKSAvIDEwMCk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgZm9yICh2YXIga2V5IGluIG8pIHtcbiAgICAgICAgICAgIGNoYXJ0RGF0YS5wdXNoKG9ba2V5XSk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgLy8gRHJhdyBjaGFydFxuICAgICAgICAvL1xuICAgICAgICB0aGlzLmRyYXdMaW5lQ2hhcnQoJ3Blci1jYXBpdGEtZ2RwLWNoYW5nZS1jaGFydCcsIGNoYXJ0RGF0YSwge1xuICAgIFxuICAgICAgICAgICAgY3VydmVUeXBlIDogJ2Z1bmN0aW9uJyxcbiAgICAgICAgICAgIGxlZ2VuZCA6IHsgcG9zaXRpb24gOiAnYm90dG9tJyB9LFxuICAgICAgICAgICAgcG9pbnRTaGFwZSA6ICdzcXVhcmUnLFxuICAgICAgICAgICAgcG9pbnRTaXplIDogOCxcbiAgICAgICAgICAgIHRpdGxlIDogJ0FubnVhbCBDaGFuZ2UgaW4gUGVyIENhcGl0YSBHRFAgb3ZlciBUaW1lJyxcbiAgICAgICAgICAgIHZBeGlzIDogeyBmb3JtYXQgOiAnIy4jJScgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIC8vIE9jY3VwYXRpb25zXG4gICAgLy9cbiAgICBkcmF3T2NjdXBhdGlvbnNEYXRhKCkge1xuICAgIFxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgXG4gICAgICAgIGdvb2dsZS5zZXRPbkxvYWRDYWxsYmFjayhmdW5jdGlvbigpIHtcbiAgICBcbiAgICAgICAgICAgIHZhciByZWdpb25JZHMgPSBzZWxmLnBhcmFtcy5yZWdpb25zLm1hcChmdW5jdGlvbihyZWdpb24pIHsgcmV0dXJuIHJlZ2lvbi5pZDsgfSk7XG4gICAgICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG4gICAgXG4gICAgICAgICAgICBjb250cm9sbGVyLmdldE9jY3VwYXRpb25zRGF0YShyZWdpb25JZHMsIGZ1bmN0aW9uKGRhdGEpIHsgXG4gICAgXG4gICAgICAgICAgICAgICAgc2VsZi5kcmF3T2NjdXBhdGlvbnNUYWJsZShyZWdpb25JZHMsIGRhdGEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBkcmF3T2NjdXBhdGlvbnNUYWJsZShyZWdpb25JZHMsIGRhdGEpIHtcbiAgICBcbiAgICAgICAgdmFyIHMgPSAnPHRyPjx0aD48L3RoPic7XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzICs9ICc8dGggY29sc3Bhbj1cXCcyXFwnPicgKyB0aGlzLnBhcmFtcy5yZWdpb25zW2ldLm5hbWUgKyAnPC90aD4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8vIFN1YiBoZWFkZXJcbiAgICAgICAgLy9cbiAgICAgICAgcyArPSAnPC90cj48dHI+PHRkIGNsYXNzPVxcJ2NvbHVtbi1oZWFkZXJcXCc+PC90ZD4nO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcyArPSAnPHRkIGNsYXNzPVxcJ2NvbHVtbi1oZWFkZXJcXCc+UGVyY2VudDwvdGQ+PHRkIGNsYXNzPVxcJ2NvbHVtbi1oZWFkZXJcXCc+UGVyY2VudGlsZTwvdGQ+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgIGlmICgoaSAlIHJlZ2lvbklkcy5sZW5ndGgpID09IDApXG4gICAgICAgICAgICAgICAgcyArPSAnPC90cj48dHI+PHRkPicgKyBkYXRhW2ldLm9jY3VwYXRpb24gKyAnPC90ZD4nOyBcbiAgICBcbiAgICAgICAgICAgIHZhciB0b3RhbFJhbmtzID0gcGFyc2VJbnQoZGF0YVtpXS50b3RhbF9yYW5rcyk7XG4gICAgICAgICAgICB2YXIgcmFuayA9IHBhcnNlSW50KGRhdGFbaV0ucGVyY2VudF9lbXBsb3llZF9yYW5rKTtcbiAgICAgICAgICAgIHZhciBwZXJjZW50aWxlID0gcGFyc2VJbnQoKCh0b3RhbFJhbmtzIC0gcmFuaykgLyB0b3RhbFJhbmtzKSAqIDEwMCk7XG4gICAgXG4gICAgICAgICAgICBzICs9ICc8dGQ+JyArIG51bWVyYWwoZGF0YVtpXS5wZXJjZW50X2VtcGxveWVkKS5mb3JtYXQoJzAuMCcpICsgJyU8L3RkPic7XG4gICAgICAgICAgICBzICs9ICc8dGQ+JyArIG51bWVyYWwocGVyY2VudGlsZSkuZm9ybWF0KCcwbycpICsgJzwvdGQ+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBzICs9ICc8L3RyPic7XG4gICAgXG4gICAgICAgICQoJyNvY2N1cGF0aW9ucy10YWJsZScpLmh0bWwocyk7XG4gICAgfVxuICAgIFxuICAgIC8vIFBvcHVsYXRpb25cbiAgICAvL1xuICAgIGRyYXdQb3B1bGF0aW9uRGF0YSgpIHtcblxuICAgICAgICBnb29nbGUuc2V0T25Mb2FkQ2FsbGJhY2soKCkgPT4ge1xuXG4gICAgICAgICAgICB2YXIgcmVnaW9uSWRzID0gdGhpcy5wYXJhbXMucmVnaW9ucy5tYXAoZnVuY3Rpb24ocmVnaW9uKSB7IHJldHVybiByZWdpb24uaWQ7IH0pO1xuICAgICAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuXG4gICAgICAgICAgICBjb250cm9sbGVyLmdldFBvcHVsYXRpb25EYXRhKHJlZ2lvbklkcywgKGRhdGEpID0+IHsgXG5cbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdQb3B1bGF0aW9uTWFwKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3UG9wdWxhdGlvbkNoYXJ0KHJlZ2lvbklkcywgZGF0YSk7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3UG9wdWxhdGlvbkNoYW5nZUNoYXJ0KHJlZ2lvbklkcywgZGF0YSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRyYXdQb3B1bGF0aW9uQ2hhcnQocmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIHZhciBjaGFydERhdGEgPSBbXTtcbiAgICAgICAgdmFyIHllYXI7XG4gICAgXG4gICAgICAgIC8vIEhlYWRlclxuICAgICAgICAvL1xuICAgICAgICB2YXIgaGVhZGVyID0gWydZZWFyJ107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBoZWFkZXJbaSArIDFdID0gdGhpcy5wYXJhbXMucmVnaW9uc1tpXS5uYW1lO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGNoYXJ0RGF0YS5wdXNoKGhlYWRlcik7XG4gICAgXG4gICAgICAgIC8vIERhdGFcbiAgICAgICAgLy9cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgbSA9IChpICUgcmVnaW9uSWRzLmxlbmd0aCk7XG4gICAgXG4gICAgICAgICAgICBpZiAobSA9PSAwKSB7XG4gICAgXG4gICAgICAgICAgICAgICAgeWVhciA9IFtdO1xuICAgICAgICAgICAgICAgIHllYXJbMF0gPSBkYXRhW2ldLnllYXI7XG4gICAgICAgICAgICAgICAgY2hhcnREYXRhLnB1c2goeWVhcik7XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICB5ZWFyW20gKyAxXSA9IHBhcnNlSW50KGRhdGFbaV0ucG9wdWxhdGlvbik7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgdGhpcy5kcmF3TGluZUNoYXJ0KCdwb3B1bGF0aW9uLWNoYXJ0JywgY2hhcnREYXRhLCB7XG4gICAgXG4gICAgICAgICAgICBjdXJ2ZVR5cGUgOiAnZnVuY3Rpb24nLFxuICAgICAgICAgICAgbGVnZW5kIDogeyBwb3NpdGlvbiA6ICdib3R0b20nIH0sXG4gICAgICAgICAgICBwb2ludFNoYXBlIDogJ3NxdWFyZScsXG4gICAgICAgICAgICBwb2ludFNpemUgOiA4LFxuICAgICAgICAgICAgdGl0bGUgOiAnUG9wdWxhdGlvbicsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBkcmF3UG9wdWxhdGlvbkNoYW5nZUNoYXJ0KHJlZ2lvbklkcywgZGF0YSkge1xuICAgIFxuICAgICAgICB2YXIgY2hhcnREYXRhID0gW107XG4gICAgICAgIHZhciB5ZWFyO1xuICAgIFxuICAgICAgICAvLyBIZWFkZXJcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGhlYWRlciA9IFsnWWVhciddO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaGVhZGVyW2kgKyAxXSA9IHRoaXMucGFyYW1zLnJlZ2lvbnNbaV0ubmFtZTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBjaGFydERhdGEucHVzaChoZWFkZXIpO1xuICAgIFxuICAgICAgICAvLyBEYXRhXG4gICAgICAgIC8vXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIFxuICAgICAgICAgICAgdmFyIG0gPSAoaSAlIHJlZ2lvbklkcy5sZW5ndGgpO1xuICAgIFxuICAgICAgICAgICAgaWYgKG0gPT0gMCkge1xuICAgIFxuICAgICAgICAgICAgICAgIHllYXIgPSBbXTtcbiAgICAgICAgICAgICAgICB5ZWFyWzBdID0gZGF0YVtpXS55ZWFyO1xuICAgICAgICAgICAgICAgIGNoYXJ0RGF0YS5wdXNoKHllYXIpO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgeWVhclttICsgMV0gPSBwYXJzZUZsb2F0KGRhdGFbaV0ucG9wdWxhdGlvbl9wZXJjZW50X2NoYW5nZSkgLyAxMDA7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgdGhpcy5kcmF3TGluZUNoYXJ0KCdwb3B1bGF0aW9uLWNoYW5nZS1jaGFydCcsIGNoYXJ0RGF0YSwge1xuICAgIFxuICAgICAgICAgICAgY3VydmVUeXBlIDogJ2Z1bmN0aW9uJyxcbiAgICAgICAgICAgIGxlZ2VuZCA6IHsgcG9zaXRpb24gOiAnYm90dG9tJyB9LFxuICAgICAgICAgICAgcG9pbnRTaGFwZSA6ICdzcXVhcmUnLFxuICAgICAgICAgICAgcG9pbnRTaXplIDogOCxcbiAgICAgICAgICAgIHRpdGxlIDogJ1BvcHVsYXRpb24gQ2hhbmdlJyxcbiAgICAgICAgICAgIHZBeGlzIDogeyBmb3JtYXQgOiAnIy4jJScgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRyYXdQb3B1bGF0aW9uTWFwKCkge1xuICAgIFxuICAgICAgICB2YXIgbWFwID0gTC5tYXAoXG4gICAgICAgICAgICAnbWFwJyxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB6b29tQ29udHJvbCA6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgbWFwLnNldFZpZXcodGhpcy5NQVBfSU5JVElBTF9DRU5URVIsIHRoaXMuTUFQX0lOSVRJQUxfWk9PTSk7XG5cbiAgICAgICAgdmFyIG15TGluZXMgPSBbe1xuICAgICAgICAgICAgXCJ0eXBlXCI6IFwiTGluZVN0cmluZ1wiLFxuICAgICAgICAgICAgXCJjb29yZGluYXRlc1wiOiBbWy0xMDAsIDQwXSwgWy0xMDUsIDQ1XSwgWy0xMTAsIDU1XV1cbiAgICAgICAgfSwge1xuICAgICAgICAgICAgXCJ0eXBlXCI6IFwiTGluZVN0cmluZ1wiLFxuICAgICAgICAgICAgXCJjb29yZGluYXRlc1wiOiBbWy0xMDUsIDQwXSwgWy0xMTAsIDQ1XSwgWy0xMTUsIDU1XV1cbiAgICAgICAgfV07XG4gICAgICAgIFxuICAgICAgICB2YXIgbXlTdHlsZSA9IHtcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjZmY3ODAwXCIsXG4gICAgICAgICAgICBcIndlaWdodFwiOiA1LFxuICAgICAgICAgICAgXCJvcGFjaXR5XCI6IDAuNjVcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIEwuZ2VvSnNvbihteUxpbmVzLCB7XG4gICAgICAgICAgICBzdHlsZTogbXlTdHlsZVxuICAgICAgICB9KS5hZGRUbyhtYXApO1xuICAgICAgICBcbiAgICAgICAgTC50aWxlTGF5ZXIoJ2h0dHBzOi8vYS50aWxlcy5tYXBib3guY29tL3YzL3NvY3JhdGEtYXBwcy5pYnAwbDg5OS97en0ve3h9L3t5fS5wbmcnKS5hZGRUbyhtYXApO1xuICAgIH1cbiAgICBcbiAgICAvLyBQbGFjZXMgaW4gcmVnaW9uXG4gICAgLy9cbiAgICBkcmF3UGxhY2VzSW5SZWdpb24oKSB7XG5cbiAgICAgICAgaWYgKHRoaXMucGFyYW1zLnJlZ2lvbnMubGVuZ3RoID09IDApIFxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHZhciByZWdpb24gPSB0aGlzLnBhcmFtcy5yZWdpb25zWzBdO1xuXG4gICAgICAgIHN3aXRjaCAocmVnaW9uLnR5cGUpIHtcblxuICAgICAgICAgICAgY2FzZSAnbmF0aW9uJzogXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICBjYXNlICdzdGF0ZSc6XG5cbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdQbGFjZXNJblN0YXRlRm9yUmVnaW9uKHJlZ2lvbi5pZCwgcmVnaW9uKSAvLyB0aGUgcmVnaW9uIGlzIGEgc3RhdGVcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UubGVuZ3RoID09IDApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjcGxhY2VzLWluLXJlZ2lvbi1oZWFkZXInKS50ZXh0KCdQbGFjZXMgaW4gezB9Jy5mb3JtYXQocmVnaW9uLm5hbWUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNwbGFjZXMtaW4tcmVnaW9uLWhlYWRlcicpLnNsaWRlVG9nZ2xlKDEwMCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BsYWNlc0luUmVnaW9uTGlzdChyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6IFxuXG4gICAgICAgICAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuXG4gICAgICAgICAgICAgICAgY29udHJvbGxlci5nZXRQYXJlbnRTdGF0ZShyZWdpb24pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmxlbmd0aCA9PSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gcmVzcG9uc2VbMF07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BsYWNlc0luU3RhdGVGb3JSZWdpb24oc3RhdGUucGFyZW50X2lkLCByZWdpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5sZW5ndGggPT0gMClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjcGxhY2VzLWluLXJlZ2lvbi1oZWFkZXInKS50ZXh0KCdQbGFjZXMgaW4gezB9Jy5mb3JtYXQoc3RhdGUucGFyZW50X25hbWUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnI3BsYWNlcy1pbi1yZWdpb24taGVhZGVyJykuc2xpZGVUb2dnbGUoMTAwKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdQbGFjZXNJblJlZ2lvbkxpc3QocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmF3UGxhY2VzSW5TdGF0ZUZvclJlZ2lvbihzdGF0ZUlkLCByZWdpb24pIHtcblxuICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG5cbiAgICAgICAgc3dpdGNoIChyZWdpb24udHlwZSkge1xuXG4gICAgICAgICAgICBjYXNlICdjb3VudHknOiByZXR1cm4gY29udHJvbGxlci5nZXRDb3VudGllc0luU3RhdGUoc3RhdGVJZCk7XG4gICAgICAgICAgICBjYXNlICdtc2EnOiByZXR1cm4gY29udHJvbGxlci5nZXRNZXRyb3NJblN0YXRlKHN0YXRlSWQpO1xuICAgICAgICAgICAgY2FzZSAncGxhY2UnOiByZXR1cm4gY29udHJvbGxlci5nZXRQbGFjZXNJblN0YXRlKHN0YXRlSWQpO1xuICAgICAgICAgICAgY2FzZSAnc3RhdGUnOlxuXG4gICAgICAgICAgICAgICAgdmFyIHBsYWNlc1Byb21pc2UgPSBjb250cm9sbGVyLmdldFBsYWNlc0luU3RhdGUoc3RhdGVJZCk7XG4gICAgICAgICAgICAgICAgdmFyIGNvdW50aWVzUHJvbWlzZSA9IGNvbnRyb2xsZXIuZ2V0Q291bnRpZXNJblN0YXRlKHN0YXRlSWQpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFtwbGFjZXNQcm9taXNlLCBjb3VudGllc1Byb21pc2VdKVxuICAgICAgICAgICAgICAgICAgICAudGhlbih2YWx1ZXMgPT4gUHJvbWlzZS5yZXNvbHZlKHZhbHVlc1swXS5jb25jYXQodmFsdWVzWzFdKSkpXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6IHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZHJhd1BsYWNlc0luUmVnaW9uTGlzdChkYXRhKSB7XG5cbiAgICAgICAgdmFyIHMgPSAnJztcblxuICAgICAgICBpZiAoZGF0YS5sZW5ndGggPT0gMClcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICB2YXIgY291bnQgPSAwO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5pc1JlZ2lvbklkQ29udGFpbmVkSW5DdXJyZW50UmVnaW9ucyhkYXRhW2ldLmNoaWxkX2lkKSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgcyArPSAnPGxpPjxhIGhyZWY9XCInO1xuICAgICAgICAgICAgcyArPSB0aGlzLmdldFNlYXJjaFBhZ2VGb3JSZWdpb25zQW5kVmVjdG9yVXJsKGRhdGFbaV0uY2hpbGRfbmFtZSkgKyAnXCI+JztcbiAgICAgICAgICAgIHMgKz0gZGF0YVtpXS5jaGlsZF9uYW1lO1xuICAgICAgICAgICAgcyArPSAnPC9hPjwvbGk+JztcblxuICAgICAgICAgICAgaWYgKGNvdW50ID09IDQpXG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgIH1cblxuICAgICAgICAkKCcjcGxhY2VzLWluLXJlZ2lvbicpLmh0bWwocyk7XG4gICAgICAgICQoJyNwbGFjZXMtaW4tcmVnaW9uJykuc2xpZGVUb2dnbGUoMTAwKTtcbiAgICB9XG5cbiAgICBpc1JlZ2lvbklkQ29udGFpbmVkSW5DdXJyZW50UmVnaW9ucyhyZWdpb25JZCkge1xuXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5wYXJhbXMucmVnaW9ucy5sZW5ndGg7IGorKykge1xuXG4gICAgICAgICAgICBpZiAocmVnaW9uSWQgPT0gdGhpcy5wYXJhbXMucmVnaW9uc1tqXS5pZClcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBTaW1pbGFyIHJlZ2lvbnNcbiAgICAvL1xuICAgIGRyYXdTaW1pbGFyUmVnaW9ucyhvbkNsaWNrUmVnaW9uKSB7XG5cbiAgICAgICAgaWYgKHRoaXMucGFyYW1zLnJlZ2lvbnMubGVuZ3RoID09IDApIFxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHZhciByZWdpb24gPSB0aGlzLnBhcmFtcy5yZWdpb25zWzBdO1xuICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG5cbiAgICAgICAgY29udHJvbGxlci5nZXRTaW1pbGFyUmVnaW9ucyhyZWdpb24uaWQpXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHRoaXMuZHJhd1NpbWlsYXJSZWdpb25zTGlzdChkYXRhLCBvbkNsaWNrUmVnaW9uKSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgfVxuXG4gICAgZHJhd1NpbWlsYXJSZWdpb25zTGlzdChkYXRhLCBvbkNsaWNrUmVnaW9uKSB7XG5cbiAgICAgICAgdmFyIHMgPSAnJztcblxuICAgICAgICBpZiAoZGF0YS5tb3N0X3NpbWlsYXIgPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHZhciBjb3VudCA9IDA7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLm1vc3Rfc2ltaWxhci5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5pc1JlZ2lvbklkQ29udGFpbmVkSW5DdXJyZW50UmVnaW9ucyhkYXRhLm1vc3Rfc2ltaWxhcltpXS5pZCkpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgIHMgKz0gJzxsaT48YT48aSBjbGFzcz1cImZhIGZhLXBsdXNcIj48L2k+JyArIGRhdGEubW9zdF9zaW1pbGFyW2ldLm5hbWUgKyAnPC9hPjwvbGk+J1xuXG4gICAgICAgICAgICBpZiAoY291bnQgPT0gNClcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAkKCcjc2ltaWxhci1yZWdpb25zJykuaHRtbChzKTtcbiAgICAgICAgJCgnI3NpbWlsYXItcmVnaW9ucycpLnNsaWRlVG9nZ2xlKDEwMCk7XG4gICAgICAgIFxuICAgICAgICAkKCcjc2ltaWxhci1yZWdpb25zIGxpIGEnKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICBcbiAgICAgICAgICAgIHZhciBpbmRleCA9ICQodGhpcykucGFyZW50KCkuaW5kZXgoKTtcbiAgICAgICAgICAgIG9uQ2xpY2tSZWdpb24oZGF0YS5tb3N0X3NpbWlsYXJbaW5kZXhdLm5hbWUpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgLy8gRHJhdyBjaGFydHNcbiAgICAvL1xuICAgIGRyYXdMaW5lQ2hhcnQoY2hhcnRJZCwgZGF0YSwgb3B0aW9ucykge1xuICAgIFxuICAgICAgICB2YXIgZGF0YVRhYmxlID0gZ29vZ2xlLnZpc3VhbGl6YXRpb24uYXJyYXlUb0RhdGFUYWJsZShkYXRhKTtcbiAgICAgICAgdmFyIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkxpbmVDaGFydChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjaGFydElkKSk7XG4gICAgXG4gICAgICAgIGNoYXJ0LmRyYXcoZGF0YVRhYmxlLCBvcHRpb25zKTtcbiAgICB9XG4gICAgXG4gICAgZHJhd1N0ZXBwZWRBcmVhQ2hhcnQoY2hhcnRJZCwgZGF0YSwgb3B0aW9ucykge1xuICAgIFxuICAgICAgICB2YXIgZGF0YVRhYmxlID0gZ29vZ2xlLnZpc3VhbGl6YXRpb24uYXJyYXlUb0RhdGFUYWJsZShkYXRhKTtcbiAgICAgICAgdmFyIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLlN0ZXBwZWRBcmVhQ2hhcnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY2hhcnRJZCkpO1xuICAgIFxuICAgICAgICBjaGFydC5kcmF3KGRhdGFUYWJsZSwgb3B0aW9ucyk7XG4gICAgfVxuICAgIFxuICAgIC8vIFBhZ2luZ1xuICAgIC8vXG4gICAgZmV0Y2hOZXh0UGFnZSgpIHtcbiAgICBcbiAgICAgICAgaWYgKHRoaXMuZmV0Y2hpbmcgfHwgdGhpcy5mZXRjaGVkQWxsKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgIFxuICAgICAgICB0aGlzLmZldGNoaW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pbmNyZW1lbnRQYWdlKCk7XG4gICAgXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBcbiAgICAgICAgJC5hamF4KHRoaXMuZ2V0U2VhcmNoUmVzdWx0c1VybCgpKS5kb25lKGZ1bmN0aW9uKGRhdGEsIHRleHRTdGF0dXMsIGpxWEhSKSB7XG4gICAgXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhqcVhIUi5zdGF0dXMgKyAnICcgKyB0ZXh0U3RhdHVzKTtcbiAgICBcbiAgICAgICAgICAgIGlmIChqcVhIUi5zdGF0dXMgPT0gMjA0KSB7IC8vIG5vIGNvbnRlbnRcbiAgICBcbiAgICAgICAgICAgICAgICBzZWxmLmRlY3JlbWVudFBhZ2UoKTtcbiAgICAgICAgICAgICAgICBzZWxmLmZldGNoaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc2VsZi5mZXRjaGVkQWxsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICAkKCcuZGF0YXNldHMnKS5hcHBlbmQoZGF0YSk7XG4gICAgICAgICAgICBzZWxmLmZldGNoaW5nID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBnZXRTZWFyY2hQYWdlRm9yUmVnaW9uc0FuZFZlY3RvclVybChyZWdpb25zLCB2ZWN0b3IsIHF1ZXJ5U3RyaW5nKSB7XG4gICAgXG4gICAgICAgIHZhciB1cmwgPSAnLyc7XG4gICAgXG4gICAgICAgIGlmICh0eXBlb2YocmVnaW9ucykgPT09ICdzdHJpbmcnKSB7XG4gICAgXG4gICAgICAgICAgICB1cmwgKz0gcmVnaW9ucy5yZXBsYWNlKC8sL2csICcnKS5yZXBsYWNlKC8gL2csICdfJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZWdpb25zKSkge1xuICAgIFxuICAgICAgICAgICAgdmFyIHJlZ2lvbk5hbWVzID0gW107XG4gICAgXG4gICAgICAgICAgICByZWdpb25OYW1lcyA9IHJlZ2lvbnMubWFwKGZ1bmN0aW9uKHJlZ2lvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWdpb24ucmVwbGFjZSgvLC9nLCAnJykucmVwbGFjZSgvIC9nLCAnXycpO1xuICAgICAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICAgICB1cmwgKz0gcmVnaW9uTmFtZXMuam9pbignX3ZzXycpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgIFxuICAgICAgICAgICAgdXJsICs9ICdzZWFyY2gnO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGlmICh2ZWN0b3IpXG4gICAgICAgICAgICB1cmwgKz0gJy8nICsgdmVjdG9yO1xuICAgIFxuICAgICAgICBpZiAocXVlcnlTdHJpbmcpIFxuICAgICAgICAgICAgdXJsICs9IHF1ZXJ5U3RyaW5nO1xuICAgIFxuICAgICAgICByZXR1cm4gdXJsO1xuICAgIH1cbiAgICBcbiAgICBnZXRTZWFyY2hQYWdlVXJsKCkge1xuICAgIFxuICAgICAgICBpZiAoKHRoaXMucGFyYW1zLnJlZ2lvbnMubGVuZ3RoID4gMCkgfHwgdGhpcy5wYXJhbXMuYXV0b1N1Z2dlc3RlZFJlZ2lvbikge1xuICAgIFxuICAgICAgICAgICAgdmFyIHJlZ2lvbk5hbWVzID0gW107XG4gICAgXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJhbXMucmVzZXRSZWdpb25zID09IGZhbHNlKSB7XG4gICAgXG4gICAgICAgICAgICAgICAgcmVnaW9uTmFtZXMgPSB0aGlzLnBhcmFtcy5yZWdpb25zLm1hcChmdW5jdGlvbihyZWdpb24pIHsgXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWdpb24ubmFtZTsgXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJhbXMuYXV0b1N1Z2dlc3RlZFJlZ2lvbilcbiAgICAgICAgICAgICAgICByZWdpb25OYW1lcy5wdXNoKHRoaXMucGFyYW1zLmF1dG9TdWdnZXN0ZWRSZWdpb24pO1xuICAgIFxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U2VhcmNoUGFnZUZvclJlZ2lvbnNBbmRWZWN0b3JVcmwocmVnaW9uTmFtZXMsIHRoaXMucGFyYW1zLnZlY3RvciwgdGhpcy5nZXRTZWFyY2hRdWVyeVN0cmluZygpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICBcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFNlYXJjaFBhZ2VGb3JSZWdpb25zQW5kVmVjdG9yVXJsKG51bGwsIHRoaXMucGFyYW1zLnZlY3RvciwgdGhpcy5nZXRTZWFyY2hRdWVyeVN0cmluZygpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBnZXRTZWFyY2hSZXN1bHRzVXJsKCkge1xuICAgIFxuICAgICAgICB2YXIgc2VhcmNoUmVzdWx0c1VybCA9IHRoaXMucGFyYW1zLnJlZ2lvbnMubGVuZ3RoID09IDAgPyAnL3NlYXJjaC1yZXN1bHRzJyA6ICcuL3NlYXJjaC1yZXN1bHRzJzsgXG4gICAgICAgIHZhciB1cmwgPSBzZWFyY2hSZXN1bHRzVXJsICsgdGhpcy5nZXRTZWFyY2hRdWVyeVN0cmluZygpOyBcbiAgICBcbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICB9XG4gICAgXG4gICAgZ2V0U2VhcmNoUXVlcnlTdHJpbmcoKSB7XG4gICAgXG4gICAgICAgIHZhciB1cmwgPSAnP3E9JyArIGVuY29kZVVSSUNvbXBvbmVudCh0aGlzLnBhcmFtcy5xKTtcbiAgICBcbiAgICAgICAgaWYgKHRoaXMucGFyYW1zLnBhZ2UgPiAxKVxuICAgICAgICAgICAgdXJsICs9ICcmcGFnZT0nICsgdGhpcy5wYXJhbXMucGFnZTtcbiAgICBcbiAgICAgICAgaWYgKHRoaXMucGFyYW1zLmNhdGVnb3JpZXMubGVuZ3RoID4gMClcbiAgICAgICAgICAgIHVybCArPSAnJmNhdGVnb3JpZXM9JyArIGVuY29kZVVSSUNvbXBvbmVudCh0aGlzLnBhcmFtcy5jYXRlZ29yaWVzLmpvaW4oJywnKSk7XG4gICAgXG4gICAgICAgIGlmICh0aGlzLnBhcmFtcy5kb21haW5zLmxlbmd0aCA+IDApXG4gICAgICAgICAgICB1cmwgKz0gJyZkb21haW5zPScgKyBlbmNvZGVVUklDb21wb25lbnQodGhpcy5wYXJhbXMuZG9tYWlucy5qb2luKCcsJykpO1xuICAgIFxuICAgICAgICBpZiAodGhpcy5wYXJhbXMuc3RhbmRhcmRzLmxlbmd0aCA+IDApXG4gICAgICAgICAgICB1cmwgKz0gJyZzdGFuZGFyZHM9JyArIGVuY29kZVVSSUNvbXBvbmVudCh0aGlzLnBhcmFtcy5zdGFuZGFyZHMuam9pbignLCcpKTtcbiAgICBcbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICB9XG4gICAgXG4gICAgaW5jcmVtZW50UGFnZSgpIHtcbiAgICBcbiAgICAgICAgdGhpcy5wYXJhbXMucGFnZSsrO1xuICAgIH1cbiAgICBcbiAgICBuYXZpZ2F0ZSgpIHtcbiAgICBcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB0aGlzLmdldFNlYXJjaFBhZ2VVcmwoKTtcbiAgICB9XG4gICAgXG4gICAgcmVtb3ZlUmVnaW9uKHJlZ2lvbkluZGV4KSB7XG4gICAgXG4gICAgICAgIHRoaXMucGFyYW1zLnJlZ2lvbnMuc3BsaWNlKHJlZ2lvbkluZGV4LCAxKTsgLy8gcmVtb3ZlIGF0IGluZGV4IGlcbiAgICAgICAgdGhpcy5wYXJhbXMucGFnZSA9IDE7XG4gICAgfVxuICAgIFxuICAgIHNldEF1dG9TdWdnZXN0ZWRSZWdpb24ocmVnaW9uLCByZXNldFJlZ2lvbnMpIHtcbiAgICBcbiAgICAgICAgdGhpcy5wYXJhbXMuYXV0b1N1Z2dlc3RlZFJlZ2lvbiA9IHJlZ2lvbjtcbiAgICAgICAgdGhpcy5wYXJhbXMucmVzZXRSZWdpb25zID0gcmVzZXRSZWdpb25zO1xuICAgICAgICB0aGlzLnBhcmFtcy5wYWdlID0gMTtcbiAgICB9XG4gICAgXG4gICAgdG9nZ2xlQ2F0ZWdvcnkoY2F0ZWdvcnkpIHtcbiAgICBcbiAgICAgICAgdmFyIGkgPSB0aGlzLnBhcmFtcy5jYXRlZ29yaWVzLmluZGV4T2YoY2F0ZWdvcnkpO1xuICAgIFxuICAgICAgICBpZiAoaSA+IC0xKVxuICAgICAgICAgICAgdGhpcy5wYXJhbXMuY2F0ZWdvcmllcy5zcGxpY2UoaSwgMSk7IC8vIHJlbW92ZSBhdCBpbmRleCBpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMucGFyYW1zLmNhdGVnb3JpZXMucHVzaChjYXRlZ29yeSk7XG4gICAgfVxuICAgIFxuICAgIHRvZ2dsZURvbWFpbihkb21haW4pIHtcbiAgICBcbiAgICAgICAgdmFyIGkgPSB0aGlzLnBhcmFtcy5kb21haW5zLmluZGV4T2YoZG9tYWluKTtcbiAgICBcbiAgICAgICAgaWYgKGkgPiAtMSlcbiAgICAgICAgICAgIHRoaXMucGFyYW1zLmRvbWFpbnMuc3BsaWNlKGksIDEpOyAvLyByZW1vdmUgYXQgaW5kZXggaVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLnBhcmFtcy5kb21haW5zLnB1c2goZG9tYWluKTtcbiAgICB9XG4gICAgXG4gICAgdG9nZ2xlU3RhbmRhcmQoc3RhbmRhcmQpIHtcbiAgICBcbiAgICAgICAgdmFyIGkgPSB0aGlzLnBhcmFtcy5zdGFuZGFyZHMuaW5kZXhPZihzdGFuZGFyZCk7XG4gICAgXG4gICAgICAgIGlmIChpID4gLTEpXG4gICAgICAgICAgICB0aGlzLnBhcmFtcy5zdGFuZGFyZHMuc3BsaWNlKGksIDEpOyAvLyByZW1vdmUgYXQgaW5kZXggaVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLnBhcmFtcy5zdGFuZGFyZHMucHVzaChzdGFuZGFyZCk7XG4gICAgfVxufSJdfQ==
//# sourceMappingURL=v4-search-page-controller.js.map
