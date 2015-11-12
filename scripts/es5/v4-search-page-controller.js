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

            /*        L.geoJson(
                        myLines, 
                        {
                            style: myStyle
                        }).addTo(map);
            */
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

                        _this2.drawPlacesInRegionList(response, 10);
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
            var _this3 = this;

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

                        var rg0 = _this3.removeCurrentRegions(values[0]);
                        var rg1 = _this3.removeCurrentRegions(values[1]);

                        return Promise.resolve(rg0.concat(rg1));
                    }).catch(function (error) {
                        return console.error(error);
                    });

                default:
                    return Promise.resolve([]);
            }
        }
    }, {
        key: 'removeCurrentRegions',
        value: function removeCurrentRegions(regions) {
            var maxCount = arguments.length <= 1 || arguments[1] === undefined ? 5 : arguments[1];

            var count = 0;
            var rg = [];

            for (var i = 0; i < regions.length; i++) {

                if (this.isRegionIdContainedInCurrentRegions(regions[i].child_id)) continue;

                rg.push(regions[i]);

                if (count == maxCount - 1) break;

                count++;
            }

            return rg;
        }
    }, {
        key: 'drawPlacesInRegionList',
        value: function drawPlacesInRegionList(data) {
            var maxCount = arguments.length <= 1 || arguments[1] === undefined ? 5 : arguments[1];

            var s = '';

            if (data.length == 0) return;

            var count = 0;

            for (var i = 0; i < data.length; i++) {

                if (this.isRegionIdContainedInCurrentRegions(data[i].child_id)) continue;

                s += '<li><a href="';
                s += this.getSearchPageForRegionsAndVectorUrl(data[i].child_name) + '">';
                s += data[i].child_name;
                s += '</a></li>';

                if (count == maxCount - 1) break;

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
            var _this4 = this;

            if (this.params.regions.length == 0) return;

            var region = this.params.regions[0];
            var controller = new ApiController();

            controller.getSimilarRegions(region.id).then(function (data) {
                return _this4.drawSimilarRegionsList(data, onClickRegion);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Y0LXNlYXJjaC1wYWdlLWNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBQU0sb0JBQW9CO0FBRXRCLGFBRkUsb0JBQW9CLENBRVYsTUFBTSxFQUFFOzhCQUZsQixvQkFBb0I7O0FBSWxCLFlBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzlDLFlBQUksQ0FBQyxnQkFBZ0IsR0FBRyxHQUFHLENBQUM7O0FBRTVCLFlBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLFlBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0FBQ3RCLFlBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO0FBQ3hCLFlBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDOztBQUV0QixZQUFJLElBQUksR0FBRyxJQUFJOzs7O0FBQUMsQUFJaEIsU0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxZQUFXOztBQUVwQyxhQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDekMsYUFBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUM1RixhQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN6QyxDQUFDLENBQUM7O0FBRUgsU0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxZQUFXOztBQUVwQyxhQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDNUMsYUFBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFB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LENBQUMsQ0FBQztBQUFDLGlCQUVuQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDNUM7OztXQTVzQ0Msb0JBQW9CIiwiZmlsZSI6InY0LXNlYXJjaC1wYWdlLWNvbnRyb2xsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBTZWFyY2hQYWdlQ29udHJvbGxlciB7XG5cbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMpIHtcblxuICAgICAgICB0aGlzLk1BUF9JTklUSUFMX0NFTlRFUiA9IFszNy4xNjY5LCAtOTUuOTY2OV07XG4gICAgICAgIHRoaXMuTUFQX0lOSVRJQUxfWk9PTSA9IDQuMDtcbiAgICAgICAgXG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zO1xuICAgICAgICB0aGlzLmZldGNoaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZmV0Y2hlZEFsbCA9IGZhbHNlO1xuICAgICAgICB0aGlzLm1vc3RTaW1pbGFyID0gW107XG4gICAgXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBcbiAgICAgICAgLy8gUmVmaW5lIG1lbnVzXG4gICAgICAgIC8vXG4gICAgICAgICQoJy5yZWZpbmUtbGluaycpLm1vdXNlZW50ZXIoZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdyZWZpbmUtbGluay1zZWxlY3RlZCcpO1xuICAgICAgICAgICAgJCh0aGlzKS5jaGlsZHJlbignc3BhbicpLmNoaWxkcmVuKCdpJykucmVtb3ZlQ2xhc3MoJ2ZhLWNhcmV0LWRvd24nKS5hZGRDbGFzcygnZmEtY2FyZXQtdXAnKTtcbiAgICAgICAgICAgICQodGhpcykuY2hpbGRyZW4oJ3VsJykuc2xpZGVEb3duKDEwMCk7XG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICAkKCcucmVmaW5lLWxpbmsnKS5tb3VzZWxlYXZlKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygncmVmaW5lLWxpbmstc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgICQodGhpcykuY2hpbGRyZW4oJ3NwYW4nKS5jaGlsZHJlbignaScpLnJlbW92ZUNsYXNzKCdmYS1jYXJldC11cCcpLmFkZENsYXNzKCdmYS1jYXJldC1kb3duJyk7XG4gICAgICAgICAgICAkKHRoaXMpLmNoaWxkcmVuKCd1bCcpLnNsaWRlVXAoMTAwKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQ2F0ZWdvcmllc1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLmF0dGFjaENhdGVnb3JpZXNDbGlja0hhbmRsZXJzKCk7XG5cbiAgICAgICAgJCgnI3JlZmluZS1tZW51LWNhdGVnb3JpZXMtdmlldy1tb3JlJykuY2xpY2soZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcblxuICAgICAgICAgICAgY29udHJvbGxlci5nZXRDYXRlZ29yaWVzKClcbiAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgcmcgPSBkYXRhLnJlc3VsdHMubWFwKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICc8bGk+PGkgY2xhc3M9XCJmYSAnICsgcmVzdWx0Lm1ldGFkYXRhLmljb24gKyAnXCI+PC9pPicgKyByZXN1bHQuY2F0ZWdvcnkgKyAnPC9saT4nO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgcyA9IHJnLmpvaW4oJycpO1xuXG4gICAgICAgICAgICAgICAgICAgICQoJyNyZWZpbmUtbWVudS1jYXRlZ29yaWVzJykuaHRtbChzKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5hdHRhY2hDYXRlZ29yaWVzQ2xpY2tIYW5kbGVycygpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gRG9tYWluc1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLmF0dGFjaERvbWFpbnNDbGlja0hhbmRsZXJzKCk7XG5cbiAgICAgICAgJCgnI3JlZmluZS1tZW51LWRvbWFpbnMtdmlldy1tb3JlJykuY2xpY2soZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcblxuICAgICAgICAgICAgY29udHJvbGxlci5nZXREb21haW5zKClcbiAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgcmcgPSBkYXRhLnJlc3VsdHMubWFwKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICc8bGk+JyArIHJlc3VsdC5kb21haW4gKyAnPC9saT4nO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgcyA9IHJnLmpvaW4oJycpO1xuXG4gICAgICAgICAgICAgICAgICAgICQoJyNyZWZpbmUtbWVudS1kb21haW5zJykuaHRtbChzKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5hdHRhY2hEb21haW5zQ2xpY2tIYW5kbGVycygpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvLyBTdGFuZGFyZHNcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5hdHRhY2hTdGFuZGFyZHNDbGlja0hhbmRsZXJzKCk7XG4gICAgXG4gICAgICAgIC8vIFRva2Vuc1xuICAgICAgICAvL1xuICAgICAgICAkKCcucmVnaW9uLXRva2VuIC5mYS10aW1lcy1jaXJjbGUnKS5jbGljayhmdW5jdGlvbigpIHsgXG4gICAgXG4gICAgICAgICAgICBzZWxmLnJlbW92ZVJlZ2lvbigkKHRoaXMpLnBhcmVudCgpLmluZGV4KCkpO1xuICAgICAgICAgICAgc2VsZi5uYXZpZ2F0ZSgpO1xuICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgJCgnLmNhdGVnb3J5LXRva2VuIC5mYS10aW1lcy1jaXJjbGUnKS5jbGljayhmdW5jdGlvbigpIHsgXG4gICAgXG4gICAgICAgICAgICBzZWxmLnRvZ2dsZUNhdGVnb3J5KCQodGhpcykucGFyZW50KCkudGV4dCgpLnRvTG93ZXJDYXNlKCkudHJpbSgpKTtcbiAgICAgICAgICAgIHNlbGYubmF2aWdhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICQoJy5kb21haW4tdG9rZW4gLmZhLXRpbWVzLWNpcmNsZScpLmNsaWNrKGZ1bmN0aW9uKCkgeyBcbiAgICBcbiAgICAgICAgICAgIHNlbGYudG9nZ2xlRG9tYWluKCQodGhpcykucGFyZW50KCkudGV4dCgpLnRvTG93ZXJDYXNlKCkudHJpbSgpKTtcbiAgICAgICAgICAgIHNlbGYubmF2aWdhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICQoJy5zdGFuZGFyZC10b2tlbiAuZmEtdGltZXMtY2lyY2xlJykuY2xpY2soZnVuY3Rpb24oKSB7IFxuICAgIFxuICAgICAgICAgICAgc2VsZi50b2dnbGVTdGFuZGFyZCgkKHRoaXMpLnBhcmVudCgpLnRleHQoKS50b0xvd2VyQ2FzZSgpLnRyaW0oKSk7XG4gICAgICAgICAgICBzZWxmLm5hdmlnYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICAvLyBJbmZpbml0ZSBzY3JvbGwgc2VhcmNoIHJlc3VsdHNcbiAgICAgICAgLy9cbiAgICAgICAgJCh3aW5kb3cpLm9uKCdzY3JvbGwnLCBmdW5jdGlvbigpIHtcbiAgICBcbiAgICAgICAgICAgIHZhciBib3R0b21PZmZzZXRUb0JlZ2luUmVxdWVzdCA9IDEwMDA7XG4gICAgXG4gICAgICAgICAgICBpZiAoJCh3aW5kb3cpLnNjcm9sbFRvcCgpID49ICQoZG9jdW1lbnQpLmhlaWdodCgpIC0gJCh3aW5kb3cpLmhlaWdodCgpIC0gYm90dG9tT2Zmc2V0VG9CZWdpblJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmZldGNoTmV4dFBhZ2UoKTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgfSkuc2Nyb2xsKCk7XG4gICAgXG4gICAgICAgIC8vIEFkZCBsb2NhdGlvblxuICAgICAgICAvL1xuICAgICAgICBuZXcgQXV0b1N1Z2dlc3RSZWdpb25Db250cm9sbGVyKCcuYWRkLXJlZ2lvbiBpbnB1dFt0eXBlPVwidGV4dFwiXScsICcuYWRkLXJlZ2lvbiB1bCcsIGZ1bmN0aW9uKHJlZ2lvbikge1xuICAgIFxuICAgICAgICAgICAgc2VsZi5zZXRBdXRvU3VnZ2VzdGVkUmVnaW9uKHJlZ2lvbiwgZmFsc2UpO1xuICAgICAgICAgICAgc2VsZi5uYXZpZ2F0ZSgpO1xuICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgJCgnLmFkZC1yZWdpb24gLmZhLXBsdXMnKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICBcbiAgICAgICAgICAgICQoJy5hZGQtcmVnaW9uIGlucHV0W3R5cGU9XCJ0ZXh0XCJdJykuZm9jdXMoKTtcbiAgICAgICAgfSk7XG4gICAgXG4gICAgICAgIC8vIFNpbWlsYXIgcmVnaW9uc1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLmRyYXdTaW1pbGFyUmVnaW9ucyhmdW5jdGlvbihyZWdpb24pIHtcbiAgICBcbiAgICAgICAgICAgIHNlbGYuc2V0QXV0b1N1Z2dlc3RlZFJlZ2lvbihyZWdpb24sIGZhbHNlKTtcbiAgICAgICAgICAgIHNlbGYubmF2aWdhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgXG4gICAgICAgIC8vIFBsYWNlcyBpbiByZWdpb25cbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5kcmF3UGxhY2VzSW5SZWdpb24oKTtcbiAgICB9XG5cbiAgICAvLyBQdWJsaWMgbWV0aG9kc1xuICAgIC8vXG4gICAgYXR0YWNoQ2F0ZWdvcmllc0NsaWNrSGFuZGxlcnMoKSB7XG4gICAgXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBcbiAgICAgICAgJCgnI3JlZmluZS1tZW51LWNhdGVnb3JpZXMgbGk6bm90KC5yZWZpbmUtdmlldy1tb3JlKScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgICAgICAgICAgc2VsZi50b2dnbGVDYXRlZ29yeSgkKHRoaXMpLnRleHQoKS50b0xvd2VyQ2FzZSgpLnRyaW0oKSk7XG4gICAgICAgICAgICBzZWxmLm5hdmlnYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBhdHRhY2hEb21haW5zQ2xpY2tIYW5kbGVycygpIHtcbiAgICBcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBcbiAgICAgICAgJCgnI3JlZmluZS1tZW51LWRvbWFpbnMgbGk6bm90KC5yZWZpbmUtdmlldy1tb3JlKScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgICAgICAgICAgdmFyIGRvbWFpbiA9ICQodGhpcykudGV4dCgpLnRvTG93ZXJDYXNlKCkudHJpbSgpO1xuICAgIFxuICAgICAgICAgICAgc2VsZi50b2dnbGVEb21haW4oZG9tYWluKTtcbiAgICAgICAgICAgIHNlbGYubmF2aWdhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGF0dGFjaFN0YW5kYXJkc0NsaWNrSGFuZGxlcnMoKSB7XG4gICAgXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgXG4gICAgICAgICQoJyNyZWZpbmUtbWVudS1zdGFuZGFyZHMgbGknKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICBcbiAgICAgICAgICAgIHZhciBzdGFuZGFyZCA9ICQodGhpcykudGV4dCgpLnRvTG93ZXJDYXNlKCkudHJpbSgpO1xuICAgIFxuICAgICAgICAgICAgc2VsZi50b2dnbGVTdGFuZGFyZChzdGFuZGFyZCk7XG4gICAgICAgICAgICBzZWxmLm5hdmlnYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBkZWNyZW1lbnRQYWdlKCkge1xuICAgIFxuICAgICAgICB0aGlzLnBhcmFtcy5wYWdlLS07XG4gICAgfVxuICAgIFxuICAgIC8vIENvc3Qgb2YgbGl2aW5nXG4gICAgLy9cbiAgICBkcmF3Q29zdE9mTGl2aW5nRGF0YSgpIHtcbiAgICBcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIFxuICAgICAgICBnb29nbGUuc2V0T25Mb2FkQ2FsbGJhY2soZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgcmVnaW9uSWRzID0gc2VsZi5wYXJhbXMucmVnaW9ucy5tYXAoZnVuY3Rpb24ocmVnaW9uKSB7IHJldHVybiByZWdpb24uaWQ7IH0pO1xuICAgICAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuICAgIFxuICAgICAgICAgICAgY29udHJvbGxlci5nZXRDb3N0T2ZMaXZpbmdEYXRhKHJlZ2lvbklkcywgZnVuY3Rpb24oZGF0YSkgeyBcbiAgICBcbiAgICAgICAgICAgICAgICBzZWxmLmRyYXdDb3N0T2ZMaXZpbmdDaGFydChyZWdpb25JZHMsIGRhdGEpO1xuICAgICAgICAgICAgICAgIHNlbGYuZHJhd0Nvc3RPZkxpdmluZ1RhYmxlKHJlZ2lvbklkcywgZGF0YSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRyYXdDb3N0T2ZMaXZpbmdDaGFydChyZWdpb25JZHMsIGRhdGEpIHtcbiAgICBcbiAgICAgICAgdGhpcy5kcmF3Q29zdE9mTGl2aW5nQ2hhcnRGb3JDb21wb25lbnQoJ2Nvc3Qtb2YtbGl2aW5nLWFsbC1jaGFydCcsICdBbGwnLCByZWdpb25JZHMsIGRhdGEpO1xuICAgICAgICB0aGlzLmRyYXdDb3N0T2ZMaXZpbmdDaGFydEZvckNvbXBvbmVudCgnY29zdC1vZi1saXZpbmctZ29vZHMtY2hhcnQnLCAnR29vZHMnLCByZWdpb25JZHMsIGRhdGEpO1xuICAgICAgICB0aGlzLmRyYXdDb3N0T2ZMaXZpbmdDaGFydEZvckNvbXBvbmVudCgnY29zdC1vZi1saXZpbmctcmVudHMtY2hhcnQnLCAnUmVudHMnLCByZWdpb25JZHMsIGRhdGEpO1xuICAgICAgICB0aGlzLmRyYXdDb3N0T2ZMaXZpbmdDaGFydEZvckNvbXBvbmVudCgnY29zdC1vZi1saXZpbmctb3RoZXItY2hhcnQnLCAnT3RoZXInLCByZWdpb25JZHMsIGRhdGEpO1xuICAgIH1cbiAgICBcbiAgICBkcmF3Q29zdE9mTGl2aW5nQ2hhcnRGb3JDb21wb25lbnQoaWQsIGNvbXBvbmVudCwgcmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIHZhciBjaGFydERhdGEgPSBbXVxuICAgIFxuICAgICAgICAvLyBIZWFkZXJcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGhlYWRlciA9IFsnWWVhciddO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaGVhZGVyW2kgKyAxXSA9IHRoaXMucGFyYW1zLnJlZ2lvbnNbaV0ubmFtZTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBjaGFydERhdGEucHVzaChoZWFkZXIpO1xuICAgIFxuICAgICAgICAvLyBGb3JtYXQgdGhlIGRhdGFcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIG8gPSB7fTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICBpZiAoZGF0YVtpXS5jb21wb25lbnQgIT0gY29tcG9uZW50KVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgIFxuICAgICAgICAgICAgaWYgKG9bZGF0YVtpXS55ZWFyXSA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBvW2RhdGFbaV0ueWVhcl0gPSBbZGF0YVtpXS55ZWFyXTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIG9bZGF0YVtpXS55ZWFyXS5wdXNoKHBhcnNlRmxvYXQoZGF0YVtpXS5pbmRleCkpO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvKSB7XG4gICAgICAgICAgICBjaGFydERhdGEucHVzaChvW2tleV0pO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIHRoaXMuZHJhd0xpbmVDaGFydChpZCwgY2hhcnREYXRhLCB7XG4gICAgXG4gICAgICAgICAgICBjdXJ2ZVR5cGUgOiAnZnVuY3Rpb24nLFxuICAgICAgICAgICAgbGVnZW5kIDogeyBwb3NpdGlvbiA6ICdib3R0b20nIH0sXG4gICAgICAgICAgICBwb2ludFNoYXBlIDogJ3NxdWFyZScsXG4gICAgICAgICAgICBwb2ludFNpemUgOiA4LFxuICAgICAgICAgICAgdGl0bGUgOiBjb21wb25lbnQsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBkcmF3Q29zdE9mTGl2aW5nVGFibGUocmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIC8vIEZvcm1hdCB0aGUgZGF0YVxuICAgICAgICAvL1xuICAgICAgICB2YXIgY29tcG9uZW50cyA9IFsnQWxsJywgJ0dvb2RzJywgJ090aGVyJywgJ1JlbnRzJ107XG4gICAgICAgIHZhciByb3dzID0gW107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29tcG9uZW50cy5sZW5ndGg7IGkrKykge1xuICAgIFxuICAgICAgICAgICAgdmFyIGNvbXBvbmVudCA9IGNvbXBvbmVudHNbaV07XG4gICAgICAgICAgICB2YXIgcm93ID0gW2NvbXBvbmVudF07XG4gICAgXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHJlZ2lvbklkcy5sZW5ndGg7IGorKykge1xuICAgIFxuICAgICAgICAgICAgICAgIHZhciBvID0gdGhpcy5nZXRMYXRlc3RDb3N0T2ZMaXZpbmcoZGF0YSwgcmVnaW9uSWRzW2pdLCBjb21wb25lbnQpO1xuICAgIFxuICAgICAgICAgICAgICAgIHJvdy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggOiAobyAhPSBudWxsKSA/IHBhcnNlRmxvYXQoby5pbmRleCkgOiAnTkEnLFxuICAgICAgICAgICAgICAgICAgICBwZXJjZW50aWxlIDogKG8gIT0gbnVsbCkgPyB0aGlzLmdldFBlcmNlbnRpbGUoby5yYW5rLCBvLnRvdGFsX3JhbmtzKSA6ICdOQScsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICByb3dzLnB1c2gocm93KTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvLyBIZWFkZXJcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIHMgPSAnPHRyPjx0aD48L3RoPic7XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzICs9ICc8dGggY29sc3Bhbj1cXCcyXFwnPicgKyB0aGlzLnBhcmFtcy5yZWdpb25zW2ldLm5hbWUgKyAnPC90aD4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8vIFN1YiBoZWFkZXJcbiAgICAgICAgLy9cbiAgICAgICAgcyArPSAnPC90cj48dHI+PHRkIGNsYXNzPVxcJ2NvbHVtbi1oZWFkZXJcXCc+PC90ZD4nO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcyArPSAnPHRkIGNsYXNzPVxcJ2NvbHVtbi1oZWFkZXJcXCc+VmFsdWU8L3RkPjx0ZCBjbGFzcz1cXCdjb2x1bW4taGVhZGVyXFwnPlBlcmNlbnRpbGU8L3RkPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgcyArPSAnPC90cj4nO1xuICAgICAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb3dzLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgcm93ID0gcm93c1tpXTtcbiAgICBcbiAgICAgICAgICAgIHMgKz0gJzx0cj4nO1xuICAgICAgICAgICAgcyArPSAnPHRkPicgKyByb3dbMF0gKyAnPC90ZD4nO1xuICAgIFxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDE7IGogPCByb3cubGVuZ3RoOyBqKyspIHtcbiAgICBcbiAgICAgICAgICAgICAgICBzICs9ICc8dGQ+JyArIHJvd1tqXS5pbmRleCArICc8L3RkPic7XG4gICAgICAgICAgICAgICAgcyArPSAnPHRkPicgKyByb3dbal0ucGVyY2VudGlsZSArICc8L3RkPic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHMgKz0gJzwvdHI+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAkKCcjY29zdC1vZi1saXZpbmctdGFibGUnKS5odG1sKHMpO1xuICAgIH1cbiAgICBcbiAgICBnZXRQZXJjZW50aWxlKHJhbmssIHRvdGFsUmFua3MpIHtcbiAgICBcbiAgICAgICAgdmFyIHRvdGFsUmFua3MgPSBwYXJzZUludCh0b3RhbFJhbmtzKTtcbiAgICAgICAgdmFyIHJhbmsgPSBwYXJzZUludChyYW5rKTtcbiAgICAgICAgdmFyIHBlcmNlbnRpbGUgPSBwYXJzZUludCgoKHRvdGFsUmFua3MgLSByYW5rKSAvIHRvdGFsUmFua3MpICogMTAwKTtcbiAgICBcbiAgICAgICAgcmV0dXJuIG51bWVyYWwocGVyY2VudGlsZSkuZm9ybWF0KCcwbycpO1xuICAgIH1cbiAgICBcbiAgICBnZXRMYXRlc3RDb3N0T2ZMaXZpbmcoZGF0YSwgcmVnaW9uSWQsIGNvbXBvbmVudCkge1xuICAgIFxuICAgICAgICB2YXIgZGF0dW0gPSBudWxsO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgIGlmIChkYXRhW2ldLmlkICE9IHJlZ2lvbklkKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgIFxuICAgICAgICAgICAgaWYgKGRhdGFbaV0uY29tcG9uZW50ICE9IGNvbXBvbmVudClcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICBcbiAgICAgICAgICAgIGlmIChkYXR1bSA9PSBudWxsKSB7XG4gICAgXG4gICAgICAgICAgICAgICAgZGF0dW0gPSBkYXRhW2ldO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgaWYgKHBhcnNlSW50KGRhdGFbaV0ueWVhcikgPD0gcGFyc2VJbnQoZGF0dW0ueWVhcikpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgXG4gICAgICAgICAgICBkYXR1bSA9IGRhdGFbaV07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBkYXR1bTtcbiAgICB9XG4gICAgXG4gICAgLy8gRWFybmluZ3NcbiAgICAvL1xuICAgIGRyYXdFYXJuaW5nc0RhdGEoKSB7XG4gICAgXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBcbiAgICAgICAgZ29vZ2xlLnNldE9uTG9hZENhbGxiYWNrKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgICAgICAgICAgdmFyIHJlZ2lvbklkcyA9IHNlbGYucGFyYW1zLnJlZ2lvbnMubWFwKGZ1bmN0aW9uKHJlZ2lvbikgeyByZXR1cm4gcmVnaW9uLmlkOyB9KTtcbiAgICAgICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcbiAgICBcbiAgICAgICAgICAgIGNvbnRyb2xsZXIuZ2V0RWFybmluZ3NEYXRhKHJlZ2lvbklkcywgZnVuY3Rpb24oZGF0YSkgeyBcbiAgICBcbiAgICAgICAgICAgICAgICBzZWxmLmRyYXdFYXJuaW5nc0NoYXJ0KHJlZ2lvbklkcywgZGF0YSk7XG4gICAgICAgICAgICAgICAgc2VsZi5kcmF3RWFybmluZ3NUYWJsZShyZWdpb25JZHMsIGRhdGEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBkcmF3RWFybmluZ3NDaGFydChyZWdpb25JZHMsIGRhdGEpIHtcbiAgICBcbiAgICAgICAgdmFyIGVhcm5pbmdzID0gW107XG4gICAgXG4gICAgICAgIC8vIEhlYWRlclxuICAgICAgICAvL1xuICAgICAgICB2YXIgaGVhZGVyID0gWydFZHVjYXRpb24gTGV2ZWwnXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGhlYWRlcltpICsgMV0gPSB0aGlzLnBhcmFtcy5yZWdpb25zW2ldLm5hbWU7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgZWFybmluZ3MucHVzaChoZWFkZXIpO1xuICAgIFxuICAgICAgICAvLyBMZXNzIHRoYW4gaGlnaCBzY2hvb2xcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIHNvbWVIaWdoU2Nob29sRWFybmluZ3MgPSBbJ1NvbWUgSGlnaCBTY2hvb2wnXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHNvbWVIaWdoU2Nob29sRWFybmluZ3NbaSArIDFdID0gcGFyc2VJbnQoZGF0YVtpXS5tZWRpYW5fZWFybmluZ3NfbGVzc190aGFuX2hpZ2hfc2Nob29sKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBlYXJuaW5ncy5wdXNoKHNvbWVIaWdoU2Nob29sRWFybmluZ3MpO1xuICAgIFxuICAgICAgICAvLyBIaWdoIHNjaG9vbFxuICAgICAgICAvL1xuICAgICAgICB2YXIgaGlnaFNjaG9vbEVhcm5pbmdzID0gWydIaWdoIFNjaG9vbCddO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaGlnaFNjaG9vbEVhcm5pbmdzW2kgKyAxXSA9IHBhcnNlSW50KGRhdGFbaV0ubWVkaWFuX2Vhcm5pbmdzX2hpZ2hfc2Nob29sKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBlYXJuaW5ncy5wdXNoKGhpZ2hTY2hvb2xFYXJuaW5ncyk7XG4gICAgXG4gICAgICAgIC8vIFNvbWUgY29sbGVnZVxuICAgICAgICAvL1xuICAgICAgICB2YXIgc29tZUNvbGxlZ2VFYXJuaW5ncyA9IFsnU29tZSBDb2xsZWdlJ107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzb21lQ29sbGVnZUVhcm5pbmdzW2kgKyAxXSA9IHBhcnNlSW50KGRhdGFbaV0ubWVkaWFuX2Vhcm5pbmdzX3NvbWVfY29sbGVnZV9vcl9hc3NvY2lhdGVzKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBlYXJuaW5ncy5wdXNoKHNvbWVDb2xsZWdlRWFybmluZ3MpO1xuICAgIFxuICAgICAgICAvLyBCYWNoZWxvcidzXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBiYWNoZWxvcnNFYXJuaW5ncyA9IFsnQmFjaGVsb3JcXCdzJ107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBiYWNoZWxvcnNFYXJuaW5nc1tpICsgMV0gPSBwYXJzZUludChkYXRhW2ldLm1lZGlhbl9lYXJuaW5nc19iYWNoZWxvcl9kZWdyZWUpO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGVhcm5pbmdzLnB1c2goYmFjaGVsb3JzRWFybmluZ3MpO1xuICAgIFxuICAgICAgICAvLyBHcmFkdWF0ZSBkZWdyZWVcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGdyYWR1YXRlRGVncmVlRWFybmluZ3MgPSBbJ0dyYWR1YXRlIERlZ3JlZSddO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZ3JhZHVhdGVEZWdyZWVFYXJuaW5nc1tpICsgMV0gPSBwYXJzZUludChkYXRhW2ldLm1lZGlhbl9lYXJuaW5nc19ncmFkdWF0ZV9vcl9wcm9mZXNzaW9uYWxfZGVncmVlKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBlYXJuaW5ncy5wdXNoKGdyYWR1YXRlRGVncmVlRWFybmluZ3MpO1xuICAgIFxuICAgICAgICB0aGlzLmRyYXdTdGVwcGVkQXJlYUNoYXJ0KCdlYXJuaW5ncy1jaGFydCcsIGVhcm5pbmdzLCB7XG4gICAgXG4gICAgICAgICAgICBhcmVhT3BhY2l0eSA6IDAsXG4gICAgICAgICAgICBjb25uZWN0U3RlcHM6IHRydWUsXG4gICAgICAgICAgICBjdXJ2ZVR5cGUgOiAnZnVuY3Rpb24nLFxuICAgICAgICAgICAgZm9jdXNUYXJnZXQgOiAnY2F0ZWdvcnknLFxuICAgICAgICAgICAgbGVnZW5kIDogeyBwb3NpdGlvbiA6ICdib3R0b20nIH0sXG4gICAgICAgICAgICB0aXRsZSA6ICdFYXJuaW5ncyBieSBFZHVjYXRpb24gTGV2ZWwnLFxuICAgICAgICAgICAgdkF4aXMgOiB7IGZvcm1hdCA6ICdjdXJyZW5jeScgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRyYXdFYXJuaW5nc1RhYmxlKHJlZ2lvbklkcywgZGF0YSkge1xuICAgIFxuICAgICAgICB2YXIgcyA9ICcnO1xuICAgIFxuICAgICAgICBzICs9ICc8dHI+PHRoPjwvdGg+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0aD4nICsgdGhpcy5wYXJhbXMucmVnaW9uc1tpXS5uYW1lICsgJzwvdGg+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvLyBNZWRpYW4gZWFybmluZ3MgYWxsXG4gICAgICAgIC8vXG4gICAgICAgIHMgKz0gJzwvdHI+PHRyPjx0ZD5NZWRpYW4gRWFybmluZ3MgKEFsbCBXb3JrZXJzKTwvdGQ+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgbnVtZXJhbChkYXRhW2ldLm1lZGlhbl9lYXJuaW5ncykuZm9ybWF0KCckMCwwJykgKyAnPC90ZD4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8vIE1lZGlhbiBlYXJuaW5ncyBmZW1hbGVcbiAgICAgICAgLy9cbiAgICAgICAgcyArPSAnPC90cj48dHI+PHRkPk1lZGlhbiBGZW1hbGUgRWFybmluZ3MgKEZ1bGwgVGltZSk8L3RkPic7XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzICs9ICc8dGQ+JyArIG51bWVyYWwoZGF0YVtpXS5mZW1hbGVfZnVsbF90aW1lX21lZGlhbl9lYXJuaW5ncykuZm9ybWF0KCckMCwwJykgKyAnPC90ZD4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8vIE1lZGlhbiBlYXJuaW5ncyBtYWxlXG4gICAgICAgIC8vXG4gICAgICAgIHMgKz0gJzwvdHI+PHRyPjx0ZD5NZWRpYW4gTWFsZSBFYXJuaW5ncyAoRnVsbCBUaW1lKTwvdGQ+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgbnVtZXJhbChkYXRhW2ldLm1hbGVfZnVsbF90aW1lX21lZGlhbl9lYXJuaW5ncykuZm9ybWF0KCckMCwwJykgKyAnPC90ZD4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIHMgKz0gJzwvdHI+JztcbiAgICBcbiAgICAgICAgJCgnI2Vhcm5pbmdzLXRhYmxlJykuaHRtbChzKTtcbiAgICB9XG4gICAgXG4gICAgLy8gRWR1Y2F0aW9uXG4gICAgLy9cbiAgICBkcmF3RWR1Y2F0aW9uRGF0YSgpIHtcbiAgICBcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIFxuICAgICAgICBnb29nbGUuc2V0T25Mb2FkQ2FsbGJhY2soZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgcmVnaW9uSWRzID0gc2VsZi5wYXJhbXMucmVnaW9ucy5tYXAoZnVuY3Rpb24ocmVnaW9uKSB7IHJldHVybiByZWdpb24uaWQ7IH0pO1xuICAgICAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuICAgIFxuICAgICAgICAgICAgY29udHJvbGxlci5nZXRFZHVjYXRpb25EYXRhKHJlZ2lvbklkcywgZnVuY3Rpb24oZGF0YSkgeyBcbiAgICBcbiAgICAgICAgICAgICAgICBzZWxmLmRyYXdFZHVjYXRpb25UYWJsZShyZWdpb25JZHMsIGRhdGEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBkcmF3RWR1Y2F0aW9uVGFibGUocmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIHZhciBzID0gJyc7XG4gICAgXG4gICAgICAgIC8vIEhlYWRlclxuICAgICAgICAvL1xuICAgICAgICBzICs9ICc8dHI+PHRoPjwvdGg+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0aCBjb2xzcGFuPVxcJzJcXCc+JyArIHRoaXMucGFyYW1zLnJlZ2lvbnNbaV0ubmFtZSArICc8L3RoPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgLy8gU3ViIGhlYWRlclxuICAgICAgICAvL1xuICAgICAgICBzICs9ICc8L3RyPjx0cj48dGQgY2xhc3M9XFwnY29sdW1uLWhlYWRlclxcJz48L3RkPic7XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzICs9ICc8dGQgY2xhc3M9XFwnY29sdW1uLWhlYWRlclxcJz5QZXJjZW50PC90ZD48dGQgY2xhc3M9XFwnY29sdW1uLWhlYWRlclxcJz5QZXJjZW50aWxlPC90ZD4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8vIEF0IGxlYXN0IGJhY2hlbG9yJ3NcbiAgICAgICAgLy9cbiAgICAgICAgcyArPSAnPC90cj48dHI+PHRkPkF0IExlYXN0IEJhY2hlbG9yXFwncyBEZWdyZWU8L3RkPic7XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgdG90YWxSYW5rcyA9IHBhcnNlSW50KGRhdGFbaV0udG90YWxfcmFua3MpO1xuICAgICAgICAgICAgdmFyIHJhbmsgPSBwYXJzZUludChkYXRhW2ldLnBlcmNlbnRfYmFjaGVsb3JzX2RlZ3JlZV9vcl9oaWdoZXJfcmFuayk7XG4gICAgICAgICAgICB2YXIgcGVyY2VudGlsZSA9IHBhcnNlSW50KCgodG90YWxSYW5rcyAtIHJhbmspIC8gdG90YWxSYW5rcykgKiAxMDApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBzICs9ICc8dGQ+JyArIGRhdGFbaV0ucGVyY2VudF9iYWNoZWxvcnNfZGVncmVlX29yX2hpZ2hlciArICclPC90ZD4nO1xuICAgICAgICAgICAgcyArPSAnPHRkPicgKyBudW1lcmFsKHBlcmNlbnRpbGUpLmZvcm1hdCgnMG8nKSArICc8L3RkPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgLy8gQXQgbGVhc3QgaGlnaCBzY2hvb2wgZGlwbG9tYVxuICAgICAgICAvL1xuICAgICAgICBzICs9ICc8L3RyPjx0cj48dGQ+QXQgTGVhc3QgSGlnaCBTY2hvb2wgRGlwbG9tYTwvdGQ+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgIHZhciB0b3RhbFJhbmtzID0gcGFyc2VJbnQoZGF0YVtpXS50b3RhbF9yYW5rcyk7XG4gICAgICAgICAgICB2YXIgcmFuayA9IHBhcnNlSW50KGRhdGFbaV0ucGVyY2VudF9oaWdoX3NjaG9vbF9ncmFkdWF0ZV9vcl9oaWdoZXIpO1xuICAgICAgICAgICAgdmFyIHBlcmNlbnRpbGUgPSBwYXJzZUludCgoKHRvdGFsUmFua3MgLSByYW5rKSAvIHRvdGFsUmFua3MpICogMTAwKTtcbiAgICBcbiAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgZGF0YVtpXS5wZXJjZW50X2hpZ2hfc2Nob29sX2dyYWR1YXRlX29yX2hpZ2hlciArICclPC90ZD4nO1xuICAgICAgICAgICAgcyArPSAnPHRkPicgKyBudW1lcmFsKHBlcmNlbnRpbGUpLmZvcm1hdCgnMG8nKSArICc8L3RkPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgcyArPSAnPC90cj4nO1xuICAgIFxuICAgICAgICAkKCcjZWR1Y2F0aW9uLXRhYmxlJykuaHRtbChzKTtcbiAgICB9XG4gICAgXG4gICAgLy8gR0RQIGRhdGFcbiAgICAvL1xuICAgIGRyYXdHZHBEYXRhKCkge1xuICAgIFxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgXG4gICAgICAgIGdvb2dsZS5zZXRPbkxvYWRDYWxsYmFjayhmdW5jdGlvbigpIHtcbiAgICBcbiAgICAgICAgICAgIHZhciByZWdpb25JZHMgPSBzZWxmLnBhcmFtcy5yZWdpb25zLm1hcChmdW5jdGlvbihyZWdpb24pIHsgcmV0dXJuIHJlZ2lvbi5pZDsgfSk7XG4gICAgICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG4gICAgXG4gICAgICAgICAgICBjb250cm9sbGVyLmdldEdkcERhdGEocmVnaW9uSWRzLCBmdW5jdGlvbihkYXRhKSB7IFxuICAgIFxuICAgICAgICAgICAgICAgIHNlbGYuZHJhd0dkcENoYXJ0KHJlZ2lvbklkcywgZGF0YSk7XG4gICAgICAgICAgICAgICAgc2VsZi5kcmF3R2RwQ2hhbmdlQ2hhcnQocmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZHJhd0dkcENoYXJ0KHJlZ2lvbklkcywgZGF0YSkge1xuICAgIFxuICAgICAgICB2YXIgY2hhcnREYXRhID0gW107XG4gICAgXG4gICAgICAgIC8vIEhlYWRlclxuICAgICAgICAvL1xuICAgICAgICB2YXIgaGVhZGVyID0gWydZZWFyJ107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBoZWFkZXJbaSArIDFdID0gdGhpcy5wYXJhbXMucmVnaW9uc1tpXS5uYW1lO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGNoYXJ0RGF0YS5wdXNoKGhlYWRlcik7XG4gICAgXG4gICAgICAgIC8vIEZvcm1hdCB0aGUgZGF0YVxuICAgICAgICAvL1xuICAgICAgICB2YXIgbyA9IHt9O1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgIGlmIChvW2RhdGFbaV0ueWVhcl0gPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgb1tkYXRhW2ldLnllYXJdID0gW2RhdGFbaV0ueWVhcl07XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICBvW2RhdGFbaV0ueWVhcl0ucHVzaChwYXJzZUZsb2F0KGRhdGFbaV0ucGVyX2NhcGl0YV9nZHApKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gbykge1xuICAgICAgICAgICAgY2hhcnREYXRhLnB1c2gob1trZXldKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvLyBEcmF3IGNoYXJ0XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuZHJhd0xpbmVDaGFydCgncGVyLWNhcGl0YS1nZHAtY2hhcnQnLCBjaGFydERhdGEsIHtcbiAgICBcbiAgICAgICAgICAgIGN1cnZlVHlwZSA6ICdmdW5jdGlvbicsXG4gICAgICAgICAgICBsZWdlbmQgOiB7IHBvc2l0aW9uIDogJ2JvdHRvbScgfSxcbiAgICAgICAgICAgIHBvaW50U2hhcGUgOiAnc3F1YXJlJyxcbiAgICAgICAgICAgIHBvaW50U2l6ZSA6IDgsXG4gICAgICAgICAgICB0aXRsZSA6ICdQZXIgQ2FwaXRhIFJlYWwgR0RQIG92ZXIgVGltZScsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBkcmF3R2RwQ2hhbmdlQ2hhcnQocmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIHZhciBjaGFydERhdGEgPSBbXTtcbiAgICBcbiAgICAgICAgLy8gSGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBoZWFkZXIgPSBbJ1llYXInXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGhlYWRlcltpICsgMV0gPSB0aGlzLnBhcmFtcy5yZWdpb25zW2ldLm5hbWU7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgY2hhcnREYXRhLnB1c2goaGVhZGVyKTtcbiAgICBcbiAgICAgICAgLy8gRm9ybWF0IHRoZSBkYXRhXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBvID0ge307XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIFxuICAgICAgICAgICAgaWYgKG9bZGF0YVtpXS55ZWFyXSA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBvW2RhdGFbaV0ueWVhcl0gPSBbZGF0YVtpXS55ZWFyXTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIG9bZGF0YVtpXS55ZWFyXS5wdXNoKHBhcnNlRmxvYXQoZGF0YVtpXS5wZXJfY2FwaXRhX2dkcF9wZXJjZW50X2NoYW5nZSkgLyAxMDApO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvKSB7XG4gICAgICAgICAgICBjaGFydERhdGEucHVzaChvW2tleV0pO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8vIERyYXcgY2hhcnRcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5kcmF3TGluZUNoYXJ0KCdwZXItY2FwaXRhLWdkcC1jaGFuZ2UtY2hhcnQnLCBjaGFydERhdGEsIHtcbiAgICBcbiAgICAgICAgICAgIGN1cnZlVHlwZSA6ICdmdW5jdGlvbicsXG4gICAgICAgICAgICBsZWdlbmQgOiB7IHBvc2l0aW9uIDogJ2JvdHRvbScgfSxcbiAgICAgICAgICAgIHBvaW50U2hhcGUgOiAnc3F1YXJlJyxcbiAgICAgICAgICAgIHBvaW50U2l6ZSA6IDgsXG4gICAgICAgICAgICB0aXRsZSA6ICdBbm51YWwgQ2hhbmdlIGluIFBlciBDYXBpdGEgR0RQIG92ZXIgVGltZScsXG4gICAgICAgICAgICB2QXhpcyA6IHsgZm9ybWF0IDogJyMuIyUnIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICAvLyBPY2N1cGF0aW9uc1xuICAgIC8vXG4gICAgZHJhd09jY3VwYXRpb25zRGF0YSgpIHtcbiAgICBcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIFxuICAgICAgICBnb29nbGUuc2V0T25Mb2FkQ2FsbGJhY2soZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgcmVnaW9uSWRzID0gc2VsZi5wYXJhbXMucmVnaW9ucy5tYXAoZnVuY3Rpb24ocmVnaW9uKSB7IHJldHVybiByZWdpb24uaWQ7IH0pO1xuICAgICAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuICAgIFxuICAgICAgICAgICAgY29udHJvbGxlci5nZXRPY2N1cGF0aW9uc0RhdGEocmVnaW9uSWRzLCBmdW5jdGlvbihkYXRhKSB7IFxuICAgIFxuICAgICAgICAgICAgICAgIHNlbGYuZHJhd09jY3VwYXRpb25zVGFibGUocmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZHJhd09jY3VwYXRpb25zVGFibGUocmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIHZhciBzID0gJzx0cj48dGg+PC90aD4nO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcyArPSAnPHRoIGNvbHNwYW49XFwnMlxcJz4nICsgdGhpcy5wYXJhbXMucmVnaW9uc1tpXS5uYW1lICsgJzwvdGg+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvLyBTdWIgaGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHMgKz0gJzwvdHI+PHRyPjx0ZCBjbGFzcz1cXCdjb2x1bW4taGVhZGVyXFwnPjwvdGQ+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0ZCBjbGFzcz1cXCdjb2x1bW4taGVhZGVyXFwnPlBlcmNlbnQ8L3RkPjx0ZCBjbGFzcz1cXCdjb2x1bW4taGVhZGVyXFwnPlBlcmNlbnRpbGU8L3RkPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICBpZiAoKGkgJSByZWdpb25JZHMubGVuZ3RoKSA9PSAwKVxuICAgICAgICAgICAgICAgIHMgKz0gJzwvdHI+PHRyPjx0ZD4nICsgZGF0YVtpXS5vY2N1cGF0aW9uICsgJzwvdGQ+JzsgXG4gICAgXG4gICAgICAgICAgICB2YXIgdG90YWxSYW5rcyA9IHBhcnNlSW50KGRhdGFbaV0udG90YWxfcmFua3MpO1xuICAgICAgICAgICAgdmFyIHJhbmsgPSBwYXJzZUludChkYXRhW2ldLnBlcmNlbnRfZW1wbG95ZWRfcmFuayk7XG4gICAgICAgICAgICB2YXIgcGVyY2VudGlsZSA9IHBhcnNlSW50KCgodG90YWxSYW5rcyAtIHJhbmspIC8gdG90YWxSYW5rcykgKiAxMDApO1xuICAgIFxuICAgICAgICAgICAgcyArPSAnPHRkPicgKyBudW1lcmFsKGRhdGFbaV0ucGVyY2VudF9lbXBsb3llZCkuZm9ybWF0KCcwLjAnKSArICclPC90ZD4nO1xuICAgICAgICAgICAgcyArPSAnPHRkPicgKyBudW1lcmFsKHBlcmNlbnRpbGUpLmZvcm1hdCgnMG8nKSArICc8L3RkPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgcyArPSAnPC90cj4nO1xuICAgIFxuICAgICAgICAkKCcjb2NjdXBhdGlvbnMtdGFibGUnKS5odG1sKHMpO1xuICAgIH1cbiAgICBcbiAgICAvLyBQb3B1bGF0aW9uXG4gICAgLy9cbiAgICBkcmF3UG9wdWxhdGlvbkRhdGEoKSB7XG5cbiAgICAgICAgZ29vZ2xlLnNldE9uTG9hZENhbGxiYWNrKCgpID0+IHtcblxuICAgICAgICAgICAgdmFyIHJlZ2lvbklkcyA9IHRoaXMucGFyYW1zLnJlZ2lvbnMubWFwKGZ1bmN0aW9uKHJlZ2lvbikgeyByZXR1cm4gcmVnaW9uLmlkOyB9KTtcbiAgICAgICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcblxuICAgICAgICAgICAgY29udHJvbGxlci5nZXRQb3B1bGF0aW9uRGF0YShyZWdpb25JZHMsIChkYXRhKSA9PiB7IFxuXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3UG9wdWxhdGlvbk1hcCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BvcHVsYXRpb25DaGFydChyZWdpb25JZHMsIGRhdGEpO1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BvcHVsYXRpb25DaGFuZ2VDaGFydChyZWdpb25JZHMsIGRhdGEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBkcmF3UG9wdWxhdGlvbkNoYXJ0KHJlZ2lvbklkcywgZGF0YSkge1xuICAgIFxuICAgICAgICB2YXIgY2hhcnREYXRhID0gW107XG4gICAgICAgIHZhciB5ZWFyO1xuICAgIFxuICAgICAgICAvLyBIZWFkZXJcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGhlYWRlciA9IFsnWWVhciddO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaGVhZGVyW2kgKyAxXSA9IHRoaXMucGFyYW1zLnJlZ2lvbnNbaV0ubmFtZTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBjaGFydERhdGEucHVzaChoZWFkZXIpO1xuICAgIFxuICAgICAgICAvLyBEYXRhXG4gICAgICAgIC8vXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIFxuICAgICAgICAgICAgdmFyIG0gPSAoaSAlIHJlZ2lvbklkcy5sZW5ndGgpO1xuICAgIFxuICAgICAgICAgICAgaWYgKG0gPT0gMCkge1xuICAgIFxuICAgICAgICAgICAgICAgIHllYXIgPSBbXTtcbiAgICAgICAgICAgICAgICB5ZWFyWzBdID0gZGF0YVtpXS55ZWFyO1xuICAgICAgICAgICAgICAgIGNoYXJ0RGF0YS5wdXNoKHllYXIpO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgeWVhclttICsgMV0gPSBwYXJzZUludChkYXRhW2ldLnBvcHVsYXRpb24pO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIHRoaXMuZHJhd0xpbmVDaGFydCgncG9wdWxhdGlvbi1jaGFydCcsIGNoYXJ0RGF0YSwge1xuICAgIFxuICAgICAgICAgICAgY3VydmVUeXBlIDogJ2Z1bmN0aW9uJyxcbiAgICAgICAgICAgIGxlZ2VuZCA6IHsgcG9zaXRpb24gOiAnYm90dG9tJyB9LFxuICAgICAgICAgICAgcG9pbnRTaGFwZSA6ICdzcXVhcmUnLFxuICAgICAgICAgICAgcG9pbnRTaXplIDogOCxcbiAgICAgICAgICAgIHRpdGxlIDogJ1BvcHVsYXRpb24nLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZHJhd1BvcHVsYXRpb25DaGFuZ2VDaGFydChyZWdpb25JZHMsIGRhdGEpIHtcbiAgICBcbiAgICAgICAgdmFyIGNoYXJ0RGF0YSA9IFtdO1xuICAgICAgICB2YXIgeWVhcjtcbiAgICBcbiAgICAgICAgLy8gSGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBoZWFkZXIgPSBbJ1llYXInXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGhlYWRlcltpICsgMV0gPSB0aGlzLnBhcmFtcy5yZWdpb25zW2ldLm5hbWU7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgY2hhcnREYXRhLnB1c2goaGVhZGVyKTtcbiAgICBcbiAgICAgICAgLy8gRGF0YVxuICAgICAgICAvL1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgIHZhciBtID0gKGkgJSByZWdpb25JZHMubGVuZ3RoKTtcbiAgICBcbiAgICAgICAgICAgIGlmIChtID09IDApIHtcbiAgICBcbiAgICAgICAgICAgICAgICB5ZWFyID0gW107XG4gICAgICAgICAgICAgICAgeWVhclswXSA9IGRhdGFbaV0ueWVhcjtcbiAgICAgICAgICAgICAgICBjaGFydERhdGEucHVzaCh5ZWFyKTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIHllYXJbbSArIDFdID0gcGFyc2VGbG9hdChkYXRhW2ldLnBvcHVsYXRpb25fcGVyY2VudF9jaGFuZ2UpIC8gMTAwO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIHRoaXMuZHJhd0xpbmVDaGFydCgncG9wdWxhdGlvbi1jaGFuZ2UtY2hhcnQnLCBjaGFydERhdGEsIHtcbiAgICBcbiAgICAgICAgICAgIGN1cnZlVHlwZSA6ICdmdW5jdGlvbicsXG4gICAgICAgICAgICBsZWdlbmQgOiB7IHBvc2l0aW9uIDogJ2JvdHRvbScgfSxcbiAgICAgICAgICAgIHBvaW50U2hhcGUgOiAnc3F1YXJlJyxcbiAgICAgICAgICAgIHBvaW50U2l6ZSA6IDgsXG4gICAgICAgICAgICB0aXRsZSA6ICdQb3B1bGF0aW9uIENoYW5nZScsXG4gICAgICAgICAgICB2QXhpcyA6IHsgZm9ybWF0IDogJyMuIyUnIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBkcmF3UG9wdWxhdGlvbk1hcCgpIHtcbiAgICBcbiAgICAgICAgdmFyIG1hcCA9IEwubWFwKFxuICAgICAgICAgICAgJ21hcCcsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgem9vbUNvbnRyb2wgOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIG1hcC5zZXRWaWV3KHRoaXMuTUFQX0lOSVRJQUxfQ0VOVEVSLCB0aGlzLk1BUF9JTklUSUFMX1pPT00pO1xuXG4gICAgICAgIHZhciBteUxpbmVzID0gW3tcbiAgICAgICAgICAgIFwidHlwZVwiOiBcIkxpbmVTdHJpbmdcIixcbiAgICAgICAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1stMTAwLCA0MF0sIFstMTA1LCA0NV0sIFstMTEwLCA1NV1dXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIFwidHlwZVwiOiBcIkxpbmVTdHJpbmdcIixcbiAgICAgICAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1stMTA1LCA0MF0sIFstMTEwLCA0NV0sIFstMTE1LCA1NV1dXG4gICAgICAgIH1dO1xuICAgICAgICBcbiAgICAgICAgdmFyIG15U3R5bGUgPSB7XG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiI2ZmNzgwMFwiLFxuICAgICAgICAgICAgXCJ3ZWlnaHRcIjogNSxcbiAgICAgICAgICAgIFwib3BhY2l0eVwiOiAwLjY1XG4gICAgICAgIH07XG4gICAgICAgIFxuLyogICAgICAgIEwuZ2VvSnNvbihcbiAgICAgICAgICAgIG15TGluZXMsIFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHN0eWxlOiBteVN0eWxlXG4gICAgICAgICAgICB9KS5hZGRUbyhtYXApO1xuKi8gICAgICAgIFxuICAgICAgICBMLnRpbGVMYXllcignaHR0cHM6Ly9hLnRpbGVzLm1hcGJveC5jb20vdjMvc29jcmF0YS1hcHBzLmlicDBsODk5L3t6fS97eH0ve3l9LnBuZycpLmFkZFRvKG1hcCk7XG4gICAgfVxuICAgIFxuICAgIC8vIFBsYWNlcyBpbiByZWdpb25cbiAgICAvL1xuICAgIGRyYXdQbGFjZXNJblJlZ2lvbigpIHtcblxuICAgICAgICBpZiAodGhpcy5wYXJhbXMucmVnaW9ucy5sZW5ndGggPT0gMCkgXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgdmFyIHJlZ2lvbiA9IHRoaXMucGFyYW1zLnJlZ2lvbnNbMF07XG5cbiAgICAgICAgc3dpdGNoIChyZWdpb24udHlwZSkge1xuXG4gICAgICAgICAgICBjYXNlICduYXRpb24nOiBcbiAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgIGNhc2UgJ3N0YXRlJzpcblxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BsYWNlc0luU3RhdGVGb3JSZWdpb24ocmVnaW9uLmlkLCByZWdpb24pIC8vIHRoZSByZWdpb24gaXMgYSBzdGF0ZVxuICAgICAgICAgICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5sZW5ndGggPT0gMClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNwbGFjZXMtaW4tcmVnaW9uLWhlYWRlcicpLnRleHQoJ1BsYWNlcyBpbiB7MH0nLmZvcm1hdChyZWdpb24ubmFtZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI3BsYWNlcy1pbi1yZWdpb24taGVhZGVyJykuc2xpZGVUb2dnbGUoMTAwKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3UGxhY2VzSW5SZWdpb25MaXN0KHJlc3BvbnNlLCAxMCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6IFxuXG4gICAgICAgICAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuXG4gICAgICAgICAgICAgICAgY29udHJvbGxlci5nZXRQYXJlbnRTdGF0ZShyZWdpb24pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmxlbmd0aCA9PSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gcmVzcG9uc2VbMF07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BsYWNlc0luU3RhdGVGb3JSZWdpb24oc3RhdGUucGFyZW50X2lkLCByZWdpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5sZW5ndGggPT0gMClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjcGxhY2VzLWluLXJlZ2lvbi1oZWFkZXInKS50ZXh0KCdQbGFjZXMgaW4gezB9Jy5mb3JtYXQoc3RhdGUucGFyZW50X25hbWUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnI3BsYWNlcy1pbi1yZWdpb24taGVhZGVyJykuc2xpZGVUb2dnbGUoMTAwKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdQbGFjZXNJblJlZ2lvbkxpc3QocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmF3UGxhY2VzSW5TdGF0ZUZvclJlZ2lvbihzdGF0ZUlkLCByZWdpb24pIHtcblxuICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG5cbiAgICAgICAgc3dpdGNoIChyZWdpb24udHlwZSkge1xuXG4gICAgICAgICAgICBjYXNlICdjb3VudHknOiByZXR1cm4gY29udHJvbGxlci5nZXRDb3VudGllc0luU3RhdGUoc3RhdGVJZCk7XG4gICAgICAgICAgICBjYXNlICdtc2EnOiByZXR1cm4gY29udHJvbGxlci5nZXRNZXRyb3NJblN0YXRlKHN0YXRlSWQpO1xuICAgICAgICAgICAgY2FzZSAncGxhY2UnOiByZXR1cm4gY29udHJvbGxlci5nZXRQbGFjZXNJblN0YXRlKHN0YXRlSWQpO1xuICAgICAgICAgICAgY2FzZSAnc3RhdGUnOlxuXG4gICAgICAgICAgICAgICAgdmFyIHBsYWNlc1Byb21pc2UgPSBjb250cm9sbGVyLmdldFBsYWNlc0luU3RhdGUoc3RhdGVJZCk7XG4gICAgICAgICAgICAgICAgdmFyIGNvdW50aWVzUHJvbWlzZSA9IGNvbnRyb2xsZXIuZ2V0Q291bnRpZXNJblN0YXRlKHN0YXRlSWQpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFtwbGFjZXNQcm9taXNlLCBjb3VudGllc1Byb21pc2VdKVxuICAgICAgICAgICAgICAgICAgICAudGhlbih2YWx1ZXMgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmcwID0gdGhpcy5yZW1vdmVDdXJyZW50UmVnaW9ucyh2YWx1ZXNbMF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJnMSA9IHRoaXMucmVtb3ZlQ3VycmVudFJlZ2lvbnModmFsdWVzWzFdKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZzAuY29uY2F0KHJnMSkpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuXG4gICAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbW92ZUN1cnJlbnRSZWdpb25zKHJlZ2lvbnMsIG1heENvdW50ID0gNSkge1xuXG4gICAgICAgIHZhciBjb3VudCA9IDA7XG4gICAgICAgIHZhciByZyA9IFtdO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9ucy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5pc1JlZ2lvbklkQ29udGFpbmVkSW5DdXJyZW50UmVnaW9ucyhyZWdpb25zW2ldLmNoaWxkX2lkKSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgcmcucHVzaChyZWdpb25zW2ldKTtcblxuICAgICAgICAgICAgaWYgKGNvdW50ID09IChtYXhDb3VudCAtIDEpKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJnO1xuICAgIH1cblxuICAgIGRyYXdQbGFjZXNJblJlZ2lvbkxpc3QoZGF0YSwgbWF4Q291bnQgPSA1KSB7XG5cbiAgICAgICAgdmFyIHMgPSAnJztcblxuICAgICAgICBpZiAoZGF0YS5sZW5ndGggPT0gMClcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICB2YXIgY291bnQgPSAwO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5pc1JlZ2lvbklkQ29udGFpbmVkSW5DdXJyZW50UmVnaW9ucyhkYXRhW2ldLmNoaWxkX2lkKSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgcyArPSAnPGxpPjxhIGhyZWY9XCInO1xuICAgICAgICAgICAgcyArPSB0aGlzLmdldFNlYXJjaFBhZ2VGb3JSZWdpb25zQW5kVmVjdG9yVXJsKGRhdGFbaV0uY2hpbGRfbmFtZSkgKyAnXCI+JztcbiAgICAgICAgICAgIHMgKz0gZGF0YVtpXS5jaGlsZF9uYW1lO1xuICAgICAgICAgICAgcyArPSAnPC9hPjwvbGk+JztcblxuICAgICAgICAgICAgaWYgKGNvdW50ID09IChtYXhDb3VudCAtIDEpKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICB9XG5cbiAgICAgICAgJCgnI3BsYWNlcy1pbi1yZWdpb24nKS5odG1sKHMpO1xuICAgICAgICAkKCcjcGxhY2VzLWluLXJlZ2lvbicpLnNsaWRlVG9nZ2xlKDEwMCk7XG4gICAgfVxuXG4gICAgaXNSZWdpb25JZENvbnRhaW5lZEluQ3VycmVudFJlZ2lvbnMocmVnaW9uSWQpIHtcblxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMucGFyYW1zLnJlZ2lvbnMubGVuZ3RoOyBqKyspIHtcblxuICAgICAgICAgICAgaWYgKHJlZ2lvbklkID09IHRoaXMucGFyYW1zLnJlZ2lvbnNbal0uaWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gU2ltaWxhciByZWdpb25zXG4gICAgLy9cbiAgICBkcmF3U2ltaWxhclJlZ2lvbnMob25DbGlja1JlZ2lvbikge1xuXG4gICAgICAgIGlmICh0aGlzLnBhcmFtcy5yZWdpb25zLmxlbmd0aCA9PSAwKSBcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICB2YXIgcmVnaW9uID0gdGhpcy5wYXJhbXMucmVnaW9uc1swXTtcbiAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuXG4gICAgICAgIGNvbnRyb2xsZXIuZ2V0U2ltaWxhclJlZ2lvbnMocmVnaW9uLmlkKVxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB0aGlzLmRyYXdTaW1pbGFyUmVnaW9uc0xpc3QoZGF0YSwgb25DbGlja1JlZ2lvbikpXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgIH1cblxuICAgIGRyYXdTaW1pbGFyUmVnaW9uc0xpc3QoZGF0YSwgb25DbGlja1JlZ2lvbikge1xuXG4gICAgICAgIHZhciBzID0gJyc7XG5cbiAgICAgICAgaWYgKGRhdGEubW9zdF9zaW1pbGFyID09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICB2YXIgY291bnQgPSAwO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5tb3N0X3NpbWlsYXIubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgaWYgKHRoaXMuaXNSZWdpb25JZENvbnRhaW5lZEluQ3VycmVudFJlZ2lvbnMoZGF0YS5tb3N0X3NpbWlsYXJbaV0uaWQpKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBzICs9ICc8bGk+PGE+PGkgY2xhc3M9XCJmYSBmYS1wbHVzXCI+PC9pPicgKyBkYXRhLm1vc3Rfc2ltaWxhcltpXS5uYW1lICsgJzwvYT48L2xpPidcblxuICAgICAgICAgICAgaWYgKGNvdW50ID09IDQpXG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgJCgnI3NpbWlsYXItcmVnaW9ucycpLmh0bWwocyk7XG4gICAgICAgICQoJyNzaW1pbGFyLXJlZ2lvbnMnKS5zbGlkZVRvZ2dsZSgxMDApO1xuICAgICAgICBcbiAgICAgICAgJCgnI3NpbWlsYXItcmVnaW9ucyBsaSBhJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgaW5kZXggPSAkKHRoaXMpLnBhcmVudCgpLmluZGV4KCk7XG4gICAgICAgICAgICBvbkNsaWNrUmVnaW9uKGRhdGEubW9zdF9zaW1pbGFyW2luZGV4XS5uYW1lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIC8vIERyYXcgY2hhcnRzXG4gICAgLy9cbiAgICBkcmF3TGluZUNoYXJ0KGNoYXJ0SWQsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBcbiAgICAgICAgdmFyIGRhdGFUYWJsZSA9IGdvb2dsZS52aXN1YWxpemF0aW9uLmFycmF5VG9EYXRhVGFibGUoZGF0YSk7XG4gICAgICAgIHZhciBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5MaW5lQ2hhcnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY2hhcnRJZCkpO1xuICAgIFxuICAgICAgICBjaGFydC5kcmF3KGRhdGFUYWJsZSwgb3B0aW9ucyk7XG4gICAgfVxuICAgIFxuICAgIGRyYXdTdGVwcGVkQXJlYUNoYXJ0KGNoYXJ0SWQsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBcbiAgICAgICAgdmFyIGRhdGFUYWJsZSA9IGdvb2dsZS52aXN1YWxpemF0aW9uLmFycmF5VG9EYXRhVGFibGUoZGF0YSk7XG4gICAgICAgIHZhciBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5TdGVwcGVkQXJlYUNoYXJ0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNoYXJ0SWQpKTtcbiAgICBcbiAgICAgICAgY2hhcnQuZHJhdyhkYXRhVGFibGUsIG9wdGlvbnMpO1xuICAgIH1cbiAgICBcbiAgICAvLyBQYWdpbmdcbiAgICAvL1xuICAgIGZldGNoTmV4dFBhZ2UoKSB7XG4gICAgXG4gICAgICAgIGlmICh0aGlzLmZldGNoaW5nIHx8IHRoaXMuZmV0Y2hlZEFsbClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICBcbiAgICAgICAgdGhpcy5mZXRjaGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuaW5jcmVtZW50UGFnZSgpO1xuICAgIFxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgXG4gICAgICAgICQuYWpheCh0aGlzLmdldFNlYXJjaFJlc3VsdHNVcmwoKSkuZG9uZShmdW5jdGlvbihkYXRhLCB0ZXh0U3RhdHVzLCBqcVhIUikge1xuICAgIFxuICAgICAgICAgICAgY29uc29sZS5sb2coanFYSFIuc3RhdHVzICsgJyAnICsgdGV4dFN0YXR1cyk7XG4gICAgXG4gICAgICAgICAgICBpZiAoanFYSFIuc3RhdHVzID09IDIwNCkgeyAvLyBubyBjb250ZW50XG4gICAgXG4gICAgICAgICAgICAgICAgc2VsZi5kZWNyZW1lbnRQYWdlKCk7XG4gICAgICAgICAgICAgICAgc2VsZi5mZXRjaGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHNlbGYuZmV0Y2hlZEFsbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgJCgnLmRhdGFzZXRzJykuYXBwZW5kKGRhdGEpO1xuICAgICAgICAgICAgc2VsZi5mZXRjaGluZyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZ2V0U2VhcmNoUGFnZUZvclJlZ2lvbnNBbmRWZWN0b3JVcmwocmVnaW9ucywgdmVjdG9yLCBxdWVyeVN0cmluZykge1xuICAgIFxuICAgICAgICB2YXIgdXJsID0gJy8nO1xuICAgIFxuICAgICAgICBpZiAodHlwZW9mKHJlZ2lvbnMpID09PSAnc3RyaW5nJykge1xuICAgIFxuICAgICAgICAgICAgdXJsICs9IHJlZ2lvbnMucmVwbGFjZSgvLC9nLCAnJykucmVwbGFjZSgvIC9nLCAnXycpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocmVnaW9ucykpIHtcbiAgICBcbiAgICAgICAgICAgIHZhciByZWdpb25OYW1lcyA9IFtdO1xuICAgIFxuICAgICAgICAgICAgcmVnaW9uTmFtZXMgPSByZWdpb25zLm1hcChmdW5jdGlvbihyZWdpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVnaW9uLnJlcGxhY2UoLywvZywgJycpLnJlcGxhY2UoLyAvZywgJ18nKTtcbiAgICAgICAgICAgIH0pO1xuICAgIFxuICAgICAgICAgICAgdXJsICs9IHJlZ2lvbk5hbWVzLmpvaW4oJ192c18nKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICBcbiAgICAgICAgICAgIHVybCArPSAnc2VhcmNoJztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBpZiAodmVjdG9yKVxuICAgICAgICAgICAgdXJsICs9ICcvJyArIHZlY3RvcjtcbiAgICBcbiAgICAgICAgaWYgKHF1ZXJ5U3RyaW5nKSBcbiAgICAgICAgICAgIHVybCArPSBxdWVyeVN0cmluZztcbiAgICBcbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICB9XG4gICAgXG4gICAgZ2V0U2VhcmNoUGFnZVVybCgpIHtcbiAgICBcbiAgICAgICAgaWYgKCh0aGlzLnBhcmFtcy5yZWdpb25zLmxlbmd0aCA+IDApIHx8IHRoaXMucGFyYW1zLmF1dG9TdWdnZXN0ZWRSZWdpb24pIHtcbiAgICBcbiAgICAgICAgICAgIHZhciByZWdpb25OYW1lcyA9IFtdO1xuICAgIFxuICAgICAgICAgICAgaWYgKHRoaXMucGFyYW1zLnJlc2V0UmVnaW9ucyA9PSBmYWxzZSkge1xuICAgIFxuICAgICAgICAgICAgICAgIHJlZ2lvbk5hbWVzID0gdGhpcy5wYXJhbXMucmVnaW9ucy5tYXAoZnVuY3Rpb24ocmVnaW9uKSB7IFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVnaW9uLm5hbWU7IFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgaWYgKHRoaXMucGFyYW1zLmF1dG9TdWdnZXN0ZWRSZWdpb24pXG4gICAgICAgICAgICAgICAgcmVnaW9uTmFtZXMucHVzaCh0aGlzLnBhcmFtcy5hdXRvU3VnZ2VzdGVkUmVnaW9uKTtcbiAgICBcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFNlYXJjaFBhZ2VGb3JSZWdpb25zQW5kVmVjdG9yVXJsKHJlZ2lvbk5hbWVzLCB0aGlzLnBhcmFtcy52ZWN0b3IsIHRoaXMuZ2V0U2VhcmNoUXVlcnlTdHJpbmcoKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRTZWFyY2hQYWdlRm9yUmVnaW9uc0FuZFZlY3RvclVybChudWxsLCB0aGlzLnBhcmFtcy52ZWN0b3IsIHRoaXMuZ2V0U2VhcmNoUXVlcnlTdHJpbmcoKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgZ2V0U2VhcmNoUmVzdWx0c1VybCgpIHtcbiAgICBcbiAgICAgICAgdmFyIHNlYXJjaFJlc3VsdHNVcmwgPSB0aGlzLnBhcmFtcy5yZWdpb25zLmxlbmd0aCA9PSAwID8gJy9zZWFyY2gtcmVzdWx0cycgOiAnLi9zZWFyY2gtcmVzdWx0cyc7IFxuICAgICAgICB2YXIgdXJsID0gc2VhcmNoUmVzdWx0c1VybCArIHRoaXMuZ2V0U2VhcmNoUXVlcnlTdHJpbmcoKTsgXG4gICAgXG4gICAgICAgIHJldHVybiB1cmw7XG4gICAgfVxuICAgIFxuICAgIGdldFNlYXJjaFF1ZXJ5U3RyaW5nKCkge1xuICAgIFxuICAgICAgICB2YXIgdXJsID0gJz9xPScgKyBlbmNvZGVVUklDb21wb25lbnQodGhpcy5wYXJhbXMucSk7XG4gICAgXG4gICAgICAgIGlmICh0aGlzLnBhcmFtcy5wYWdlID4gMSlcbiAgICAgICAgICAgIHVybCArPSAnJnBhZ2U9JyArIHRoaXMucGFyYW1zLnBhZ2U7XG4gICAgXG4gICAgICAgIGlmICh0aGlzLnBhcmFtcy5jYXRlZ29yaWVzLmxlbmd0aCA+IDApXG4gICAgICAgICAgICB1cmwgKz0gJyZjYXRlZ29yaWVzPScgKyBlbmNvZGVVUklDb21wb25lbnQodGhpcy5wYXJhbXMuY2F0ZWdvcmllcy5qb2luKCcsJykpO1xuICAgIFxuICAgICAgICBpZiAodGhpcy5wYXJhbXMuZG9tYWlucy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgdXJsICs9ICcmZG9tYWlucz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMucGFyYW1zLmRvbWFpbnMuam9pbignLCcpKTtcbiAgICBcbiAgICAgICAgaWYgKHRoaXMucGFyYW1zLnN0YW5kYXJkcy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgdXJsICs9ICcmc3RhbmRhcmRzPScgKyBlbmNvZGVVUklDb21wb25lbnQodGhpcy5wYXJhbXMuc3RhbmRhcmRzLmpvaW4oJywnKSk7XG4gICAgXG4gICAgICAgIHJldHVybiB1cmw7XG4gICAgfVxuICAgIFxuICAgIGluY3JlbWVudFBhZ2UoKSB7XG4gICAgXG4gICAgICAgIHRoaXMucGFyYW1zLnBhZ2UrKztcbiAgICB9XG4gICAgXG4gICAgbmF2aWdhdGUoKSB7XG4gICAgXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdGhpcy5nZXRTZWFyY2hQYWdlVXJsKCk7XG4gICAgfVxuICAgIFxuICAgIHJlbW92ZVJlZ2lvbihyZWdpb25JbmRleCkge1xuICAgIFxuICAgICAgICB0aGlzLnBhcmFtcy5yZWdpb25zLnNwbGljZShyZWdpb25JbmRleCwgMSk7IC8vIHJlbW92ZSBhdCBpbmRleCBpXG4gICAgICAgIHRoaXMucGFyYW1zLnBhZ2UgPSAxO1xuICAgIH1cbiAgICBcbiAgICBzZXRBdXRvU3VnZ2VzdGVkUmVnaW9uKHJlZ2lvbiwgcmVzZXRSZWdpb25zKSB7XG4gICAgXG4gICAgICAgIHRoaXMucGFyYW1zLmF1dG9TdWdnZXN0ZWRSZWdpb24gPSByZWdpb247XG4gICAgICAgIHRoaXMucGFyYW1zLnJlc2V0UmVnaW9ucyA9IHJlc2V0UmVnaW9ucztcbiAgICAgICAgdGhpcy5wYXJhbXMucGFnZSA9IDE7XG4gICAgfVxuICAgIFxuICAgIHRvZ2dsZUNhdGVnb3J5KGNhdGVnb3J5KSB7XG4gICAgXG4gICAgICAgIHZhciBpID0gdGhpcy5wYXJhbXMuY2F0ZWdvcmllcy5pbmRleE9mKGNhdGVnb3J5KTtcbiAgICBcbiAgICAgICAgaWYgKGkgPiAtMSlcbiAgICAgICAgICAgIHRoaXMucGFyYW1zLmNhdGVnb3JpZXMuc3BsaWNlKGksIDEpOyAvLyByZW1vdmUgYXQgaW5kZXggaVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLnBhcmFtcy5jYXRlZ29yaWVzLnB1c2goY2F0ZWdvcnkpO1xuICAgIH1cbiAgICBcbiAgICB0b2dnbGVEb21haW4oZG9tYWluKSB7XG4gICAgXG4gICAgICAgIHZhciBpID0gdGhpcy5wYXJhbXMuZG9tYWlucy5pbmRleE9mKGRvbWFpbik7XG4gICAgXG4gICAgICAgIGlmIChpID4gLTEpXG4gICAgICAgICAgICB0aGlzLnBhcmFtcy5kb21haW5zLnNwbGljZShpLCAxKTsgLy8gcmVtb3ZlIGF0IGluZGV4IGlcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5wYXJhbXMuZG9tYWlucy5wdXNoKGRvbWFpbik7XG4gICAgfVxuICAgIFxuICAgIHRvZ2dsZVN0YW5kYXJkKHN0YW5kYXJkKSB7XG4gICAgXG4gICAgICAgIHZhciBpID0gdGhpcy5wYXJhbXMuc3RhbmRhcmRzLmluZGV4T2Yoc3RhbmRhcmQpO1xuICAgIFxuICAgICAgICBpZiAoaSA+IC0xKVxuICAgICAgICAgICAgdGhpcy5wYXJhbXMuc3RhbmRhcmRzLnNwbGljZShpLCAxKTsgLy8gcmVtb3ZlIGF0IGluZGV4IGlcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5wYXJhbXMuc3RhbmRhcmRzLnB1c2goc3RhbmRhcmQpO1xuICAgIH1cbn0iXX0=
//# sourceMappingURL=v4-search-page-controller.js.map
