'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SearchPageController = (function () {
    function SearchPageController(params) {
        _classCallCheck(this, SearchPageController);

        this.MAP_COLOR_SCALE = colorbrewer.RdYlBu[9], this.MAP_INITIAL_ZOOM = 10.0;
        this.MAP_RADIUS_SCALE = [500, 2000];

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
            var _this = this;

            google.setOnLoadCallback(function () {

                var regionIds = _this.params.regions.map(function (region) {
                    return region.id;
                });
                var controller = new ApiController();

                controller.getCostOfLivingData(regionIds).then(function (data) {

                    _this.drawCostOfLivingChart(regionIds, data);
                    _this.drawCostOfLivingTable(regionIds, data);
                }).catch(function (error) {
                    return console.error(error);
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
            var _this2 = this;

            google.setOnLoadCallback(function () {

                var regionIds = _this2.params.regions.map(function (region) {
                    return region.id;
                });
                var controller = new ApiController();

                controller.getEarningsData(regionIds).then(function (data) {

                    _this2.drawEarningsMap();
                    _this2.drawEarningsChart(regionIds, data);
                    _this2.drawEarningsTable(regionIds, data);
                }).catch(function (error) {
                    return console.error(error);
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
        key: 'drawEarningsMap',
        value: function drawEarningsMap() {
            var _this3 = this;

            var controller = new ApiController();
            var placesPromise = controller.getPlaces();
            var earningsPromise = controller.getEarningsByPlace();

            return Promise.all([placesPromise, earningsPromise]).then(function (values) {

                var placesResponse = values[0];
                var earningsResponse = values[1];

                // Get the geo coordinates for each region
                //
                var regionPlaces = _this3.getPlacesForRegion(placesResponse);

                // Create a place lookup table
                //
                var placeMap = {};
                placesResponse.forEach(function (place) {
                    return placeMap[place.id] = place;
                }); // init the place map

                // Get map data
                //
                var earningsPlaces = [];

                earningsResponse.forEach(function (item) {

                    if (item.median_earnings == 0) return;

                    if (item.id in placeMap) {

                        earningsPlaces.push({
                            coordinates: placeMap[item.id].location.coordinates,
                            id: item.id,
                            name: item.name,
                            value: parseInt(item.median_earnings)
                        });
                    }
                });

                earningsPlaces.sort(function (a, b) {
                    return b.value - a.value;
                }); // desc
                var earnings = _.map(earningsPlaces, function (x) {
                    return x.value;
                });

                // Init map
                //
                var radiusScale = _this3.getRadiusScaleLinear(earnings);
                var colorScale = _this3.getColorScale(earnings);

                var coordinates = regionPlaces[0].location.coordinates;
                var center = [coordinates[1], coordinates[0]];
                var map = L.map('map', { zoomControl: true });

                L.tileLayer('https://a.tiles.mapbox.com/v3/socrata-apps.ibp0l899/{z}/{x}/{y}.png').addTo(map);
                map.setView(center, _this3.MAP_INITIAL_ZOOM);

                // Populate map
                //
                _this3.drawCirclesForPlaces(map, earningsPlaces, radiusScale, colorScale);
                _this3.drawMarkersForPlaces(map, regionPlaces);
            }).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'drawEarningsTable',
        value: function drawEarningsTable(regionIds, data) {

            var s = '<tr><th></th>';

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
            var _this4 = this;

            google.setOnLoadCallback(function () {

                var regionIds = _this4.params.regions.map(function (region) {
                    return region.id;
                });
                var controller = new ApiController();

                controller.getEducationData(regionIds).then(function (data) {
                    return _this4.drawEducationTable(regionIds, data);
                }).catch(function (error) {
                    return console.error(error);
                });
            });
        }
    }, {
        key: 'drawEducationTable',
        value: function drawEducationTable(regionIds, data) {

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
            var _this5 = this;

            google.setOnLoadCallback(function () {

                var regionIds = _this5.params.regions.map(function (region) {
                    return region.id;
                });
                var controller = new ApiController();

                controller.getGdpData(regionIds).then(function (data) {

                    _this5.drawGdpChart(regionIds, data);
                    _this5.drawGdpChangeChart(regionIds, data);
                }).catch(function (error) {
                    return console.error(error);
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
            var _this6 = this;

            google.setOnLoadCallback(function () {

                var regionIds = _this6.params.regions.map(function (region) {
                    return region.id;
                });
                var controller = new ApiController();

                controller.getOccupationsData(regionIds).then(function (data) {
                    return _this6.drawOccupationsTable(regionIds, data);
                }).catch(function (error) {
                    return console.error(error);
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
            var _this7 = this;

            google.setOnLoadCallback(function () {

                var regionIds = _this7.params.regions.map(function (region) {
                    return region.id;
                });
                var controller = new ApiController();

                controller.getPopulationData(regionIds).then(function (data) {

                    _this7.drawPopulationMap();
                    _this7.drawPopulationChart(regionIds, data);
                    _this7.drawPopulationChangeChart(regionIds, data);
                }).catch(function (error) {
                    return console.error(error);
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
            var _this8 = this;

            var controller = new ApiController();
            var places = [];

            controller.getPlaces().then(function (placesResponse) {

                // Set place value to earnings data
                //
                placesResponse.forEach(function (item) {
                    places.push({
                        coordinates: item.location.coordinates,
                        name: item.name,
                        id: item.id,
                        value: parseInt(item.population)
                    });
                });

                // Get map data
                //
                var populatedPlaces = places.sort(function (a, b) {
                    return b.value - a.value;
                });
                var regionPlaces = _this8.getPlacesForRegion(placesResponse);
                var populations = _.map(populatedPlaces, function (x) {
                    return x.value;
                });

                // Init map
                //
                var radiusScale = _this8.getRadiusScaleLog(populations);
                var colorScale = _this8.getColorScale(populations);

                var coordinates = regionPlaces[0].location.coordinates;
                var center = [coordinates[1], coordinates[0]];
                var map = L.map('map', { zoomControl: true });

                L.tileLayer('https://a.tiles.mapbox.com/v3/socrata-apps.ibp0l899/{z}/{x}/{y}.png').addTo(map);
                map.setView(center, _this8.MAP_INITIAL_ZOOM);

                // Populate map
                //
                _this8.drawCirclesForPlaces(map, populatedPlaces, radiusScale, colorScale);
                _this8.drawMarkersForPlaces(map, regionPlaces);
            }).catch(function (error) {
                return console.error(error);
            });
        }

        // Places in region
        //

    }, {
        key: 'drawPlacesInRegion',
        value: function drawPlacesInRegion() {

            if (this.params.regions.length == 0) return;

            var region = this.params.regions[0];

            switch (region.type) {

                case 'nation':
                    this.drawChildPlacesInRegion(region, 'Regions in {0}'.format(region.name));break;
                case 'region':
                    this.drawChildPlacesInRegion(region, 'Divisions in {0}'.format(region.name));break;
                case 'division':
                    this.drawChildPlacesInRegion(region, 'States in {0}'.format(region.name));break;
                case 'state':
                    this.drawCitiesAndCountiesInState(region);break;
                case 'county':
                    this.drawOtherCountiesInState(region);break;
                case 'msa':
                    this.drawOtherMetrosInState(region);break;
                case 'place':
                    this.drawOtherCitiesInState(region);break;
            }
        }
    }, {
        key: 'drawChildPlacesInRegion',
        value: function drawChildPlacesInRegion(region, label) {
            var _this9 = this;

            var controller = new ApiController();

            controller.getChildRegions(region.id).then(function (response) {

                _this9.drawPlacesInRegionHeader('#places-in-region-header-0', label);
                _this9.drawPlacesInRegionList('#places-in-region-list-0', response);
            }).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'drawCitiesAndCountiesInState',
        value: function drawCitiesAndCountiesInState(region) {
            var _this10 = this;

            var controller = new ApiController();
            var citiesPromise = controller.getCitiesInState(region.id);
            var countiesPromise = controller.getCountiesInState(region.id);

            return Promise.all([citiesPromise, countiesPromise]).then(function (values) {

                if (values.length == 0) return;

                if (values[0].length > 0) {

                    _this10.drawPlacesInRegionHeader('#places-in-region-header-0', 'Places in {0}'.format(region.name));
                    _this10.drawPlacesInRegionList('#places-in-region-list-0', values[0]);
                }

                if (values[1].length > 0) {

                    _this10.drawPlacesInRegionHeader('#places-in-region-header-1', 'Counties in {0}'.format(region.name));
                    _this10.drawPlacesInRegionList('#places-in-region-list-1', values[1]);
                }
            }).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'drawOtherCitiesInState',
        value: function drawOtherCitiesInState(region) {
            var _this11 = this;

            var controller = new ApiController();

            controller.getParentState(region).then(function (response) {

                if (response.length == 0) return;

                var state = response[0];

                controller.getCitiesInState(state.parent_id).then(function (response) {

                    if (response.length == 0) return;

                    _this11.drawPlacesInRegionHeader('#places-in-region-header-0', 'Places in {0}'.format(state.parent_name));
                    _this11.drawPlacesInRegionList('#places-in-region-list-0', response);
                }).catch(function (error) {
                    return console.error(error);
                });
            });
        }
    }, {
        key: 'drawOtherCountiesInState',
        value: function drawOtherCountiesInState(region) {
            var _this12 = this;

            var controller = new ApiController();

            controller.getParentState(region).then(function (response) {

                if (response.length == 0) return;

                var state = response[0];

                controller.getCountiesInState(state.parent_id).then(function (response) {

                    if (response.length == 0) return;

                    _this12.drawPlacesInRegionHeader('#places-in-region-header-0', 'Counties in {0}'.format(state.parent_name));
                    _this12.drawPlacesInRegionList('#places-in-region-list-0', response);
                }).catch(function (error) {
                    return console.error(error);
                });
            });
        }
    }, {
        key: 'drawOtherMetrosInState',
        value: function drawOtherMetrosInState(region) {
            var _this13 = this;

            var controller = new ApiController();

            controller.getParentState(region).then(function (response) {

                if (response.length == 0) return;

                var state = response[0];

                controller.getMetrosInState(state.parent_id).then(function (response) {

                    if (response.length == 0) return;

                    _this13.drawPlacesInRegionHeader('#places-in-region-header-0', 'Metropolitan Areas in {0}'.format(state.parent_name));
                    _this13.drawPlacesInRegionList('#places-in-region-list-0', response);
                }).catch(function (error) {
                    return console.error(error);
                });
            });
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
        key: 'drawPlacesInRegionHeader',
        value: function drawPlacesInRegionHeader(headerId, label) {

            $(headerId).text(label).slideToggle(100);
        }
    }, {
        key: 'drawPlacesInRegionList',
        value: function drawPlacesInRegionList(listId, data) {
            var maxCount = arguments.length <= 2 || arguments[2] === undefined ? 5 : arguments[2];

            if (data.length == 0) return;

            var count = 0;
            var s = '';

            for (var i = 0; i < data.length; i++) {

                if (this.isRegionIdContainedInCurrentRegions(data[i].child_id)) continue;

                s += '<li><a href="';
                s += this.getSearchPageForRegionsAndVectorUrl(data[i].child_name) + '">';
                s += data[i].child_name;
                s += '</a></li>';

                if (count == maxCount - 1) break;

                count++;
            }

            $(listId).html(s);
            $(listId).slideToggle(100);
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
            var _this14 = this;

            if (this.params.regions.length == 0) return;

            var region = this.params.regions[0];
            var controller = new ApiController();

            controller.getSimilarRegions(region.id).then(function (data) {
                return _this14.drawSimilarRegionsList(data, onClickRegion);
            }).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'drawSimilarRegionsList',
        value: function drawSimilarRegionsList(data, onClickRegion) {

            if (data.most_similar == undefined) return;

            var count = 0;
            var s = '';

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

        // Maps
        //

    }, {
        key: 'getRadiusScaleLinear',
        value: function getRadiusScaleLinear(values) {

            return d3.scale.linear().domain(d3.extent(values)).range(this.MAP_RADIUS_SCALE);
        }
    }, {
        key: 'getRadiusScaleLog',
        value: function getRadiusScaleLog(values) {

            return d3.scale.log().domain(d3.extent(values)).range(this.MAP_RADIUS_SCALE);
        }
    }, {
        key: 'getColorScale',
        value: function getColorScale(values) {
            var _this15 = this;

            var domain = (function () {

                var step = 1.0 / _this15.MAP_COLOR_SCALE.length;

                function quantile(value, index, list) {
                    return d3.quantile(values, (index + 1) * step);
                }

                return _.map(_this15.MAP_COLOR_SCALE.slice(1), quantile);
            })();

            return d3.scale.quantile().domain(domain).range(this.MAP_COLOR_SCALE);
        }
    }, {
        key: 'drawCirclesForPlaces',
        value: function drawCirclesForPlaces(map, places, radiusScale, colorScale) {

            places.forEach(function (place) {

                var feature = {
                    "type": "Feature",
                    "properties": {
                        "name": place.name
                    },
                    "geometry": {
                        "coordinates": place.coordinates,
                        "type": "Point"
                    }
                };

                var options = {
                    fillColor: colorScale(place.value),
                    fillOpacity: 1,
                    opacity: 0,
                    radius: 8,
                    stroke: false,
                    weight: 0
                };

                L.geoJson(feature, {
                    pointToLayer: function pointToLayer(feature, latlng) {
                        return L.circle(latlng, radiusScale(place.value), options);
                    }
                }).addTo(map);
            });
        }
    }, {
        key: 'drawMarkersForPlaces',
        value: function drawMarkersForPlaces(map, places) {

            places.forEach(function (place) {

                var feature = {
                    "type": "Feature",
                    "properties": {
                        "name": place.name
                    },
                    "geometry": {
                        "coordinates": place.location.coordinates,
                        "type": "Point"
                    }
                };

                L.geoJson(feature).addTo(map);
            });
        }
    }, {
        key: 'getPlacesForRegion',
        value: function getPlacesForRegion(data) {
            var _this16 = this;

            var places = [];

            data.forEach(function (place) {

                _this16.params.regions.forEach(function (region) {

                    if (place.id == region.id) places.push(place);
                });
            });

            return places;
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
        value: function getSearchPageForRegionsAndVectorUrl(regions, vector, searchResults, queryString) {

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

            if (searchResults) url += '/search-results';

            if (queryString) url += queryString;

            return url;
        }
    }, {
        key: 'getSearchPageUrl',
        value: function getSearchPageUrl(searchResults) {

            if (this.params.regions.length > 0 || this.params.autoSuggestedRegion) {

                var regionNames = [];

                if (this.params.resetRegions == false) {

                    regionNames = this.params.regions.map(function (region) {
                        return region.name;
                    });
                }

                if (this.params.autoSuggestedRegion) regionNames.push(this.params.autoSuggestedRegion);

                return this.getSearchPageForRegionsAndVectorUrl(regionNames, this.params.vector, searchResults, this.getSearchQueryString());
            } else {

                return this.getSearchPageForRegionsAndVectorUrl(null, this.params.vector, searchResults, this.getSearchQueryString());
            }
        }
    }, {
        key: 'getSearchResultsUrl',
        value: function getSearchResultsUrl() {

            return this.getSearchPageUrl(true);
        }
    }, {
        key: 'getSearchQueryString',
        value: function getSearchQueryString() {

            var url = '?q=' + encodeURIComponent(this.params.q);

            if (this.params.page > 1) url += '&page=' + this.params.page;

            if (this.params.categories.length > 0) url += '&categories=' + encodeURIComponent(this.params.categories.join(','));

            if (this.params.domains.length > 0) url += '&domains=' + encodeURIComponent(this.params.domains.join(','));

            if (this.params.standards.length > 0) url += '&standards=' + encodeURIComponent(this.params.standards.join(','));

            if (this.params.debug) url += '&debug=';

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Y0LXNlYXJjaC1wYWdlLWNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBQU0sb0JBQW9CO0FBRXRCLGFBRkUsb0JBQW9CLENBRVYsTUFBTSxFQUFFOzhCQUZsQixvQkFBb0I7O0FBSWxCLFlBQUksQ0FBQyxlQUFlLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFDNUMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztBQUM3QixZQUFJLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRXBDLFlBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLFlBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0FBQ3RCLFlBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO0FBQ3hCLFlBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDOztBQUV0QixZQUFJLElBQUksR0FBRyxJQUFJOzs7O0FBQUMsQUFJaEIsU0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxZQUFXOztBQUVwQyxhQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDekMsYUFBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUM1RixhQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN6QyxDQUFDLENBQUM7O0FBRUgsU0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxZQUFXOztBQUVwQyxhQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFD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QUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUU1QyxnQkFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQ04sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFBQyxpQkFFakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3hDOzs7dUNBRWMsUUFBUSxFQUFFOztBQUVyQixnQkFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUVoRCxnQkFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQ04sSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFBQyxpQkFFbkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQzVDOzs7V0FqN0NDLG9CQUFvQiIsImZpbGUiOiJ2NC1zZWFyY2gtcGFnZS1jb250cm9sbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgU2VhcmNoUGFnZUNvbnRyb2xsZXIge1xuXG4gICAgY29uc3RydWN0b3IocGFyYW1zKSB7XG5cbiAgICAgICAgdGhpcy5NQVBfQ09MT1JfU0NBTEUgPSBjb2xvcmJyZXdlci5SZFlsQnVbOV0sXG4gICAgICAgIHRoaXMuTUFQX0lOSVRJQUxfWk9PTSA9IDEwLjA7XG4gICAgICAgIHRoaXMuTUFQX1JBRElVU19TQ0FMRSA9IFs1MDAsIDIwMDBdO1xuXG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zO1xuICAgICAgICB0aGlzLmZldGNoaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZmV0Y2hlZEFsbCA9IGZhbHNlO1xuICAgICAgICB0aGlzLm1vc3RTaW1pbGFyID0gW107XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIC8vIFJlZmluZSBtZW51c1xuICAgICAgICAvL1xuICAgICAgICAkKCcucmVmaW5lLWxpbmsnKS5tb3VzZWVudGVyKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdyZWZpbmUtbGluay1zZWxlY3RlZCcpO1xuICAgICAgICAgICAgJCh0aGlzKS5jaGlsZHJlbignc3BhbicpLmNoaWxkcmVuKCdpJykucmVtb3ZlQ2xhc3MoJ2ZhLWNhcmV0LWRvd24nKS5hZGRDbGFzcygnZmEtY2FyZXQtdXAnKTtcbiAgICAgICAgICAgICQodGhpcykuY2hpbGRyZW4oJ3VsJykuc2xpZGVEb3duKDEwMCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICQoJy5yZWZpbmUtbGluaycpLm1vdXNlbGVhdmUoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ3JlZmluZS1saW5rLXNlbGVjdGVkJyk7XG4gICAgICAgICAgICAkKHRoaXMpLmNoaWxkcmVuKCdzcGFuJykuY2hpbGRyZW4oJ2knKS5yZW1vdmVDbGFzcygnZmEtY2FyZXQtdXAnKS5hZGRDbGFzcygnZmEtY2FyZXQtZG93bicpO1xuICAgICAgICAgICAgJCh0aGlzKS5jaGlsZHJlbigndWwnKS5zbGlkZVVwKDEwMCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIENhdGVnb3JpZXNcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5hdHRhY2hDYXRlZ29yaWVzQ2xpY2tIYW5kbGVycygpO1xuXG4gICAgICAgICQoJyNyZWZpbmUtbWVudS1jYXRlZ29yaWVzLXZpZXctbW9yZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG5cbiAgICAgICAgICAgIGNvbnRyb2xsZXIuZ2V0Q2F0ZWdvcmllcygpXG4gICAgICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHJnID0gZGF0YS5yZXN1bHRzLm1hcChmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnPGxpPjxpIGNsYXNzPVwiZmEgJyArIHJlc3VsdC5tZXRhZGF0YS5pY29uICsgJ1wiPjwvaT4nICsgcmVzdWx0LmNhdGVnb3J5ICsgJzwvbGk+JztcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHMgPSByZy5qb2luKCcnKTtcblxuICAgICAgICAgICAgICAgICAgICAkKCcjcmVmaW5lLW1lbnUtY2F0ZWdvcmllcycpLmh0bWwocyk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYXR0YWNoQ2F0ZWdvcmllc0NsaWNrSGFuZGxlcnMoKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIERvbWFpbnNcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5hdHRhY2hEb21haW5zQ2xpY2tIYW5kbGVycygpO1xuXG4gICAgICAgICQoJyNyZWZpbmUtbWVudS1kb21haW5zLXZpZXctbW9yZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG5cbiAgICAgICAgICAgIGNvbnRyb2xsZXIuZ2V0RG9tYWlucygpXG4gICAgICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHJnID0gZGF0YS5yZXN1bHRzLm1hcChmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnPGxpPicgKyByZXN1bHQuZG9tYWluICsgJzwvbGk+JztcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHMgPSByZy5qb2luKCcnKTtcblxuICAgICAgICAgICAgICAgICAgICAkKCcjcmVmaW5lLW1lbnUtZG9tYWlucycpLmh0bWwocyk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYXR0YWNoRG9tYWluc0NsaWNrSGFuZGxlcnMoKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gU3RhbmRhcmRzXG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuYXR0YWNoU3RhbmRhcmRzQ2xpY2tIYW5kbGVycygpO1xuICAgIFxuICAgICAgICAvLyBUb2tlbnNcbiAgICAgICAgLy9cbiAgICAgICAgJCgnLnJlZ2lvbi10b2tlbiAuZmEtdGltZXMtY2lyY2xlJykuY2xpY2soZnVuY3Rpb24oKSB7IFxuICAgIFxuICAgICAgICAgICAgc2VsZi5yZW1vdmVSZWdpb24oJCh0aGlzKS5wYXJlbnQoKS5pbmRleCgpKTtcbiAgICAgICAgICAgIHNlbGYubmF2aWdhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICQoJy5jYXRlZ29yeS10b2tlbiAuZmEtdGltZXMtY2lyY2xlJykuY2xpY2soZnVuY3Rpb24oKSB7IFxuICAgIFxuICAgICAgICAgICAgc2VsZi50b2dnbGVDYXRlZ29yeSgkKHRoaXMpLnBhcmVudCgpLnRleHQoKS50b0xvd2VyQ2FzZSgpLnRyaW0oKSk7XG4gICAgICAgICAgICBzZWxmLm5hdmlnYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICAkKCcuZG9tYWluLXRva2VuIC5mYS10aW1lcy1jaXJjbGUnKS5jbGljayhmdW5jdGlvbigpIHsgXG4gICAgXG4gICAgICAgICAgICBzZWxmLnRvZ2dsZURvbWFpbigkKHRoaXMpLnBhcmVudCgpLnRleHQoKS50b0xvd2VyQ2FzZSgpLnRyaW0oKSk7XG4gICAgICAgICAgICBzZWxmLm5hdmlnYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICAkKCcuc3RhbmRhcmQtdG9rZW4gLmZhLXRpbWVzLWNpcmNsZScpLmNsaWNrKGZ1bmN0aW9uKCkgeyBcbiAgICBcbiAgICAgICAgICAgIHNlbGYudG9nZ2xlU3RhbmRhcmQoJCh0aGlzKS5wYXJlbnQoKS50ZXh0KCkudG9Mb3dlckNhc2UoKS50cmltKCkpO1xuICAgICAgICAgICAgc2VsZi5uYXZpZ2F0ZSgpO1xuICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgLy8gSW5maW5pdGUgc2Nyb2xsIHNlYXJjaCByZXN1bHRzXG4gICAgICAgIC8vXG4gICAgICAgICQod2luZG93KS5vbignc2Nyb2xsJywgZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgYm90dG9tT2Zmc2V0VG9CZWdpblJlcXVlc3QgPSAxMDAwO1xuICAgIFxuICAgICAgICAgICAgaWYgKCQod2luZG93KS5zY3JvbGxUb3AoKSA+PSAkKGRvY3VtZW50KS5oZWlnaHQoKSAtICQod2luZG93KS5oZWlnaHQoKSAtIGJvdHRvbU9mZnNldFRvQmVnaW5SZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgc2VsZi5mZXRjaE5leHRQYWdlKCk7XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgIH0pLnNjcm9sbCgpO1xuICAgIFxuICAgICAgICAvLyBBZGQgbG9jYXRpb25cbiAgICAgICAgLy9cbiAgICAgICAgbmV3IEF1dG9TdWdnZXN0UmVnaW9uQ29udHJvbGxlcignLmFkZC1yZWdpb24gaW5wdXRbdHlwZT1cInRleHRcIl0nLCAnLmFkZC1yZWdpb24gdWwnLCBmdW5jdGlvbihyZWdpb24pIHtcbiAgICBcbiAgICAgICAgICAgIHNlbGYuc2V0QXV0b1N1Z2dlc3RlZFJlZ2lvbihyZWdpb24sIGZhbHNlKTtcbiAgICAgICAgICAgIHNlbGYubmF2aWdhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICQoJy5hZGQtcmVnaW9uIC5mYS1wbHVzJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICAgICAgICAkKCcuYWRkLXJlZ2lvbiBpbnB1dFt0eXBlPVwidGV4dFwiXScpLmZvY3VzKCk7XG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICAvLyBTaW1pbGFyIHJlZ2lvbnNcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5kcmF3U2ltaWxhclJlZ2lvbnMoZnVuY3Rpb24ocmVnaW9uKSB7XG4gICAgXG4gICAgICAgICAgICBzZWxmLnNldEF1dG9TdWdnZXN0ZWRSZWdpb24ocmVnaW9uLCBmYWxzZSk7XG4gICAgICAgICAgICBzZWxmLm5hdmlnYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICAvLyBQbGFjZXMgaW4gcmVnaW9uXG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuZHJhd1BsYWNlc0luUmVnaW9uKCk7XG4gICAgfVxuXG4gICAgLy8gUHVibGljIG1ldGhvZHNcbiAgICAvL1xuICAgIGF0dGFjaENhdGVnb3JpZXNDbGlja0hhbmRsZXJzKCkge1xuICAgIFxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgXG4gICAgICAgICQoJyNyZWZpbmUtbWVudS1jYXRlZ29yaWVzIGxpOm5vdCgucmVmaW5lLXZpZXctbW9yZSknKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICBcbiAgICAgICAgICAgIHNlbGYudG9nZ2xlQ2F0ZWdvcnkoJCh0aGlzKS50ZXh0KCkudG9Mb3dlckNhc2UoKS50cmltKCkpO1xuICAgICAgICAgICAgc2VsZi5uYXZpZ2F0ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgYXR0YWNoRG9tYWluc0NsaWNrSGFuZGxlcnMoKSB7XG4gICAgXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgXG4gICAgICAgICQoJyNyZWZpbmUtbWVudS1kb21haW5zIGxpOm5vdCgucmVmaW5lLXZpZXctbW9yZSknKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICBcbiAgICAgICAgICAgIHZhciBkb21haW4gPSAkKHRoaXMpLnRleHQoKS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcbiAgICBcbiAgICAgICAgICAgIHNlbGYudG9nZ2xlRG9tYWluKGRvbWFpbik7XG4gICAgICAgICAgICBzZWxmLm5hdmlnYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGF0dGFjaFN0YW5kYXJkc0NsaWNrSGFuZGxlcnMoKSB7XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICQoJyNyZWZpbmUtbWVudS1zdGFuZGFyZHMgbGknKS5jbGljayhmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIHN0YW5kYXJkID0gJCh0aGlzKS50ZXh0KCkudG9Mb3dlckNhc2UoKS50cmltKCk7XG5cbiAgICAgICAgICAgIHNlbGYudG9nZ2xlU3RhbmRhcmQoc3RhbmRhcmQpO1xuICAgICAgICAgICAgc2VsZi5uYXZpZ2F0ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkZWNyZW1lbnRQYWdlKCkge1xuXG4gICAgICAgIHRoaXMucGFyYW1zLnBhZ2UtLTtcbiAgICB9XG5cbiAgICAvLyBDb3N0IG9mIGxpdmluZ1xuICAgIC8vXG4gICAgZHJhd0Nvc3RPZkxpdmluZ0RhdGEoKSB7XG5cbiAgICAgICAgZ29vZ2xlLnNldE9uTG9hZENhbGxiYWNrKCgpID0+IHtcblxuICAgICAgICAgICAgdmFyIHJlZ2lvbklkcyA9IHRoaXMucGFyYW1zLnJlZ2lvbnMubWFwKGZ1bmN0aW9uKHJlZ2lvbikgeyByZXR1cm4gcmVnaW9uLmlkOyB9KTtcbiAgICAgICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcblxuICAgICAgICAgICAgY29udHJvbGxlci5nZXRDb3N0T2ZMaXZpbmdEYXRhKHJlZ2lvbklkcylcbiAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IHsgXG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3Q29zdE9mTGl2aW5nQ2hhcnQocmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3Q29zdE9mTGl2aW5nVGFibGUocmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBkcmF3Q29zdE9mTGl2aW5nQ2hhcnQocmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIHRoaXMuZHJhd0Nvc3RPZkxpdmluZ0NoYXJ0Rm9yQ29tcG9uZW50KCdjb3N0LW9mLWxpdmluZy1hbGwtY2hhcnQnLCAnQWxsJywgcmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgdGhpcy5kcmF3Q29zdE9mTGl2aW5nQ2hhcnRGb3JDb21wb25lbnQoJ2Nvc3Qtb2YtbGl2aW5nLWdvb2RzLWNoYXJ0JywgJ0dvb2RzJywgcmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgdGhpcy5kcmF3Q29zdE9mTGl2aW5nQ2hhcnRGb3JDb21wb25lbnQoJ2Nvc3Qtb2YtbGl2aW5nLXJlbnRzLWNoYXJ0JywgJ1JlbnRzJywgcmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgdGhpcy5kcmF3Q29zdE9mTGl2aW5nQ2hhcnRGb3JDb21wb25lbnQoJ2Nvc3Qtb2YtbGl2aW5nLW90aGVyLWNoYXJ0JywgJ090aGVyJywgcmVnaW9uSWRzLCBkYXRhKTtcbiAgICB9XG4gICAgXG4gICAgZHJhd0Nvc3RPZkxpdmluZ0NoYXJ0Rm9yQ29tcG9uZW50KGlkLCBjb21wb25lbnQsIHJlZ2lvbklkcywgZGF0YSkge1xuICAgIFxuICAgICAgICB2YXIgY2hhcnREYXRhID0gW11cbiAgICBcbiAgICAgICAgLy8gSGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBoZWFkZXIgPSBbJ1llYXInXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGhlYWRlcltpICsgMV0gPSB0aGlzLnBhcmFtcy5yZWdpb25zW2ldLm5hbWU7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgY2hhcnREYXRhLnB1c2goaGVhZGVyKTtcbiAgICBcbiAgICAgICAgLy8gRm9ybWF0IHRoZSBkYXRhXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBvID0ge307XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIFxuICAgICAgICAgICAgaWYgKGRhdGFbaV0uY29tcG9uZW50ICE9IGNvbXBvbmVudClcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICBcbiAgICAgICAgICAgIGlmIChvW2RhdGFbaV0ueWVhcl0gPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgb1tkYXRhW2ldLnllYXJdID0gW2RhdGFbaV0ueWVhcl07XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICBvW2RhdGFbaV0ueWVhcl0ucHVzaChwYXJzZUZsb2F0KGRhdGFbaV0uaW5kZXgpKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gbykge1xuICAgICAgICAgICAgY2hhcnREYXRhLnB1c2gob1trZXldKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICB0aGlzLmRyYXdMaW5lQ2hhcnQoaWQsIGNoYXJ0RGF0YSwge1xuICAgIFxuICAgICAgICAgICAgY3VydmVUeXBlIDogJ2Z1bmN0aW9uJyxcbiAgICAgICAgICAgIGxlZ2VuZCA6IHsgcG9zaXRpb24gOiAnYm90dG9tJyB9LFxuICAgICAgICAgICAgcG9pbnRTaGFwZSA6ICdzcXVhcmUnLFxuICAgICAgICAgICAgcG9pbnRTaXplIDogOCxcbiAgICAgICAgICAgIHRpdGxlIDogY29tcG9uZW50LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZHJhd0Nvc3RPZkxpdmluZ1RhYmxlKHJlZ2lvbklkcywgZGF0YSkge1xuICAgIFxuICAgICAgICAvLyBGb3JtYXQgdGhlIGRhdGFcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGNvbXBvbmVudHMgPSBbJ0FsbCcsICdHb29kcycsICdPdGhlcicsICdSZW50cyddO1xuICAgICAgICB2YXIgcm93cyA9IFtdO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbXBvbmVudHMubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgIHZhciBjb21wb25lbnQgPSBjb21wb25lbnRzW2ldO1xuICAgICAgICAgICAgdmFyIHJvdyA9IFtjb21wb25lbnRdO1xuICAgIFxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCByZWdpb25JZHMubGVuZ3RoOyBqKyspIHtcbiAgICBcbiAgICAgICAgICAgICAgICB2YXIgbyA9IHRoaXMuZ2V0TGF0ZXN0Q29zdE9mTGl2aW5nKGRhdGEsIHJlZ2lvbklkc1tqXSwgY29tcG9uZW50KTtcbiAgICBcbiAgICAgICAgICAgICAgICByb3cucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4IDogKG8gIT0gbnVsbCkgPyBwYXJzZUZsb2F0KG8uaW5kZXgpIDogJ05BJyxcbiAgICAgICAgICAgICAgICAgICAgcGVyY2VudGlsZSA6IChvICE9IG51bGwpID8gdGhpcy5nZXRQZXJjZW50aWxlKG8ucmFuaywgby50b3RhbF9yYW5rcykgOiAnTkEnLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgcm93cy5wdXNoKHJvdyk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgLy8gSGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBzID0gJzx0cj48dGg+PC90aD4nO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcyArPSAnPHRoIGNvbHNwYW49XFwnMlxcJz4nICsgdGhpcy5wYXJhbXMucmVnaW9uc1tpXS5uYW1lICsgJzwvdGg+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvLyBTdWIgaGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHMgKz0gJzwvdHI+PHRyPjx0ZCBjbGFzcz1cXCdjb2x1bW4taGVhZGVyXFwnPjwvdGQ+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0ZCBjbGFzcz1cXCdjb2x1bW4taGVhZGVyXFwnPlZhbHVlPC90ZD48dGQgY2xhc3M9XFwnY29sdW1uLWhlYWRlclxcJz5QZXJjZW50aWxlPC90ZD4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIHMgKz0gJzwvdHI+JztcbiAgICAgICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcm93cy5sZW5ndGg7IGkrKykge1xuICAgIFxuICAgICAgICAgICAgdmFyIHJvdyA9IHJvd3NbaV07XG4gICAgXG4gICAgICAgICAgICBzICs9ICc8dHI+JztcbiAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgcm93WzBdICsgJzwvdGQ+JztcbiAgICBcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAxOyBqIDwgcm93Lmxlbmd0aDsgaisrKSB7XG4gICAgXG4gICAgICAgICAgICAgICAgcyArPSAnPHRkPicgKyByb3dbal0uaW5kZXggKyAnPC90ZD4nO1xuICAgICAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgcm93W2pdLnBlcmNlbnRpbGUgKyAnPC90ZD4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzICs9ICc8L3RyPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgJCgnI2Nvc3Qtb2YtbGl2aW5nLXRhYmxlJykuaHRtbChzKTtcbiAgICB9XG4gICAgXG4gICAgZ2V0UGVyY2VudGlsZShyYW5rLCB0b3RhbFJhbmtzKSB7XG4gICAgXG4gICAgICAgIHZhciB0b3RhbFJhbmtzID0gcGFyc2VJbnQodG90YWxSYW5rcyk7XG4gICAgICAgIHZhciByYW5rID0gcGFyc2VJbnQocmFuayk7XG4gICAgICAgIHZhciBwZXJjZW50aWxlID0gcGFyc2VJbnQoKCh0b3RhbFJhbmtzIC0gcmFuaykgLyB0b3RhbFJhbmtzKSAqIDEwMCk7XG4gICAgXG4gICAgICAgIHJldHVybiBudW1lcmFsKHBlcmNlbnRpbGUpLmZvcm1hdCgnMG8nKTtcbiAgICB9XG4gICAgXG4gICAgZ2V0TGF0ZXN0Q29zdE9mTGl2aW5nKGRhdGEsIHJlZ2lvbklkLCBjb21wb25lbnQpIHtcbiAgICBcbiAgICAgICAgdmFyIGRhdHVtID0gbnVsbDtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICBpZiAoZGF0YVtpXS5pZCAhPSByZWdpb25JZClcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICBcbiAgICAgICAgICAgIGlmIChkYXRhW2ldLmNvbXBvbmVudCAhPSBjb21wb25lbnQpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgXG4gICAgICAgICAgICBpZiAoZGF0dW0gPT0gbnVsbCkge1xuICAgIFxuICAgICAgICAgICAgICAgIGRhdHVtID0gZGF0YVtpXTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIGlmIChwYXJzZUludChkYXRhW2ldLnllYXIpIDw9IHBhcnNlSW50KGRhdHVtLnllYXIpKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgIFxuICAgICAgICAgICAgZGF0dW0gPSBkYXRhW2ldO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZGF0dW07XG4gICAgfVxuICAgIFxuICAgIC8vIEVhcm5pbmdzXG4gICAgLy9cbiAgICBkcmF3RWFybmluZ3NEYXRhKCkge1xuXG4gICAgICAgIGdvb2dsZS5zZXRPbkxvYWRDYWxsYmFjaygoKSA9PiB7XG4gICAgXG4gICAgICAgICAgICB2YXIgcmVnaW9uSWRzID0gdGhpcy5wYXJhbXMucmVnaW9ucy5tYXAoZnVuY3Rpb24ocmVnaW9uKSB7IHJldHVybiByZWdpb24uaWQ7IH0pO1xuICAgICAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuICAgIFxuICAgICAgICAgICAgY29udHJvbGxlci5nZXRFYXJuaW5nc0RhdGEocmVnaW9uSWRzKVxuICAgICAgICAgICAgICAgIC50aGVuKGRhdGEgPT4geyBcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdFYXJuaW5nc01hcCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdFYXJuaW5nc0NoYXJ0KHJlZ2lvbklkcywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd0Vhcm5pbmdzVGFibGUocmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRyYXdFYXJuaW5nc0NoYXJ0KHJlZ2lvbklkcywgZGF0YSkge1xuICAgIFxuICAgICAgICB2YXIgZWFybmluZ3MgPSBbXTtcbiAgICBcbiAgICAgICAgLy8gSGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBoZWFkZXIgPSBbJ0VkdWNhdGlvbiBMZXZlbCddO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaGVhZGVyW2kgKyAxXSA9IHRoaXMucGFyYW1zLnJlZ2lvbnNbaV0ubmFtZTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBlYXJuaW5ncy5wdXNoKGhlYWRlcik7XG4gICAgXG4gICAgICAgIC8vIExlc3MgdGhhbiBoaWdoIHNjaG9vbFxuICAgICAgICAvL1xuICAgICAgICB2YXIgc29tZUhpZ2hTY2hvb2xFYXJuaW5ncyA9IFsnU29tZSBIaWdoIFNjaG9vbCddO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc29tZUhpZ2hTY2hvb2xFYXJuaW5nc1tpICsgMV0gPSBwYXJzZUludChkYXRhW2ldLm1lZGlhbl9lYXJuaW5nc19sZXNzX3RoYW5faGlnaF9zY2hvb2wpO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGVhcm5pbmdzLnB1c2goc29tZUhpZ2hTY2hvb2xFYXJuaW5ncyk7XG4gICAgXG4gICAgICAgIC8vIEhpZ2ggc2Nob29sXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBoaWdoU2Nob29sRWFybmluZ3MgPSBbJ0hpZ2ggU2Nob29sJ107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBoaWdoU2Nob29sRWFybmluZ3NbaSArIDFdID0gcGFyc2VJbnQoZGF0YVtpXS5tZWRpYW5fZWFybmluZ3NfaGlnaF9zY2hvb2wpO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGVhcm5pbmdzLnB1c2goaGlnaFNjaG9vbEVhcm5pbmdzKTtcbiAgICBcbiAgICAgICAgLy8gU29tZSBjb2xsZWdlXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBzb21lQ29sbGVnZUVhcm5pbmdzID0gWydTb21lIENvbGxlZ2UnXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHNvbWVDb2xsZWdlRWFybmluZ3NbaSArIDFdID0gcGFyc2VJbnQoZGF0YVtpXS5tZWRpYW5fZWFybmluZ3Nfc29tZV9jb2xsZWdlX29yX2Fzc29jaWF0ZXMpO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGVhcm5pbmdzLnB1c2goc29tZUNvbGxlZ2VFYXJuaW5ncyk7XG4gICAgXG4gICAgICAgIC8vIEJhY2hlbG9yJ3NcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGJhY2hlbG9yc0Vhcm5pbmdzID0gWydCYWNoZWxvclxcJ3MnXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGJhY2hlbG9yc0Vhcm5pbmdzW2kgKyAxXSA9IHBhcnNlSW50KGRhdGFbaV0ubWVkaWFuX2Vhcm5pbmdzX2JhY2hlbG9yX2RlZ3JlZSk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgZWFybmluZ3MucHVzaChiYWNoZWxvcnNFYXJuaW5ncyk7XG4gICAgXG4gICAgICAgIC8vIEdyYWR1YXRlIGRlZ3JlZVxuICAgICAgICAvL1xuICAgICAgICB2YXIgZ3JhZHVhdGVEZWdyZWVFYXJuaW5ncyA9IFsnR3JhZHVhdGUgRGVncmVlJ107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBncmFkdWF0ZURlZ3JlZUVhcm5pbmdzW2kgKyAxXSA9IHBhcnNlSW50KGRhdGFbaV0ubWVkaWFuX2Vhcm5pbmdzX2dyYWR1YXRlX29yX3Byb2Zlc3Npb25hbF9kZWdyZWUpO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGVhcm5pbmdzLnB1c2goZ3JhZHVhdGVEZWdyZWVFYXJuaW5ncyk7XG4gICAgXG4gICAgICAgIHRoaXMuZHJhd1N0ZXBwZWRBcmVhQ2hhcnQoJ2Vhcm5pbmdzLWNoYXJ0JywgZWFybmluZ3MsIHtcbiAgICBcbiAgICAgICAgICAgIGFyZWFPcGFjaXR5IDogMCxcbiAgICAgICAgICAgIGNvbm5lY3RTdGVwczogdHJ1ZSxcbiAgICAgICAgICAgIGN1cnZlVHlwZSA6ICdmdW5jdGlvbicsXG4gICAgICAgICAgICBmb2N1c1RhcmdldCA6ICdjYXRlZ29yeScsXG4gICAgICAgICAgICBsZWdlbmQgOiB7IHBvc2l0aW9uIDogJ2JvdHRvbScgfSxcbiAgICAgICAgICAgIHRpdGxlIDogJ0Vhcm5pbmdzIGJ5IEVkdWNhdGlvbiBMZXZlbCcsXG4gICAgICAgICAgICB2QXhpcyA6IHsgZm9ybWF0IDogJ2N1cnJlbmN5JyB9LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkcmF3RWFybmluZ3NNYXAoKSB7XG5cbiAgICAgICAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG4gICAgICAgIGNvbnN0IHBsYWNlc1Byb21pc2UgPSBjb250cm9sbGVyLmdldFBsYWNlcygpO1xuICAgICAgICBjb25zdCBlYXJuaW5nc1Byb21pc2UgPSBjb250cm9sbGVyLmdldEVhcm5pbmdzQnlQbGFjZSgpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFtwbGFjZXNQcm9taXNlLCBlYXJuaW5nc1Byb21pc2VdKVxuICAgICAgICAgICAgLnRoZW4odmFsdWVzID0+IHtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHBsYWNlc1Jlc3BvbnNlID0gdmFsdWVzWzBdO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVhcm5pbmdzUmVzcG9uc2UgPSB2YWx1ZXNbMV07XG5cbiAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIGdlbyBjb29yZGluYXRlcyBmb3IgZWFjaCByZWdpb25cbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlZ2lvblBsYWNlcyA9IHRoaXMuZ2V0UGxhY2VzRm9yUmVnaW9uKHBsYWNlc1Jlc3BvbnNlKTtcblxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhIHBsYWNlIGxvb2t1cCB0YWJsZVxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgY29uc3QgcGxhY2VNYXAgPSB7fTtcbiAgICAgICAgICAgICAgICBwbGFjZXNSZXNwb25zZS5mb3JFYWNoKHBsYWNlID0+IHBsYWNlTWFwW3BsYWNlLmlkXSA9IHBsYWNlKTsgLy8gaW5pdCB0aGUgcGxhY2UgbWFwXG5cbiAgICAgICAgICAgICAgICAvLyBHZXQgbWFwIGRhdGFcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIGNvbnN0IGVhcm5pbmdzUGxhY2VzID0gW107XG5cbiAgICAgICAgICAgICAgICBlYXJuaW5nc1Jlc3BvbnNlLmZvckVhY2goaXRlbSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0ubWVkaWFuX2Vhcm5pbmdzID09IDApXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uaWQgaW4gcGxhY2VNYXApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZWFybmluZ3NQbGFjZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXMgOiBwbGFjZU1hcFtpdGVtLmlkXS5sb2NhdGlvbi5jb29yZGluYXRlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZCA6IGl0ZW0uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA6IGl0ZW0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA6IHBhcnNlSW50KGl0ZW0ubWVkaWFuX2Vhcm5pbmdzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGVhcm5pbmdzUGxhY2VzLnNvcnQoKGEsIGIpID0+IGIudmFsdWUgLSBhLnZhbHVlKTsgLy8gZGVzY1xuICAgICAgICAgICAgICAgIGNvbnN0IGVhcm5pbmdzID0gXy5tYXAoZWFybmluZ3NQbGFjZXMsIHggPT4geyByZXR1cm4geC52YWx1ZSB9KTtcblxuICAgICAgICAgICAgICAgIC8vIEluaXQgbWFwXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICBjb25zdCByYWRpdXNTY2FsZSA9IHRoaXMuZ2V0UmFkaXVzU2NhbGVMaW5lYXIoZWFybmluZ3MpXG4gICAgICAgICAgICAgICAgY29uc3QgY29sb3JTY2FsZSA9IHRoaXMuZ2V0Q29sb3JTY2FsZShlYXJuaW5ncylcblxuICAgICAgICAgICAgICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gcmVnaW9uUGxhY2VzWzBdLmxvY2F0aW9uLmNvb3JkaW5hdGVzO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNlbnRlciA9IFtjb29yZGluYXRlc1sxXSwgY29vcmRpbmF0ZXNbMF1dO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hcCA9IEwubWFwKCdtYXAnLCB7IHpvb21Db250cm9sIDogdHJ1ZSB9KTtcblxuICAgICAgICAgICAgICAgIEwudGlsZUxheWVyKCdodHRwczovL2EudGlsZXMubWFwYm94LmNvbS92My9zb2NyYXRhLWFwcHMuaWJwMGw4OTkve3p9L3t4fS97eX0ucG5nJykuYWRkVG8obWFwKTtcbiAgICAgICAgICAgICAgICBtYXAuc2V0VmlldyhjZW50ZXIsIHRoaXMuTUFQX0lOSVRJQUxfWk9PTSk7XG5cbiAgICAgICAgICAgICAgICAvLyBQb3B1bGF0ZSBtYXBcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhd0NpcmNsZXNGb3JQbGFjZXMobWFwLCBlYXJuaW5nc1BsYWNlcywgcmFkaXVzU2NhbGUsIGNvbG9yU2NhbGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhd01hcmtlcnNGb3JQbGFjZXMobWFwLCByZWdpb25QbGFjZXMpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgfVxuXG4gICAgZHJhd0Vhcm5pbmdzVGFibGUocmVnaW9uSWRzLCBkYXRhKSB7XG5cbiAgICAgICAgdmFyIHMgPSAnPHRyPjx0aD48L3RoPic7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0aD4nICsgdGhpcy5wYXJhbXMucmVnaW9uc1tpXS5uYW1lICsgJzwvdGg+JztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE1lZGlhbiBlYXJuaW5ncyBhbGxcbiAgICAgICAgLy9cbiAgICAgICAgcyArPSAnPC90cj48dHI+PHRkPk1lZGlhbiBFYXJuaW5ncyAoQWxsIFdvcmtlcnMpPC90ZD4nO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcyArPSAnPHRkPicgKyBudW1lcmFsKGRhdGFbaV0ubWVkaWFuX2Vhcm5pbmdzKS5mb3JtYXQoJyQwLDAnKSArICc8L3RkPic7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNZWRpYW4gZWFybmluZ3MgZmVtYWxlXG4gICAgICAgIC8vXG4gICAgICAgIHMgKz0gJzwvdHI+PHRyPjx0ZD5NZWRpYW4gRmVtYWxlIEVhcm5pbmdzIChGdWxsIFRpbWUpPC90ZD4nO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzICs9ICc8dGQ+JyArIG51bWVyYWwoZGF0YVtpXS5mZW1hbGVfZnVsbF90aW1lX21lZGlhbl9lYXJuaW5ncykuZm9ybWF0KCckMCwwJykgKyAnPC90ZD4nO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTWVkaWFuIGVhcm5pbmdzIG1hbGVcbiAgICAgICAgLy9cbiAgICAgICAgcyArPSAnPC90cj48dHI+PHRkPk1lZGlhbiBNYWxlIEVhcm5pbmdzIChGdWxsIFRpbWUpPC90ZD4nO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzICs9ICc8dGQ+JyArIG51bWVyYWwoZGF0YVtpXS5tYWxlX2Z1bGxfdGltZV9tZWRpYW5fZWFybmluZ3MpLmZvcm1hdCgnJDAsMCcpICsgJzwvdGQ+JztcbiAgICAgICAgfVxuXG4gICAgICAgIHMgKz0gJzwvdHI+JztcblxuICAgICAgICAkKCcjZWFybmluZ3MtdGFibGUnKS5odG1sKHMpO1xuICAgIH1cblxuICAgIC8vIEVkdWNhdGlvblxuICAgIC8vXG4gICAgZHJhd0VkdWNhdGlvbkRhdGEoKSB7XG5cbiAgICAgICAgZ29vZ2xlLnNldE9uTG9hZENhbGxiYWNrKCgpID0+IHtcblxuICAgICAgICAgICAgdmFyIHJlZ2lvbklkcyA9IHRoaXMucGFyYW1zLnJlZ2lvbnMubWFwKGZ1bmN0aW9uKHJlZ2lvbikgeyByZXR1cm4gcmVnaW9uLmlkOyB9KTtcbiAgICAgICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcblxuICAgICAgICAgICAgY29udHJvbGxlci5nZXRFZHVjYXRpb25EYXRhKHJlZ2lvbklkcylcbiAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IHRoaXMuZHJhd0VkdWNhdGlvblRhYmxlKHJlZ2lvbklkcywgZGF0YSkpXG4gICAgICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZHJhd0VkdWNhdGlvblRhYmxlKHJlZ2lvbklkcywgZGF0YSkge1xuXG4gICAgICAgIC8vIEhlYWRlclxuICAgICAgICAvL1xuICAgICAgICB2YXIgcyA9ICc8dHI+PHRoPjwvdGg+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0aCBjb2xzcGFuPVxcJzJcXCc+JyArIHRoaXMucGFyYW1zLnJlZ2lvbnNbaV0ubmFtZSArICc8L3RoPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgLy8gU3ViIGhlYWRlclxuICAgICAgICAvL1xuICAgICAgICBzICs9ICc8L3RyPjx0cj48dGQgY2xhc3M9XFwnY29sdW1uLWhlYWRlclxcJz48L3RkPic7XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzICs9ICc8dGQgY2xhc3M9XFwnY29sdW1uLWhlYWRlclxcJz5QZXJjZW50PC90ZD48dGQgY2xhc3M9XFwnY29sdW1uLWhlYWRlclxcJz5QZXJjZW50aWxlPC90ZD4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8vIEF0IGxlYXN0IGJhY2hlbG9yJ3NcbiAgICAgICAgLy9cbiAgICAgICAgcyArPSAnPC90cj48dHI+PHRkPkF0IExlYXN0IEJhY2hlbG9yXFwncyBEZWdyZWU8L3RkPic7XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgdG90YWxSYW5rcyA9IHBhcnNlSW50KGRhdGFbaV0udG90YWxfcmFua3MpO1xuICAgICAgICAgICAgdmFyIHJhbmsgPSBwYXJzZUludChkYXRhW2ldLnBlcmNlbnRfYmFjaGVsb3JzX2RlZ3JlZV9vcl9oaWdoZXJfcmFuayk7XG4gICAgICAgICAgICB2YXIgcGVyY2VudGlsZSA9IHBhcnNlSW50KCgodG90YWxSYW5rcyAtIHJhbmspIC8gdG90YWxSYW5rcykgKiAxMDApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBzICs9ICc8dGQ+JyArIGRhdGFbaV0ucGVyY2VudF9iYWNoZWxvcnNfZGVncmVlX29yX2hpZ2hlciArICclPC90ZD4nO1xuICAgICAgICAgICAgcyArPSAnPHRkPicgKyBudW1lcmFsKHBlcmNlbnRpbGUpLmZvcm1hdCgnMG8nKSArICc8L3RkPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgLy8gQXQgbGVhc3QgaGlnaCBzY2hvb2wgZGlwbG9tYVxuICAgICAgICAvL1xuICAgICAgICBzICs9ICc8L3RyPjx0cj48dGQ+QXQgTGVhc3QgSGlnaCBTY2hvb2wgRGlwbG9tYTwvdGQ+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgIHZhciB0b3RhbFJhbmtzID0gcGFyc2VJbnQoZGF0YVtpXS50b3RhbF9yYW5rcyk7XG4gICAgICAgICAgICB2YXIgcmFuayA9IHBhcnNlSW50KGRhdGFbaV0ucGVyY2VudF9oaWdoX3NjaG9vbF9ncmFkdWF0ZV9vcl9oaWdoZXIpO1xuICAgICAgICAgICAgdmFyIHBlcmNlbnRpbGUgPSBwYXJzZUludCgoKHRvdGFsUmFua3MgLSByYW5rKSAvIHRvdGFsUmFua3MpICogMTAwKTtcbiAgICBcbiAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgZGF0YVtpXS5wZXJjZW50X2hpZ2hfc2Nob29sX2dyYWR1YXRlX29yX2hpZ2hlciArICclPC90ZD4nO1xuICAgICAgICAgICAgcyArPSAnPHRkPicgKyBudW1lcmFsKHBlcmNlbnRpbGUpLmZvcm1hdCgnMG8nKSArICc8L3RkPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgcyArPSAnPC90cj4nO1xuICAgIFxuICAgICAgICAkKCcjZWR1Y2F0aW9uLXRhYmxlJykuaHRtbChzKTtcbiAgICB9XG4gICAgXG4gICAgLy8gR0RQIGRhdGFcbiAgICAvL1xuICAgIGRyYXdHZHBEYXRhKCkge1xuXG4gICAgICAgIGdvb2dsZS5zZXRPbkxvYWRDYWxsYmFjaygoKSA9PiB7XG5cbiAgICAgICAgICAgIHZhciByZWdpb25JZHMgPSB0aGlzLnBhcmFtcy5yZWdpb25zLm1hcChmdW5jdGlvbihyZWdpb24pIHsgcmV0dXJuIHJlZ2lvbi5pZDsgfSk7XG4gICAgICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG5cbiAgICAgICAgICAgIGNvbnRyb2xsZXIuZ2V0R2RwRGF0YShyZWdpb25JZHMpXG4gICAgICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7IFxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd0dkcENoYXJ0KHJlZ2lvbklkcywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd0dkcENoYW5nZUNoYXJ0KHJlZ2lvbklkcywgZGF0YSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZHJhd0dkcENoYXJ0KHJlZ2lvbklkcywgZGF0YSkge1xuICAgIFxuICAgICAgICB2YXIgY2hhcnREYXRhID0gW107XG4gICAgXG4gICAgICAgIC8vIEhlYWRlclxuICAgICAgICAvL1xuICAgICAgICB2YXIgaGVhZGVyID0gWydZZWFyJ107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBoZWFkZXJbaSArIDFdID0gdGhpcy5wYXJhbXMucmVnaW9uc1tpXS5uYW1lO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGNoYXJ0RGF0YS5wdXNoKGhlYWRlcik7XG4gICAgXG4gICAgICAgIC8vIEZvcm1hdCB0aGUgZGF0YVxuICAgICAgICAvL1xuICAgICAgICB2YXIgbyA9IHt9O1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgIGlmIChvW2RhdGFbaV0ueWVhcl0gPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgb1tkYXRhW2ldLnllYXJdID0gW2RhdGFbaV0ueWVhcl07XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICBvW2RhdGFbaV0ueWVhcl0ucHVzaChwYXJzZUZsb2F0KGRhdGFbaV0ucGVyX2NhcGl0YV9nZHApKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gbykge1xuICAgICAgICAgICAgY2hhcnREYXRhLnB1c2gob1trZXldKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvLyBEcmF3IGNoYXJ0XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuZHJhd0xpbmVDaGFydCgncGVyLWNhcGl0YS1nZHAtY2hhcnQnLCBjaGFydERhdGEsIHtcbiAgICBcbiAgICAgICAgICAgIGN1cnZlVHlwZSA6ICdmdW5jdGlvbicsXG4gICAgICAgICAgICBsZWdlbmQgOiB7IHBvc2l0aW9uIDogJ2JvdHRvbScgfSxcbiAgICAgICAgICAgIHBvaW50U2hhcGUgOiAnc3F1YXJlJyxcbiAgICAgICAgICAgIHBvaW50U2l6ZSA6IDgsXG4gICAgICAgICAgICB0aXRsZSA6ICdQZXIgQ2FwaXRhIFJlYWwgR0RQIG92ZXIgVGltZScsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBkcmF3R2RwQ2hhbmdlQ2hhcnQocmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIHZhciBjaGFydERhdGEgPSBbXTtcbiAgICBcbiAgICAgICAgLy8gSGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBoZWFkZXIgPSBbJ1llYXInXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGhlYWRlcltpICsgMV0gPSB0aGlzLnBhcmFtcy5yZWdpb25zW2ldLm5hbWU7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgY2hhcnREYXRhLnB1c2goaGVhZGVyKTtcbiAgICBcbiAgICAgICAgLy8gRm9ybWF0IHRoZSBkYXRhXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBvID0ge307XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIFxuICAgICAgICAgICAgaWYgKG9bZGF0YVtpXS55ZWFyXSA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBvW2RhdGFbaV0ueWVhcl0gPSBbZGF0YVtpXS55ZWFyXTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIG9bZGF0YVtpXS55ZWFyXS5wdXNoKHBhcnNlRmxvYXQoZGF0YVtpXS5wZXJfY2FwaXRhX2dkcF9wZXJjZW50X2NoYW5nZSkgLyAxMDApO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvKSB7XG4gICAgICAgICAgICBjaGFydERhdGEucHVzaChvW2tleV0pO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8vIERyYXcgY2hhcnRcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5kcmF3TGluZUNoYXJ0KCdwZXItY2FwaXRhLWdkcC1jaGFuZ2UtY2hhcnQnLCBjaGFydERhdGEsIHtcbiAgICBcbiAgICAgICAgICAgIGN1cnZlVHlwZSA6ICdmdW5jdGlvbicsXG4gICAgICAgICAgICBsZWdlbmQgOiB7IHBvc2l0aW9uIDogJ2JvdHRvbScgfSxcbiAgICAgICAgICAgIHBvaW50U2hhcGUgOiAnc3F1YXJlJyxcbiAgICAgICAgICAgIHBvaW50U2l6ZSA6IDgsXG4gICAgICAgICAgICB0aXRsZSA6ICdBbm51YWwgQ2hhbmdlIGluIFBlciBDYXBpdGEgR0RQIG92ZXIgVGltZScsXG4gICAgICAgICAgICB2QXhpcyA6IHsgZm9ybWF0IDogJyMuIyUnIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICAvLyBPY2N1cGF0aW9uc1xuICAgIC8vXG4gICAgZHJhd09jY3VwYXRpb25zRGF0YSgpIHtcblxuICAgICAgICBnb29nbGUuc2V0T25Mb2FkQ2FsbGJhY2soKCkgPT4ge1xuXG4gICAgICAgICAgICB2YXIgcmVnaW9uSWRzID0gdGhpcy5wYXJhbXMucmVnaW9ucy5tYXAoZnVuY3Rpb24ocmVnaW9uKSB7IHJldHVybiByZWdpb24uaWQ7IH0pO1xuICAgICAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuXG4gICAgICAgICAgICBjb250cm9sbGVyLmdldE9jY3VwYXRpb25zRGF0YShyZWdpb25JZHMpXG4gICAgICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB0aGlzLmRyYXdPY2N1cGF0aW9uc1RhYmxlKHJlZ2lvbklkcywgZGF0YSkpXG4gICAgICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRyYXdPY2N1cGF0aW9uc1RhYmxlKHJlZ2lvbklkcywgZGF0YSkge1xuICAgIFxuICAgICAgICB2YXIgcyA9ICc8dHI+PHRoPjwvdGg+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0aCBjb2xzcGFuPVxcJzJcXCc+JyArIHRoaXMucGFyYW1zLnJlZ2lvbnNbaV0ubmFtZSArICc8L3RoPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgLy8gU3ViIGhlYWRlclxuICAgICAgICAvL1xuICAgICAgICBzICs9ICc8L3RyPjx0cj48dGQgY2xhc3M9XFwnY29sdW1uLWhlYWRlclxcJz48L3RkPic7XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzICs9ICc8dGQgY2xhc3M9XFwnY29sdW1uLWhlYWRlclxcJz5QZXJjZW50PC90ZD48dGQgY2xhc3M9XFwnY29sdW1uLWhlYWRlclxcJz5QZXJjZW50aWxlPC90ZD4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIFxuICAgICAgICAgICAgaWYgKChpICUgcmVnaW9uSWRzLmxlbmd0aCkgPT0gMClcbiAgICAgICAgICAgICAgICBzICs9ICc8L3RyPjx0cj48dGQ+JyArIGRhdGFbaV0ub2NjdXBhdGlvbiArICc8L3RkPic7IFxuICAgIFxuICAgICAgICAgICAgdmFyIHRvdGFsUmFua3MgPSBwYXJzZUludChkYXRhW2ldLnRvdGFsX3JhbmtzKTtcbiAgICAgICAgICAgIHZhciByYW5rID0gcGFyc2VJbnQoZGF0YVtpXS5wZXJjZW50X2VtcGxveWVkX3JhbmspO1xuICAgICAgICAgICAgdmFyIHBlcmNlbnRpbGUgPSBwYXJzZUludCgoKHRvdGFsUmFua3MgLSByYW5rKSAvIHRvdGFsUmFua3MpICogMTAwKTtcbiAgICBcbiAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgbnVtZXJhbChkYXRhW2ldLnBlcmNlbnRfZW1wbG95ZWQpLmZvcm1hdCgnMC4wJykgKyAnJTwvdGQ+JztcbiAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgbnVtZXJhbChwZXJjZW50aWxlKS5mb3JtYXQoJzBvJykgKyAnPC90ZD4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIHMgKz0gJzwvdHI+JztcbiAgICBcbiAgICAgICAgJCgnI29jY3VwYXRpb25zLXRhYmxlJykuaHRtbChzKTtcbiAgICB9XG4gICAgXG4gICAgLy8gUG9wdWxhdGlvblxuICAgIC8vXG4gICAgZHJhd1BvcHVsYXRpb25EYXRhKCkge1xuXG4gICAgICAgIGdvb2dsZS5zZXRPbkxvYWRDYWxsYmFjaygoKSA9PiB7XG5cbiAgICAgICAgICAgIHZhciByZWdpb25JZHMgPSB0aGlzLnBhcmFtcy5yZWdpb25zLm1hcChmdW5jdGlvbihyZWdpb24pIHsgcmV0dXJuIHJlZ2lvbi5pZDsgfSk7XG4gICAgICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG5cbiAgICAgICAgICAgIGNvbnRyb2xsZXIuZ2V0UG9wdWxhdGlvbkRhdGEocmVnaW9uSWRzKVxuICAgICAgICAgICAgICAgIC50aGVuKGRhdGEgPT4geyBcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdQb3B1bGF0aW9uTWFwKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BvcHVsYXRpb25DaGFydChyZWdpb25JZHMsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdQb3B1bGF0aW9uQ2hhbmdlQ2hhcnQocmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBkcmF3UG9wdWxhdGlvbkNoYXJ0KHJlZ2lvbklkcywgZGF0YSkge1xuICAgIFxuICAgICAgICB2YXIgY2hhcnREYXRhID0gW107XG4gICAgICAgIHZhciB5ZWFyO1xuICAgIFxuICAgICAgICAvLyBIZWFkZXJcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGhlYWRlciA9IFsnWWVhciddO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaGVhZGVyW2kgKyAxXSA9IHRoaXMucGFyYW1zLnJlZ2lvbnNbaV0ubmFtZTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBjaGFydERhdGEucHVzaChoZWFkZXIpO1xuICAgIFxuICAgICAgICAvLyBEYXRhXG4gICAgICAgIC8vXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIFxuICAgICAgICAgICAgdmFyIG0gPSAoaSAlIHJlZ2lvbklkcy5sZW5ndGgpO1xuICAgIFxuICAgICAgICAgICAgaWYgKG0gPT0gMCkge1xuICAgIFxuICAgICAgICAgICAgICAgIHllYXIgPSBbXTtcbiAgICAgICAgICAgICAgICB5ZWFyWzBdID0gZGF0YVtpXS55ZWFyO1xuICAgICAgICAgICAgICAgIGNoYXJ0RGF0YS5wdXNoKHllYXIpO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgeWVhclttICsgMV0gPSBwYXJzZUludChkYXRhW2ldLnBvcHVsYXRpb24pO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIHRoaXMuZHJhd0xpbmVDaGFydCgncG9wdWxhdGlvbi1jaGFydCcsIGNoYXJ0RGF0YSwge1xuICAgIFxuICAgICAgICAgICAgY3VydmVUeXBlIDogJ2Z1bmN0aW9uJyxcbiAgICAgICAgICAgIGxlZ2VuZCA6IHsgcG9zaXRpb24gOiAnYm90dG9tJyB9LFxuICAgICAgICAgICAgcG9pbnRTaGFwZSA6ICdzcXVhcmUnLFxuICAgICAgICAgICAgcG9pbnRTaXplIDogOCxcbiAgICAgICAgICAgIHRpdGxlIDogJ1BvcHVsYXRpb24nLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZHJhd1BvcHVsYXRpb25DaGFuZ2VDaGFydChyZWdpb25JZHMsIGRhdGEpIHtcbiAgICBcbiAgICAgICAgdmFyIGNoYXJ0RGF0YSA9IFtdO1xuICAgICAgICB2YXIgeWVhcjtcbiAgICBcbiAgICAgICAgLy8gSGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBoZWFkZXIgPSBbJ1llYXInXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGhlYWRlcltpICsgMV0gPSB0aGlzLnBhcmFtcy5yZWdpb25zW2ldLm5hbWU7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgY2hhcnREYXRhLnB1c2goaGVhZGVyKTtcbiAgICBcbiAgICAgICAgLy8gRGF0YVxuICAgICAgICAvL1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgIHZhciBtID0gKGkgJSByZWdpb25JZHMubGVuZ3RoKTtcbiAgICBcbiAgICAgICAgICAgIGlmIChtID09IDApIHtcbiAgICBcbiAgICAgICAgICAgICAgICB5ZWFyID0gW107XG4gICAgICAgICAgICAgICAgeWVhclswXSA9IGRhdGFbaV0ueWVhcjtcbiAgICAgICAgICAgICAgICBjaGFydERhdGEucHVzaCh5ZWFyKTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIHllYXJbbSArIDFdID0gcGFyc2VGbG9hdChkYXRhW2ldLnBvcHVsYXRpb25fcGVyY2VudF9jaGFuZ2UpIC8gMTAwO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIHRoaXMuZHJhd0xpbmVDaGFydCgncG9wdWxhdGlvbi1jaGFuZ2UtY2hhcnQnLCBjaGFydERhdGEsIHtcbiAgICBcbiAgICAgICAgICAgIGN1cnZlVHlwZSA6ICdmdW5jdGlvbicsXG4gICAgICAgICAgICBsZWdlbmQgOiB7IHBvc2l0aW9uIDogJ2JvdHRvbScgfSxcbiAgICAgICAgICAgIHBvaW50U2hhcGUgOiAnc3F1YXJlJyxcbiAgICAgICAgICAgIHBvaW50U2l6ZSA6IDgsXG4gICAgICAgICAgICB0aXRsZSA6ICdQb3B1bGF0aW9uIENoYW5nZScsXG4gICAgICAgICAgICB2QXhpcyA6IHsgZm9ybWF0IDogJyMuIyUnIH0sXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRyYXdQb3B1bGF0aW9uTWFwKCkge1xuXG4gICAgICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuICAgICAgICBjb25zdCBwbGFjZXMgPSBbXTtcblxuICAgICAgICBjb250cm9sbGVyLmdldFBsYWNlcygpXG4gICAgICAgICAgICAudGhlbihwbGFjZXNSZXNwb25zZSA9PiB7XG5cbiAgICAgICAgICAgICAgICAvLyBTZXQgcGxhY2UgdmFsdWUgdG8gZWFybmluZ3MgZGF0YVxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgcGxhY2VzUmVzcG9uc2UuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcGxhY2VzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXMgOiBpdGVtLmxvY2F0aW9uLmNvb3JkaW5hdGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA6IGl0ZW0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkIDogaXRlbS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlIDogcGFyc2VJbnQoaXRlbS5wb3B1bGF0aW9uKSxcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIEdldCBtYXAgZGF0YVxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgY29uc3QgcG9wdWxhdGVkUGxhY2VzID0gcGxhY2VzLnNvcnQoKGEsIGIpID0+IGIudmFsdWUgLSBhLnZhbHVlKTtcbiAgICAgICAgICAgICAgICBjb25zdCByZWdpb25QbGFjZXMgPSB0aGlzLmdldFBsYWNlc0ZvclJlZ2lvbihwbGFjZXNSZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgY29uc3QgcG9wdWxhdGlvbnMgPSBfLm1hcChwb3B1bGF0ZWRQbGFjZXMsIHggPT4geyByZXR1cm4geC52YWx1ZSB9KTtcblxuICAgICAgICAgICAgICAgIC8vIEluaXQgbWFwXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICBjb25zdCByYWRpdXNTY2FsZSA9IHRoaXMuZ2V0UmFkaXVzU2NhbGVMb2cocG9wdWxhdGlvbnMpXG4gICAgICAgICAgICAgICAgY29uc3QgY29sb3JTY2FsZSA9IHRoaXMuZ2V0Q29sb3JTY2FsZShwb3B1bGF0aW9ucylcblxuICAgICAgICAgICAgICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gcmVnaW9uUGxhY2VzWzBdLmxvY2F0aW9uLmNvb3JkaW5hdGVzO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNlbnRlciA9IFtjb29yZGluYXRlc1sxXSwgY29vcmRpbmF0ZXNbMF1dO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hcCA9IEwubWFwKCdtYXAnLCB7IHpvb21Db250cm9sIDogdHJ1ZSB9KTtcblxuICAgICAgICAgICAgICAgIEwudGlsZUxheWVyKCdodHRwczovL2EudGlsZXMubWFwYm94LmNvbS92My9zb2NyYXRhLWFwcHMuaWJwMGw4OTkve3p9L3t4fS97eX0ucG5nJykuYWRkVG8obWFwKTtcbiAgICAgICAgICAgICAgICBtYXAuc2V0VmlldyhjZW50ZXIsIHRoaXMuTUFQX0lOSVRJQUxfWk9PTSk7XG5cbiAgICAgICAgICAgICAgICAvLyBQb3B1bGF0ZSBtYXBcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhd0NpcmNsZXNGb3JQbGFjZXMobWFwLCBwb3B1bGF0ZWRQbGFjZXMsIHJhZGl1c1NjYWxlLCBjb2xvclNjYWxlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdNYXJrZXJzRm9yUGxhY2VzKG1hcCwgcmVnaW9uUGxhY2VzKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgIH1cblxuICAgIC8vIFBsYWNlcyBpbiByZWdpb25cbiAgICAvL1xuICAgIGRyYXdQbGFjZXNJblJlZ2lvbigpIHtcblxuICAgICAgICBpZiAodGhpcy5wYXJhbXMucmVnaW9ucy5sZW5ndGggPT0gMCkgXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgdmFyIHJlZ2lvbiA9IHRoaXMucGFyYW1zLnJlZ2lvbnNbMF07XG5cbiAgICAgICAgc3dpdGNoIChyZWdpb24udHlwZSkge1xuXG4gICAgICAgICAgICBjYXNlICduYXRpb24nOiB0aGlzLmRyYXdDaGlsZFBsYWNlc0luUmVnaW9uKHJlZ2lvbiwgJ1JlZ2lvbnMgaW4gezB9Jy5mb3JtYXQocmVnaW9uLm5hbWUpKTsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdyZWdpb24nOiB0aGlzLmRyYXdDaGlsZFBsYWNlc0luUmVnaW9uKHJlZ2lvbiwgJ0RpdmlzaW9ucyBpbiB7MH0nLmZvcm1hdChyZWdpb24ubmFtZSkpOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2RpdmlzaW9uJzogdGhpcy5kcmF3Q2hpbGRQbGFjZXNJblJlZ2lvbihyZWdpb24sICdTdGF0ZXMgaW4gezB9Jy5mb3JtYXQocmVnaW9uLm5hbWUpKTsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdzdGF0ZSc6IHRoaXMuZHJhd0NpdGllc0FuZENvdW50aWVzSW5TdGF0ZShyZWdpb24pOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NvdW50eSc6IHRoaXMuZHJhd090aGVyQ291bnRpZXNJblN0YXRlKHJlZ2lvbik7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbXNhJzogdGhpcy5kcmF3T3RoZXJNZXRyb3NJblN0YXRlKHJlZ2lvbik7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncGxhY2UnOiB0aGlzLmRyYXdPdGhlckNpdGllc0luU3RhdGUocmVnaW9uKTsgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmF3Q2hpbGRQbGFjZXNJblJlZ2lvbihyZWdpb24sIGxhYmVsKSB7XG5cbiAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuXG4gICAgICAgIGNvbnRyb2xsZXIuZ2V0Q2hpbGRSZWdpb25zKHJlZ2lvbi5pZClcbiAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3UGxhY2VzSW5SZWdpb25IZWFkZXIoJyNwbGFjZXMtaW4tcmVnaW9uLWhlYWRlci0wJywgbGFiZWwpO1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BsYWNlc0luUmVnaW9uTGlzdCgnI3BsYWNlcy1pbi1yZWdpb24tbGlzdC0wJywgcmVzcG9uc2UpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgfVxuXG4gICAgZHJhd0NpdGllc0FuZENvdW50aWVzSW5TdGF0ZShyZWdpb24pIHtcblxuICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG4gICAgICAgIHZhciBjaXRpZXNQcm9taXNlID0gY29udHJvbGxlci5nZXRDaXRpZXNJblN0YXRlKHJlZ2lvbi5pZCk7XG4gICAgICAgIHZhciBjb3VudGllc1Byb21pc2UgPSBjb250cm9sbGVyLmdldENvdW50aWVzSW5TdGF0ZShyZWdpb24uaWQpO1xuXG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChbY2l0aWVzUHJvbWlzZSwgY291bnRpZXNQcm9taXNlXSlcbiAgICAgICAgICAgIC50aGVuKHZhbHVlcyA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZiAodmFsdWVzLmxlbmd0aCA9PSAwKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgICAgICBpZiAodmFsdWVzWzBdLmxlbmd0aCA+IDApIHtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdQbGFjZXNJblJlZ2lvbkhlYWRlcignI3BsYWNlcy1pbi1yZWdpb24taGVhZGVyLTAnLCAnUGxhY2VzIGluIHswfScuZm9ybWF0KHJlZ2lvbi5uYW1lKSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BsYWNlc0luUmVnaW9uTGlzdCgnI3BsYWNlcy1pbi1yZWdpb24tbGlzdC0wJywgdmFsdWVzWzBdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlc1sxXS5sZW5ndGggPiAwKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3UGxhY2VzSW5SZWdpb25IZWFkZXIoJyNwbGFjZXMtaW4tcmVnaW9uLWhlYWRlci0xJywgJ0NvdW50aWVzIGluIHswfScuZm9ybWF0KHJlZ2lvbi5uYW1lKSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BsYWNlc0luUmVnaW9uTGlzdCgnI3BsYWNlcy1pbi1yZWdpb24tbGlzdC0xJywgdmFsdWVzWzFdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICB9XG5cbiAgICBkcmF3T3RoZXJDaXRpZXNJblN0YXRlKHJlZ2lvbikge1xuXG4gICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcblxuICAgICAgICBjb250cm9sbGVyLmdldFBhcmVudFN0YXRlKHJlZ2lvbilcbiAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICBcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UubGVuZ3RoID09IDApXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICBcbiAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSByZXNwb25zZVswXTtcbiAgICBcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyLmdldENpdGllc0luU3RhdGUoc3RhdGUucGFyZW50X2lkKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmxlbmd0aCA9PSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdQbGFjZXNJblJlZ2lvbkhlYWRlcignI3BsYWNlcy1pbi1yZWdpb24taGVhZGVyLTAnLCAnUGxhY2VzIGluIHswfScuZm9ybWF0KHN0YXRlLnBhcmVudF9uYW1lKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdQbGFjZXNJblJlZ2lvbkxpc3QoJyNwbGFjZXMtaW4tcmVnaW9uLWxpc3QtMCcsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRyYXdPdGhlckNvdW50aWVzSW5TdGF0ZShyZWdpb24pIHtcblxuICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG5cbiAgICAgICAgY29udHJvbGxlci5nZXRQYXJlbnRTdGF0ZShyZWdpb24pXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmxlbmd0aCA9PSAwKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgXG4gICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gcmVzcG9uc2VbMF07XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29udHJvbGxlci5nZXRDb3VudGllc0luU3RhdGUoc3RhdGUucGFyZW50X2lkKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmxlbmd0aCA9PSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdQbGFjZXNJblJlZ2lvbkhlYWRlcignI3BsYWNlcy1pbi1yZWdpb24taGVhZGVyLTAnLCAnQ291bnRpZXMgaW4gezB9Jy5mb3JtYXQoc3RhdGUucGFyZW50X25hbWUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BsYWNlc0luUmVnaW9uTGlzdCgnI3BsYWNlcy1pbi1yZWdpb24tbGlzdC0wJywgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZHJhd090aGVyTWV0cm9zSW5TdGF0ZShyZWdpb24pIHtcblxuICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG5cbiAgICAgICAgY29udHJvbGxlci5nZXRQYXJlbnRTdGF0ZShyZWdpb24pXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmxlbmd0aCA9PSAwKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgXG4gICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gcmVzcG9uc2VbMF07XG4gICAgXG4gICAgICAgICAgICAgICAgY29udHJvbGxlci5nZXRNZXRyb3NJblN0YXRlKHN0YXRlLnBhcmVudF9pZClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5sZW5ndGggPT0gMClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3UGxhY2VzSW5SZWdpb25IZWFkZXIoJyNwbGFjZXMtaW4tcmVnaW9uLWhlYWRlci0wJywgJ01ldHJvcG9saXRhbiBBcmVhcyBpbiB7MH0nLmZvcm1hdChzdGF0ZS5wYXJlbnRfbmFtZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3UGxhY2VzSW5SZWdpb25MaXN0KCcjcGxhY2VzLWluLXJlZ2lvbi1saXN0LTAnLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZW1vdmVDdXJyZW50UmVnaW9ucyhyZWdpb25zLCBtYXhDb3VudCA9IDUpIHtcblxuICAgICAgICB2YXIgY291bnQgPSAwO1xuICAgICAgICB2YXIgcmcgPSBbXTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbnMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgaWYgKHRoaXMuaXNSZWdpb25JZENvbnRhaW5lZEluQ3VycmVudFJlZ2lvbnMocmVnaW9uc1tpXS5jaGlsZF9pZCkpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgIHJnLnB1c2gocmVnaW9uc1tpXSk7XG5cbiAgICAgICAgICAgIGlmIChjb3VudCA9PSAobWF4Q291bnQgLSAxKSlcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZztcbiAgICB9XG5cbiAgICBkcmF3UGxhY2VzSW5SZWdpb25IZWFkZXIoaGVhZGVySWQsIGxhYmVsKSB7XG5cbiAgICAgICAgJChoZWFkZXJJZCkudGV4dChsYWJlbCkuc2xpZGVUb2dnbGUoMTAwKTtcbiAgICB9XG5cbiAgICBkcmF3UGxhY2VzSW5SZWdpb25MaXN0KGxpc3RJZCwgZGF0YSwgbWF4Q291bnQgPSA1KSB7XG5cbiAgICAgICAgaWYgKGRhdGEubGVuZ3RoID09IDApXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgdmFyIGNvdW50ID0gMDtcbiAgICAgICAgdmFyIHMgPSAnJztcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgaWYgKHRoaXMuaXNSZWdpb25JZENvbnRhaW5lZEluQ3VycmVudFJlZ2lvbnMoZGF0YVtpXS5jaGlsZF9pZCkpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgIHMgKz0gJzxsaT48YSBocmVmPVwiJztcbiAgICAgICAgICAgIHMgKz0gdGhpcy5nZXRTZWFyY2hQYWdlRm9yUmVnaW9uc0FuZFZlY3RvclVybChkYXRhW2ldLmNoaWxkX25hbWUpICsgJ1wiPic7XG4gICAgICAgICAgICBzICs9IGRhdGFbaV0uY2hpbGRfbmFtZTtcbiAgICAgICAgICAgIHMgKz0gJzwvYT48L2xpPic7XG5cbiAgICAgICAgICAgIGlmIChjb3VudCA9PSAobWF4Q291bnQgLSAxKSlcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgfVxuXG4gICAgICAgICQobGlzdElkKS5odG1sKHMpO1xuICAgICAgICAkKGxpc3RJZCkuc2xpZGVUb2dnbGUoMTAwKTtcbiAgICB9XG5cbiAgICBpc1JlZ2lvbklkQ29udGFpbmVkSW5DdXJyZW50UmVnaW9ucyhyZWdpb25JZCkge1xuXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5wYXJhbXMucmVnaW9ucy5sZW5ndGg7IGorKykge1xuXG4gICAgICAgICAgICBpZiAocmVnaW9uSWQgPT0gdGhpcy5wYXJhbXMucmVnaW9uc1tqXS5pZClcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBTaW1pbGFyIHJlZ2lvbnNcbiAgICAvL1xuICAgIGRyYXdTaW1pbGFyUmVnaW9ucyhvbkNsaWNrUmVnaW9uKSB7XG5cbiAgICAgICAgaWYgKHRoaXMucGFyYW1zLnJlZ2lvbnMubGVuZ3RoID09IDApIFxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHZhciByZWdpb24gPSB0aGlzLnBhcmFtcy5yZWdpb25zWzBdO1xuICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG5cbiAgICAgICAgY29udHJvbGxlci5nZXRTaW1pbGFyUmVnaW9ucyhyZWdpb24uaWQpXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHRoaXMuZHJhd1NpbWlsYXJSZWdpb25zTGlzdChkYXRhLCBvbkNsaWNrUmVnaW9uKSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgfVxuXG4gICAgZHJhd1NpbWlsYXJSZWdpb25zTGlzdChkYXRhLCBvbkNsaWNrUmVnaW9uKSB7XG5cbiAgICAgICAgaWYgKGRhdGEubW9zdF9zaW1pbGFyID09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICB2YXIgY291bnQgPSAwO1xuICAgICAgICB2YXIgcyA9ICcnO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5tb3N0X3NpbWlsYXIubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgaWYgKHRoaXMuaXNSZWdpb25JZENvbnRhaW5lZEluQ3VycmVudFJlZ2lvbnMoZGF0YS5tb3N0X3NpbWlsYXJbaV0uaWQpKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBzICs9ICc8bGk+PGE+PGkgY2xhc3M9XCJmYSBmYS1wbHVzXCI+PC9pPicgKyBkYXRhLm1vc3Rfc2ltaWxhcltpXS5uYW1lICsgJzwvYT48L2xpPidcblxuICAgICAgICAgICAgaWYgKGNvdW50ID09IDQpXG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgJCgnI3NpbWlsYXItcmVnaW9ucycpLmh0bWwocyk7XG4gICAgICAgICQoJyNzaW1pbGFyLXJlZ2lvbnMnKS5zbGlkZVRvZ2dsZSgxMDApO1xuICAgICAgICBcbiAgICAgICAgJCgnI3NpbWlsYXItcmVnaW9ucyBsaSBhJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgaW5kZXggPSAkKHRoaXMpLnBhcmVudCgpLmluZGV4KCk7XG4gICAgICAgICAgICBvbkNsaWNrUmVnaW9uKGRhdGEubW9zdF9zaW1pbGFyW2luZGV4XS5uYW1lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIC8vIERyYXcgY2hhcnRzXG4gICAgLy9cbiAgICBkcmF3TGluZUNoYXJ0KGNoYXJ0SWQsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBcbiAgICAgICAgdmFyIGRhdGFUYWJsZSA9IGdvb2dsZS52aXN1YWxpemF0aW9uLmFycmF5VG9EYXRhVGFibGUoZGF0YSk7XG4gICAgICAgIHZhciBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5MaW5lQ2hhcnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY2hhcnRJZCkpO1xuICAgIFxuICAgICAgICBjaGFydC5kcmF3KGRhdGFUYWJsZSwgb3B0aW9ucyk7XG4gICAgfVxuICAgIFxuICAgIGRyYXdTdGVwcGVkQXJlYUNoYXJ0KGNoYXJ0SWQsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBcbiAgICAgICAgdmFyIGRhdGFUYWJsZSA9IGdvb2dsZS52aXN1YWxpemF0aW9uLmFycmF5VG9EYXRhVGFibGUoZGF0YSk7XG4gICAgICAgIHZhciBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5TdGVwcGVkQXJlYUNoYXJ0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNoYXJ0SWQpKTtcbiAgICBcbiAgICAgICAgY2hhcnQuZHJhdyhkYXRhVGFibGUsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIC8vIE1hcHNcbiAgICAvL1xuICAgIGdldFJhZGl1c1NjYWxlTGluZWFyKHZhbHVlcykge1xuXG4gICAgICAgIHJldHVybiBkMy5zY2FsZS5saW5lYXIoKVxuICAgICAgICAgICAgLmRvbWFpbihkMy5leHRlbnQodmFsdWVzKSlcbiAgICAgICAgICAgIC5yYW5nZSh0aGlzLk1BUF9SQURJVVNfU0NBTEUpO1xuICAgIH1cblxuICAgIGdldFJhZGl1c1NjYWxlTG9nKHZhbHVlcykge1xuXG4gICAgICAgIHJldHVybiBkMy5zY2FsZS5sb2coKVxuICAgICAgICAgICAgLmRvbWFpbihkMy5leHRlbnQodmFsdWVzKSlcbiAgICAgICAgICAgIC5yYW5nZSh0aGlzLk1BUF9SQURJVVNfU0NBTEUpO1xuICAgIH1cblxuICAgIGdldENvbG9yU2NhbGUodmFsdWVzKSB7XG5cbiAgICAgICAgY29uc3QgZG9tYWluID0gKCgpID0+IHtcblxuICAgICAgICAgICAgY29uc3Qgc3RlcCA9IDEuMCAvIHRoaXMuTUFQX0NPTE9SX1NDQUxFLmxlbmd0aDtcblxuICAgICAgICAgICAgZnVuY3Rpb24gcXVhbnRpbGUodmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGQzLnF1YW50aWxlKHZhbHVlcywgKGluZGV4ICsgMSkgKiBzdGVwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIF8ubWFwKHRoaXMuTUFQX0NPTE9SX1NDQUxFLnNsaWNlKDEpLCBxdWFudGlsZSk7XG4gICAgICAgIH0pKCk7XG5cbiAgICAgICAgcmV0dXJuIGQzLnNjYWxlLnF1YW50aWxlKClcbiAgICAgICAgICAgIC5kb21haW4oZG9tYWluKVxuICAgICAgICAgICAgLnJhbmdlKHRoaXMuTUFQX0NPTE9SX1NDQUxFKTtcbiAgICB9XG5cbiAgICBkcmF3Q2lyY2xlc0ZvclBsYWNlcyhtYXAsIHBsYWNlcywgcmFkaXVzU2NhbGUsIGNvbG9yU2NhbGUpIHtcblxuICAgICAgICBwbGFjZXMuZm9yRWFjaChwbGFjZSA9PiB7XG5cbiAgICAgICAgICAgIHZhciBmZWF0dXJlID0ge1xuICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgICAgICAgICAgICBcInByb3BlcnRpZXNcIjoge1xuICAgICAgICAgICAgICAgICAgICBcIm5hbWVcIjogcGxhY2UubmFtZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJnZW9tZXRyeVwiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiY29vcmRpbmF0ZXNcIjogcGxhY2UuY29vcmRpbmF0ZXMsXG4gICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcIlBvaW50XCIsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICBmaWxsQ29sb3I6IGNvbG9yU2NhbGUocGxhY2UudmFsdWUpLFxuICAgICAgICAgICAgICAgIGZpbGxPcGFjaXR5OiAxLFxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAsXG4gICAgICAgICAgICAgICAgcmFkaXVzOiA4LFxuICAgICAgICAgICAgICAgIHN0cm9rZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgd2VpZ2h0OiAwLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgTC5nZW9Kc29uKFxuICAgICAgICAgICAgICAgIGZlYXR1cmUsIFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRUb0xheWVyOiAoZmVhdHVyZSwgbGF0bG5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gTC5jaXJjbGUobGF0bG5nLCByYWRpdXNTY2FsZShwbGFjZS52YWx1ZSApLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICkuYWRkVG8obWFwKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZHJhd01hcmtlcnNGb3JQbGFjZXMobWFwLCBwbGFjZXMpIHtcblxuICAgICAgICBwbGFjZXMuZm9yRWFjaChwbGFjZSA9PiB7XG5cbiAgICAgICAgICAgIHZhciBmZWF0dXJlID0ge1xuICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgICAgICAgICAgICBcInByb3BlcnRpZXNcIjoge1xuICAgICAgICAgICAgICAgICAgICBcIm5hbWVcIjogcGxhY2UubmFtZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJnZW9tZXRyeVwiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiY29vcmRpbmF0ZXNcIjogcGxhY2UubG9jYXRpb24uY29vcmRpbmF0ZXMsXG4gICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcIlBvaW50XCIsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgTC5nZW9Kc29uKGZlYXR1cmUpLmFkZFRvKG1hcCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFBsYWNlc0ZvclJlZ2lvbihkYXRhKSB7XG5cbiAgICAgICAgdmFyIHBsYWNlcyA9IFtdO1xuXG4gICAgICAgIGRhdGEuZm9yRWFjaChwbGFjZSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXMucGFyYW1zLnJlZ2lvbnMuZm9yRWFjaChyZWdpb24gPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYgKHBsYWNlLmlkID09IHJlZ2lvbi5pZClcbiAgICAgICAgICAgICAgICAgICAgcGxhY2VzLnB1c2gocGxhY2UpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHBsYWNlcztcbiAgICB9XG5cbiAgICAvLyBQYWdpbmdcbiAgICAvL1xuICAgIGZldGNoTmV4dFBhZ2UoKSB7XG4gICAgXG4gICAgICAgIGlmICh0aGlzLmZldGNoaW5nIHx8IHRoaXMuZmV0Y2hlZEFsbClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICBcbiAgICAgICAgdGhpcy5mZXRjaGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuaW5jcmVtZW50UGFnZSgpO1xuICAgIFxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgXG4gICAgICAgICQuYWpheCh0aGlzLmdldFNlYXJjaFJlc3VsdHNVcmwoKSkuZG9uZShmdW5jdGlvbihkYXRhLCB0ZXh0U3RhdHVzLCBqcVhIUikge1xuXG4gICAgICAgICAgICBpZiAoanFYSFIuc3RhdHVzID09IDIwNCkgeyAvLyBubyBjb250ZW50XG4gICAgXG4gICAgICAgICAgICAgICAgc2VsZi5kZWNyZW1lbnRQYWdlKCk7XG4gICAgICAgICAgICAgICAgc2VsZi5mZXRjaGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHNlbGYuZmV0Y2hlZEFsbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgJCgnLmRhdGFzZXRzJykuYXBwZW5kKGRhdGEpO1xuICAgICAgICAgICAgc2VsZi5mZXRjaGluZyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZ2V0U2VhcmNoUGFnZUZvclJlZ2lvbnNBbmRWZWN0b3JVcmwocmVnaW9ucywgdmVjdG9yLCBzZWFyY2hSZXN1bHRzLCBxdWVyeVN0cmluZykge1xuICAgIFxuICAgICAgICB2YXIgdXJsID0gJy8nO1xuICAgIFxuICAgICAgICBpZiAodHlwZW9mKHJlZ2lvbnMpID09PSAnc3RyaW5nJykge1xuICAgIFxuICAgICAgICAgICAgdXJsICs9IHJlZ2lvbnMucmVwbGFjZSgvLC9nLCAnJykucmVwbGFjZSgvIC9nLCAnXycpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocmVnaW9ucykpIHtcbiAgICBcbiAgICAgICAgICAgIHZhciByZWdpb25OYW1lcyA9IFtdO1xuICAgIFxuICAgICAgICAgICAgcmVnaW9uTmFtZXMgPSByZWdpb25zLm1hcChmdW5jdGlvbihyZWdpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVnaW9uLnJlcGxhY2UoLywvZywgJycpLnJlcGxhY2UoLyAvZywgJ18nKTtcbiAgICAgICAgICAgIH0pO1xuICAgIFxuICAgICAgICAgICAgdXJsICs9IHJlZ2lvbk5hbWVzLmpvaW4oJ192c18nKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICBcbiAgICAgICAgICAgIHVybCArPSAnc2VhcmNoJztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBpZiAodmVjdG9yKVxuICAgICAgICAgICAgdXJsICs9ICcvJyArIHZlY3RvcjtcbiAgICBcbiAgICAgICAgaWYgKHNlYXJjaFJlc3VsdHMpXG4gICAgICAgICAgICB1cmwgKz0gJy9zZWFyY2gtcmVzdWx0cyc7XG4gICAgXG4gICAgICAgIGlmIChxdWVyeVN0cmluZykgXG4gICAgICAgICAgICB1cmwgKz0gcXVlcnlTdHJpbmc7XG4gICAgXG4gICAgICAgIHJldHVybiB1cmw7XG4gICAgfVxuICAgIFxuICAgIGdldFNlYXJjaFBhZ2VVcmwoc2VhcmNoUmVzdWx0cykge1xuXG4gICAgICAgIGlmICgodGhpcy5wYXJhbXMucmVnaW9ucy5sZW5ndGggPiAwKSB8fCB0aGlzLnBhcmFtcy5hdXRvU3VnZ2VzdGVkUmVnaW9uKSB7XG5cbiAgICAgICAgICAgIHZhciByZWdpb25OYW1lcyA9IFtdO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJhbXMucmVzZXRSZWdpb25zID09IGZhbHNlKSB7XG5cbiAgICAgICAgICAgICAgICByZWdpb25OYW1lcyA9IHRoaXMucGFyYW1zLnJlZ2lvbnMubWFwKGZ1bmN0aW9uKHJlZ2lvbikgeyBcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlZ2lvbi5uYW1lOyBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMucGFyYW1zLmF1dG9TdWdnZXN0ZWRSZWdpb24pXG4gICAgICAgICAgICAgICAgcmVnaW9uTmFtZXMucHVzaCh0aGlzLnBhcmFtcy5hdXRvU3VnZ2VzdGVkUmVnaW9uKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U2VhcmNoUGFnZUZvclJlZ2lvbnNBbmRWZWN0b3JVcmwocmVnaW9uTmFtZXMsIHRoaXMucGFyYW1zLnZlY3Rvciwgc2VhcmNoUmVzdWx0cywgdGhpcy5nZXRTZWFyY2hRdWVyeVN0cmluZygpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U2VhcmNoUGFnZUZvclJlZ2lvbnNBbmRWZWN0b3JVcmwobnVsbCwgdGhpcy5wYXJhbXMudmVjdG9yLCBzZWFyY2hSZXN1bHRzLCB0aGlzLmdldFNlYXJjaFF1ZXJ5U3RyaW5nKCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0U2VhcmNoUmVzdWx0c1VybCgpIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZXRTZWFyY2hQYWdlVXJsKHRydWUpO1xuICAgIH1cblxuICAgIGdldFNlYXJjaFF1ZXJ5U3RyaW5nKCkge1xuXG4gICAgICAgIHZhciB1cmwgPSAnP3E9JyArIGVuY29kZVVSSUNvbXBvbmVudCh0aGlzLnBhcmFtcy5xKTtcblxuICAgICAgICBpZiAodGhpcy5wYXJhbXMucGFnZSA+IDEpXG4gICAgICAgICAgICB1cmwgKz0gJyZwYWdlPScgKyB0aGlzLnBhcmFtcy5wYWdlO1xuXG4gICAgICAgIGlmICh0aGlzLnBhcmFtcy5jYXRlZ29yaWVzLmxlbmd0aCA+IDApXG4gICAgICAgICAgICB1cmwgKz0gJyZjYXRlZ29yaWVzPScgKyBlbmNvZGVVUklDb21wb25lbnQodGhpcy5wYXJhbXMuY2F0ZWdvcmllcy5qb2luKCcsJykpO1xuXG4gICAgICAgIGlmICh0aGlzLnBhcmFtcy5kb21haW5zLmxlbmd0aCA+IDApXG4gICAgICAgICAgICB1cmwgKz0gJyZkb21haW5zPScgKyBlbmNvZGVVUklDb21wb25lbnQodGhpcy5wYXJhbXMuZG9tYWlucy5qb2luKCcsJykpO1xuXG4gICAgICAgIGlmICh0aGlzLnBhcmFtcy5zdGFuZGFyZHMubGVuZ3RoID4gMClcbiAgICAgICAgICAgIHVybCArPSAnJnN0YW5kYXJkcz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMucGFyYW1zLnN0YW5kYXJkcy5qb2luKCcsJykpO1xuXG4gICAgICAgIGlmICh0aGlzLnBhcmFtcy5kZWJ1ZylcbiAgICAgICAgICAgIHVybCArPSAnJmRlYnVnPSc7XG5cbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICB9XG5cbiAgICBpbmNyZW1lbnRQYWdlKCkge1xuICAgIFxuICAgICAgICB0aGlzLnBhcmFtcy5wYWdlKys7XG4gICAgfVxuICAgIFxuICAgIG5hdmlnYXRlKCkge1xuICAgIFxuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHRoaXMuZ2V0U2VhcmNoUGFnZVVybCgpO1xuICAgIH1cbiAgICBcbiAgICByZW1vdmVSZWdpb24ocmVnaW9uSW5kZXgpIHtcbiAgICBcbiAgICAgICAgdGhpcy5wYXJhbXMucmVnaW9ucy5zcGxpY2UocmVnaW9uSW5kZXgsIDEpOyAvLyByZW1vdmUgYXQgaW5kZXggaVxuICAgICAgICB0aGlzLnBhcmFtcy5wYWdlID0gMTtcbiAgICB9XG4gICAgXG4gICAgc2V0QXV0b1N1Z2dlc3RlZFJlZ2lvbihyZWdpb24sIHJlc2V0UmVnaW9ucykge1xuICAgIFxuICAgICAgICB0aGlzLnBhcmFtcy5hdXRvU3VnZ2VzdGVkUmVnaW9uID0gcmVnaW9uO1xuICAgICAgICB0aGlzLnBhcmFtcy5yZXNldFJlZ2lvbnMgPSByZXNldFJlZ2lvbnM7XG4gICAgICAgIHRoaXMucGFyYW1zLnBhZ2UgPSAxO1xuICAgIH1cbiAgICBcbiAgICB0b2dnbGVDYXRlZ29yeShjYXRlZ29yeSkge1xuICAgIFxuICAgICAgICB2YXIgaSA9IHRoaXMucGFyYW1zLmNhdGVnb3JpZXMuaW5kZXhPZihjYXRlZ29yeSk7XG4gICAgXG4gICAgICAgIGlmIChpID4gLTEpXG4gICAgICAgICAgICB0aGlzLnBhcmFtcy5jYXRlZ29yaWVzLnNwbGljZShpLCAxKTsgLy8gcmVtb3ZlIGF0IGluZGV4IGlcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5wYXJhbXMuY2F0ZWdvcmllcy5wdXNoKGNhdGVnb3J5KTtcbiAgICB9XG4gICAgXG4gICAgdG9nZ2xlRG9tYWluKGRvbWFpbikge1xuICAgIFxuICAgICAgICB2YXIgaSA9IHRoaXMucGFyYW1zLmRvbWFpbnMuaW5kZXhPZihkb21haW4pO1xuICAgIFxuICAgICAgICBpZiAoaSA+IC0xKVxuICAgICAgICAgICAgdGhpcy5wYXJhbXMuZG9tYWlucy5zcGxpY2UoaSwgMSk7IC8vIHJlbW92ZSBhdCBpbmRleCBpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMucGFyYW1zLmRvbWFpbnMucHVzaChkb21haW4pO1xuICAgIH1cbiAgICBcbiAgICB0b2dnbGVTdGFuZGFyZChzdGFuZGFyZCkge1xuICAgIFxuICAgICAgICB2YXIgaSA9IHRoaXMucGFyYW1zLnN0YW5kYXJkcy5pbmRleE9mKHN0YW5kYXJkKTtcbiAgICBcbiAgICAgICAgaWYgKGkgPiAtMSlcbiAgICAgICAgICAgIHRoaXMucGFyYW1zLnN0YW5kYXJkcy5zcGxpY2UoaSwgMSk7IC8vIHJlbW92ZSBhdCBpbmRleCBpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMucGFyYW1zLnN0YW5kYXJkcy5wdXNoKHN0YW5kYXJkKTtcbiAgICB9XG59Il19
//# sourceMappingURL=v4-search-page-controller.js.map
