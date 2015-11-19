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
            var regionPlaces;
            var placeMap = {};

            controller.getPlaces().then(function (placesResponse) {

                regionPlaces = _this3.getPlacesForRegion(placesResponse);
                placesResponse.forEach(function (place) {
                    return placeMap[place.id] = place;
                }); // init the place map

                return controller.getEarningsByPlace();
            }).then(function (earningsResponse) {

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Y0LXNlYXJjaC1wYWdlLWNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBQU0sb0JBQW9CO0FBRXRCLGFBRkUsb0JBQW9CLENBRVYsTUFBTSxFQUFFOzhCQUZsQixvQkFBb0I7O0FBSWxCLFlBQUksQ0FBQyxlQUFlLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFDNUMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztBQUM3QixZQUFJLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRXBDLFlBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLFlBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0FBQ3RCLFlBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO0FBQ3hCLFlBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDOztBQUV0QixZQUFJLElBQUksR0FBRyxJQUFJOzs7O0FBQUMsQUFJaEIsU0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxZQUFXOztBQUVwQyxhQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDekMsYUFBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUM1RixhQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN6QyxDQUFDLENBQUM7O0FBRUgsU0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxZQUFXOztBQUVwQyxhQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFD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QUcsQ0FBQyxDQUFDLEVBQ04sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFBQyxpQkFFakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3hDOzs7dUNBRWMsUUFBUSxFQUFFOztBQUVyQixnQkFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUVoRCxnQkFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQ04sSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFBQyxpQkFFbkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQzVDOzs7V0FsN0NDLG9CQUFvQiIsImZpbGUiOiJ2NC1zZWFyY2gtcGFnZS1jb250cm9sbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgU2VhcmNoUGFnZUNvbnRyb2xsZXIge1xuXG4gICAgY29uc3RydWN0b3IocGFyYW1zKSB7XG5cbiAgICAgICAgdGhpcy5NQVBfQ09MT1JfU0NBTEUgPSBjb2xvcmJyZXdlci5SZFlsQnVbOV0sXG4gICAgICAgIHRoaXMuTUFQX0lOSVRJQUxfWk9PTSA9IDEwLjA7XG4gICAgICAgIHRoaXMuTUFQX1JBRElVU19TQ0FMRSA9IFs1MDAsIDIwMDBdO1xuXG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zO1xuICAgICAgICB0aGlzLmZldGNoaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZmV0Y2hlZEFsbCA9IGZhbHNlO1xuICAgICAgICB0aGlzLm1vc3RTaW1pbGFyID0gW107XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIC8vIFJlZmluZSBtZW51c1xuICAgICAgICAvL1xuICAgICAgICAkKCcucmVmaW5lLWxpbmsnKS5tb3VzZWVudGVyKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdyZWZpbmUtbGluay1zZWxlY3RlZCcpO1xuICAgICAgICAgICAgJCh0aGlzKS5jaGlsZHJlbignc3BhbicpLmNoaWxkcmVuKCdpJykucmVtb3ZlQ2xhc3MoJ2ZhLWNhcmV0LWRvd24nKS5hZGRDbGFzcygnZmEtY2FyZXQtdXAnKTtcbiAgICAgICAgICAgICQodGhpcykuY2hpbGRyZW4oJ3VsJykuc2xpZGVEb3duKDEwMCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICQoJy5yZWZpbmUtbGluaycpLm1vdXNlbGVhdmUoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ3JlZmluZS1saW5rLXNlbGVjdGVkJyk7XG4gICAgICAgICAgICAkKHRoaXMpLmNoaWxkcmVuKCdzcGFuJykuY2hpbGRyZW4oJ2knKS5yZW1vdmVDbGFzcygnZmEtY2FyZXQtdXAnKS5hZGRDbGFzcygnZmEtY2FyZXQtZG93bicpO1xuICAgICAgICAgICAgJCh0aGlzKS5jaGlsZHJlbigndWwnKS5zbGlkZVVwKDEwMCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIENhdGVnb3JpZXNcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5hdHRhY2hDYXRlZ29yaWVzQ2xpY2tIYW5kbGVycygpO1xuXG4gICAgICAgICQoJyNyZWZpbmUtbWVudS1jYXRlZ29yaWVzLXZpZXctbW9yZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG5cbiAgICAgICAgICAgIGNvbnRyb2xsZXIuZ2V0Q2F0ZWdvcmllcygpXG4gICAgICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHJnID0gZGF0YS5yZXN1bHRzLm1hcChmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnPGxpPjxpIGNsYXNzPVwiZmEgJyArIHJlc3VsdC5tZXRhZGF0YS5pY29uICsgJ1wiPjwvaT4nICsgcmVzdWx0LmNhdGVnb3J5ICsgJzwvbGk+JztcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHMgPSByZy5qb2luKCcnKTtcblxuICAgICAgICAgICAgICAgICAgICAkKCcjcmVmaW5lLW1lbnUtY2F0ZWdvcmllcycpLmh0bWwocyk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYXR0YWNoQ2F0ZWdvcmllc0NsaWNrSGFuZGxlcnMoKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIERvbWFpbnNcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5hdHRhY2hEb21haW5zQ2xpY2tIYW5kbGVycygpO1xuXG4gICAgICAgICQoJyNyZWZpbmUtbWVudS1kb21haW5zLXZpZXctbW9yZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG5cbiAgICAgICAgICAgIGNvbnRyb2xsZXIuZ2V0RG9tYWlucygpXG4gICAgICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHJnID0gZGF0YS5yZXN1bHRzLm1hcChmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnPGxpPicgKyByZXN1bHQuZG9tYWluICsgJzwvbGk+JztcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHMgPSByZy5qb2luKCcnKTtcblxuICAgICAgICAgICAgICAgICAgICAkKCcjcmVmaW5lLW1lbnUtZG9tYWlucycpLmh0bWwocyk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYXR0YWNoRG9tYWluc0NsaWNrSGFuZGxlcnMoKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gU3RhbmRhcmRzXG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuYXR0YWNoU3RhbmRhcmRzQ2xpY2tIYW5kbGVycygpO1xuICAgIFxuICAgICAgICAvLyBUb2tlbnNcbiAgICAgICAgLy9cbiAgICAgICAgJCgnLnJlZ2lvbi10b2tlbiAuZmEtdGltZXMtY2lyY2xlJykuY2xpY2soZnVuY3Rpb24oKSB7IFxuICAgIFxuICAgICAgICAgICAgc2VsZi5yZW1vdmVSZWdpb24oJCh0aGlzKS5wYXJlbnQoKS5pbmRleCgpKTtcbiAgICAgICAgICAgIHNlbGYubmF2aWdhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICQoJy5jYXRlZ29yeS10b2tlbiAuZmEtdGltZXMtY2lyY2xlJykuY2xpY2soZnVuY3Rpb24oKSB7IFxuICAgIFxuICAgICAgICAgICAgc2VsZi50b2dnbGVDYXRlZ29yeSgkKHRoaXMpLnBhcmVudCgpLnRleHQoKS50b0xvd2VyQ2FzZSgpLnRyaW0oKSk7XG4gICAgICAgICAgICBzZWxmLm5hdmlnYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICAkKCcuZG9tYWluLXRva2VuIC5mYS10aW1lcy1jaXJjbGUnKS5jbGljayhmdW5jdGlvbigpIHsgXG4gICAgXG4gICAgICAgICAgICBzZWxmLnRvZ2dsZURvbWFpbigkKHRoaXMpLnBhcmVudCgpLnRleHQoKS50b0xvd2VyQ2FzZSgpLnRyaW0oKSk7XG4gICAgICAgICAgICBzZWxmLm5hdmlnYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICAkKCcuc3RhbmRhcmQtdG9rZW4gLmZhLXRpbWVzLWNpcmNsZScpLmNsaWNrKGZ1bmN0aW9uKCkgeyBcbiAgICBcbiAgICAgICAgICAgIHNlbGYudG9nZ2xlU3RhbmRhcmQoJCh0aGlzKS5wYXJlbnQoKS50ZXh0KCkudG9Mb3dlckNhc2UoKS50cmltKCkpO1xuICAgICAgICAgICAgc2VsZi5uYXZpZ2F0ZSgpO1xuICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgLy8gSW5maW5pdGUgc2Nyb2xsIHNlYXJjaCByZXN1bHRzXG4gICAgICAgIC8vXG4gICAgICAgICQod2luZG93KS5vbignc2Nyb2xsJywgZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgYm90dG9tT2Zmc2V0VG9CZWdpblJlcXVlc3QgPSAxMDAwO1xuICAgIFxuICAgICAgICAgICAgaWYgKCQod2luZG93KS5zY3JvbGxUb3AoKSA+PSAkKGRvY3VtZW50KS5oZWlnaHQoKSAtICQod2luZG93KS5oZWlnaHQoKSAtIGJvdHRvbU9mZnNldFRvQmVnaW5SZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgc2VsZi5mZXRjaE5leHRQYWdlKCk7XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgIH0pLnNjcm9sbCgpO1xuICAgIFxuICAgICAgICAvLyBBZGQgbG9jYXRpb25cbiAgICAgICAgLy9cbiAgICAgICAgbmV3IEF1dG9TdWdnZXN0UmVnaW9uQ29udHJvbGxlcignLmFkZC1yZWdpb24gaW5wdXRbdHlwZT1cInRleHRcIl0nLCAnLmFkZC1yZWdpb24gdWwnLCBmdW5jdGlvbihyZWdpb24pIHtcbiAgICBcbiAgICAgICAgICAgIHNlbGYuc2V0QXV0b1N1Z2dlc3RlZFJlZ2lvbihyZWdpb24sIGZhbHNlKTtcbiAgICAgICAgICAgIHNlbGYubmF2aWdhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICQoJy5hZGQtcmVnaW9uIC5mYS1wbHVzJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICAgICAgICAkKCcuYWRkLXJlZ2lvbiBpbnB1dFt0eXBlPVwidGV4dFwiXScpLmZvY3VzKCk7XG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICAvLyBTaW1pbGFyIHJlZ2lvbnNcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5kcmF3U2ltaWxhclJlZ2lvbnMoZnVuY3Rpb24ocmVnaW9uKSB7XG4gICAgXG4gICAgICAgICAgICBzZWxmLnNldEF1dG9TdWdnZXN0ZWRSZWdpb24ocmVnaW9uLCBmYWxzZSk7XG4gICAgICAgICAgICBzZWxmLm5hdmlnYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICAvLyBQbGFjZXMgaW4gcmVnaW9uXG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuZHJhd1BsYWNlc0luUmVnaW9uKCk7XG4gICAgfVxuXG4gICAgLy8gUHVibGljIG1ldGhvZHNcbiAgICAvL1xuICAgIGF0dGFjaENhdGVnb3JpZXNDbGlja0hhbmRsZXJzKCkge1xuICAgIFxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgXG4gICAgICAgICQoJyNyZWZpbmUtbWVudS1jYXRlZ29yaWVzIGxpOm5vdCgucmVmaW5lLXZpZXctbW9yZSknKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICBcbiAgICAgICAgICAgIHNlbGYudG9nZ2xlQ2F0ZWdvcnkoJCh0aGlzKS50ZXh0KCkudG9Mb3dlckNhc2UoKS50cmltKCkpO1xuICAgICAgICAgICAgc2VsZi5uYXZpZ2F0ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgYXR0YWNoRG9tYWluc0NsaWNrSGFuZGxlcnMoKSB7XG4gICAgXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgXG4gICAgICAgICQoJyNyZWZpbmUtbWVudS1kb21haW5zIGxpOm5vdCgucmVmaW5lLXZpZXctbW9yZSknKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICBcbiAgICAgICAgICAgIHZhciBkb21haW4gPSAkKHRoaXMpLnRleHQoKS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcbiAgICBcbiAgICAgICAgICAgIHNlbGYudG9nZ2xlRG9tYWluKGRvbWFpbik7XG4gICAgICAgICAgICBzZWxmLm5hdmlnYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGF0dGFjaFN0YW5kYXJkc0NsaWNrSGFuZGxlcnMoKSB7XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICQoJyNyZWZpbmUtbWVudS1zdGFuZGFyZHMgbGknKS5jbGljayhmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIHN0YW5kYXJkID0gJCh0aGlzKS50ZXh0KCkudG9Mb3dlckNhc2UoKS50cmltKCk7XG5cbiAgICAgICAgICAgIHNlbGYudG9nZ2xlU3RhbmRhcmQoc3RhbmRhcmQpO1xuICAgICAgICAgICAgc2VsZi5uYXZpZ2F0ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkZWNyZW1lbnRQYWdlKCkge1xuXG4gICAgICAgIHRoaXMucGFyYW1zLnBhZ2UtLTtcbiAgICB9XG5cbiAgICAvLyBDb3N0IG9mIGxpdmluZ1xuICAgIC8vXG4gICAgZHJhd0Nvc3RPZkxpdmluZ0RhdGEoKSB7XG5cbiAgICAgICAgZ29vZ2xlLnNldE9uTG9hZENhbGxiYWNrKCgpID0+IHtcblxuICAgICAgICAgICAgdmFyIHJlZ2lvbklkcyA9IHRoaXMucGFyYW1zLnJlZ2lvbnMubWFwKGZ1bmN0aW9uKHJlZ2lvbikgeyByZXR1cm4gcmVnaW9uLmlkOyB9KTtcbiAgICAgICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcblxuICAgICAgICAgICAgY29udHJvbGxlci5nZXRDb3N0T2ZMaXZpbmdEYXRhKHJlZ2lvbklkcylcbiAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IHsgXG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3Q29zdE9mTGl2aW5nQ2hhcnQocmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3Q29zdE9mTGl2aW5nVGFibGUocmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBkcmF3Q29zdE9mTGl2aW5nQ2hhcnQocmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIHRoaXMuZHJhd0Nvc3RPZkxpdmluZ0NoYXJ0Rm9yQ29tcG9uZW50KCdjb3N0LW9mLWxpdmluZy1hbGwtY2hhcnQnLCAnQWxsJywgcmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgdGhpcy5kcmF3Q29zdE9mTGl2aW5nQ2hhcnRGb3JDb21wb25lbnQoJ2Nvc3Qtb2YtbGl2aW5nLWdvb2RzLWNoYXJ0JywgJ0dvb2RzJywgcmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgdGhpcy5kcmF3Q29zdE9mTGl2aW5nQ2hhcnRGb3JDb21wb25lbnQoJ2Nvc3Qtb2YtbGl2aW5nLXJlbnRzLWNoYXJ0JywgJ1JlbnRzJywgcmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgdGhpcy5kcmF3Q29zdE9mTGl2aW5nQ2hhcnRGb3JDb21wb25lbnQoJ2Nvc3Qtb2YtbGl2aW5nLW90aGVyLWNoYXJ0JywgJ090aGVyJywgcmVnaW9uSWRzLCBkYXRhKTtcbiAgICB9XG4gICAgXG4gICAgZHJhd0Nvc3RPZkxpdmluZ0NoYXJ0Rm9yQ29tcG9uZW50KGlkLCBjb21wb25lbnQsIHJlZ2lvbklkcywgZGF0YSkge1xuICAgIFxuICAgICAgICB2YXIgY2hhcnREYXRhID0gW11cbiAgICBcbiAgICAgICAgLy8gSGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBoZWFkZXIgPSBbJ1llYXInXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGhlYWRlcltpICsgMV0gPSB0aGlzLnBhcmFtcy5yZWdpb25zW2ldLm5hbWU7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgY2hhcnREYXRhLnB1c2goaGVhZGVyKTtcbiAgICBcbiAgICAgICAgLy8gRm9ybWF0IHRoZSBkYXRhXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBvID0ge307XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIFxuICAgICAgICAgICAgaWYgKGRhdGFbaV0uY29tcG9uZW50ICE9IGNvbXBvbmVudClcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICBcbiAgICAgICAgICAgIGlmIChvW2RhdGFbaV0ueWVhcl0gPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgb1tkYXRhW2ldLnllYXJdID0gW2RhdGFbaV0ueWVhcl07XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICBvW2RhdGFbaV0ueWVhcl0ucHVzaChwYXJzZUZsb2F0KGRhdGFbaV0uaW5kZXgpKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gbykge1xuICAgICAgICAgICAgY2hhcnREYXRhLnB1c2gob1trZXldKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICB0aGlzLmRyYXdMaW5lQ2hhcnQoaWQsIGNoYXJ0RGF0YSwge1xuICAgIFxuICAgICAgICAgICAgY3VydmVUeXBlIDogJ2Z1bmN0aW9uJyxcbiAgICAgICAgICAgIGxlZ2VuZCA6IHsgcG9zaXRpb24gOiAnYm90dG9tJyB9LFxuICAgICAgICAgICAgcG9pbnRTaGFwZSA6ICdzcXVhcmUnLFxuICAgICAgICAgICAgcG9pbnRTaXplIDogOCxcbiAgICAgICAgICAgIHRpdGxlIDogY29tcG9uZW50LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZHJhd0Nvc3RPZkxpdmluZ1RhYmxlKHJlZ2lvbklkcywgZGF0YSkge1xuICAgIFxuICAgICAgICAvLyBGb3JtYXQgdGhlIGRhdGFcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGNvbXBvbmVudHMgPSBbJ0FsbCcsICdHb29kcycsICdPdGhlcicsICdSZW50cyddO1xuICAgICAgICB2YXIgcm93cyA9IFtdO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbXBvbmVudHMubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgIHZhciBjb21wb25lbnQgPSBjb21wb25lbnRzW2ldO1xuICAgICAgICAgICAgdmFyIHJvdyA9IFtjb21wb25lbnRdO1xuICAgIFxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCByZWdpb25JZHMubGVuZ3RoOyBqKyspIHtcbiAgICBcbiAgICAgICAgICAgICAgICB2YXIgbyA9IHRoaXMuZ2V0TGF0ZXN0Q29zdE9mTGl2aW5nKGRhdGEsIHJlZ2lvbklkc1tqXSwgY29tcG9uZW50KTtcbiAgICBcbiAgICAgICAgICAgICAgICByb3cucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4IDogKG8gIT0gbnVsbCkgPyBwYXJzZUZsb2F0KG8uaW5kZXgpIDogJ05BJyxcbiAgICAgICAgICAgICAgICAgICAgcGVyY2VudGlsZSA6IChvICE9IG51bGwpID8gdGhpcy5nZXRQZXJjZW50aWxlKG8ucmFuaywgby50b3RhbF9yYW5rcykgOiAnTkEnLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgcm93cy5wdXNoKHJvdyk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgLy8gSGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBzID0gJzx0cj48dGg+PC90aD4nO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcyArPSAnPHRoIGNvbHNwYW49XFwnMlxcJz4nICsgdGhpcy5wYXJhbXMucmVnaW9uc1tpXS5uYW1lICsgJzwvdGg+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvLyBTdWIgaGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHMgKz0gJzwvdHI+PHRyPjx0ZCBjbGFzcz1cXCdjb2x1bW4taGVhZGVyXFwnPjwvdGQ+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0ZCBjbGFzcz1cXCdjb2x1bW4taGVhZGVyXFwnPlZhbHVlPC90ZD48dGQgY2xhc3M9XFwnY29sdW1uLWhlYWRlclxcJz5QZXJjZW50aWxlPC90ZD4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIHMgKz0gJzwvdHI+JztcbiAgICAgICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcm93cy5sZW5ndGg7IGkrKykge1xuICAgIFxuICAgICAgICAgICAgdmFyIHJvdyA9IHJvd3NbaV07XG4gICAgXG4gICAgICAgICAgICBzICs9ICc8dHI+JztcbiAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgcm93WzBdICsgJzwvdGQ+JztcbiAgICBcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAxOyBqIDwgcm93Lmxlbmd0aDsgaisrKSB7XG4gICAgXG4gICAgICAgICAgICAgICAgcyArPSAnPHRkPicgKyByb3dbal0uaW5kZXggKyAnPC90ZD4nO1xuICAgICAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgcm93W2pdLnBlcmNlbnRpbGUgKyAnPC90ZD4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzICs9ICc8L3RyPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgJCgnI2Nvc3Qtb2YtbGl2aW5nLXRhYmxlJykuaHRtbChzKTtcbiAgICB9XG4gICAgXG4gICAgZ2V0UGVyY2VudGlsZShyYW5rLCB0b3RhbFJhbmtzKSB7XG4gICAgXG4gICAgICAgIHZhciB0b3RhbFJhbmtzID0gcGFyc2VJbnQodG90YWxSYW5rcyk7XG4gICAgICAgIHZhciByYW5rID0gcGFyc2VJbnQocmFuayk7XG4gICAgICAgIHZhciBwZXJjZW50aWxlID0gcGFyc2VJbnQoKCh0b3RhbFJhbmtzIC0gcmFuaykgLyB0b3RhbFJhbmtzKSAqIDEwMCk7XG4gICAgXG4gICAgICAgIHJldHVybiBudW1lcmFsKHBlcmNlbnRpbGUpLmZvcm1hdCgnMG8nKTtcbiAgICB9XG4gICAgXG4gICAgZ2V0TGF0ZXN0Q29zdE9mTGl2aW5nKGRhdGEsIHJlZ2lvbklkLCBjb21wb25lbnQpIHtcbiAgICBcbiAgICAgICAgdmFyIGRhdHVtID0gbnVsbDtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICBpZiAoZGF0YVtpXS5pZCAhPSByZWdpb25JZClcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICBcbiAgICAgICAgICAgIGlmIChkYXRhW2ldLmNvbXBvbmVudCAhPSBjb21wb25lbnQpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgXG4gICAgICAgICAgICBpZiAoZGF0dW0gPT0gbnVsbCkge1xuICAgIFxuICAgICAgICAgICAgICAgIGRhdHVtID0gZGF0YVtpXTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIGlmIChwYXJzZUludChkYXRhW2ldLnllYXIpIDw9IHBhcnNlSW50KGRhdHVtLnllYXIpKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgIFxuICAgICAgICAgICAgZGF0dW0gPSBkYXRhW2ldO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZGF0dW07XG4gICAgfVxuICAgIFxuICAgIC8vIEVhcm5pbmdzXG4gICAgLy9cbiAgICBkcmF3RWFybmluZ3NEYXRhKCkge1xuXG4gICAgICAgIGdvb2dsZS5zZXRPbkxvYWRDYWxsYmFjaygoKSA9PiB7XG4gICAgXG4gICAgICAgICAgICB2YXIgcmVnaW9uSWRzID0gdGhpcy5wYXJhbXMucmVnaW9ucy5tYXAoZnVuY3Rpb24ocmVnaW9uKSB7IHJldHVybiByZWdpb24uaWQ7IH0pO1xuICAgICAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuICAgIFxuICAgICAgICAgICAgY29udHJvbGxlci5nZXRFYXJuaW5nc0RhdGEocmVnaW9uSWRzKVxuICAgICAgICAgICAgICAgIC50aGVuKGRhdGEgPT4geyBcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdFYXJuaW5nc01hcCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdFYXJuaW5nc0NoYXJ0KHJlZ2lvbklkcywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd0Vhcm5pbmdzVGFibGUocmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRyYXdFYXJuaW5nc0NoYXJ0KHJlZ2lvbklkcywgZGF0YSkge1xuICAgIFxuICAgICAgICB2YXIgZWFybmluZ3MgPSBbXTtcbiAgICBcbiAgICAgICAgLy8gSGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBoZWFkZXIgPSBbJ0VkdWNhdGlvbiBMZXZlbCddO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaGVhZGVyW2kgKyAxXSA9IHRoaXMucGFyYW1zLnJlZ2lvbnNbaV0ubmFtZTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBlYXJuaW5ncy5wdXNoKGhlYWRlcik7XG4gICAgXG4gICAgICAgIC8vIExlc3MgdGhhbiBoaWdoIHNjaG9vbFxuICAgICAgICAvL1xuICAgICAgICB2YXIgc29tZUhpZ2hTY2hvb2xFYXJuaW5ncyA9IFsnU29tZSBIaWdoIFNjaG9vbCddO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc29tZUhpZ2hTY2hvb2xFYXJuaW5nc1tpICsgMV0gPSBwYXJzZUludChkYXRhW2ldLm1lZGlhbl9lYXJuaW5nc19sZXNzX3RoYW5faGlnaF9zY2hvb2wpO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGVhcm5pbmdzLnB1c2goc29tZUhpZ2hTY2hvb2xFYXJuaW5ncyk7XG4gICAgXG4gICAgICAgIC8vIEhpZ2ggc2Nob29sXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBoaWdoU2Nob29sRWFybmluZ3MgPSBbJ0hpZ2ggU2Nob29sJ107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBoaWdoU2Nob29sRWFybmluZ3NbaSArIDFdID0gcGFyc2VJbnQoZGF0YVtpXS5tZWRpYW5fZWFybmluZ3NfaGlnaF9zY2hvb2wpO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGVhcm5pbmdzLnB1c2goaGlnaFNjaG9vbEVhcm5pbmdzKTtcbiAgICBcbiAgICAgICAgLy8gU29tZSBjb2xsZWdlXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBzb21lQ29sbGVnZUVhcm5pbmdzID0gWydTb21lIENvbGxlZ2UnXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHNvbWVDb2xsZWdlRWFybmluZ3NbaSArIDFdID0gcGFyc2VJbnQoZGF0YVtpXS5tZWRpYW5fZWFybmluZ3Nfc29tZV9jb2xsZWdlX29yX2Fzc29jaWF0ZXMpO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGVhcm5pbmdzLnB1c2goc29tZUNvbGxlZ2VFYXJuaW5ncyk7XG4gICAgXG4gICAgICAgIC8vIEJhY2hlbG9yJ3NcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGJhY2hlbG9yc0Vhcm5pbmdzID0gWydCYWNoZWxvclxcJ3MnXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGJhY2hlbG9yc0Vhcm5pbmdzW2kgKyAxXSA9IHBhcnNlSW50KGRhdGFbaV0ubWVkaWFuX2Vhcm5pbmdzX2JhY2hlbG9yX2RlZ3JlZSk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgZWFybmluZ3MucHVzaChiYWNoZWxvcnNFYXJuaW5ncyk7XG4gICAgXG4gICAgICAgIC8vIEdyYWR1YXRlIGRlZ3JlZVxuICAgICAgICAvL1xuICAgICAgICB2YXIgZ3JhZHVhdGVEZWdyZWVFYXJuaW5ncyA9IFsnR3JhZHVhdGUgRGVncmVlJ107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBncmFkdWF0ZURlZ3JlZUVhcm5pbmdzW2kgKyAxXSA9IHBhcnNlSW50KGRhdGFbaV0ubWVkaWFuX2Vhcm5pbmdzX2dyYWR1YXRlX29yX3Byb2Zlc3Npb25hbF9kZWdyZWUpO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGVhcm5pbmdzLnB1c2goZ3JhZHVhdGVEZWdyZWVFYXJuaW5ncyk7XG4gICAgXG4gICAgICAgIHRoaXMuZHJhd1N0ZXBwZWRBcmVhQ2hhcnQoJ2Vhcm5pbmdzLWNoYXJ0JywgZWFybmluZ3MsIHtcbiAgICBcbiAgICAgICAgICAgIGFyZWFPcGFjaXR5IDogMCxcbiAgICAgICAgICAgIGNvbm5lY3RTdGVwczogdHJ1ZSxcbiAgICAgICAgICAgIGN1cnZlVHlwZSA6ICdmdW5jdGlvbicsXG4gICAgICAgICAgICBmb2N1c1RhcmdldCA6ICdjYXRlZ29yeScsXG4gICAgICAgICAgICBsZWdlbmQgOiB7IHBvc2l0aW9uIDogJ2JvdHRvbScgfSxcbiAgICAgICAgICAgIHRpdGxlIDogJ0Vhcm5pbmdzIGJ5IEVkdWNhdGlvbiBMZXZlbCcsXG4gICAgICAgICAgICB2QXhpcyA6IHsgZm9ybWF0IDogJ2N1cnJlbmN5JyB9LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkcmF3RWFybmluZ3NNYXAoKSB7XG5cbiAgICAgICAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG4gICAgICAgIHZhciByZWdpb25QbGFjZXM7XG4gICAgICAgIHZhciBwbGFjZU1hcCA9IHt9O1xuXG4gICAgICAgIGNvbnRyb2xsZXIuZ2V0UGxhY2VzKClcbiAgICAgICAgICAgIC50aGVuKHBsYWNlc1Jlc3BvbnNlID0+IHtcblxuICAgICAgICAgICAgICAgIHJlZ2lvblBsYWNlcyA9IHRoaXMuZ2V0UGxhY2VzRm9yUmVnaW9uKHBsYWNlc1Jlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICBwbGFjZXNSZXNwb25zZS5mb3JFYWNoKHBsYWNlID0+IHBsYWNlTWFwW3BsYWNlLmlkXSA9IHBsYWNlKTsgLy8gaW5pdCB0aGUgcGxhY2UgbWFwXG5cbiAgICAgICAgICAgICAgICByZXR1cm4gY29udHJvbGxlci5nZXRFYXJuaW5nc0J5UGxhY2UoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKGVhcm5pbmdzUmVzcG9uc2UgPT4ge1xuXG4gICAgICAgICAgICAgICAgLy8gR2V0IG1hcCBkYXRhXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICBjb25zdCBlYXJuaW5nc1BsYWNlcyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgZWFybmluZ3NSZXNwb25zZS5mb3JFYWNoKGl0ZW0gPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLm1lZGlhbl9lYXJuaW5ncyA9PSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmlkIGluIHBsYWNlTWFwKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGVhcm5pbmdzUGxhY2VzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzIDogcGxhY2VNYXBbaXRlbS5pZF0ubG9jYXRpb24uY29vcmRpbmF0ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQgOiBpdGVtLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgOiBpdGVtLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgOiBwYXJzZUludChpdGVtLm1lZGlhbl9lYXJuaW5ncyksXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBlYXJuaW5nc1BsYWNlcy5zb3J0KChhLCBiKSA9PiBiLnZhbHVlIC0gYS52YWx1ZSk7IC8vIGRlc2NcbiAgICAgICAgICAgICAgICBjb25zdCBlYXJuaW5ncyA9IF8ubWFwKGVhcm5pbmdzUGxhY2VzLCB4ID0+IHsgcmV0dXJuIHgudmFsdWUgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBJbml0IG1hcFxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgY29uc3QgcmFkaXVzU2NhbGUgPSB0aGlzLmdldFJhZGl1c1NjYWxlTGluZWFyKGVhcm5pbmdzKVxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9yU2NhbGUgPSB0aGlzLmdldENvbG9yU2NhbGUoZWFybmluZ3MpXG5cbiAgICAgICAgICAgICAgICBjb25zdCBjb29yZGluYXRlcyA9IHJlZ2lvblBsYWNlc1swXS5sb2NhdGlvbi5jb29yZGluYXRlcztcbiAgICAgICAgICAgICAgICBjb25zdCBjZW50ZXIgPSBbY29vcmRpbmF0ZXNbMV0sIGNvb3JkaW5hdGVzWzBdXTtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXAgPSBMLm1hcCgnbWFwJywgeyB6b29tQ29udHJvbCA6IHRydWUgfSk7XG5cbiAgICAgICAgICAgICAgICBMLnRpbGVMYXllcignaHR0cHM6Ly9hLnRpbGVzLm1hcGJveC5jb20vdjMvc29jcmF0YS1hcHBzLmlicDBsODk5L3t6fS97eH0ve3l9LnBuZycpLmFkZFRvKG1hcCk7XG4gICAgICAgICAgICAgICAgbWFwLnNldFZpZXcoY2VudGVyLCB0aGlzLk1BUF9JTklUSUFMX1pPT00pO1xuXG4gICAgICAgICAgICAgICAgLy8gUG9wdWxhdGUgbWFwXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdDaXJjbGVzRm9yUGxhY2VzKG1hcCwgZWFybmluZ3NQbGFjZXMsIHJhZGl1c1NjYWxlLCBjb2xvclNjYWxlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdNYXJrZXJzRm9yUGxhY2VzKG1hcCwgcmVnaW9uUGxhY2VzKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgIH1cblxuICAgIGRyYXdFYXJuaW5nc1RhYmxlKHJlZ2lvbklkcywgZGF0YSkge1xuICAgIFxuICAgICAgICB2YXIgcyA9ICcnO1xuICAgIFxuICAgICAgICBzICs9ICc8dHI+PHRoPjwvdGg+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0aD4nICsgdGhpcy5wYXJhbXMucmVnaW9uc1tpXS5uYW1lICsgJzwvdGg+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvLyBNZWRpYW4gZWFybmluZ3MgYWxsXG4gICAgICAgIC8vXG4gICAgICAgIHMgKz0gJzwvdHI+PHRyPjx0ZD5NZWRpYW4gRWFybmluZ3MgKEFsbCBXb3JrZXJzKTwvdGQ+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgbnVtZXJhbChkYXRhW2ldLm1lZGlhbl9lYXJuaW5ncykuZm9ybWF0KCckMCwwJykgKyAnPC90ZD4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8vIE1lZGlhbiBlYXJuaW5ncyBmZW1hbGVcbiAgICAgICAgLy9cbiAgICAgICAgcyArPSAnPC90cj48dHI+PHRkPk1lZGlhbiBGZW1hbGUgRWFybmluZ3MgKEZ1bGwgVGltZSk8L3RkPic7XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzICs9ICc8dGQ+JyArIG51bWVyYWwoZGF0YVtpXS5mZW1hbGVfZnVsbF90aW1lX21lZGlhbl9lYXJuaW5ncykuZm9ybWF0KCckMCwwJykgKyAnPC90ZD4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8vIE1lZGlhbiBlYXJuaW5ncyBtYWxlXG4gICAgICAgIC8vXG4gICAgICAgIHMgKz0gJzwvdHI+PHRyPjx0ZD5NZWRpYW4gTWFsZSBFYXJuaW5ncyAoRnVsbCBUaW1lKTwvdGQ+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgbnVtZXJhbChkYXRhW2ldLm1hbGVfZnVsbF90aW1lX21lZGlhbl9lYXJuaW5ncykuZm9ybWF0KCckMCwwJykgKyAnPC90ZD4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIHMgKz0gJzwvdHI+JztcbiAgICBcbiAgICAgICAgJCgnI2Vhcm5pbmdzLXRhYmxlJykuaHRtbChzKTtcbiAgICB9XG4gICAgXG4gICAgLy8gRWR1Y2F0aW9uXG4gICAgLy9cbiAgICBkcmF3RWR1Y2F0aW9uRGF0YSgpIHtcblxuICAgICAgICBnb29nbGUuc2V0T25Mb2FkQ2FsbGJhY2soKCkgPT4ge1xuXG4gICAgICAgICAgICB2YXIgcmVnaW9uSWRzID0gdGhpcy5wYXJhbXMucmVnaW9ucy5tYXAoZnVuY3Rpb24ocmVnaW9uKSB7IHJldHVybiByZWdpb24uaWQ7IH0pO1xuICAgICAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuXG4gICAgICAgICAgICBjb250cm9sbGVyLmdldEVkdWNhdGlvbkRhdGEocmVnaW9uSWRzKVxuICAgICAgICAgICAgICAgIC50aGVuKGRhdGEgPT4gdGhpcy5kcmF3RWR1Y2F0aW9uVGFibGUocmVnaW9uSWRzLCBkYXRhKSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZHJhd0VkdWNhdGlvblRhYmxlKHJlZ2lvbklkcywgZGF0YSkge1xuICAgIFxuICAgICAgICB2YXIgcyA9ICcnO1xuICAgIFxuICAgICAgICAvLyBIZWFkZXJcbiAgICAgICAgLy9cbiAgICAgICAgcyArPSAnPHRyPjx0aD48L3RoPic7XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzICs9ICc8dGggY29sc3Bhbj1cXCcyXFwnPicgKyB0aGlzLnBhcmFtcy5yZWdpb25zW2ldLm5hbWUgKyAnPC90aD4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8vIFN1YiBoZWFkZXJcbiAgICAgICAgLy9cbiAgICAgICAgcyArPSAnPC90cj48dHI+PHRkIGNsYXNzPVxcJ2NvbHVtbi1oZWFkZXJcXCc+PC90ZD4nO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcyArPSAnPHRkIGNsYXNzPVxcJ2NvbHVtbi1oZWFkZXJcXCc+UGVyY2VudDwvdGQ+PHRkIGNsYXNzPVxcJ2NvbHVtbi1oZWFkZXJcXCc+UGVyY2VudGlsZTwvdGQ+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvLyBBdCBsZWFzdCBiYWNoZWxvcidzXG4gICAgICAgIC8vXG4gICAgICAgIHMgKz0gJzwvdHI+PHRyPjx0ZD5BdCBMZWFzdCBCYWNoZWxvclxcJ3MgRGVncmVlPC90ZD4nO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgIFxuICAgICAgICAgICAgdmFyIHRvdGFsUmFua3MgPSBwYXJzZUludChkYXRhW2ldLnRvdGFsX3JhbmtzKTtcbiAgICAgICAgICAgIHZhciByYW5rID0gcGFyc2VJbnQoZGF0YVtpXS5wZXJjZW50X2JhY2hlbG9yc19kZWdyZWVfb3JfaGlnaGVyX3JhbmspO1xuICAgICAgICAgICAgdmFyIHBlcmNlbnRpbGUgPSBwYXJzZUludCgoKHRvdGFsUmFua3MgLSByYW5rKSAvIHRvdGFsUmFua3MpICogMTAwKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcyArPSAnPHRkPicgKyBkYXRhW2ldLnBlcmNlbnRfYmFjaGVsb3JzX2RlZ3JlZV9vcl9oaWdoZXIgKyAnJTwvdGQ+JztcbiAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgbnVtZXJhbChwZXJjZW50aWxlKS5mb3JtYXQoJzBvJykgKyAnPC90ZD4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8vIEF0IGxlYXN0IGhpZ2ggc2Nob29sIGRpcGxvbWFcbiAgICAgICAgLy9cbiAgICAgICAgcyArPSAnPC90cj48dHI+PHRkPkF0IExlYXN0IEhpZ2ggU2Nob29sIERpcGxvbWE8L3RkPic7XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgdG90YWxSYW5rcyA9IHBhcnNlSW50KGRhdGFbaV0udG90YWxfcmFua3MpO1xuICAgICAgICAgICAgdmFyIHJhbmsgPSBwYXJzZUludChkYXRhW2ldLnBlcmNlbnRfaGlnaF9zY2hvb2xfZ3JhZHVhdGVfb3JfaGlnaGVyKTtcbiAgICAgICAgICAgIHZhciBwZXJjZW50aWxlID0gcGFyc2VJbnQoKCh0b3RhbFJhbmtzIC0gcmFuaykgLyB0b3RhbFJhbmtzKSAqIDEwMCk7XG4gICAgXG4gICAgICAgICAgICBzICs9ICc8dGQ+JyArIGRhdGFbaV0ucGVyY2VudF9oaWdoX3NjaG9vbF9ncmFkdWF0ZV9vcl9oaWdoZXIgKyAnJTwvdGQ+JztcbiAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgbnVtZXJhbChwZXJjZW50aWxlKS5mb3JtYXQoJzBvJykgKyAnPC90ZD4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIHMgKz0gJzwvdHI+JztcbiAgICBcbiAgICAgICAgJCgnI2VkdWNhdGlvbi10YWJsZScpLmh0bWwocyk7XG4gICAgfVxuICAgIFxuICAgIC8vIEdEUCBkYXRhXG4gICAgLy9cbiAgICBkcmF3R2RwRGF0YSgpIHtcblxuICAgICAgICBnb29nbGUuc2V0T25Mb2FkQ2FsbGJhY2soKCkgPT4ge1xuXG4gICAgICAgICAgICB2YXIgcmVnaW9uSWRzID0gdGhpcy5wYXJhbXMucmVnaW9ucy5tYXAoZnVuY3Rpb24ocmVnaW9uKSB7IHJldHVybiByZWdpb24uaWQ7IH0pO1xuICAgICAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuXG4gICAgICAgICAgICBjb250cm9sbGVyLmdldEdkcERhdGEocmVnaW9uSWRzKVxuICAgICAgICAgICAgICAgIC50aGVuKGRhdGEgPT4geyBcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdHZHBDaGFydChyZWdpb25JZHMsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdHZHBDaGFuZ2VDaGFydChyZWdpb25JZHMsIGRhdGEpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRyYXdHZHBDaGFydChyZWdpb25JZHMsIGRhdGEpIHtcbiAgICBcbiAgICAgICAgdmFyIGNoYXJ0RGF0YSA9IFtdO1xuICAgIFxuICAgICAgICAvLyBIZWFkZXJcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGhlYWRlciA9IFsnWWVhciddO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaGVhZGVyW2kgKyAxXSA9IHRoaXMucGFyYW1zLnJlZ2lvbnNbaV0ubmFtZTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBjaGFydERhdGEucHVzaChoZWFkZXIpO1xuICAgIFxuICAgICAgICAvLyBGb3JtYXQgdGhlIGRhdGFcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIG8gPSB7fTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICBpZiAob1tkYXRhW2ldLnllYXJdID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG9bZGF0YVtpXS55ZWFyXSA9IFtkYXRhW2ldLnllYXJdO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgb1tkYXRhW2ldLnllYXJdLnB1c2gocGFyc2VGbG9hdChkYXRhW2ldLnBlcl9jYXBpdGFfZ2RwKSk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgZm9yICh2YXIga2V5IGluIG8pIHtcbiAgICAgICAgICAgIGNoYXJ0RGF0YS5wdXNoKG9ba2V5XSk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgLy8gRHJhdyBjaGFydFxuICAgICAgICAvL1xuICAgICAgICB0aGlzLmRyYXdMaW5lQ2hhcnQoJ3Blci1jYXBpdGEtZ2RwLWNoYXJ0JywgY2hhcnREYXRhLCB7XG4gICAgXG4gICAgICAgICAgICBjdXJ2ZVR5cGUgOiAnZnVuY3Rpb24nLFxuICAgICAgICAgICAgbGVnZW5kIDogeyBwb3NpdGlvbiA6ICdib3R0b20nIH0sXG4gICAgICAgICAgICBwb2ludFNoYXBlIDogJ3NxdWFyZScsXG4gICAgICAgICAgICBwb2ludFNpemUgOiA4LFxuICAgICAgICAgICAgdGl0bGUgOiAnUGVyIENhcGl0YSBSZWFsIEdEUCBvdmVyIFRpbWUnLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZHJhd0dkcENoYW5nZUNoYXJ0KHJlZ2lvbklkcywgZGF0YSkge1xuICAgIFxuICAgICAgICB2YXIgY2hhcnREYXRhID0gW107XG4gICAgXG4gICAgICAgIC8vIEhlYWRlclxuICAgICAgICAvL1xuICAgICAgICB2YXIgaGVhZGVyID0gWydZZWFyJ107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBoZWFkZXJbaSArIDFdID0gdGhpcy5wYXJhbXMucmVnaW9uc1tpXS5uYW1lO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGNoYXJ0RGF0YS5wdXNoKGhlYWRlcik7XG4gICAgXG4gICAgICAgIC8vIEZvcm1hdCB0aGUgZGF0YVxuICAgICAgICAvL1xuICAgICAgICB2YXIgbyA9IHt9O1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgIGlmIChvW2RhdGFbaV0ueWVhcl0gPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgb1tkYXRhW2ldLnllYXJdID0gW2RhdGFbaV0ueWVhcl07XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICBvW2RhdGFbaV0ueWVhcl0ucHVzaChwYXJzZUZsb2F0KGRhdGFbaV0ucGVyX2NhcGl0YV9nZHBfcGVyY2VudF9jaGFuZ2UpIC8gMTAwKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gbykge1xuICAgICAgICAgICAgY2hhcnREYXRhLnB1c2gob1trZXldKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvLyBEcmF3IGNoYXJ0XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuZHJhd0xpbmVDaGFydCgncGVyLWNhcGl0YS1nZHAtY2hhbmdlLWNoYXJ0JywgY2hhcnREYXRhLCB7XG4gICAgXG4gICAgICAgICAgICBjdXJ2ZVR5cGUgOiAnZnVuY3Rpb24nLFxuICAgICAgICAgICAgbGVnZW5kIDogeyBwb3NpdGlvbiA6ICdib3R0b20nIH0sXG4gICAgICAgICAgICBwb2ludFNoYXBlIDogJ3NxdWFyZScsXG4gICAgICAgICAgICBwb2ludFNpemUgOiA4LFxuICAgICAgICAgICAgdGl0bGUgOiAnQW5udWFsIENoYW5nZSBpbiBQZXIgQ2FwaXRhIEdEUCBvdmVyIFRpbWUnLFxuICAgICAgICAgICAgdkF4aXMgOiB7IGZvcm1hdCA6ICcjLiMlJyB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgLy8gT2NjdXBhdGlvbnNcbiAgICAvL1xuICAgIGRyYXdPY2N1cGF0aW9uc0RhdGEoKSB7XG5cbiAgICAgICAgZ29vZ2xlLnNldE9uTG9hZENhbGxiYWNrKCgpID0+IHtcblxuICAgICAgICAgICAgdmFyIHJlZ2lvbklkcyA9IHRoaXMucGFyYW1zLnJlZ2lvbnMubWFwKGZ1bmN0aW9uKHJlZ2lvbikgeyByZXR1cm4gcmVnaW9uLmlkOyB9KTtcbiAgICAgICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcblxuICAgICAgICAgICAgY29udHJvbGxlci5nZXRPY2N1cGF0aW9uc0RhdGEocmVnaW9uSWRzKVxuICAgICAgICAgICAgICAgIC50aGVuKGRhdGEgPT4gdGhpcy5kcmF3T2NjdXBhdGlvbnNUYWJsZShyZWdpb25JZHMsIGRhdGEpKVxuICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBkcmF3T2NjdXBhdGlvbnNUYWJsZShyZWdpb25JZHMsIGRhdGEpIHtcbiAgICBcbiAgICAgICAgdmFyIHMgPSAnPHRyPjx0aD48L3RoPic7XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzICs9ICc8dGggY29sc3Bhbj1cXCcyXFwnPicgKyB0aGlzLnBhcmFtcy5yZWdpb25zW2ldLm5hbWUgKyAnPC90aD4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8vIFN1YiBoZWFkZXJcbiAgICAgICAgLy9cbiAgICAgICAgcyArPSAnPC90cj48dHI+PHRkIGNsYXNzPVxcJ2NvbHVtbi1oZWFkZXJcXCc+PC90ZD4nO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcyArPSAnPHRkIGNsYXNzPVxcJ2NvbHVtbi1oZWFkZXJcXCc+UGVyY2VudDwvdGQ+PHRkIGNsYXNzPVxcJ2NvbHVtbi1oZWFkZXJcXCc+UGVyY2VudGlsZTwvdGQ+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgIGlmICgoaSAlIHJlZ2lvbklkcy5sZW5ndGgpID09IDApXG4gICAgICAgICAgICAgICAgcyArPSAnPC90cj48dHI+PHRkPicgKyBkYXRhW2ldLm9jY3VwYXRpb24gKyAnPC90ZD4nOyBcbiAgICBcbiAgICAgICAgICAgIHZhciB0b3RhbFJhbmtzID0gcGFyc2VJbnQoZGF0YVtpXS50b3RhbF9yYW5rcyk7XG4gICAgICAgICAgICB2YXIgcmFuayA9IHBhcnNlSW50KGRhdGFbaV0ucGVyY2VudF9lbXBsb3llZF9yYW5rKTtcbiAgICAgICAgICAgIHZhciBwZXJjZW50aWxlID0gcGFyc2VJbnQoKCh0b3RhbFJhbmtzIC0gcmFuaykgLyB0b3RhbFJhbmtzKSAqIDEwMCk7XG4gICAgXG4gICAgICAgICAgICBzICs9ICc8dGQ+JyArIG51bWVyYWwoZGF0YVtpXS5wZXJjZW50X2VtcGxveWVkKS5mb3JtYXQoJzAuMCcpICsgJyU8L3RkPic7XG4gICAgICAgICAgICBzICs9ICc8dGQ+JyArIG51bWVyYWwocGVyY2VudGlsZSkuZm9ybWF0KCcwbycpICsgJzwvdGQ+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBzICs9ICc8L3RyPic7XG4gICAgXG4gICAgICAgICQoJyNvY2N1cGF0aW9ucy10YWJsZScpLmh0bWwocyk7XG4gICAgfVxuICAgIFxuICAgIC8vIFBvcHVsYXRpb25cbiAgICAvL1xuICAgIGRyYXdQb3B1bGF0aW9uRGF0YSgpIHtcblxuICAgICAgICBnb29nbGUuc2V0T25Mb2FkQ2FsbGJhY2soKCkgPT4ge1xuXG4gICAgICAgICAgICB2YXIgcmVnaW9uSWRzID0gdGhpcy5wYXJhbXMucmVnaW9ucy5tYXAoZnVuY3Rpb24ocmVnaW9uKSB7IHJldHVybiByZWdpb24uaWQ7IH0pO1xuICAgICAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuXG4gICAgICAgICAgICBjb250cm9sbGVyLmdldFBvcHVsYXRpb25EYXRhKHJlZ2lvbklkcylcbiAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IHsgXG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3UG9wdWxhdGlvbk1hcCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdQb3B1bGF0aW9uQ2hhcnQocmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3UG9wdWxhdGlvbkNoYW5nZUNoYXJ0KHJlZ2lvbklkcywgZGF0YSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZHJhd1BvcHVsYXRpb25DaGFydChyZWdpb25JZHMsIGRhdGEpIHtcbiAgICBcbiAgICAgICAgdmFyIGNoYXJ0RGF0YSA9IFtdO1xuICAgICAgICB2YXIgeWVhcjtcbiAgICBcbiAgICAgICAgLy8gSGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBoZWFkZXIgPSBbJ1llYXInXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGhlYWRlcltpICsgMV0gPSB0aGlzLnBhcmFtcy5yZWdpb25zW2ldLm5hbWU7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgY2hhcnREYXRhLnB1c2goaGVhZGVyKTtcbiAgICBcbiAgICAgICAgLy8gRGF0YVxuICAgICAgICAvL1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgIHZhciBtID0gKGkgJSByZWdpb25JZHMubGVuZ3RoKTtcbiAgICBcbiAgICAgICAgICAgIGlmIChtID09IDApIHtcbiAgICBcbiAgICAgICAgICAgICAgICB5ZWFyID0gW107XG4gICAgICAgICAgICAgICAgeWVhclswXSA9IGRhdGFbaV0ueWVhcjtcbiAgICAgICAgICAgICAgICBjaGFydERhdGEucHVzaCh5ZWFyKTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIHllYXJbbSArIDFdID0gcGFyc2VJbnQoZGF0YVtpXS5wb3B1bGF0aW9uKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICB0aGlzLmRyYXdMaW5lQ2hhcnQoJ3BvcHVsYXRpb24tY2hhcnQnLCBjaGFydERhdGEsIHtcbiAgICBcbiAgICAgICAgICAgIGN1cnZlVHlwZSA6ICdmdW5jdGlvbicsXG4gICAgICAgICAgICBsZWdlbmQgOiB7IHBvc2l0aW9uIDogJ2JvdHRvbScgfSxcbiAgICAgICAgICAgIHBvaW50U2hhcGUgOiAnc3F1YXJlJyxcbiAgICAgICAgICAgIHBvaW50U2l6ZSA6IDgsXG4gICAgICAgICAgICB0aXRsZSA6ICdQb3B1bGF0aW9uJyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRyYXdQb3B1bGF0aW9uQ2hhbmdlQ2hhcnQocmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIHZhciBjaGFydERhdGEgPSBbXTtcbiAgICAgICAgdmFyIHllYXI7XG4gICAgXG4gICAgICAgIC8vIEhlYWRlclxuICAgICAgICAvL1xuICAgICAgICB2YXIgaGVhZGVyID0gWydZZWFyJ107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBoZWFkZXJbaSArIDFdID0gdGhpcy5wYXJhbXMucmVnaW9uc1tpXS5uYW1lO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGNoYXJ0RGF0YS5wdXNoKGhlYWRlcik7XG4gICAgXG4gICAgICAgIC8vIERhdGFcbiAgICAgICAgLy9cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgbSA9IChpICUgcmVnaW9uSWRzLmxlbmd0aCk7XG4gICAgXG4gICAgICAgICAgICBpZiAobSA9PSAwKSB7XG4gICAgXG4gICAgICAgICAgICAgICAgeWVhciA9IFtdO1xuICAgICAgICAgICAgICAgIHllYXJbMF0gPSBkYXRhW2ldLnllYXI7XG4gICAgICAgICAgICAgICAgY2hhcnREYXRhLnB1c2goeWVhcik7XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICB5ZWFyW20gKyAxXSA9IHBhcnNlRmxvYXQoZGF0YVtpXS5wb3B1bGF0aW9uX3BlcmNlbnRfY2hhbmdlKSAvIDEwMDtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICB0aGlzLmRyYXdMaW5lQ2hhcnQoJ3BvcHVsYXRpb24tY2hhbmdlLWNoYXJ0JywgY2hhcnREYXRhLCB7XG4gICAgXG4gICAgICAgICAgICBjdXJ2ZVR5cGUgOiAnZnVuY3Rpb24nLFxuICAgICAgICAgICAgbGVnZW5kIDogeyBwb3NpdGlvbiA6ICdib3R0b20nIH0sXG4gICAgICAgICAgICBwb2ludFNoYXBlIDogJ3NxdWFyZScsXG4gICAgICAgICAgICBwb2ludFNpemUgOiA4LFxuICAgICAgICAgICAgdGl0bGUgOiAnUG9wdWxhdGlvbiBDaGFuZ2UnLFxuICAgICAgICAgICAgdkF4aXMgOiB7IGZvcm1hdCA6ICcjLiMlJyB9LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkcmF3UG9wdWxhdGlvbk1hcCgpIHtcblxuICAgICAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcbiAgICAgICAgY29uc3QgcGxhY2VzID0gW107XG5cbiAgICAgICAgY29udHJvbGxlci5nZXRQbGFjZXMoKVxuICAgICAgICAgICAgLnRoZW4ocGxhY2VzUmVzcG9uc2UgPT4ge1xuXG4gICAgICAgICAgICAgICAgLy8gU2V0IHBsYWNlIHZhbHVlIHRvIGVhcm5pbmdzIGRhdGFcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIHBsYWNlc1Jlc3BvbnNlLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzIDogaXRlbS5sb2NhdGlvbi5jb29yZGluYXRlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgOiBpdGVtLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBpZCA6IGl0ZW0uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA6IHBhcnNlSW50KGl0ZW0ucG9wdWxhdGlvbiksXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBHZXQgbWFwIGRhdGFcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIGNvbnN0IHBvcHVsYXRlZFBsYWNlcyA9IHBsYWNlcy5zb3J0KChhLCBiKSA9PiBiLnZhbHVlIC0gYS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVnaW9uUGxhY2VzID0gdGhpcy5nZXRQbGFjZXNGb3JSZWdpb24ocGxhY2VzUmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBvcHVsYXRpb25zID0gXy5tYXAocG9wdWxhdGVkUGxhY2VzLCB4ID0+IHsgcmV0dXJuIHgudmFsdWUgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBJbml0IG1hcFxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgY29uc3QgcmFkaXVzU2NhbGUgPSB0aGlzLmdldFJhZGl1c1NjYWxlTG9nKHBvcHVsYXRpb25zKVxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9yU2NhbGUgPSB0aGlzLmdldENvbG9yU2NhbGUocG9wdWxhdGlvbnMpXG5cbiAgICAgICAgICAgICAgICBjb25zdCBjb29yZGluYXRlcyA9IHJlZ2lvblBsYWNlc1swXS5sb2NhdGlvbi5jb29yZGluYXRlcztcbiAgICAgICAgICAgICAgICBjb25zdCBjZW50ZXIgPSBbY29vcmRpbmF0ZXNbMV0sIGNvb3JkaW5hdGVzWzBdXTtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXAgPSBMLm1hcCgnbWFwJywgeyB6b29tQ29udHJvbCA6IHRydWUgfSk7XG5cbiAgICAgICAgICAgICAgICBMLnRpbGVMYXllcignaHR0cHM6Ly9hLnRpbGVzLm1hcGJveC5jb20vdjMvc29jcmF0YS1hcHBzLmlicDBsODk5L3t6fS97eH0ve3l9LnBuZycpLmFkZFRvKG1hcCk7XG4gICAgICAgICAgICAgICAgbWFwLnNldFZpZXcoY2VudGVyLCB0aGlzLk1BUF9JTklUSUFMX1pPT00pO1xuXG4gICAgICAgICAgICAgICAgLy8gUG9wdWxhdGUgbWFwXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdDaXJjbGVzRm9yUGxhY2VzKG1hcCwgcG9wdWxhdGVkUGxhY2VzLCByYWRpdXNTY2FsZSwgY29sb3JTY2FsZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3TWFya2Vyc0ZvclBsYWNlcyhtYXAsIHJlZ2lvblBsYWNlcyk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICB9XG5cbiAgICAvLyBQbGFjZXMgaW4gcmVnaW9uXG4gICAgLy9cbiAgICBkcmF3UGxhY2VzSW5SZWdpb24oKSB7XG5cbiAgICAgICAgaWYgKHRoaXMucGFyYW1zLnJlZ2lvbnMubGVuZ3RoID09IDApIFxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHZhciByZWdpb24gPSB0aGlzLnBhcmFtcy5yZWdpb25zWzBdO1xuXG4gICAgICAgIHN3aXRjaCAocmVnaW9uLnR5cGUpIHtcblxuICAgICAgICAgICAgY2FzZSAnbmF0aW9uJzogdGhpcy5kcmF3Q2hpbGRQbGFjZXNJblJlZ2lvbihyZWdpb24sICdSZWdpb25zIGluIHswfScuZm9ybWF0KHJlZ2lvbi5uYW1lKSk7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncmVnaW9uJzogdGhpcy5kcmF3Q2hpbGRQbGFjZXNJblJlZ2lvbihyZWdpb24sICdEaXZpc2lvbnMgaW4gezB9Jy5mb3JtYXQocmVnaW9uLm5hbWUpKTsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkaXZpc2lvbic6IHRoaXMuZHJhd0NoaWxkUGxhY2VzSW5SZWdpb24ocmVnaW9uLCAnU3RhdGVzIGluIHswfScuZm9ybWF0KHJlZ2lvbi5uYW1lKSk7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnc3RhdGUnOiB0aGlzLmRyYXdDaXRpZXNBbmRDb3VudGllc0luU3RhdGUocmVnaW9uKTsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjb3VudHknOiB0aGlzLmRyYXdPdGhlckNvdW50aWVzSW5TdGF0ZShyZWdpb24pOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ21zYSc6IHRoaXMuZHJhd090aGVyTWV0cm9zSW5TdGF0ZShyZWdpb24pOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3BsYWNlJzogdGhpcy5kcmF3T3RoZXJDaXRpZXNJblN0YXRlKHJlZ2lvbik7IGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZHJhd0NoaWxkUGxhY2VzSW5SZWdpb24ocmVnaW9uLCBsYWJlbCkge1xuXG4gICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcblxuICAgICAgICBjb250cm9sbGVyLmdldENoaWxkUmVnaW9ucyhyZWdpb24uaWQpXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BsYWNlc0luUmVnaW9uSGVhZGVyKCcjcGxhY2VzLWluLXJlZ2lvbi1oZWFkZXItMCcsIGxhYmVsKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdQbGFjZXNJblJlZ2lvbkxpc3QoJyNwbGFjZXMtaW4tcmVnaW9uLWxpc3QtMCcsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgIH1cblxuICAgIGRyYXdDaXRpZXNBbmRDb3VudGllc0luU3RhdGUocmVnaW9uKSB7XG5cbiAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuICAgICAgICB2YXIgY2l0aWVzUHJvbWlzZSA9IGNvbnRyb2xsZXIuZ2V0Q2l0aWVzSW5TdGF0ZShyZWdpb24uaWQpO1xuICAgICAgICB2YXIgY291bnRpZXNQcm9taXNlID0gY29udHJvbGxlci5nZXRDb3VudGllc0luU3RhdGUocmVnaW9uLmlkKTtcblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoW2NpdGllc1Byb21pc2UsIGNvdW50aWVzUHJvbWlzZV0pXG4gICAgICAgICAgICAudGhlbih2YWx1ZXMgPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlcy5sZW5ndGggPT0gMClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlc1swXS5sZW5ndGggPiAwKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3UGxhY2VzSW5SZWdpb25IZWFkZXIoJyNwbGFjZXMtaW4tcmVnaW9uLWhlYWRlci0wJywgJ1BsYWNlcyBpbiB7MH0nLmZvcm1hdChyZWdpb24ubmFtZSkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdQbGFjZXNJblJlZ2lvbkxpc3QoJyNwbGFjZXMtaW4tcmVnaW9uLWxpc3QtMCcsIHZhbHVlc1swXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZXNbMV0ubGVuZ3RoID4gMCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BsYWNlc0luUmVnaW9uSGVhZGVyKCcjcGxhY2VzLWluLXJlZ2lvbi1oZWFkZXItMScsICdDb3VudGllcyBpbiB7MH0nLmZvcm1hdChyZWdpb24ubmFtZSkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdQbGFjZXNJblJlZ2lvbkxpc3QoJyNwbGFjZXMtaW4tcmVnaW9uLWxpc3QtMScsIHZhbHVlc1sxXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgfVxuXG4gICAgZHJhd090aGVyQ2l0aWVzSW5TdGF0ZShyZWdpb24pIHtcblxuICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG5cbiAgICAgICAgY29udHJvbGxlci5nZXRQYXJlbnRTdGF0ZShyZWdpb24pXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmxlbmd0aCA9PSAwKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgXG4gICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gcmVzcG9uc2VbMF07XG4gICAgXG4gICAgICAgICAgICAgICAgY29udHJvbGxlci5nZXRDaXRpZXNJblN0YXRlKHN0YXRlLnBhcmVudF9pZClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5sZW5ndGggPT0gMClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3UGxhY2VzSW5SZWdpb25IZWFkZXIoJyNwbGFjZXMtaW4tcmVnaW9uLWhlYWRlci0wJywgJ1BsYWNlcyBpbiB7MH0nLmZvcm1hdChzdGF0ZS5wYXJlbnRfbmFtZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3UGxhY2VzSW5SZWdpb25MaXN0KCcjcGxhY2VzLWluLXJlZ2lvbi1saXN0LTAnLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkcmF3T3RoZXJDb3VudGllc0luU3RhdGUocmVnaW9uKSB7XG5cbiAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuXG4gICAgICAgIGNvbnRyb2xsZXIuZ2V0UGFyZW50U3RhdGUocmVnaW9uKVxuICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgIFxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5sZW5ndGggPT0gMClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgIFxuICAgICAgICAgICAgICAgIHZhciBzdGF0ZSA9IHJlc3BvbnNlWzBdO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIuZ2V0Q291bnRpZXNJblN0YXRlKHN0YXRlLnBhcmVudF9pZClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5sZW5ndGggPT0gMClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3UGxhY2VzSW5SZWdpb25IZWFkZXIoJyNwbGFjZXMtaW4tcmVnaW9uLWhlYWRlci0wJywgJ0NvdW50aWVzIGluIHswfScuZm9ybWF0KHN0YXRlLnBhcmVudF9uYW1lKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdQbGFjZXNJblJlZ2lvbkxpc3QoJyNwbGFjZXMtaW4tcmVnaW9uLWxpc3QtMCcsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRyYXdPdGhlck1ldHJvc0luU3RhdGUocmVnaW9uKSB7XG5cbiAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuXG4gICAgICAgIGNvbnRyb2xsZXIuZ2V0UGFyZW50U3RhdGUocmVnaW9uKVxuICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgIFxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5sZW5ndGggPT0gMClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgIFxuICAgICAgICAgICAgICAgIHZhciBzdGF0ZSA9IHJlc3BvbnNlWzBdO1xuICAgIFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIuZ2V0TWV0cm9zSW5TdGF0ZShzdGF0ZS5wYXJlbnRfaWQpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UubGVuZ3RoID09IDApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BsYWNlc0luUmVnaW9uSGVhZGVyKCcjcGxhY2VzLWluLXJlZ2lvbi1oZWFkZXItMCcsICdNZXRyb3BvbGl0YW4gQXJlYXMgaW4gezB9Jy5mb3JtYXQoc3RhdGUucGFyZW50X25hbWUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BsYWNlc0luUmVnaW9uTGlzdCgnI3BsYWNlcy1pbi1yZWdpb24tbGlzdC0wJywgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVtb3ZlQ3VycmVudFJlZ2lvbnMocmVnaW9ucywgbWF4Q291bnQgPSA1KSB7XG5cbiAgICAgICAgdmFyIGNvdW50ID0gMDtcbiAgICAgICAgdmFyIHJnID0gW107XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25zLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmlzUmVnaW9uSWRDb250YWluZWRJbkN1cnJlbnRSZWdpb25zKHJlZ2lvbnNbaV0uY2hpbGRfaWQpKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICByZy5wdXNoKHJlZ2lvbnNbaV0pO1xuXG4gICAgICAgICAgICBpZiAoY291bnQgPT0gKG1heENvdW50IC0gMSkpXG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmc7XG4gICAgfVxuXG4gICAgZHJhd1BsYWNlc0luUmVnaW9uSGVhZGVyKGhlYWRlcklkLCBsYWJlbCkge1xuXG4gICAgICAgICQoaGVhZGVySWQpLnRleHQobGFiZWwpLnNsaWRlVG9nZ2xlKDEwMCk7XG4gICAgfVxuXG4gICAgZHJhd1BsYWNlc0luUmVnaW9uTGlzdChsaXN0SWQsIGRhdGEsIG1heENvdW50ID0gNSkge1xuXG4gICAgICAgIHZhciBzID0gJyc7XG5cbiAgICAgICAgaWYgKGRhdGEubGVuZ3RoID09IDApXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgdmFyIGNvdW50ID0gMDtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgaWYgKHRoaXMuaXNSZWdpb25JZENvbnRhaW5lZEluQ3VycmVudFJlZ2lvbnMoZGF0YVtpXS5jaGlsZF9pZCkpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgIHMgKz0gJzxsaT48YSBocmVmPVwiJztcbiAgICAgICAgICAgIHMgKz0gdGhpcy5nZXRTZWFyY2hQYWdlRm9yUmVnaW9uc0FuZFZlY3RvclVybChkYXRhW2ldLmNoaWxkX25hbWUpICsgJ1wiPic7XG4gICAgICAgICAgICBzICs9IGRhdGFbaV0uY2hpbGRfbmFtZTtcbiAgICAgICAgICAgIHMgKz0gJzwvYT48L2xpPic7XG5cbiAgICAgICAgICAgIGlmIChjb3VudCA9PSAobWF4Q291bnQgLSAxKSlcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgfVxuXG4gICAgICAgICQobGlzdElkKS5odG1sKHMpO1xuICAgICAgICAkKGxpc3RJZCkuc2xpZGVUb2dnbGUoMTAwKTtcbiAgICB9XG5cbiAgICBpc1JlZ2lvbklkQ29udGFpbmVkSW5DdXJyZW50UmVnaW9ucyhyZWdpb25JZCkge1xuXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5wYXJhbXMucmVnaW9ucy5sZW5ndGg7IGorKykge1xuXG4gICAgICAgICAgICBpZiAocmVnaW9uSWQgPT0gdGhpcy5wYXJhbXMucmVnaW9uc1tqXS5pZClcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBTaW1pbGFyIHJlZ2lvbnNcbiAgICAvL1xuICAgIGRyYXdTaW1pbGFyUmVnaW9ucyhvbkNsaWNrUmVnaW9uKSB7XG5cbiAgICAgICAgaWYgKHRoaXMucGFyYW1zLnJlZ2lvbnMubGVuZ3RoID09IDApIFxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHZhciByZWdpb24gPSB0aGlzLnBhcmFtcy5yZWdpb25zWzBdO1xuICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG5cbiAgICAgICAgY29udHJvbGxlci5nZXRTaW1pbGFyUmVnaW9ucyhyZWdpb24uaWQpXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHRoaXMuZHJhd1NpbWlsYXJSZWdpb25zTGlzdChkYXRhLCBvbkNsaWNrUmVnaW9uKSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgfVxuXG4gICAgZHJhd1NpbWlsYXJSZWdpb25zTGlzdChkYXRhLCBvbkNsaWNrUmVnaW9uKSB7XG5cbiAgICAgICAgdmFyIHMgPSAnJztcblxuICAgICAgICBpZiAoZGF0YS5tb3N0X3NpbWlsYXIgPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHZhciBjb3VudCA9IDA7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLm1vc3Rfc2ltaWxhci5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5pc1JlZ2lvbklkQ29udGFpbmVkSW5DdXJyZW50UmVnaW9ucyhkYXRhLm1vc3Rfc2ltaWxhcltpXS5pZCkpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgIHMgKz0gJzxsaT48YT48aSBjbGFzcz1cImZhIGZhLXBsdXNcIj48L2k+JyArIGRhdGEubW9zdF9zaW1pbGFyW2ldLm5hbWUgKyAnPC9hPjwvbGk+J1xuXG4gICAgICAgICAgICBpZiAoY291bnQgPT0gNClcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAkKCcjc2ltaWxhci1yZWdpb25zJykuaHRtbChzKTtcbiAgICAgICAgJCgnI3NpbWlsYXItcmVnaW9ucycpLnNsaWRlVG9nZ2xlKDEwMCk7XG4gICAgICAgIFxuICAgICAgICAkKCcjc2ltaWxhci1yZWdpb25zIGxpIGEnKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICBcbiAgICAgICAgICAgIHZhciBpbmRleCA9ICQodGhpcykucGFyZW50KCkuaW5kZXgoKTtcbiAgICAgICAgICAgIG9uQ2xpY2tSZWdpb24oZGF0YS5tb3N0X3NpbWlsYXJbaW5kZXhdLm5hbWUpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgLy8gRHJhdyBjaGFydHNcbiAgICAvL1xuICAgIGRyYXdMaW5lQ2hhcnQoY2hhcnRJZCwgZGF0YSwgb3B0aW9ucykge1xuICAgIFxuICAgICAgICB2YXIgZGF0YVRhYmxlID0gZ29vZ2xlLnZpc3VhbGl6YXRpb24uYXJyYXlUb0RhdGFUYWJsZShkYXRhKTtcbiAgICAgICAgdmFyIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkxpbmVDaGFydChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjaGFydElkKSk7XG4gICAgXG4gICAgICAgIGNoYXJ0LmRyYXcoZGF0YVRhYmxlLCBvcHRpb25zKTtcbiAgICB9XG4gICAgXG4gICAgZHJhd1N0ZXBwZWRBcmVhQ2hhcnQoY2hhcnRJZCwgZGF0YSwgb3B0aW9ucykge1xuICAgIFxuICAgICAgICB2YXIgZGF0YVRhYmxlID0gZ29vZ2xlLnZpc3VhbGl6YXRpb24uYXJyYXlUb0RhdGFUYWJsZShkYXRhKTtcbiAgICAgICAgdmFyIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLlN0ZXBwZWRBcmVhQ2hhcnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY2hhcnRJZCkpO1xuICAgIFxuICAgICAgICBjaGFydC5kcmF3KGRhdGFUYWJsZSwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLy8gTWFwc1xuICAgIC8vXG4gICAgZ2V0UmFkaXVzU2NhbGVMaW5lYXIodmFsdWVzKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnNjYWxlLmxpbmVhcigpXG4gICAgICAgICAgICAuZG9tYWluKGQzLmV4dGVudCh2YWx1ZXMpKVxuICAgICAgICAgICAgLnJhbmdlKHRoaXMuTUFQX1JBRElVU19TQ0FMRSk7XG4gICAgfVxuXG4gICAgZ2V0UmFkaXVzU2NhbGVMb2codmFsdWVzKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnNjYWxlLmxvZygpXG4gICAgICAgICAgICAuZG9tYWluKGQzLmV4dGVudCh2YWx1ZXMpKVxuICAgICAgICAgICAgLnJhbmdlKHRoaXMuTUFQX1JBRElVU19TQ0FMRSk7XG4gICAgfVxuXG4gICAgZ2V0Q29sb3JTY2FsZSh2YWx1ZXMpIHtcblxuICAgICAgICBjb25zdCBkb21haW4gPSAoKCkgPT4ge1xuXG4gICAgICAgICAgICBjb25zdCBzdGVwID0gMS4wIC8gdGhpcy5NQVBfQ09MT1JfU0NBTEUubGVuZ3RoO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBxdWFudGlsZSh2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZDMucXVhbnRpbGUodmFsdWVzLCAoaW5kZXggKyAxKSAqIHN0ZXApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gXy5tYXAodGhpcy5NQVBfQ09MT1JfU0NBTEUuc2xpY2UoMSksIHF1YW50aWxlKTtcbiAgICAgICAgfSkoKTtcblxuICAgICAgICByZXR1cm4gZDMuc2NhbGUucXVhbnRpbGUoKVxuICAgICAgICAgICAgLmRvbWFpbihkb21haW4pXG4gICAgICAgICAgICAucmFuZ2UodGhpcy5NQVBfQ09MT1JfU0NBTEUpO1xuICAgIH1cblxuICAgIGRyYXdDaXJjbGVzRm9yUGxhY2VzKG1hcCwgcGxhY2VzLCByYWRpdXNTY2FsZSwgY29sb3JTY2FsZSkge1xuXG4gICAgICAgIHBsYWNlcy5mb3JFYWNoKHBsYWNlID0+IHtcblxuICAgICAgICAgICAgdmFyIGZlYXR1cmUgPSB7XG4gICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgICAgICAgICAgIFwicHJvcGVydGllc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwibmFtZVwiOiBwbGFjZS5uYW1lXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcImdlb21ldHJ5XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJjb29yZGluYXRlc1wiOiBwbGFjZS5jb29yZGluYXRlcyxcbiAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIGZpbGxDb2xvcjogY29sb3JTY2FsZShwbGFjZS52YWx1ZSksXG4gICAgICAgICAgICAgICAgZmlsbE9wYWNpdHk6IDEsXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMCxcbiAgICAgICAgICAgICAgICByYWRpdXM6IDgsXG4gICAgICAgICAgICAgICAgc3Ryb2tlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB3ZWlnaHQ6IDAsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBMLmdlb0pzb24oXG4gICAgICAgICAgICAgICAgZmVhdHVyZSwgXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBwb2ludFRvTGF5ZXI6IChmZWF0dXJlLCBsYXRsbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBMLmNpcmNsZShsYXRsbmcsIHJhZGl1c1NjYWxlKHBsYWNlLnZhbHVlICksIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKS5hZGRUbyhtYXApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkcmF3TWFya2Vyc0ZvclBsYWNlcyhtYXAsIHBsYWNlcykge1xuXG4gICAgICAgIHBsYWNlcy5mb3JFYWNoKHBsYWNlID0+IHtcblxuICAgICAgICAgICAgdmFyIGZlYXR1cmUgPSB7XG4gICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgICAgICAgICAgIFwicHJvcGVydGllc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwibmFtZVwiOiBwbGFjZS5uYW1lXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcImdlb21ldHJ5XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJjb29yZGluYXRlc1wiOiBwbGFjZS5sb2NhdGlvbi5jb29yZGluYXRlcyxcbiAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBMLmdlb0pzb24oZmVhdHVyZSkuYWRkVG8obWFwKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0UGxhY2VzRm9yUmVnaW9uKGRhdGEpIHtcblxuICAgICAgICB2YXIgcGxhY2VzID0gW107XG5cbiAgICAgICAgZGF0YS5mb3JFYWNoKHBsYWNlID0+IHtcblxuICAgICAgICAgICAgdGhpcy5wYXJhbXMucmVnaW9ucy5mb3JFYWNoKHJlZ2lvbiA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZiAocGxhY2UuaWQgPT0gcmVnaW9uLmlkKVxuICAgICAgICAgICAgICAgICAgICBwbGFjZXMucHVzaChwbGFjZSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcGxhY2VzO1xuICAgIH1cblxuICAgIC8vIFBhZ2luZ1xuICAgIC8vXG4gICAgZmV0Y2hOZXh0UGFnZSgpIHtcbiAgICBcbiAgICAgICAgaWYgKHRoaXMuZmV0Y2hpbmcgfHwgdGhpcy5mZXRjaGVkQWxsKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgIFxuICAgICAgICB0aGlzLmZldGNoaW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pbmNyZW1lbnRQYWdlKCk7XG4gICAgXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBcbiAgICAgICAgJC5hamF4KHRoaXMuZ2V0U2VhcmNoUmVzdWx0c1VybCgpKS5kb25lKGZ1bmN0aW9uKGRhdGEsIHRleHRTdGF0dXMsIGpxWEhSKSB7XG5cbiAgICAgICAgICAgIGlmIChqcVhIUi5zdGF0dXMgPT0gMjA0KSB7IC8vIG5vIGNvbnRlbnRcbiAgICBcbiAgICAgICAgICAgICAgICBzZWxmLmRlY3JlbWVudFBhZ2UoKTtcbiAgICAgICAgICAgICAgICBzZWxmLmZldGNoaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc2VsZi5mZXRjaGVkQWxsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICAkKCcuZGF0YXNldHMnKS5hcHBlbmQoZGF0YSk7XG4gICAgICAgICAgICBzZWxmLmZldGNoaW5nID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBnZXRTZWFyY2hQYWdlRm9yUmVnaW9uc0FuZFZlY3RvclVybChyZWdpb25zLCB2ZWN0b3IsIHNlYXJjaFJlc3VsdHMsIHF1ZXJ5U3RyaW5nKSB7XG4gICAgXG4gICAgICAgIHZhciB1cmwgPSAnLyc7XG4gICAgXG4gICAgICAgIGlmICh0eXBlb2YocmVnaW9ucykgPT09ICdzdHJpbmcnKSB7XG4gICAgXG4gICAgICAgICAgICB1cmwgKz0gcmVnaW9ucy5yZXBsYWNlKC8sL2csICcnKS5yZXBsYWNlKC8gL2csICdfJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZWdpb25zKSkge1xuICAgIFxuICAgICAgICAgICAgdmFyIHJlZ2lvbk5hbWVzID0gW107XG4gICAgXG4gICAgICAgICAgICByZWdpb25OYW1lcyA9IHJlZ2lvbnMubWFwKGZ1bmN0aW9uKHJlZ2lvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWdpb24ucmVwbGFjZSgvLC9nLCAnJykucmVwbGFjZSgvIC9nLCAnXycpO1xuICAgICAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICAgICB1cmwgKz0gcmVnaW9uTmFtZXMuam9pbignX3ZzXycpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgIFxuICAgICAgICAgICAgdXJsICs9ICdzZWFyY2gnO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGlmICh2ZWN0b3IpXG4gICAgICAgICAgICB1cmwgKz0gJy8nICsgdmVjdG9yO1xuICAgIFxuICAgICAgICBpZiAoc2VhcmNoUmVzdWx0cylcbiAgICAgICAgICAgIHVybCArPSAnL3NlYXJjaC1yZXN1bHRzJztcbiAgICBcbiAgICAgICAgaWYgKHF1ZXJ5U3RyaW5nKSBcbiAgICAgICAgICAgIHVybCArPSBxdWVyeVN0cmluZztcbiAgICBcbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICB9XG4gICAgXG4gICAgZ2V0U2VhcmNoUGFnZVVybChzZWFyY2hSZXN1bHRzKSB7XG5cbiAgICAgICAgaWYgKCh0aGlzLnBhcmFtcy5yZWdpb25zLmxlbmd0aCA+IDApIHx8IHRoaXMucGFyYW1zLmF1dG9TdWdnZXN0ZWRSZWdpb24pIHtcblxuICAgICAgICAgICAgdmFyIHJlZ2lvbk5hbWVzID0gW107XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmFtcy5yZXNldFJlZ2lvbnMgPT0gZmFsc2UpIHtcblxuICAgICAgICAgICAgICAgIHJlZ2lvbk5hbWVzID0gdGhpcy5wYXJhbXMucmVnaW9ucy5tYXAoZnVuY3Rpb24ocmVnaW9uKSB7IFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVnaW9uLm5hbWU7IFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJhbXMuYXV0b1N1Z2dlc3RlZFJlZ2lvbilcbiAgICAgICAgICAgICAgICByZWdpb25OYW1lcy5wdXNoKHRoaXMucGFyYW1zLmF1dG9TdWdnZXN0ZWRSZWdpb24pO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRTZWFyY2hQYWdlRm9yUmVnaW9uc0FuZFZlY3RvclVybChyZWdpb25OYW1lcywgdGhpcy5wYXJhbXMudmVjdG9yLCBzZWFyY2hSZXN1bHRzLCB0aGlzLmdldFNlYXJjaFF1ZXJ5U3RyaW5nKCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRTZWFyY2hQYWdlRm9yUmVnaW9uc0FuZFZlY3RvclVybChudWxsLCB0aGlzLnBhcmFtcy52ZWN0b3IsIHNlYXJjaFJlc3VsdHMsIHRoaXMuZ2V0U2VhcmNoUXVlcnlTdHJpbmcoKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRTZWFyY2hSZXN1bHRzVXJsKCkge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmdldFNlYXJjaFBhZ2VVcmwodHJ1ZSk7XG4gICAgfVxuXG4gICAgZ2V0U2VhcmNoUXVlcnlTdHJpbmcoKSB7XG5cbiAgICAgICAgdmFyIHVybCA9ICc/cT0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMucGFyYW1zLnEpO1xuXG4gICAgICAgIGlmICh0aGlzLnBhcmFtcy5wYWdlID4gMSlcbiAgICAgICAgICAgIHVybCArPSAnJnBhZ2U9JyArIHRoaXMucGFyYW1zLnBhZ2U7XG5cbiAgICAgICAgaWYgKHRoaXMucGFyYW1zLmNhdGVnb3JpZXMubGVuZ3RoID4gMClcbiAgICAgICAgICAgIHVybCArPSAnJmNhdGVnb3JpZXM9JyArIGVuY29kZVVSSUNvbXBvbmVudCh0aGlzLnBhcmFtcy5jYXRlZ29yaWVzLmpvaW4oJywnKSk7XG5cbiAgICAgICAgaWYgKHRoaXMucGFyYW1zLmRvbWFpbnMubGVuZ3RoID4gMClcbiAgICAgICAgICAgIHVybCArPSAnJmRvbWFpbnM9JyArIGVuY29kZVVSSUNvbXBvbmVudCh0aGlzLnBhcmFtcy5kb21haW5zLmpvaW4oJywnKSk7XG5cbiAgICAgICAgaWYgKHRoaXMucGFyYW1zLnN0YW5kYXJkcy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgdXJsICs9ICcmc3RhbmRhcmRzPScgKyBlbmNvZGVVUklDb21wb25lbnQodGhpcy5wYXJhbXMuc3RhbmRhcmRzLmpvaW4oJywnKSk7XG5cbiAgICAgICAgaWYgKHRoaXMucGFyYW1zLmRlYnVnKVxuICAgICAgICAgICAgdXJsICs9ICcmZGVidWc9JztcblxuICAgICAgICByZXR1cm4gdXJsO1xuICAgIH1cblxuICAgIGluY3JlbWVudFBhZ2UoKSB7XG4gICAgXG4gICAgICAgIHRoaXMucGFyYW1zLnBhZ2UrKztcbiAgICB9XG4gICAgXG4gICAgbmF2aWdhdGUoKSB7XG4gICAgXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdGhpcy5nZXRTZWFyY2hQYWdlVXJsKCk7XG4gICAgfVxuICAgIFxuICAgIHJlbW92ZVJlZ2lvbihyZWdpb25JbmRleCkge1xuICAgIFxuICAgICAgICB0aGlzLnBhcmFtcy5yZWdpb25zLnNwbGljZShyZWdpb25JbmRleCwgMSk7IC8vIHJlbW92ZSBhdCBpbmRleCBpXG4gICAgICAgIHRoaXMucGFyYW1zLnBhZ2UgPSAxO1xuICAgIH1cbiAgICBcbiAgICBzZXRBdXRvU3VnZ2VzdGVkUmVnaW9uKHJlZ2lvbiwgcmVzZXRSZWdpb25zKSB7XG4gICAgXG4gICAgICAgIHRoaXMucGFyYW1zLmF1dG9TdWdnZXN0ZWRSZWdpb24gPSByZWdpb247XG4gICAgICAgIHRoaXMucGFyYW1zLnJlc2V0UmVnaW9ucyA9IHJlc2V0UmVnaW9ucztcbiAgICAgICAgdGhpcy5wYXJhbXMucGFnZSA9IDE7XG4gICAgfVxuICAgIFxuICAgIHRvZ2dsZUNhdGVnb3J5KGNhdGVnb3J5KSB7XG4gICAgXG4gICAgICAgIHZhciBpID0gdGhpcy5wYXJhbXMuY2F0ZWdvcmllcy5pbmRleE9mKGNhdGVnb3J5KTtcbiAgICBcbiAgICAgICAgaWYgKGkgPiAtMSlcbiAgICAgICAgICAgIHRoaXMucGFyYW1zLmNhdGVnb3JpZXMuc3BsaWNlKGksIDEpOyAvLyByZW1vdmUgYXQgaW5kZXggaVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLnBhcmFtcy5jYXRlZ29yaWVzLnB1c2goY2F0ZWdvcnkpO1xuICAgIH1cbiAgICBcbiAgICB0b2dnbGVEb21haW4oZG9tYWluKSB7XG4gICAgXG4gICAgICAgIHZhciBpID0gdGhpcy5wYXJhbXMuZG9tYWlucy5pbmRleE9mKGRvbWFpbik7XG4gICAgXG4gICAgICAgIGlmIChpID4gLTEpXG4gICAgICAgICAgICB0aGlzLnBhcmFtcy5kb21haW5zLnNwbGljZShpLCAxKTsgLy8gcmVtb3ZlIGF0IGluZGV4IGlcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5wYXJhbXMuZG9tYWlucy5wdXNoKGRvbWFpbik7XG4gICAgfVxuICAgIFxuICAgIHRvZ2dsZVN0YW5kYXJkKHN0YW5kYXJkKSB7XG4gICAgXG4gICAgICAgIHZhciBpID0gdGhpcy5wYXJhbXMuc3RhbmRhcmRzLmluZGV4T2Yoc3RhbmRhcmQpO1xuICAgIFxuICAgICAgICBpZiAoaSA+IC0xKVxuICAgICAgICAgICAgdGhpcy5wYXJhbXMuc3RhbmRhcmRzLnNwbGljZShpLCAxKTsgLy8gcmVtb3ZlIGF0IGluZGV4IGlcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5wYXJhbXMuc3RhbmRhcmRzLnB1c2goc3RhbmRhcmQpO1xuICAgIH1cbn0iXX0=
//# sourceMappingURL=v4-search-page-controller.js.map
