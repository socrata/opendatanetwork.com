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
            var _this3 = this;

            google.setOnLoadCallback(function () {

                var regionIds = _this3.params.regions.map(function (region) {
                    return region.id;
                });
                var controller = new ApiController();

                controller.getEducationData(regionIds).then(function (data) {
                    return _this3.drawEducationTable(regionIds, data);
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
            var _this4 = this;

            google.setOnLoadCallback(function () {

                var regionIds = _this4.params.regions.map(function (region) {
                    return region.id;
                });
                var controller = new ApiController();

                controller.getGdpData(regionIds).then(function (data) {

                    _this4.drawGdpChart(regionIds, data);
                    _this4.drawGdpChangeChart(regionIds, data);
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
            var _this5 = this;

            google.setOnLoadCallback(function () {

                var regionIds = _this5.params.regions.map(function (region) {
                    return region.id;
                });
                var controller = new ApiController();

                controller.getOccupationsData(regionIds).then(function (data) {
                    return _this5.drawOccupationsTable(regionIds, data);
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
            var _this6 = this;

            google.setOnLoadCallback(function () {

                var regionIds = _this6.params.regions.map(function (region) {
                    return region.id;
                });
                var controller = new ApiController();

                controller.getPopulationData(regionIds).then(function (data) {

                    _this6.drawPopulationMap();
                    _this6.drawPopulationChart(regionIds, data);
                    _this6.drawPopulationChangeChart(regionIds, data);
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

            var map = L.map('map', {
                zoomControl: false
            });

            map.setView(this.MAP_INITIAL_CENTER, this.MAP_INITIAL_ZOOM);

            L.tileLayer('https://a.tiles.mapbox.com/v3/socrata-apps.ibp0l899/{z}/{x}/{y}.png').addTo(map);
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
            var _this7 = this;

            var controller = new ApiController();

            controller.getChildRegions(region.id).then(function (response) {

                _this7.drawPlacesInRegionHeader('#places-in-region-header-0', label);
                _this7.drawPlacesInRegionList('#places-in-region-list-0', response);
            }).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'drawCitiesAndCountiesInState',
        value: function drawCitiesAndCountiesInState(region) {
            var _this8 = this;

            var controller = new ApiController();
            var citiesPromise = controller.getCitiesInState(region.id);
            var countiesPromise = controller.getCountiesInState(region.id);

            return Promise.all([citiesPromise, countiesPromise]).then(function (values) {

                if (values.length == 0) return;

                if (values[0].length > 0) {

                    _this8.drawPlacesInRegionHeader('#places-in-region-header-0', 'Places in {0}'.format(region.name));
                    _this8.drawPlacesInRegionList('#places-in-region-list-0', values[0]);
                }

                if (values[1].length > 0) {

                    _this8.drawPlacesInRegionHeader('#places-in-region-header-1', 'Counties in {0}'.format(region.name));
                    _this8.drawPlacesInRegionList('#places-in-region-list-1', values[1]);
                }
            }).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'drawOtherCitiesInState',
        value: function drawOtherCitiesInState(region) {
            var _this9 = this;

            var controller = new ApiController();

            controller.getParentState(region).then(function (response) {

                if (response.length == 0) return;

                var state = response[0];

                controller.getCitiesInState(state.parent_id).then(function (response) {

                    if (response.length == 0) return;

                    _this9.drawPlacesInRegionHeader('#places-in-region-header-0', 'Places in {0}'.format(state.parent_name));
                    _this9.drawPlacesInRegionList('#places-in-region-list-0', response);
                }).catch(function (error) {
                    return console.error(error);
                });
            });
        }
    }, {
        key: 'drawOtherCountiesInState',
        value: function drawOtherCountiesInState(region) {
            var _this10 = this;

            var controller = new ApiController();

            controller.getParentState(region).then(function (response) {

                if (response.length == 0) return;

                var state = response[0];

                controller.getCountiesInState(state.parent_id).then(function (response) {

                    if (response.length == 0) return;

                    _this10.drawPlacesInRegionHeader('#places-in-region-header-0', 'Counties in {0}'.format(state.parent_name));
                    _this10.drawPlacesInRegionList('#places-in-region-list-0', response);
                }).catch(function (error) {
                    return console.error(error);
                });
            });
        }
    }, {
        key: 'drawOtherMetrosInState',
        value: function drawOtherMetrosInState(region) {
            var _this11 = this;

            var controller = new ApiController();

            controller.getParentState(region).then(function (response) {

                if (response.length == 0) return;

                var state = response[0];

                controller.getMetrosInState(state.parent_id).then(function (response) {

                    if (response.length == 0) return;

                    _this11.drawPlacesInRegionHeader('#places-in-region-header-0', 'Metropolitan Areas in {0}'.format(state.parent_name));
                    _this11.drawPlacesInRegionList('#places-in-region-list-0', response);
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
            var _this12 = this;

            if (this.params.regions.length == 0) return;

            var region = this.params.regions[0];
            var controller = new ApiController();

            controller.getSimilarRegions(region.id).then(function (data) {
                return _this12.drawSimilarRegionsList(data, onClickRegion);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Y0LXNlYXJjaC1wYWdlLWNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBQU0sb0JBQW9CO0FBRXRCLGFBRkUsb0JBQW9CLENBRVYsTUFBTSxFQUFFOzhCQUZsQixvQkFBb0I7O0FBSWxCLFlBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzlDLFlBQUksQ0FBQyxnQkFBZ0IsR0FBRyxHQUFHLENBQUM7O0FBRTVCLFlBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLFlBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0FBQ3RCLFlBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO0FBQ3hCLFlBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDOztBQUV0QixZQUFJLElBQUksR0FBRyxJQUFJOzs7O0FBQUMsQUFJaEIsU0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxZQUFXOztBQUVwQyxhQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDekMsYUFBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUM1RixhQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN6QyxDQUFDLENBQUM7O0FBRUgsU0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxZQUFXOztBQUVwQyxhQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDNUMsYUFBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFB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QUFDLFFBQVEsQ0FBQyxDQUFDOztBQUVqRCxnQkFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQ04sSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFBQyxpQkFFcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQzdDOzs7cUNBRVksTUFBTSxFQUFFOztBQUVqQixnQkFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUU1QyxnQkFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQ04sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFBQyxpQkFFakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3hDOzs7dUNBRWMsUUFBUSxFQUFFOztBQUVyQixnQkFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUVoRCxnQkFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQ04sSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFBQyxpQkFFbkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQzVDOzs7V0E3dUNDLG9CQUFvQiIsImZpbGUiOiJ2NC1zZWFyY2gtcGFnZS1jb250cm9sbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgU2VhcmNoUGFnZUNvbnRyb2xsZXIge1xuXG4gICAgY29uc3RydWN0b3IocGFyYW1zKSB7XG5cbiAgICAgICAgdGhpcy5NQVBfSU5JVElBTF9DRU5URVIgPSBbMzcuMTY2OSwgLTk1Ljk2NjldO1xuICAgICAgICB0aGlzLk1BUF9JTklUSUFMX1pPT00gPSA0LjA7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnBhcmFtcyA9IHBhcmFtcztcbiAgICAgICAgdGhpcy5mZXRjaGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmZldGNoZWRBbGwgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5tb3N0U2ltaWxhciA9IFtdO1xuICAgIFxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgXG4gICAgICAgIC8vIFJlZmluZSBtZW51c1xuICAgICAgICAvL1xuICAgICAgICAkKCcucmVmaW5lLWxpbmsnKS5tb3VzZWVudGVyKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygncmVmaW5lLWxpbmstc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgICQodGhpcykuY2hpbGRyZW4oJ3NwYW4nKS5jaGlsZHJlbignaScpLnJlbW92ZUNsYXNzKCdmYS1jYXJldC1kb3duJykuYWRkQ2xhc3MoJ2ZhLWNhcmV0LXVwJyk7XG4gICAgICAgICAgICAkKHRoaXMpLmNoaWxkcmVuKCd1bCcpLnNsaWRlRG93bigxMDApO1xuICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgJCgnLnJlZmluZS1saW5rJykubW91c2VsZWF2ZShmdW5jdGlvbigpIHtcbiAgICBcbiAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ3JlZmluZS1saW5rLXNlbGVjdGVkJyk7XG4gICAgICAgICAgICAkKHRoaXMpLmNoaWxkcmVuKCdzcGFuJykuY2hpbGRyZW4oJ2knKS5yZW1vdmVDbGFzcygnZmEtY2FyZXQtdXAnKS5hZGRDbGFzcygnZmEtY2FyZXQtZG93bicpO1xuICAgICAgICAgICAgJCh0aGlzKS5jaGlsZHJlbigndWwnKS5zbGlkZVVwKDEwMCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIENhdGVnb3JpZXNcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5hdHRhY2hDYXRlZ29yaWVzQ2xpY2tIYW5kbGVycygpO1xuXG4gICAgICAgICQoJyNyZWZpbmUtbWVudS1jYXRlZ29yaWVzLXZpZXctbW9yZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG5cbiAgICAgICAgICAgIGNvbnRyb2xsZXIuZ2V0Q2F0ZWdvcmllcygpXG4gICAgICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHJnID0gZGF0YS5yZXN1bHRzLm1hcChmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnPGxpPjxpIGNsYXNzPVwiZmEgJyArIHJlc3VsdC5tZXRhZGF0YS5pY29uICsgJ1wiPjwvaT4nICsgcmVzdWx0LmNhdGVnb3J5ICsgJzwvbGk+JztcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHMgPSByZy5qb2luKCcnKTtcblxuICAgICAgICAgICAgICAgICAgICAkKCcjcmVmaW5lLW1lbnUtY2F0ZWdvcmllcycpLmh0bWwocyk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYXR0YWNoQ2F0ZWdvcmllc0NsaWNrSGFuZGxlcnMoKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIERvbWFpbnNcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5hdHRhY2hEb21haW5zQ2xpY2tIYW5kbGVycygpO1xuXG4gICAgICAgICQoJyNyZWZpbmUtbWVudS1kb21haW5zLXZpZXctbW9yZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG5cbiAgICAgICAgICAgIGNvbnRyb2xsZXIuZ2V0RG9tYWlucygpXG4gICAgICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHJnID0gZGF0YS5yZXN1bHRzLm1hcChmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnPGxpPicgKyByZXN1bHQuZG9tYWluICsgJzwvbGk+JztcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHMgPSByZy5qb2luKCcnKTtcblxuICAgICAgICAgICAgICAgICAgICAkKCcjcmVmaW5lLW1lbnUtZG9tYWlucycpLmh0bWwocyk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYXR0YWNoRG9tYWluc0NsaWNrSGFuZGxlcnMoKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gU3RhbmRhcmRzXG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuYXR0YWNoU3RhbmRhcmRzQ2xpY2tIYW5kbGVycygpO1xuICAgIFxuICAgICAgICAvLyBUb2tlbnNcbiAgICAgICAgLy9cbiAgICAgICAgJCgnLnJlZ2lvbi10b2tlbiAuZmEtdGltZXMtY2lyY2xlJykuY2xpY2soZnVuY3Rpb24oKSB7IFxuICAgIFxuICAgICAgICAgICAgc2VsZi5yZW1vdmVSZWdpb24oJCh0aGlzKS5wYXJlbnQoKS5pbmRleCgpKTtcbiAgICAgICAgICAgIHNlbGYubmF2aWdhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICQoJy5jYXRlZ29yeS10b2tlbiAuZmEtdGltZXMtY2lyY2xlJykuY2xpY2soZnVuY3Rpb24oKSB7IFxuICAgIFxuICAgICAgICAgICAgc2VsZi50b2dnbGVDYXRlZ29yeSgkKHRoaXMpLnBhcmVudCgpLnRleHQoKS50b0xvd2VyQ2FzZSgpLnRyaW0oKSk7XG4gICAgICAgICAgICBzZWxmLm5hdmlnYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICAkKCcuZG9tYWluLXRva2VuIC5mYS10aW1lcy1jaXJjbGUnKS5jbGljayhmdW5jdGlvbigpIHsgXG4gICAgXG4gICAgICAgICAgICBzZWxmLnRvZ2dsZURvbWFpbigkKHRoaXMpLnBhcmVudCgpLnRleHQoKS50b0xvd2VyQ2FzZSgpLnRyaW0oKSk7XG4gICAgICAgICAgICBzZWxmLm5hdmlnYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICAkKCcuc3RhbmRhcmQtdG9rZW4gLmZhLXRpbWVzLWNpcmNsZScpLmNsaWNrKGZ1bmN0aW9uKCkgeyBcbiAgICBcbiAgICAgICAgICAgIHNlbGYudG9nZ2xlU3RhbmRhcmQoJCh0aGlzKS5wYXJlbnQoKS50ZXh0KCkudG9Mb3dlckNhc2UoKS50cmltKCkpO1xuICAgICAgICAgICAgc2VsZi5uYXZpZ2F0ZSgpO1xuICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgLy8gSW5maW5pdGUgc2Nyb2xsIHNlYXJjaCByZXN1bHRzXG4gICAgICAgIC8vXG4gICAgICAgICQod2luZG93KS5vbignc2Nyb2xsJywgZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgYm90dG9tT2Zmc2V0VG9CZWdpblJlcXVlc3QgPSAxMDAwO1xuICAgIFxuICAgICAgICAgICAgaWYgKCQod2luZG93KS5zY3JvbGxUb3AoKSA+PSAkKGRvY3VtZW50KS5oZWlnaHQoKSAtICQod2luZG93KS5oZWlnaHQoKSAtIGJvdHRvbU9mZnNldFRvQmVnaW5SZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgc2VsZi5mZXRjaE5leHRQYWdlKCk7XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgIH0pLnNjcm9sbCgpO1xuICAgIFxuICAgICAgICAvLyBBZGQgbG9jYXRpb25cbiAgICAgICAgLy9cbiAgICAgICAgbmV3IEF1dG9TdWdnZXN0UmVnaW9uQ29udHJvbGxlcignLmFkZC1yZWdpb24gaW5wdXRbdHlwZT1cInRleHRcIl0nLCAnLmFkZC1yZWdpb24gdWwnLCBmdW5jdGlvbihyZWdpb24pIHtcbiAgICBcbiAgICAgICAgICAgIHNlbGYuc2V0QXV0b1N1Z2dlc3RlZFJlZ2lvbihyZWdpb24sIGZhbHNlKTtcbiAgICAgICAgICAgIHNlbGYubmF2aWdhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICQoJy5hZGQtcmVnaW9uIC5mYS1wbHVzJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICAgICAgICAkKCcuYWRkLXJlZ2lvbiBpbnB1dFt0eXBlPVwidGV4dFwiXScpLmZvY3VzKCk7XG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICAvLyBTaW1pbGFyIHJlZ2lvbnNcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5kcmF3U2ltaWxhclJlZ2lvbnMoZnVuY3Rpb24ocmVnaW9uKSB7XG4gICAgXG4gICAgICAgICAgICBzZWxmLnNldEF1dG9TdWdnZXN0ZWRSZWdpb24ocmVnaW9uLCBmYWxzZSk7XG4gICAgICAgICAgICBzZWxmLm5hdmlnYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICAvLyBQbGFjZXMgaW4gcmVnaW9uXG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuZHJhd1BsYWNlc0luUmVnaW9uKCk7XG4gICAgfVxuXG4gICAgLy8gUHVibGljIG1ldGhvZHNcbiAgICAvL1xuICAgIGF0dGFjaENhdGVnb3JpZXNDbGlja0hhbmRsZXJzKCkge1xuICAgIFxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgXG4gICAgICAgICQoJyNyZWZpbmUtbWVudS1jYXRlZ29yaWVzIGxpOm5vdCgucmVmaW5lLXZpZXctbW9yZSknKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICBcbiAgICAgICAgICAgIHNlbGYudG9nZ2xlQ2F0ZWdvcnkoJCh0aGlzKS50ZXh0KCkudG9Mb3dlckNhc2UoKS50cmltKCkpO1xuICAgICAgICAgICAgc2VsZi5uYXZpZ2F0ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgYXR0YWNoRG9tYWluc0NsaWNrSGFuZGxlcnMoKSB7XG4gICAgXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgXG4gICAgICAgICQoJyNyZWZpbmUtbWVudS1kb21haW5zIGxpOm5vdCgucmVmaW5lLXZpZXctbW9yZSknKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICBcbiAgICAgICAgICAgIHZhciBkb21haW4gPSAkKHRoaXMpLnRleHQoKS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcbiAgICBcbiAgICAgICAgICAgIHNlbGYudG9nZ2xlRG9tYWluKGRvbWFpbik7XG4gICAgICAgICAgICBzZWxmLm5hdmlnYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBhdHRhY2hTdGFuZGFyZHNDbGlja0hhbmRsZXJzKCkge1xuICAgIFxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIFxuICAgICAgICAkKCcjcmVmaW5lLW1lbnUtc3RhbmRhcmRzIGxpJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgc3RhbmRhcmQgPSAkKHRoaXMpLnRleHQoKS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcbiAgICBcbiAgICAgICAgICAgIHNlbGYudG9nZ2xlU3RhbmRhcmQoc3RhbmRhcmQpO1xuICAgICAgICAgICAgc2VsZi5uYXZpZ2F0ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZGVjcmVtZW50UGFnZSgpIHtcbiAgICBcbiAgICAgICAgdGhpcy5wYXJhbXMucGFnZS0tO1xuICAgIH1cbiAgICBcbiAgICAvLyBDb3N0IG9mIGxpdmluZ1xuICAgIC8vXG4gICAgZHJhd0Nvc3RPZkxpdmluZ0RhdGEoKSB7XG5cbiAgICAgICAgZ29vZ2xlLnNldE9uTG9hZENhbGxiYWNrKCgpID0+IHtcblxuICAgICAgICAgICAgdmFyIHJlZ2lvbklkcyA9IHRoaXMucGFyYW1zLnJlZ2lvbnMubWFwKGZ1bmN0aW9uKHJlZ2lvbikgeyByZXR1cm4gcmVnaW9uLmlkOyB9KTtcbiAgICAgICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcblxuICAgICAgICAgICAgY29udHJvbGxlci5nZXRDb3N0T2ZMaXZpbmdEYXRhKHJlZ2lvbklkcylcbiAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IHsgXG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3Q29zdE9mTGl2aW5nQ2hhcnQocmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3Q29zdE9mTGl2aW5nVGFibGUocmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBkcmF3Q29zdE9mTGl2aW5nQ2hhcnQocmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIHRoaXMuZHJhd0Nvc3RPZkxpdmluZ0NoYXJ0Rm9yQ29tcG9uZW50KCdjb3N0LW9mLWxpdmluZy1hbGwtY2hhcnQnLCAnQWxsJywgcmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgdGhpcy5kcmF3Q29zdE9mTGl2aW5nQ2hhcnRGb3JDb21wb25lbnQoJ2Nvc3Qtb2YtbGl2aW5nLWdvb2RzLWNoYXJ0JywgJ0dvb2RzJywgcmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgdGhpcy5kcmF3Q29zdE9mTGl2aW5nQ2hhcnRGb3JDb21wb25lbnQoJ2Nvc3Qtb2YtbGl2aW5nLXJlbnRzLWNoYXJ0JywgJ1JlbnRzJywgcmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgdGhpcy5kcmF3Q29zdE9mTGl2aW5nQ2hhcnRGb3JDb21wb25lbnQoJ2Nvc3Qtb2YtbGl2aW5nLW90aGVyLWNoYXJ0JywgJ090aGVyJywgcmVnaW9uSWRzLCBkYXRhKTtcbiAgICB9XG4gICAgXG4gICAgZHJhd0Nvc3RPZkxpdmluZ0NoYXJ0Rm9yQ29tcG9uZW50KGlkLCBjb21wb25lbnQsIHJlZ2lvbklkcywgZGF0YSkge1xuICAgIFxuICAgICAgICB2YXIgY2hhcnREYXRhID0gW11cbiAgICBcbiAgICAgICAgLy8gSGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBoZWFkZXIgPSBbJ1llYXInXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGhlYWRlcltpICsgMV0gPSB0aGlzLnBhcmFtcy5yZWdpb25zW2ldLm5hbWU7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgY2hhcnREYXRhLnB1c2goaGVhZGVyKTtcbiAgICBcbiAgICAgICAgLy8gRm9ybWF0IHRoZSBkYXRhXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBvID0ge307XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIFxuICAgICAgICAgICAgaWYgKGRhdGFbaV0uY29tcG9uZW50ICE9IGNvbXBvbmVudClcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICBcbiAgICAgICAgICAgIGlmIChvW2RhdGFbaV0ueWVhcl0gPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgb1tkYXRhW2ldLnllYXJdID0gW2RhdGFbaV0ueWVhcl07XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICBvW2RhdGFbaV0ueWVhcl0ucHVzaChwYXJzZUZsb2F0KGRhdGFbaV0uaW5kZXgpKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gbykge1xuICAgICAgICAgICAgY2hhcnREYXRhLnB1c2gob1trZXldKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICB0aGlzLmRyYXdMaW5lQ2hhcnQoaWQsIGNoYXJ0RGF0YSwge1xuICAgIFxuICAgICAgICAgICAgY3VydmVUeXBlIDogJ2Z1bmN0aW9uJyxcbiAgICAgICAgICAgIGxlZ2VuZCA6IHsgcG9zaXRpb24gOiAnYm90dG9tJyB9LFxuICAgICAgICAgICAgcG9pbnRTaGFwZSA6ICdzcXVhcmUnLFxuICAgICAgICAgICAgcG9pbnRTaXplIDogOCxcbiAgICAgICAgICAgIHRpdGxlIDogY29tcG9uZW50LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZHJhd0Nvc3RPZkxpdmluZ1RhYmxlKHJlZ2lvbklkcywgZGF0YSkge1xuICAgIFxuICAgICAgICAvLyBGb3JtYXQgdGhlIGRhdGFcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGNvbXBvbmVudHMgPSBbJ0FsbCcsICdHb29kcycsICdPdGhlcicsICdSZW50cyddO1xuICAgICAgICB2YXIgcm93cyA9IFtdO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbXBvbmVudHMubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgIHZhciBjb21wb25lbnQgPSBjb21wb25lbnRzW2ldO1xuICAgICAgICAgICAgdmFyIHJvdyA9IFtjb21wb25lbnRdO1xuICAgIFxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCByZWdpb25JZHMubGVuZ3RoOyBqKyspIHtcbiAgICBcbiAgICAgICAgICAgICAgICB2YXIgbyA9IHRoaXMuZ2V0TGF0ZXN0Q29zdE9mTGl2aW5nKGRhdGEsIHJlZ2lvbklkc1tqXSwgY29tcG9uZW50KTtcbiAgICBcbiAgICAgICAgICAgICAgICByb3cucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4IDogKG8gIT0gbnVsbCkgPyBwYXJzZUZsb2F0KG8uaW5kZXgpIDogJ05BJyxcbiAgICAgICAgICAgICAgICAgICAgcGVyY2VudGlsZSA6IChvICE9IG51bGwpID8gdGhpcy5nZXRQZXJjZW50aWxlKG8ucmFuaywgby50b3RhbF9yYW5rcykgOiAnTkEnLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgcm93cy5wdXNoKHJvdyk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgLy8gSGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBzID0gJzx0cj48dGg+PC90aD4nO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcyArPSAnPHRoIGNvbHNwYW49XFwnMlxcJz4nICsgdGhpcy5wYXJhbXMucmVnaW9uc1tpXS5uYW1lICsgJzwvdGg+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvLyBTdWIgaGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHMgKz0gJzwvdHI+PHRyPjx0ZCBjbGFzcz1cXCdjb2x1bW4taGVhZGVyXFwnPjwvdGQ+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0ZCBjbGFzcz1cXCdjb2x1bW4taGVhZGVyXFwnPlZhbHVlPC90ZD48dGQgY2xhc3M9XFwnY29sdW1uLWhlYWRlclxcJz5QZXJjZW50aWxlPC90ZD4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIHMgKz0gJzwvdHI+JztcbiAgICAgICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcm93cy5sZW5ndGg7IGkrKykge1xuICAgIFxuICAgICAgICAgICAgdmFyIHJvdyA9IHJvd3NbaV07XG4gICAgXG4gICAgICAgICAgICBzICs9ICc8dHI+JztcbiAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgcm93WzBdICsgJzwvdGQ+JztcbiAgICBcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAxOyBqIDwgcm93Lmxlbmd0aDsgaisrKSB7XG4gICAgXG4gICAgICAgICAgICAgICAgcyArPSAnPHRkPicgKyByb3dbal0uaW5kZXggKyAnPC90ZD4nO1xuICAgICAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgcm93W2pdLnBlcmNlbnRpbGUgKyAnPC90ZD4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzICs9ICc8L3RyPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgJCgnI2Nvc3Qtb2YtbGl2aW5nLXRhYmxlJykuaHRtbChzKTtcbiAgICB9XG4gICAgXG4gICAgZ2V0UGVyY2VudGlsZShyYW5rLCB0b3RhbFJhbmtzKSB7XG4gICAgXG4gICAgICAgIHZhciB0b3RhbFJhbmtzID0gcGFyc2VJbnQodG90YWxSYW5rcyk7XG4gICAgICAgIHZhciByYW5rID0gcGFyc2VJbnQocmFuayk7XG4gICAgICAgIHZhciBwZXJjZW50aWxlID0gcGFyc2VJbnQoKCh0b3RhbFJhbmtzIC0gcmFuaykgLyB0b3RhbFJhbmtzKSAqIDEwMCk7XG4gICAgXG4gICAgICAgIHJldHVybiBudW1lcmFsKHBlcmNlbnRpbGUpLmZvcm1hdCgnMG8nKTtcbiAgICB9XG4gICAgXG4gICAgZ2V0TGF0ZXN0Q29zdE9mTGl2aW5nKGRhdGEsIHJlZ2lvbklkLCBjb21wb25lbnQpIHtcbiAgICBcbiAgICAgICAgdmFyIGRhdHVtID0gbnVsbDtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICBpZiAoZGF0YVtpXS5pZCAhPSByZWdpb25JZClcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICBcbiAgICAgICAgICAgIGlmIChkYXRhW2ldLmNvbXBvbmVudCAhPSBjb21wb25lbnQpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgXG4gICAgICAgICAgICBpZiAoZGF0dW0gPT0gbnVsbCkge1xuICAgIFxuICAgICAgICAgICAgICAgIGRhdHVtID0gZGF0YVtpXTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIGlmIChwYXJzZUludChkYXRhW2ldLnllYXIpIDw9IHBhcnNlSW50KGRhdHVtLnllYXIpKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgIFxuICAgICAgICAgICAgZGF0dW0gPSBkYXRhW2ldO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZGF0dW07XG4gICAgfVxuICAgIFxuICAgIC8vIEVhcm5pbmdzXG4gICAgLy9cbiAgICBkcmF3RWFybmluZ3NEYXRhKCkge1xuXG4gICAgICAgIGdvb2dsZS5zZXRPbkxvYWRDYWxsYmFjaygoKSA9PiB7XG4gICAgXG4gICAgICAgICAgICB2YXIgcmVnaW9uSWRzID0gdGhpcy5wYXJhbXMucmVnaW9ucy5tYXAoZnVuY3Rpb24ocmVnaW9uKSB7IHJldHVybiByZWdpb24uaWQ7IH0pO1xuICAgICAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuICAgIFxuICAgICAgICAgICAgY29udHJvbGxlci5nZXRFYXJuaW5nc0RhdGEocmVnaW9uSWRzKVxuICAgICAgICAgICAgICAgIC50aGVuKGRhdGEgPT4geyBcbiAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3RWFybmluZ3NDaGFydChyZWdpb25JZHMsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdFYXJuaW5nc1RhYmxlKHJlZ2lvbklkcywgZGF0YSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZHJhd0Vhcm5pbmdzQ2hhcnQocmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIHZhciBlYXJuaW5ncyA9IFtdO1xuICAgIFxuICAgICAgICAvLyBIZWFkZXJcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGhlYWRlciA9IFsnRWR1Y2F0aW9uIExldmVsJ107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBoZWFkZXJbaSArIDFdID0gdGhpcy5wYXJhbXMucmVnaW9uc1tpXS5uYW1lO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGVhcm5pbmdzLnB1c2goaGVhZGVyKTtcbiAgICBcbiAgICAgICAgLy8gTGVzcyB0aGFuIGhpZ2ggc2Nob29sXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBzb21lSGlnaFNjaG9vbEVhcm5pbmdzID0gWydTb21lIEhpZ2ggU2Nob29sJ107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzb21lSGlnaFNjaG9vbEVhcm5pbmdzW2kgKyAxXSA9IHBhcnNlSW50KGRhdGFbaV0ubWVkaWFuX2Vhcm5pbmdzX2xlc3NfdGhhbl9oaWdoX3NjaG9vbCk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgZWFybmluZ3MucHVzaChzb21lSGlnaFNjaG9vbEVhcm5pbmdzKTtcbiAgICBcbiAgICAgICAgLy8gSGlnaCBzY2hvb2xcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGhpZ2hTY2hvb2xFYXJuaW5ncyA9IFsnSGlnaCBTY2hvb2wnXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGhpZ2hTY2hvb2xFYXJuaW5nc1tpICsgMV0gPSBwYXJzZUludChkYXRhW2ldLm1lZGlhbl9lYXJuaW5nc19oaWdoX3NjaG9vbCk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgZWFybmluZ3MucHVzaChoaWdoU2Nob29sRWFybmluZ3MpO1xuICAgIFxuICAgICAgICAvLyBTb21lIGNvbGxlZ2VcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIHNvbWVDb2xsZWdlRWFybmluZ3MgPSBbJ1NvbWUgQ29sbGVnZSddO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc29tZUNvbGxlZ2VFYXJuaW5nc1tpICsgMV0gPSBwYXJzZUludChkYXRhW2ldLm1lZGlhbl9lYXJuaW5nc19zb21lX2NvbGxlZ2Vfb3JfYXNzb2NpYXRlcyk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgZWFybmluZ3MucHVzaChzb21lQ29sbGVnZUVhcm5pbmdzKTtcbiAgICBcbiAgICAgICAgLy8gQmFjaGVsb3Inc1xuICAgICAgICAvL1xuICAgICAgICB2YXIgYmFjaGVsb3JzRWFybmluZ3MgPSBbJ0JhY2hlbG9yXFwncyddO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYmFjaGVsb3JzRWFybmluZ3NbaSArIDFdID0gcGFyc2VJbnQoZGF0YVtpXS5tZWRpYW5fZWFybmluZ3NfYmFjaGVsb3JfZGVncmVlKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBlYXJuaW5ncy5wdXNoKGJhY2hlbG9yc0Vhcm5pbmdzKTtcbiAgICBcbiAgICAgICAgLy8gR3JhZHVhdGUgZGVncmVlXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBncmFkdWF0ZURlZ3JlZUVhcm5pbmdzID0gWydHcmFkdWF0ZSBEZWdyZWUnXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGdyYWR1YXRlRGVncmVlRWFybmluZ3NbaSArIDFdID0gcGFyc2VJbnQoZGF0YVtpXS5tZWRpYW5fZWFybmluZ3NfZ3JhZHVhdGVfb3JfcHJvZmVzc2lvbmFsX2RlZ3JlZSk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgZWFybmluZ3MucHVzaChncmFkdWF0ZURlZ3JlZUVhcm5pbmdzKTtcbiAgICBcbiAgICAgICAgdGhpcy5kcmF3U3RlcHBlZEFyZWFDaGFydCgnZWFybmluZ3MtY2hhcnQnLCBlYXJuaW5ncywge1xuICAgIFxuICAgICAgICAgICAgYXJlYU9wYWNpdHkgOiAwLFxuICAgICAgICAgICAgY29ubmVjdFN0ZXBzOiB0cnVlLFxuICAgICAgICAgICAgY3VydmVUeXBlIDogJ2Z1bmN0aW9uJyxcbiAgICAgICAgICAgIGZvY3VzVGFyZ2V0IDogJ2NhdGVnb3J5JyxcbiAgICAgICAgICAgIGxlZ2VuZCA6IHsgcG9zaXRpb24gOiAnYm90dG9tJyB9LFxuICAgICAgICAgICAgdGl0bGUgOiAnRWFybmluZ3MgYnkgRWR1Y2F0aW9uIExldmVsJyxcbiAgICAgICAgICAgIHZBeGlzIDogeyBmb3JtYXQgOiAnY3VycmVuY3knIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBkcmF3RWFybmluZ3NUYWJsZShyZWdpb25JZHMsIGRhdGEpIHtcbiAgICBcbiAgICAgICAgdmFyIHMgPSAnJztcbiAgICBcbiAgICAgICAgcyArPSAnPHRyPjx0aD48L3RoPic7XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzICs9ICc8dGg+JyArIHRoaXMucGFyYW1zLnJlZ2lvbnNbaV0ubmFtZSArICc8L3RoPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgLy8gTWVkaWFuIGVhcm5pbmdzIGFsbFxuICAgICAgICAvL1xuICAgICAgICBzICs9ICc8L3RyPjx0cj48dGQ+TWVkaWFuIEVhcm5pbmdzIChBbGwgV29ya2Vycyk8L3RkPic7XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzICs9ICc8dGQ+JyArIG51bWVyYWwoZGF0YVtpXS5tZWRpYW5fZWFybmluZ3MpLmZvcm1hdCgnJDAsMCcpICsgJzwvdGQ+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvLyBNZWRpYW4gZWFybmluZ3MgZmVtYWxlXG4gICAgICAgIC8vXG4gICAgICAgIHMgKz0gJzwvdHI+PHRyPjx0ZD5NZWRpYW4gRmVtYWxlIEVhcm5pbmdzIChGdWxsIFRpbWUpPC90ZD4nO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcyArPSAnPHRkPicgKyBudW1lcmFsKGRhdGFbaV0uZmVtYWxlX2Z1bGxfdGltZV9tZWRpYW5fZWFybmluZ3MpLmZvcm1hdCgnJDAsMCcpICsgJzwvdGQ+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvLyBNZWRpYW4gZWFybmluZ3MgbWFsZVxuICAgICAgICAvL1xuICAgICAgICBzICs9ICc8L3RyPjx0cj48dGQ+TWVkaWFuIE1hbGUgRWFybmluZ3MgKEZ1bGwgVGltZSk8L3RkPic7XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzICs9ICc8dGQ+JyArIG51bWVyYWwoZGF0YVtpXS5tYWxlX2Z1bGxfdGltZV9tZWRpYW5fZWFybmluZ3MpLmZvcm1hdCgnJDAsMCcpICsgJzwvdGQ+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBzICs9ICc8L3RyPic7XG4gICAgXG4gICAgICAgICQoJyNlYXJuaW5ncy10YWJsZScpLmh0bWwocyk7XG4gICAgfVxuICAgIFxuICAgIC8vIEVkdWNhdGlvblxuICAgIC8vXG4gICAgZHJhd0VkdWNhdGlvbkRhdGEoKSB7XG5cbiAgICAgICAgZ29vZ2xlLnNldE9uTG9hZENhbGxiYWNrKCgpID0+IHtcblxuICAgICAgICAgICAgdmFyIHJlZ2lvbklkcyA9IHRoaXMucGFyYW1zLnJlZ2lvbnMubWFwKGZ1bmN0aW9uKHJlZ2lvbikgeyByZXR1cm4gcmVnaW9uLmlkOyB9KTtcbiAgICAgICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcblxuICAgICAgICAgICAgY29udHJvbGxlci5nZXRFZHVjYXRpb25EYXRhKHJlZ2lvbklkcylcbiAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IHRoaXMuZHJhd0VkdWNhdGlvblRhYmxlKHJlZ2lvbklkcywgZGF0YSkpXG4gICAgICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRyYXdFZHVjYXRpb25UYWJsZShyZWdpb25JZHMsIGRhdGEpIHtcbiAgICBcbiAgICAgICAgdmFyIHMgPSAnJztcbiAgICBcbiAgICAgICAgLy8gSGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHMgKz0gJzx0cj48dGg+PC90aD4nO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcyArPSAnPHRoIGNvbHNwYW49XFwnMlxcJz4nICsgdGhpcy5wYXJhbXMucmVnaW9uc1tpXS5uYW1lICsgJzwvdGg+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvLyBTdWIgaGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHMgKz0gJzwvdHI+PHRyPjx0ZCBjbGFzcz1cXCdjb2x1bW4taGVhZGVyXFwnPjwvdGQ+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0ZCBjbGFzcz1cXCdjb2x1bW4taGVhZGVyXFwnPlBlcmNlbnQ8L3RkPjx0ZCBjbGFzcz1cXCdjb2x1bW4taGVhZGVyXFwnPlBlcmNlbnRpbGU8L3RkPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgLy8gQXQgbGVhc3QgYmFjaGVsb3Inc1xuICAgICAgICAvL1xuICAgICAgICBzICs9ICc8L3RyPjx0cj48dGQ+QXQgTGVhc3QgQmFjaGVsb3JcXCdzIERlZ3JlZTwvdGQ+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgIHZhciB0b3RhbFJhbmtzID0gcGFyc2VJbnQoZGF0YVtpXS50b3RhbF9yYW5rcyk7XG4gICAgICAgICAgICB2YXIgcmFuayA9IHBhcnNlSW50KGRhdGFbaV0ucGVyY2VudF9iYWNoZWxvcnNfZGVncmVlX29yX2hpZ2hlcl9yYW5rKTtcbiAgICAgICAgICAgIHZhciBwZXJjZW50aWxlID0gcGFyc2VJbnQoKCh0b3RhbFJhbmtzIC0gcmFuaykgLyB0b3RhbFJhbmtzKSAqIDEwMCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgZGF0YVtpXS5wZXJjZW50X2JhY2hlbG9yc19kZWdyZWVfb3JfaGlnaGVyICsgJyU8L3RkPic7XG4gICAgICAgICAgICBzICs9ICc8dGQ+JyArIG51bWVyYWwocGVyY2VudGlsZSkuZm9ybWF0KCcwbycpICsgJzwvdGQ+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvLyBBdCBsZWFzdCBoaWdoIHNjaG9vbCBkaXBsb21hXG4gICAgICAgIC8vXG4gICAgICAgIHMgKz0gJzwvdHI+PHRyPjx0ZD5BdCBMZWFzdCBIaWdoIFNjaG9vbCBEaXBsb21hPC90ZD4nO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgIFxuICAgICAgICAgICAgdmFyIHRvdGFsUmFua3MgPSBwYXJzZUludChkYXRhW2ldLnRvdGFsX3JhbmtzKTtcbiAgICAgICAgICAgIHZhciByYW5rID0gcGFyc2VJbnQoZGF0YVtpXS5wZXJjZW50X2hpZ2hfc2Nob29sX2dyYWR1YXRlX29yX2hpZ2hlcik7XG4gICAgICAgICAgICB2YXIgcGVyY2VudGlsZSA9IHBhcnNlSW50KCgodG90YWxSYW5rcyAtIHJhbmspIC8gdG90YWxSYW5rcykgKiAxMDApO1xuICAgIFxuICAgICAgICAgICAgcyArPSAnPHRkPicgKyBkYXRhW2ldLnBlcmNlbnRfaGlnaF9zY2hvb2xfZ3JhZHVhdGVfb3JfaGlnaGVyICsgJyU8L3RkPic7XG4gICAgICAgICAgICBzICs9ICc8dGQ+JyArIG51bWVyYWwocGVyY2VudGlsZSkuZm9ybWF0KCcwbycpICsgJzwvdGQ+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBzICs9ICc8L3RyPic7XG4gICAgXG4gICAgICAgICQoJyNlZHVjYXRpb24tdGFibGUnKS5odG1sKHMpO1xuICAgIH1cbiAgICBcbiAgICAvLyBHRFAgZGF0YVxuICAgIC8vXG4gICAgZHJhd0dkcERhdGEoKSB7XG5cbiAgICAgICAgZ29vZ2xlLnNldE9uTG9hZENhbGxiYWNrKCgpID0+IHtcblxuICAgICAgICAgICAgdmFyIHJlZ2lvbklkcyA9IHRoaXMucGFyYW1zLnJlZ2lvbnMubWFwKGZ1bmN0aW9uKHJlZ2lvbikgeyByZXR1cm4gcmVnaW9uLmlkOyB9KTtcbiAgICAgICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcblxuICAgICAgICAgICAgY29udHJvbGxlci5nZXRHZHBEYXRhKHJlZ2lvbklkcylcbiAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IHsgXG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3R2RwQ2hhcnQocmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3R2RwQ2hhbmdlQ2hhcnQocmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBkcmF3R2RwQ2hhcnQocmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIHZhciBjaGFydERhdGEgPSBbXTtcbiAgICBcbiAgICAgICAgLy8gSGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBoZWFkZXIgPSBbJ1llYXInXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGhlYWRlcltpICsgMV0gPSB0aGlzLnBhcmFtcy5yZWdpb25zW2ldLm5hbWU7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgY2hhcnREYXRhLnB1c2goaGVhZGVyKTtcbiAgICBcbiAgICAgICAgLy8gRm9ybWF0IHRoZSBkYXRhXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBvID0ge307XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIFxuICAgICAgICAgICAgaWYgKG9bZGF0YVtpXS55ZWFyXSA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBvW2RhdGFbaV0ueWVhcl0gPSBbZGF0YVtpXS55ZWFyXTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIG9bZGF0YVtpXS55ZWFyXS5wdXNoKHBhcnNlRmxvYXQoZGF0YVtpXS5wZXJfY2FwaXRhX2dkcCkpO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvKSB7XG4gICAgICAgICAgICBjaGFydERhdGEucHVzaChvW2tleV0pO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8vIERyYXcgY2hhcnRcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5kcmF3TGluZUNoYXJ0KCdwZXItY2FwaXRhLWdkcC1jaGFydCcsIGNoYXJ0RGF0YSwge1xuICAgIFxuICAgICAgICAgICAgY3VydmVUeXBlIDogJ2Z1bmN0aW9uJyxcbiAgICAgICAgICAgIGxlZ2VuZCA6IHsgcG9zaXRpb24gOiAnYm90dG9tJyB9LFxuICAgICAgICAgICAgcG9pbnRTaGFwZSA6ICdzcXVhcmUnLFxuICAgICAgICAgICAgcG9pbnRTaXplIDogOCxcbiAgICAgICAgICAgIHRpdGxlIDogJ1BlciBDYXBpdGEgUmVhbCBHRFAgb3ZlciBUaW1lJyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRyYXdHZHBDaGFuZ2VDaGFydChyZWdpb25JZHMsIGRhdGEpIHtcbiAgICBcbiAgICAgICAgdmFyIGNoYXJ0RGF0YSA9IFtdO1xuICAgIFxuICAgICAgICAvLyBIZWFkZXJcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGhlYWRlciA9IFsnWWVhciddO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaGVhZGVyW2kgKyAxXSA9IHRoaXMucGFyYW1zLnJlZ2lvbnNbaV0ubmFtZTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBjaGFydERhdGEucHVzaChoZWFkZXIpO1xuICAgIFxuICAgICAgICAvLyBGb3JtYXQgdGhlIGRhdGFcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIG8gPSB7fTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICBpZiAob1tkYXRhW2ldLnllYXJdID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG9bZGF0YVtpXS55ZWFyXSA9IFtkYXRhW2ldLnllYXJdO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgb1tkYXRhW2ldLnllYXJdLnB1c2gocGFyc2VGbG9hdChkYXRhW2ldLnBlcl9jYXBpdGFfZ2RwX3BlcmNlbnRfY2hhbmdlKSAvIDEwMCk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgZm9yICh2YXIga2V5IGluIG8pIHtcbiAgICAgICAgICAgIGNoYXJ0RGF0YS5wdXNoKG9ba2V5XSk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgLy8gRHJhdyBjaGFydFxuICAgICAgICAvL1xuICAgICAgICB0aGlzLmRyYXdMaW5lQ2hhcnQoJ3Blci1jYXBpdGEtZ2RwLWNoYW5nZS1jaGFydCcsIGNoYXJ0RGF0YSwge1xuICAgIFxuICAgICAgICAgICAgY3VydmVUeXBlIDogJ2Z1bmN0aW9uJyxcbiAgICAgICAgICAgIGxlZ2VuZCA6IHsgcG9zaXRpb24gOiAnYm90dG9tJyB9LFxuICAgICAgICAgICAgcG9pbnRTaGFwZSA6ICdzcXVhcmUnLFxuICAgICAgICAgICAgcG9pbnRTaXplIDogOCxcbiAgICAgICAgICAgIHRpdGxlIDogJ0FubnVhbCBDaGFuZ2UgaW4gUGVyIENhcGl0YSBHRFAgb3ZlciBUaW1lJyxcbiAgICAgICAgICAgIHZBeGlzIDogeyBmb3JtYXQgOiAnIy4jJScgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIC8vIE9jY3VwYXRpb25zXG4gICAgLy9cbiAgICBkcmF3T2NjdXBhdGlvbnNEYXRhKCkge1xuXG4gICAgICAgIGdvb2dsZS5zZXRPbkxvYWRDYWxsYmFjaygoKSA9PiB7XG5cbiAgICAgICAgICAgIHZhciByZWdpb25JZHMgPSB0aGlzLnBhcmFtcy5yZWdpb25zLm1hcChmdW5jdGlvbihyZWdpb24pIHsgcmV0dXJuIHJlZ2lvbi5pZDsgfSk7XG4gICAgICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG5cbiAgICAgICAgICAgIGNvbnRyb2xsZXIuZ2V0T2NjdXBhdGlvbnNEYXRhKHJlZ2lvbklkcylcbiAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IHRoaXMuZHJhd09jY3VwYXRpb25zVGFibGUocmVnaW9uSWRzLCBkYXRhKSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZHJhd09jY3VwYXRpb25zVGFibGUocmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIHZhciBzID0gJzx0cj48dGg+PC90aD4nO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcyArPSAnPHRoIGNvbHNwYW49XFwnMlxcJz4nICsgdGhpcy5wYXJhbXMucmVnaW9uc1tpXS5uYW1lICsgJzwvdGg+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvLyBTdWIgaGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHMgKz0gJzwvdHI+PHRyPjx0ZCBjbGFzcz1cXCdjb2x1bW4taGVhZGVyXFwnPjwvdGQ+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0ZCBjbGFzcz1cXCdjb2x1bW4taGVhZGVyXFwnPlBlcmNlbnQ8L3RkPjx0ZCBjbGFzcz1cXCdjb2x1bW4taGVhZGVyXFwnPlBlcmNlbnRpbGU8L3RkPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICBpZiAoKGkgJSByZWdpb25JZHMubGVuZ3RoKSA9PSAwKVxuICAgICAgICAgICAgICAgIHMgKz0gJzwvdHI+PHRyPjx0ZD4nICsgZGF0YVtpXS5vY2N1cGF0aW9uICsgJzwvdGQ+JzsgXG4gICAgXG4gICAgICAgICAgICB2YXIgdG90YWxSYW5rcyA9IHBhcnNlSW50KGRhdGFbaV0udG90YWxfcmFua3MpO1xuICAgICAgICAgICAgdmFyIHJhbmsgPSBwYXJzZUludChkYXRhW2ldLnBlcmNlbnRfZW1wbG95ZWRfcmFuayk7XG4gICAgICAgICAgICB2YXIgcGVyY2VudGlsZSA9IHBhcnNlSW50KCgodG90YWxSYW5rcyAtIHJhbmspIC8gdG90YWxSYW5rcykgKiAxMDApO1xuICAgIFxuICAgICAgICAgICAgcyArPSAnPHRkPicgKyBudW1lcmFsKGRhdGFbaV0ucGVyY2VudF9lbXBsb3llZCkuZm9ybWF0KCcwLjAnKSArICclPC90ZD4nO1xuICAgICAgICAgICAgcyArPSAnPHRkPicgKyBudW1lcmFsKHBlcmNlbnRpbGUpLmZvcm1hdCgnMG8nKSArICc8L3RkPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgcyArPSAnPC90cj4nO1xuICAgIFxuICAgICAgICAkKCcjb2NjdXBhdGlvbnMtdGFibGUnKS5odG1sKHMpO1xuICAgIH1cbiAgICBcbiAgICAvLyBQb3B1bGF0aW9uXG4gICAgLy9cbiAgICBkcmF3UG9wdWxhdGlvbkRhdGEoKSB7XG5cbiAgICAgICAgZ29vZ2xlLnNldE9uTG9hZENhbGxiYWNrKCgpID0+IHtcblxuICAgICAgICAgICAgdmFyIHJlZ2lvbklkcyA9IHRoaXMucGFyYW1zLnJlZ2lvbnMubWFwKGZ1bmN0aW9uKHJlZ2lvbikgeyByZXR1cm4gcmVnaW9uLmlkOyB9KTtcbiAgICAgICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcblxuICAgICAgICAgICAgY29udHJvbGxlci5nZXRQb3B1bGF0aW9uRGF0YShyZWdpb25JZHMpXG4gICAgICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7IFxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BvcHVsYXRpb25NYXAoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3UG9wdWxhdGlvbkNoYXJ0KHJlZ2lvbklkcywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BvcHVsYXRpb25DaGFuZ2VDaGFydChyZWdpb25JZHMsIGRhdGEpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRyYXdQb3B1bGF0aW9uQ2hhcnQocmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIHZhciBjaGFydERhdGEgPSBbXTtcbiAgICAgICAgdmFyIHllYXI7XG4gICAgXG4gICAgICAgIC8vIEhlYWRlclxuICAgICAgICAvL1xuICAgICAgICB2YXIgaGVhZGVyID0gWydZZWFyJ107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBoZWFkZXJbaSArIDFdID0gdGhpcy5wYXJhbXMucmVnaW9uc1tpXS5uYW1lO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGNoYXJ0RGF0YS5wdXNoKGhlYWRlcik7XG4gICAgXG4gICAgICAgIC8vIERhdGFcbiAgICAgICAgLy9cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgbSA9IChpICUgcmVnaW9uSWRzLmxlbmd0aCk7XG4gICAgXG4gICAgICAgICAgICBpZiAobSA9PSAwKSB7XG4gICAgXG4gICAgICAgICAgICAgICAgeWVhciA9IFtdO1xuICAgICAgICAgICAgICAgIHllYXJbMF0gPSBkYXRhW2ldLnllYXI7XG4gICAgICAgICAgICAgICAgY2hhcnREYXRhLnB1c2goeWVhcik7XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICB5ZWFyW20gKyAxXSA9IHBhcnNlSW50KGRhdGFbaV0ucG9wdWxhdGlvbik7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgdGhpcy5kcmF3TGluZUNoYXJ0KCdwb3B1bGF0aW9uLWNoYXJ0JywgY2hhcnREYXRhLCB7XG4gICAgXG4gICAgICAgICAgICBjdXJ2ZVR5cGUgOiAnZnVuY3Rpb24nLFxuICAgICAgICAgICAgbGVnZW5kIDogeyBwb3NpdGlvbiA6ICdib3R0b20nIH0sXG4gICAgICAgICAgICBwb2ludFNoYXBlIDogJ3NxdWFyZScsXG4gICAgICAgICAgICBwb2ludFNpemUgOiA4LFxuICAgICAgICAgICAgdGl0bGUgOiAnUG9wdWxhdGlvbicsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBkcmF3UG9wdWxhdGlvbkNoYW5nZUNoYXJ0KHJlZ2lvbklkcywgZGF0YSkge1xuICAgIFxuICAgICAgICB2YXIgY2hhcnREYXRhID0gW107XG4gICAgICAgIHZhciB5ZWFyO1xuICAgIFxuICAgICAgICAvLyBIZWFkZXJcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGhlYWRlciA9IFsnWWVhciddO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaGVhZGVyW2kgKyAxXSA9IHRoaXMucGFyYW1zLnJlZ2lvbnNbaV0ubmFtZTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBjaGFydERhdGEucHVzaChoZWFkZXIpO1xuICAgIFxuICAgICAgICAvLyBEYXRhXG4gICAgICAgIC8vXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIFxuICAgICAgICAgICAgdmFyIG0gPSAoaSAlIHJlZ2lvbklkcy5sZW5ndGgpO1xuICAgIFxuICAgICAgICAgICAgaWYgKG0gPT0gMCkge1xuICAgIFxuICAgICAgICAgICAgICAgIHllYXIgPSBbXTtcbiAgICAgICAgICAgICAgICB5ZWFyWzBdID0gZGF0YVtpXS55ZWFyO1xuICAgICAgICAgICAgICAgIGNoYXJ0RGF0YS5wdXNoKHllYXIpO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgeWVhclttICsgMV0gPSBwYXJzZUZsb2F0KGRhdGFbaV0ucG9wdWxhdGlvbl9wZXJjZW50X2NoYW5nZSkgLyAxMDA7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgdGhpcy5kcmF3TGluZUNoYXJ0KCdwb3B1bGF0aW9uLWNoYW5nZS1jaGFydCcsIGNoYXJ0RGF0YSwge1xuICAgIFxuICAgICAgICAgICAgY3VydmVUeXBlIDogJ2Z1bmN0aW9uJyxcbiAgICAgICAgICAgIGxlZ2VuZCA6IHsgcG9zaXRpb24gOiAnYm90dG9tJyB9LFxuICAgICAgICAgICAgcG9pbnRTaGFwZSA6ICdzcXVhcmUnLFxuICAgICAgICAgICAgcG9pbnRTaXplIDogOCxcbiAgICAgICAgICAgIHRpdGxlIDogJ1BvcHVsYXRpb24gQ2hhbmdlJyxcbiAgICAgICAgICAgIHZBeGlzIDogeyBmb3JtYXQgOiAnIy4jJScgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRyYXdQb3B1bGF0aW9uTWFwKCkge1xuICAgIFxuICAgICAgICB2YXIgbWFwID0gTC5tYXAoXG4gICAgICAgICAgICAnbWFwJyxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB6b29tQ29udHJvbCA6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgbWFwLnNldFZpZXcodGhpcy5NQVBfSU5JVElBTF9DRU5URVIsIHRoaXMuTUFQX0lOSVRJQUxfWk9PTSk7XG5cbiAgICAgICAgTC50aWxlTGF5ZXIoJ2h0dHBzOi8vYS50aWxlcy5tYXBib3guY29tL3YzL3NvY3JhdGEtYXBwcy5pYnAwbDg5OS97en0ve3h9L3t5fS5wbmcnKS5hZGRUbyhtYXApO1xuICAgIH1cbiAgICBcbiAgICAvLyBQbGFjZXMgaW4gcmVnaW9uXG4gICAgLy9cbiAgICBkcmF3UGxhY2VzSW5SZWdpb24oKSB7XG5cbiAgICAgICAgaWYgKHRoaXMucGFyYW1zLnJlZ2lvbnMubGVuZ3RoID09IDApIFxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHZhciByZWdpb24gPSB0aGlzLnBhcmFtcy5yZWdpb25zWzBdO1xuXG4gICAgICAgIHN3aXRjaCAocmVnaW9uLnR5cGUpIHtcblxuICAgICAgICAgICAgY2FzZSAnbmF0aW9uJzogdGhpcy5kcmF3Q2hpbGRQbGFjZXNJblJlZ2lvbihyZWdpb24sICdSZWdpb25zIGluIHswfScuZm9ybWF0KHJlZ2lvbi5uYW1lKSk7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncmVnaW9uJzogdGhpcy5kcmF3Q2hpbGRQbGFjZXNJblJlZ2lvbihyZWdpb24sICdEaXZpc2lvbnMgaW4gezB9Jy5mb3JtYXQocmVnaW9uLm5hbWUpKTsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkaXZpc2lvbic6IHRoaXMuZHJhd0NoaWxkUGxhY2VzSW5SZWdpb24ocmVnaW9uLCAnU3RhdGVzIGluIHswfScuZm9ybWF0KHJlZ2lvbi5uYW1lKSk7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnc3RhdGUnOiB0aGlzLmRyYXdDaXRpZXNBbmRDb3VudGllc0luU3RhdGUocmVnaW9uKTsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjb3VudHknOiB0aGlzLmRyYXdPdGhlckNvdW50aWVzSW5TdGF0ZShyZWdpb24pOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ21zYSc6IHRoaXMuZHJhd090aGVyTWV0cm9zSW5TdGF0ZShyZWdpb24pOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3BsYWNlJzogdGhpcy5kcmF3T3RoZXJDaXRpZXNJblN0YXRlKHJlZ2lvbik7IGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZHJhd0NoaWxkUGxhY2VzSW5SZWdpb24ocmVnaW9uLCBsYWJlbCkge1xuXG4gICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcblxuICAgICAgICBjb250cm9sbGVyLmdldENoaWxkUmVnaW9ucyhyZWdpb24uaWQpXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BsYWNlc0luUmVnaW9uSGVhZGVyKCcjcGxhY2VzLWluLXJlZ2lvbi1oZWFkZXItMCcsIGxhYmVsKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdQbGFjZXNJblJlZ2lvbkxpc3QoJyNwbGFjZXMtaW4tcmVnaW9uLWxpc3QtMCcsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgIH1cblxuICAgIGRyYXdDaXRpZXNBbmRDb3VudGllc0luU3RhdGUocmVnaW9uKSB7XG5cbiAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuICAgICAgICB2YXIgY2l0aWVzUHJvbWlzZSA9IGNvbnRyb2xsZXIuZ2V0Q2l0aWVzSW5TdGF0ZShyZWdpb24uaWQpO1xuICAgICAgICB2YXIgY291bnRpZXNQcm9taXNlID0gY29udHJvbGxlci5nZXRDb3VudGllc0luU3RhdGUocmVnaW9uLmlkKTtcblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoW2NpdGllc1Byb21pc2UsIGNvdW50aWVzUHJvbWlzZV0pXG4gICAgICAgICAgICAudGhlbih2YWx1ZXMgPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlcy5sZW5ndGggPT0gMClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlc1swXS5sZW5ndGggPiAwKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3UGxhY2VzSW5SZWdpb25IZWFkZXIoJyNwbGFjZXMtaW4tcmVnaW9uLWhlYWRlci0wJywgJ1BsYWNlcyBpbiB7MH0nLmZvcm1hdChyZWdpb24ubmFtZSkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdQbGFjZXNJblJlZ2lvbkxpc3QoJyNwbGFjZXMtaW4tcmVnaW9uLWxpc3QtMCcsIHZhbHVlc1swXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZXNbMV0ubGVuZ3RoID4gMCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BsYWNlc0luUmVnaW9uSGVhZGVyKCcjcGxhY2VzLWluLXJlZ2lvbi1oZWFkZXItMScsICdDb3VudGllcyBpbiB7MH0nLmZvcm1hdChyZWdpb24ubmFtZSkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdQbGFjZXNJblJlZ2lvbkxpc3QoJyNwbGFjZXMtaW4tcmVnaW9uLWxpc3QtMScsIHZhbHVlc1sxXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgfVxuXG4gICAgZHJhd090aGVyQ2l0aWVzSW5TdGF0ZShyZWdpb24pIHtcblxuICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG5cbiAgICAgICAgY29udHJvbGxlci5nZXRQYXJlbnRTdGF0ZShyZWdpb24pXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmxlbmd0aCA9PSAwKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgXG4gICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gcmVzcG9uc2VbMF07XG4gICAgXG4gICAgICAgICAgICAgICAgY29udHJvbGxlci5nZXRDaXRpZXNJblN0YXRlKHN0YXRlLnBhcmVudF9pZClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5sZW5ndGggPT0gMClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3UGxhY2VzSW5SZWdpb25IZWFkZXIoJyNwbGFjZXMtaW4tcmVnaW9uLWhlYWRlci0wJywgJ1BsYWNlcyBpbiB7MH0nLmZvcm1hdChzdGF0ZS5wYXJlbnRfbmFtZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3UGxhY2VzSW5SZWdpb25MaXN0KCcjcGxhY2VzLWluLXJlZ2lvbi1saXN0LTAnLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkcmF3T3RoZXJDb3VudGllc0luU3RhdGUocmVnaW9uKSB7XG5cbiAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuXG4gICAgICAgIGNvbnRyb2xsZXIuZ2V0UGFyZW50U3RhdGUocmVnaW9uKVxuICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgIFxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5sZW5ndGggPT0gMClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgIFxuICAgICAgICAgICAgICAgIHZhciBzdGF0ZSA9IHJlc3BvbnNlWzBdO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIuZ2V0Q291bnRpZXNJblN0YXRlKHN0YXRlLnBhcmVudF9pZClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5sZW5ndGggPT0gMClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3UGxhY2VzSW5SZWdpb25IZWFkZXIoJyNwbGFjZXMtaW4tcmVnaW9uLWhlYWRlci0wJywgJ0NvdW50aWVzIGluIHswfScuZm9ybWF0KHN0YXRlLnBhcmVudF9uYW1lKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdQbGFjZXNJblJlZ2lvbkxpc3QoJyNwbGFjZXMtaW4tcmVnaW9uLWxpc3QtMCcsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRyYXdPdGhlck1ldHJvc0luU3RhdGUocmVnaW9uKSB7XG5cbiAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuXG4gICAgICAgIGNvbnRyb2xsZXIuZ2V0UGFyZW50U3RhdGUocmVnaW9uKVxuICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgIFxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5sZW5ndGggPT0gMClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgIFxuICAgICAgICAgICAgICAgIHZhciBzdGF0ZSA9IHJlc3BvbnNlWzBdO1xuICAgIFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIuZ2V0TWV0cm9zSW5TdGF0ZShzdGF0ZS5wYXJlbnRfaWQpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UubGVuZ3RoID09IDApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BsYWNlc0luUmVnaW9uSGVhZGVyKCcjcGxhY2VzLWluLXJlZ2lvbi1oZWFkZXItMCcsICdNZXRyb3BvbGl0YW4gQXJlYXMgaW4gezB9Jy5mb3JtYXQoc3RhdGUucGFyZW50X25hbWUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BsYWNlc0luUmVnaW9uTGlzdCgnI3BsYWNlcy1pbi1yZWdpb24tbGlzdC0wJywgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVtb3ZlQ3VycmVudFJlZ2lvbnMocmVnaW9ucywgbWF4Q291bnQgPSA1KSB7XG5cbiAgICAgICAgdmFyIGNvdW50ID0gMDtcbiAgICAgICAgdmFyIHJnID0gW107XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25zLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmlzUmVnaW9uSWRDb250YWluZWRJbkN1cnJlbnRSZWdpb25zKHJlZ2lvbnNbaV0uY2hpbGRfaWQpKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICByZy5wdXNoKHJlZ2lvbnNbaV0pO1xuXG4gICAgICAgICAgICBpZiAoY291bnQgPT0gKG1heENvdW50IC0gMSkpXG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmc7XG4gICAgfVxuXG4gICAgZHJhd1BsYWNlc0luUmVnaW9uSGVhZGVyKGhlYWRlcklkLCBsYWJlbCkge1xuXG4gICAgICAgICQoaGVhZGVySWQpLnRleHQobGFiZWwpLnNsaWRlVG9nZ2xlKDEwMCk7XG4gICAgfVxuXG4gICAgZHJhd1BsYWNlc0luUmVnaW9uTGlzdChsaXN0SWQsIGRhdGEsIG1heENvdW50ID0gNSkge1xuXG4gICAgICAgIHZhciBzID0gJyc7XG5cbiAgICAgICAgaWYgKGRhdGEubGVuZ3RoID09IDApXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgdmFyIGNvdW50ID0gMDtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgaWYgKHRoaXMuaXNSZWdpb25JZENvbnRhaW5lZEluQ3VycmVudFJlZ2lvbnMoZGF0YVtpXS5jaGlsZF9pZCkpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgIHMgKz0gJzxsaT48YSBocmVmPVwiJztcbiAgICAgICAgICAgIHMgKz0gdGhpcy5nZXRTZWFyY2hQYWdlRm9yUmVnaW9uc0FuZFZlY3RvclVybChkYXRhW2ldLmNoaWxkX25hbWUpICsgJ1wiPic7XG4gICAgICAgICAgICBzICs9IGRhdGFbaV0uY2hpbGRfbmFtZTtcbiAgICAgICAgICAgIHMgKz0gJzwvYT48L2xpPic7XG5cbiAgICAgICAgICAgIGlmIChjb3VudCA9PSAobWF4Q291bnQgLSAxKSlcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgfVxuXG4gICAgICAgICQobGlzdElkKS5odG1sKHMpO1xuICAgICAgICAkKGxpc3RJZCkuc2xpZGVUb2dnbGUoMTAwKTtcbiAgICB9XG5cbiAgICBpc1JlZ2lvbklkQ29udGFpbmVkSW5DdXJyZW50UmVnaW9ucyhyZWdpb25JZCkge1xuXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5wYXJhbXMucmVnaW9ucy5sZW5ndGg7IGorKykge1xuXG4gICAgICAgICAgICBpZiAocmVnaW9uSWQgPT0gdGhpcy5wYXJhbXMucmVnaW9uc1tqXS5pZClcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBTaW1pbGFyIHJlZ2lvbnNcbiAgICAvL1xuICAgIGRyYXdTaW1pbGFyUmVnaW9ucyhvbkNsaWNrUmVnaW9uKSB7XG5cbiAgICAgICAgaWYgKHRoaXMucGFyYW1zLnJlZ2lvbnMubGVuZ3RoID09IDApIFxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHZhciByZWdpb24gPSB0aGlzLnBhcmFtcy5yZWdpb25zWzBdO1xuICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG5cbiAgICAgICAgY29udHJvbGxlci5nZXRTaW1pbGFyUmVnaW9ucyhyZWdpb24uaWQpXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHRoaXMuZHJhd1NpbWlsYXJSZWdpb25zTGlzdChkYXRhLCBvbkNsaWNrUmVnaW9uKSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgfVxuXG4gICAgZHJhd1NpbWlsYXJSZWdpb25zTGlzdChkYXRhLCBvbkNsaWNrUmVnaW9uKSB7XG5cbiAgICAgICAgdmFyIHMgPSAnJztcblxuICAgICAgICBpZiAoZGF0YS5tb3N0X3NpbWlsYXIgPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHZhciBjb3VudCA9IDA7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLm1vc3Rfc2ltaWxhci5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5pc1JlZ2lvbklkQ29udGFpbmVkSW5DdXJyZW50UmVnaW9ucyhkYXRhLm1vc3Rfc2ltaWxhcltpXS5pZCkpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgIHMgKz0gJzxsaT48YT48aSBjbGFzcz1cImZhIGZhLXBsdXNcIj48L2k+JyArIGRhdGEubW9zdF9zaW1pbGFyW2ldLm5hbWUgKyAnPC9hPjwvbGk+J1xuXG4gICAgICAgICAgICBpZiAoY291bnQgPT0gNClcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAkKCcjc2ltaWxhci1yZWdpb25zJykuaHRtbChzKTtcbiAgICAgICAgJCgnI3NpbWlsYXItcmVnaW9ucycpLnNsaWRlVG9nZ2xlKDEwMCk7XG4gICAgICAgIFxuICAgICAgICAkKCcjc2ltaWxhci1yZWdpb25zIGxpIGEnKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICBcbiAgICAgICAgICAgIHZhciBpbmRleCA9ICQodGhpcykucGFyZW50KCkuaW5kZXgoKTtcbiAgICAgICAgICAgIG9uQ2xpY2tSZWdpb24oZGF0YS5tb3N0X3NpbWlsYXJbaW5kZXhdLm5hbWUpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgLy8gRHJhdyBjaGFydHNcbiAgICAvL1xuICAgIGRyYXdMaW5lQ2hhcnQoY2hhcnRJZCwgZGF0YSwgb3B0aW9ucykge1xuICAgIFxuICAgICAgICB2YXIgZGF0YVRhYmxlID0gZ29vZ2xlLnZpc3VhbGl6YXRpb24uYXJyYXlUb0RhdGFUYWJsZShkYXRhKTtcbiAgICAgICAgdmFyIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkxpbmVDaGFydChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjaGFydElkKSk7XG4gICAgXG4gICAgICAgIGNoYXJ0LmRyYXcoZGF0YVRhYmxlLCBvcHRpb25zKTtcbiAgICB9XG4gICAgXG4gICAgZHJhd1N0ZXBwZWRBcmVhQ2hhcnQoY2hhcnRJZCwgZGF0YSwgb3B0aW9ucykge1xuICAgIFxuICAgICAgICB2YXIgZGF0YVRhYmxlID0gZ29vZ2xlLnZpc3VhbGl6YXRpb24uYXJyYXlUb0RhdGFUYWJsZShkYXRhKTtcbiAgICAgICAgdmFyIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLlN0ZXBwZWRBcmVhQ2hhcnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY2hhcnRJZCkpO1xuICAgIFxuICAgICAgICBjaGFydC5kcmF3KGRhdGFUYWJsZSwgb3B0aW9ucyk7XG4gICAgfVxuICAgIFxuICAgIC8vIFBhZ2luZ1xuICAgIC8vXG4gICAgZmV0Y2hOZXh0UGFnZSgpIHtcbiAgICBcbiAgICAgICAgaWYgKHRoaXMuZmV0Y2hpbmcgfHwgdGhpcy5mZXRjaGVkQWxsKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgIFxuICAgICAgICB0aGlzLmZldGNoaW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pbmNyZW1lbnRQYWdlKCk7XG4gICAgXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBcbiAgICAgICAgJC5hamF4KHRoaXMuZ2V0U2VhcmNoUmVzdWx0c1VybCgpKS5kb25lKGZ1bmN0aW9uKGRhdGEsIHRleHRTdGF0dXMsIGpxWEhSKSB7XG5cbiAgICAgICAgICAgIGlmIChqcVhIUi5zdGF0dXMgPT0gMjA0KSB7IC8vIG5vIGNvbnRlbnRcbiAgICBcbiAgICAgICAgICAgICAgICBzZWxmLmRlY3JlbWVudFBhZ2UoKTtcbiAgICAgICAgICAgICAgICBzZWxmLmZldGNoaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc2VsZi5mZXRjaGVkQWxsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICAkKCcuZGF0YXNldHMnKS5hcHBlbmQoZGF0YSk7XG4gICAgICAgICAgICBzZWxmLmZldGNoaW5nID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBnZXRTZWFyY2hQYWdlRm9yUmVnaW9uc0FuZFZlY3RvclVybChyZWdpb25zLCB2ZWN0b3IsIHNlYXJjaFJlc3VsdHMsIHF1ZXJ5U3RyaW5nKSB7XG4gICAgXG4gICAgICAgIHZhciB1cmwgPSAnLyc7XG4gICAgXG4gICAgICAgIGlmICh0eXBlb2YocmVnaW9ucykgPT09ICdzdHJpbmcnKSB7XG4gICAgXG4gICAgICAgICAgICB1cmwgKz0gcmVnaW9ucy5yZXBsYWNlKC8sL2csICcnKS5yZXBsYWNlKC8gL2csICdfJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZWdpb25zKSkge1xuICAgIFxuICAgICAgICAgICAgdmFyIHJlZ2lvbk5hbWVzID0gW107XG4gICAgXG4gICAgICAgICAgICByZWdpb25OYW1lcyA9IHJlZ2lvbnMubWFwKGZ1bmN0aW9uKHJlZ2lvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWdpb24ucmVwbGFjZSgvLC9nLCAnJykucmVwbGFjZSgvIC9nLCAnXycpO1xuICAgICAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICAgICB1cmwgKz0gcmVnaW9uTmFtZXMuam9pbignX3ZzXycpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgIFxuICAgICAgICAgICAgdXJsICs9ICdzZWFyY2gnO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGlmICh2ZWN0b3IpXG4gICAgICAgICAgICB1cmwgKz0gJy8nICsgdmVjdG9yO1xuICAgIFxuICAgICAgICBpZiAoc2VhcmNoUmVzdWx0cylcbiAgICAgICAgICAgIHVybCArPSAnL3NlYXJjaC1yZXN1bHRzJztcbiAgICBcbiAgICAgICAgaWYgKHF1ZXJ5U3RyaW5nKSBcbiAgICAgICAgICAgIHVybCArPSBxdWVyeVN0cmluZztcbiAgICBcbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICB9XG4gICAgXG4gICAgZ2V0U2VhcmNoUGFnZVVybChzZWFyY2hSZXN1bHRzKSB7XG5cbiAgICAgICAgaWYgKCh0aGlzLnBhcmFtcy5yZWdpb25zLmxlbmd0aCA+IDApIHx8IHRoaXMucGFyYW1zLmF1dG9TdWdnZXN0ZWRSZWdpb24pIHtcblxuICAgICAgICAgICAgdmFyIHJlZ2lvbk5hbWVzID0gW107XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmFtcy5yZXNldFJlZ2lvbnMgPT0gZmFsc2UpIHtcblxuICAgICAgICAgICAgICAgIHJlZ2lvbk5hbWVzID0gdGhpcy5wYXJhbXMucmVnaW9ucy5tYXAoZnVuY3Rpb24ocmVnaW9uKSB7IFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVnaW9uLm5hbWU7IFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJhbXMuYXV0b1N1Z2dlc3RlZFJlZ2lvbilcbiAgICAgICAgICAgICAgICByZWdpb25OYW1lcy5wdXNoKHRoaXMucGFyYW1zLmF1dG9TdWdnZXN0ZWRSZWdpb24pO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRTZWFyY2hQYWdlRm9yUmVnaW9uc0FuZFZlY3RvclVybChyZWdpb25OYW1lcywgdGhpcy5wYXJhbXMudmVjdG9yLCBzZWFyY2hSZXN1bHRzLCB0aGlzLmdldFNlYXJjaFF1ZXJ5U3RyaW5nKCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRTZWFyY2hQYWdlRm9yUmVnaW9uc0FuZFZlY3RvclVybChudWxsLCB0aGlzLnBhcmFtcy52ZWN0b3IsIHNlYXJjaFJlc3VsdHMsIHRoaXMuZ2V0U2VhcmNoUXVlcnlTdHJpbmcoKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgZ2V0U2VhcmNoUmVzdWx0c1VybCgpIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZXRTZWFyY2hQYWdlVXJsKHRydWUpO1xuICAgIH1cblxuICAgIGdldFNlYXJjaFF1ZXJ5U3RyaW5nKCkge1xuXG4gICAgICAgIHZhciB1cmwgPSAnP3E9JyArIGVuY29kZVVSSUNvbXBvbmVudCh0aGlzLnBhcmFtcy5xKTtcblxuICAgICAgICBpZiAodGhpcy5wYXJhbXMucGFnZSA+IDEpXG4gICAgICAgICAgICB1cmwgKz0gJyZwYWdlPScgKyB0aGlzLnBhcmFtcy5wYWdlO1xuXG4gICAgICAgIGlmICh0aGlzLnBhcmFtcy5jYXRlZ29yaWVzLmxlbmd0aCA+IDApXG4gICAgICAgICAgICB1cmwgKz0gJyZjYXRlZ29yaWVzPScgKyBlbmNvZGVVUklDb21wb25lbnQodGhpcy5wYXJhbXMuY2F0ZWdvcmllcy5qb2luKCcsJykpO1xuXG4gICAgICAgIGlmICh0aGlzLnBhcmFtcy5kb21haW5zLmxlbmd0aCA+IDApXG4gICAgICAgICAgICB1cmwgKz0gJyZkb21haW5zPScgKyBlbmNvZGVVUklDb21wb25lbnQodGhpcy5wYXJhbXMuZG9tYWlucy5qb2luKCcsJykpO1xuXG4gICAgICAgIGlmICh0aGlzLnBhcmFtcy5zdGFuZGFyZHMubGVuZ3RoID4gMClcbiAgICAgICAgICAgIHVybCArPSAnJnN0YW5kYXJkcz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMucGFyYW1zLnN0YW5kYXJkcy5qb2luKCcsJykpO1xuXG4gICAgICAgIGlmICh0aGlzLnBhcmFtcy5kZWJ1ZylcbiAgICAgICAgICAgIHVybCArPSAnJmRlYnVnPSc7XG5cbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICB9XG5cbiAgICBpbmNyZW1lbnRQYWdlKCkge1xuICAgIFxuICAgICAgICB0aGlzLnBhcmFtcy5wYWdlKys7XG4gICAgfVxuICAgIFxuICAgIG5hdmlnYXRlKCkge1xuICAgIFxuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHRoaXMuZ2V0U2VhcmNoUGFnZVVybCgpO1xuICAgIH1cbiAgICBcbiAgICByZW1vdmVSZWdpb24ocmVnaW9uSW5kZXgpIHtcbiAgICBcbiAgICAgICAgdGhpcy5wYXJhbXMucmVnaW9ucy5zcGxpY2UocmVnaW9uSW5kZXgsIDEpOyAvLyByZW1vdmUgYXQgaW5kZXggaVxuICAgICAgICB0aGlzLnBhcmFtcy5wYWdlID0gMTtcbiAgICB9XG4gICAgXG4gICAgc2V0QXV0b1N1Z2dlc3RlZFJlZ2lvbihyZWdpb24sIHJlc2V0UmVnaW9ucykge1xuICAgIFxuICAgICAgICB0aGlzLnBhcmFtcy5hdXRvU3VnZ2VzdGVkUmVnaW9uID0gcmVnaW9uO1xuICAgICAgICB0aGlzLnBhcmFtcy5yZXNldFJlZ2lvbnMgPSByZXNldFJlZ2lvbnM7XG4gICAgICAgIHRoaXMucGFyYW1zLnBhZ2UgPSAxO1xuICAgIH1cbiAgICBcbiAgICB0b2dnbGVDYXRlZ29yeShjYXRlZ29yeSkge1xuICAgIFxuICAgICAgICB2YXIgaSA9IHRoaXMucGFyYW1zLmNhdGVnb3JpZXMuaW5kZXhPZihjYXRlZ29yeSk7XG4gICAgXG4gICAgICAgIGlmIChpID4gLTEpXG4gICAgICAgICAgICB0aGlzLnBhcmFtcy5jYXRlZ29yaWVzLnNwbGljZShpLCAxKTsgLy8gcmVtb3ZlIGF0IGluZGV4IGlcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5wYXJhbXMuY2F0ZWdvcmllcy5wdXNoKGNhdGVnb3J5KTtcbiAgICB9XG4gICAgXG4gICAgdG9nZ2xlRG9tYWluKGRvbWFpbikge1xuICAgIFxuICAgICAgICB2YXIgaSA9IHRoaXMucGFyYW1zLmRvbWFpbnMuaW5kZXhPZihkb21haW4pO1xuICAgIFxuICAgICAgICBpZiAoaSA+IC0xKVxuICAgICAgICAgICAgdGhpcy5wYXJhbXMuZG9tYWlucy5zcGxpY2UoaSwgMSk7IC8vIHJlbW92ZSBhdCBpbmRleCBpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMucGFyYW1zLmRvbWFpbnMucHVzaChkb21haW4pO1xuICAgIH1cbiAgICBcbiAgICB0b2dnbGVTdGFuZGFyZChzdGFuZGFyZCkge1xuICAgIFxuICAgICAgICB2YXIgaSA9IHRoaXMucGFyYW1zLnN0YW5kYXJkcy5pbmRleE9mKHN0YW5kYXJkKTtcbiAgICBcbiAgICAgICAgaWYgKGkgPiAtMSlcbiAgICAgICAgICAgIHRoaXMucGFyYW1zLnN0YW5kYXJkcy5zcGxpY2UoaSwgMSk7IC8vIHJlbW92ZSBhdCBpbmRleCBpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMucGFyYW1zLnN0YW5kYXJkcy5wdXNoKHN0YW5kYXJkKTtcbiAgICB9XG59Il19
//# sourceMappingURL=v4-search-page-controller.js.map
