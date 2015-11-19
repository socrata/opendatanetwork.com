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

        // Health
        //

    }, {
        key: 'drawHealthData',
        value: function drawHealthData() {
            var _this4 = this;

            google.setOnLoadCallback(function () {

                var regionIds = _this4.params.regions.map(function (region) {
                    return region.id;
                });
                var controller = new ApiController();

                controller.getHealthRwjfChrData(regionIds).then(function (data) {
                    return _this4.drawRwjfChrTable(regionIds, data);
                }).catch(function (error) {
                    return console.error(error);
                });
            });
        }
    }, {
        key: 'drawRwjfChrTableRow',
        value: function drawRwjfChrTableRow(regionIds, data, first_td, var_label, var_key, fmt_str) {
            var addl_fmt = arguments.length <= 6 || arguments[6] === undefined ? '' : arguments[6];

            var s = '<tr>' + first_td + '<td>' + var_label + '</td>';
            for (var i = 0; i < regionIds.length; i++) {
                s += '<td>';
                if (data[i] && data[i][var_key]) {
                    s += numeral(data[i][var_key].replace(',', '')).format(fmt_str) + addl_fmt;
                } else {
                    s += '';
                }
                s += '</td>';
            }
            s += '</tr>';
            return s;
        }
    }, {
        key: 'drawRwjfChrTable',
        value: function drawRwjfChrTable(regionIds, data) {

            var s = '';

            // first row, which is region names
            s += '<tr><th></th><th></th>';
            for (var i = 0; i < regionIds.length; i++) {
                s += '<th>' + this.params.regions[i].name + '</th>';
            }
            s += '</tr>';

            // HEALTH OUTCOMES
            s += '<tr><td colspan=' + numeral(regionIds.length) + 1 + '>HEALTH OUTCOMES</td></tr>';
            // health outcomes - length of life - 1 measure
            s += this.drawRwjfChrTableRow(regionIds, data, '<td rowspan=1>Length of Life</td>', 'Premature Death', 'premature_death_value', '0,0');
            // health outcomes - quality of life - 4 measures
            s += this.drawRwjfChrTableRow(regionIds, data, '<td rowspan=4>Quality of Life</td>', 'Poor or fair health', 'poor_or_fair_health_value', '0.0%');
            s += this.drawRwjfChrTableRow(regionIds, data, '', 'Poor physical health days', 'poor_physical_health_days_value', '0.0');
            s += this.drawRwjfChrTableRow(regionIds, data, '', 'Poor mental health days', 'poor_mental_health_days_value', '0.0');
            s += this.drawRwjfChrTableRow(regionIds, data, '', 'Low birthweight', 'low_birthweight_value', '0.0%');

            // HEALTH FACTORS
            s += '<tr><td colspan=' + numeral(regionIds.length) + 1 + '>HEALTH FACTORS</td></tr>';
            // health outcomes - health factors - 9 measures
            s += this.drawRwjfChrTableRow(regionIds, data, '<td rowspan=9>Health Behaviors</td>', 'Adult smoking', 'adult_smoking_value', '0.0%');
            s += this.drawRwjfChrTableRow(regionIds, data, '', 'Adult obesity', 'adult_obesity_value', '0.0%');
            s += this.drawRwjfChrTableRow(regionIds, data, '', 'Food environment index', 'food_environment_index_value', '0.0');
            s += this.drawRwjfChrTableRow(regionIds, data, '', 'Physical inactivity', 'physical_inactivity_value', '0.0%');
            s += this.drawRwjfChrTableRow(regionIds, data, '', 'Access to exercise opportunities', 'access_to_exercise_opportunities_value', '0.0%');
            s += this.drawRwjfChrTableRow(regionIds, data, '', 'Excessive drinking', 'excessive_drinking_value', '0.0%');
            s += this.drawRwjfChrTableRow(regionIds, data, '', 'Alcohol-impaired driving deaths', 'alcohol_impaired_driving_deaths_value', '0.0%');
            s += this.drawRwjfChrTableRow(regionIds, data, '', 'Sexually transmitted infections', 'sexually_transmitted_infections_value', '0,0');
            s += this.drawRwjfChrTableRow(regionIds, data, '', 'Teen births', 'alcohol_impaired_driving_deaths_value', '0,0');
            // health outcomes - clinical care - 7 measures
            s += this.drawRwjfChrTableRow(regionIds, data, '<td rowspan=7>Clinical Care</td>', 'Uninsured', 'uninsured_value', '0.0%');
            s += this.drawRwjfChrTableRow(regionIds, data, '', 'Primary care physicians', 'primary_care_physicians_value', '0,0');
            s += this.drawRwjfChrTableRow(regionIds, data, '', 'Dentists', 'dentists_value', '0,0');
            s += this.drawRwjfChrTableRow(regionIds, data, '', 'Mental health providers', 'mental_health_providers_value', '0,0');
            s += this.drawRwjfChrTableRow(regionIds, data, '', 'Preventable hospital stays', 'preventable_hospital_stays_value', '0,0');
            s += this.drawRwjfChrTableRow(regionIds, data, '', 'Diabetic monitoring', 'diabetic_screening_value', '0.0%');
            s += this.drawRwjfChrTableRow(regionIds, data, '', 'Mammography screening', 'mammography_screening_value', '0.0%');

            // health outcomes - social and economic factors - 9 measures
            s += this.drawRwjfChrTableRow(regionIds, data, '<td rowspan=9>Social & Economic Factors</td>', 'High school graduation', 'high_school_graduation_value', '0.0%');
            s += this.drawRwjfChrTableRow(regionIds, data, '', 'Some college', 'some_college_value', '0.0%');
            s += this.drawRwjfChrTableRow(regionIds, data, '', 'Unemployment', 'unemployment_value', '0.0%');
            s += this.drawRwjfChrTableRow(regionIds, data, '', 'Children in poverty', 'children_in_poverty_value', '0.0%');
            s += this.drawRwjfChrTableRow(regionIds, data, '', 'Income inequality', 'income_inequality_value', '0.0');
            s += this.drawRwjfChrTableRow(regionIds, data, '', 'Children in single-parent households', 'children_in_single_parent_households_value', '0.0%');
            s += this.drawRwjfChrTableRow(regionIds, data, '', 'Social associations', 'social_associations_value', '0.0');
            s += this.drawRwjfChrTableRow(regionIds, data, '', 'Violent crime', 'violent_crime_value', '0.0');
            s += this.drawRwjfChrTableRow(regionIds, data, '', 'Injury deaths', 'injury_deaths_value', '0.0');

            // health outcomes - physical environment - 5 measures
            s += this.drawRwjfChrTableRow(regionIds, data, '<td rowspan=5>Physical Environment</td>', 'Air pollution - particulate matter', 'air_pollution_particulate_matter_value', '0.0');
            s += this.drawRwjfChrTableRow(regionIds, data, '', 'Drinking water violations', 'drinking_water_violations_value', '0.0%');
            s += this.drawRwjfChrTableRow(regionIds, data, '', 'Severe housing problems', 'severe_housing_problems_value', '0.0%');
            s += this.drawRwjfChrTableRow(regionIds, data, '', 'Driving alone to work', 'driving_alone_to_work_value', '0.0%');
            s += this.drawRwjfChrTableRow(regionIds, data, '', 'Long commute - driving alone', 'long_commute_driving_alone_value', '0.0%');

            $('#rwjf-county-health-rankings-table').html(s);
        }

        // Education
        //

    }, {
        key: 'drawEducationData',
        value: function drawEducationData() {
            var _this5 = this;

            google.setOnLoadCallback(function () {

                var regionIds = _this5.params.regions.map(function (region) {
                    return region.id;
                });
                var controller = new ApiController();

                controller.getEducationData(regionIds).then(function (data) {
                    return _this5.drawEducationTable(regionIds, data);
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
            var _this6 = this;

            google.setOnLoadCallback(function () {

                var regionIds = _this6.params.regions.map(function (region) {
                    return region.id;
                });
                var controller = new ApiController();

                controller.getGdpData(regionIds).then(function (data) {

                    _this6.drawGdpChart(regionIds, data);
                    _this6.drawGdpChangeChart(regionIds, data);
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
            var _this7 = this;

            google.setOnLoadCallback(function () {

                var regionIds = _this7.params.regions.map(function (region) {
                    return region.id;
                });
                var controller = new ApiController();

                controller.getOccupationsData(regionIds).then(function (data) {
                    return _this7.drawOccupationsTable(regionIds, data);
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
            var _this8 = this;

            google.setOnLoadCallback(function () {

                var regionIds = _this8.params.regions.map(function (region) {
                    return region.id;
                });
                var controller = new ApiController();

                controller.getPopulationData(regionIds).then(function (data) {

                    _this8.drawPopulationMap();
                    _this8.drawPopulationChart(regionIds, data);
                    _this8.drawPopulationChangeChart(regionIds, data);
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
            var _this9 = this;

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
                var regionPlaces = _this9.getPlacesForRegion(placesResponse);
                var populations = _.map(populatedPlaces, function (x) {
                    return x.value;
                });

                // Init map
                //
                var radiusScale = _this9.getRadiusScaleLog(populations);
                var colorScale = _this9.getColorScale(populations);

                var coordinates = regionPlaces[0].location.coordinates;
                var center = [coordinates[1], coordinates[0]];
                var map = L.map('map', { zoomControl: true });

                L.tileLayer('https://a.tiles.mapbox.com/v3/socrata-apps.ibp0l899/{z}/{x}/{y}.png').addTo(map);
                map.setView(center, _this9.MAP_INITIAL_ZOOM);

                // Populate map
                //
                _this9.drawCirclesForPlaces(map, populatedPlaces, radiusScale, colorScale);
                _this9.drawMarkersForPlaces(map, regionPlaces);
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
            var _this10 = this;

            var controller = new ApiController();

            controller.getChildRegions(region.id).then(function (response) {

                _this10.drawPlacesInRegionHeader('#places-in-region-header-0', label);
                _this10.drawPlacesInRegionList('#places-in-region-list-0', response);
            }).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'drawCitiesAndCountiesInState',
        value: function drawCitiesAndCountiesInState(region) {
            var _this11 = this;

            var controller = new ApiController();
            var citiesPromise = controller.getCitiesInState(region.id);
            var countiesPromise = controller.getCountiesInState(region.id);

            return Promise.all([citiesPromise, countiesPromise]).then(function (values) {

                if (values.length == 0) return;

                if (values[0].length > 0) {

                    _this11.drawPlacesInRegionHeader('#places-in-region-header-0', 'Places in {0}'.format(region.name));
                    _this11.drawPlacesInRegionList('#places-in-region-list-0', values[0]);
                }

                if (values[1].length > 0) {

                    _this11.drawPlacesInRegionHeader('#places-in-region-header-1', 'Counties in {0}'.format(region.name));
                    _this11.drawPlacesInRegionList('#places-in-region-list-1', values[1]);
                }
            }).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'drawOtherCitiesInState',
        value: function drawOtherCitiesInState(region) {
            var _this12 = this;

            var controller = new ApiController();

            controller.getParentState(region).then(function (response) {

                if (response.length == 0) return;

                var state = response[0];

                controller.getCitiesInState(state.parent_id).then(function (response) {

                    if (response.length == 0) return;

                    _this12.drawPlacesInRegionHeader('#places-in-region-header-0', 'Places in {0}'.format(state.parent_name));
                    _this12.drawPlacesInRegionList('#places-in-region-list-0', response);
                }).catch(function (error) {
                    return console.error(error);
                });
            });
        }
    }, {
        key: 'drawOtherCountiesInState',
        value: function drawOtherCountiesInState(region) {
            var _this13 = this;

            var controller = new ApiController();

            controller.getParentState(region).then(function (response) {

                if (response.length == 0) return;

                var state = response[0];

                controller.getCountiesInState(state.parent_id).then(function (response) {

                    if (response.length == 0) return;

                    _this13.drawPlacesInRegionHeader('#places-in-region-header-0', 'Counties in {0}'.format(state.parent_name));
                    _this13.drawPlacesInRegionList('#places-in-region-list-0', response);
                }).catch(function (error) {
                    return console.error(error);
                });
            });
        }
    }, {
        key: 'drawOtherMetrosInState',
        value: function drawOtherMetrosInState(region) {
            var _this14 = this;

            var controller = new ApiController();

            controller.getParentState(region).then(function (response) {

                if (response.length == 0) return;

                var state = response[0];

                controller.getMetrosInState(state.parent_id).then(function (response) {

                    if (response.length == 0) return;

                    _this14.drawPlacesInRegionHeader('#places-in-region-header-0', 'Metropolitan Areas in {0}'.format(state.parent_name));
                    _this14.drawPlacesInRegionList('#places-in-region-list-0', response);
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
            var _this15 = this;

            if (this.params.regions.length == 0) return;

            var region = this.params.regions[0];
            var controller = new ApiController();

            controller.getSimilarRegions(region.id).then(function (data) {
                return _this15.drawSimilarRegionsList(data, onClickRegion);
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
            var _this16 = this;

            var domain = (function () {

                var step = 1.0 / _this16.MAP_COLOR_SCALE.length;

                function quantile(value, index, list) {
                    return d3.quantile(values, (index + 1) * step);
                }

                return _.map(_this16.MAP_COLOR_SCALE.slice(1), quantile);
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
            var _this17 = this;

            var places = [];

            data.forEach(function (place) {

                _this17.params.regions.forEach(function (region) {

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Y0LXNlYXJjaC1wYWdlLWNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBQU0sb0JBQW9CO0FBRXRCLGFBRkUsb0JBQW9CLENBRVYsTUFBTSxFQUFFOzhCQUZsQixvQkFBb0I7O0FBSWxCLFlBQUksQ0FBQyxlQUFlLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFDNUMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztBQUM3QixZQUFJLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRXBDLFlBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLFlBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0FBQ3RCLFlBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO0FBQ3hCLFlBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDOztBQUV0QixZQUFJLElBQUksR0FBRyxJQUFJOzs7O0FBQUMsQUFJaEIsU0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxZQUFXOztBQUVwQyxhQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDekMsYUFBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUM1RixhQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN6QyxDQUFDLENBQUM7O0FBRUgsU0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxZQUFXOztBQUVwQyxhQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFD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Q0FBQyxHQUFHLENBQUMsQ0FBQyxFQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQUMsaUJBRWpDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUN4Qzs7O3VDQUVjLFFBQVEsRUFBRTs7QUFFckIsZ0JBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFaEQsZ0JBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQUMsaUJBRW5DLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUM1Qzs7O1dBL2dEQyxvQkFBb0IiLCJmaWxlIjoidjQtc2VhcmNoLXBhZ2UtY29udHJvbGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFNlYXJjaFBhZ2VDb250cm9sbGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuXG4gICAgICAgIHRoaXMuTUFQX0NPTE9SX1NDQUxFID0gY29sb3JicmV3ZXIuUmRZbEJ1WzldLFxuICAgICAgICB0aGlzLk1BUF9JTklUSUFMX1pPT00gPSAxMC4wO1xuICAgICAgICB0aGlzLk1BUF9SQURJVVNfU0NBTEUgPSBbNTAwLCAyMDAwXTtcblxuICAgICAgICB0aGlzLnBhcmFtcyA9IHBhcmFtcztcbiAgICAgICAgdGhpcy5mZXRjaGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmZldGNoZWRBbGwgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5tb3N0U2ltaWxhciA9IFtdO1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAvLyBSZWZpbmUgbWVudXNcbiAgICAgICAgLy9cbiAgICAgICAgJCgnLnJlZmluZS1saW5rJykubW91c2VlbnRlcihmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygncmVmaW5lLWxpbmstc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgICQodGhpcykuY2hpbGRyZW4oJ3NwYW4nKS5jaGlsZHJlbignaScpLnJlbW92ZUNsYXNzKCdmYS1jYXJldC1kb3duJykuYWRkQ2xhc3MoJ2ZhLWNhcmV0LXVwJyk7XG4gICAgICAgICAgICAkKHRoaXMpLmNoaWxkcmVuKCd1bCcpLnNsaWRlRG93bigxMDApO1xuICAgICAgICB9KTtcblxuICAgICAgICAkKCcucmVmaW5lLWxpbmsnKS5tb3VzZWxlYXZlKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdyZWZpbmUtbGluay1zZWxlY3RlZCcpO1xuICAgICAgICAgICAgJCh0aGlzKS5jaGlsZHJlbignc3BhbicpLmNoaWxkcmVuKCdpJykucmVtb3ZlQ2xhc3MoJ2ZhLWNhcmV0LXVwJykuYWRkQ2xhc3MoJ2ZhLWNhcmV0LWRvd24nKTtcbiAgICAgICAgICAgICQodGhpcykuY2hpbGRyZW4oJ3VsJykuc2xpZGVVcCgxMDApO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBDYXRlZ29yaWVzXG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuYXR0YWNoQ2F0ZWdvcmllc0NsaWNrSGFuZGxlcnMoKTtcblxuICAgICAgICAkKCcjcmVmaW5lLW1lbnUtY2F0ZWdvcmllcy12aWV3LW1vcmUnKS5jbGljayhmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuXG4gICAgICAgICAgICBjb250cm9sbGVyLmdldENhdGVnb3JpZXMoKVxuICAgICAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciByZyA9IGRhdGEucmVzdWx0cy5tYXAoZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJzxsaT48aSBjbGFzcz1cImZhICcgKyByZXN1bHQubWV0YWRhdGEuaWNvbiArICdcIj48L2k+JyArIHJlc3VsdC5jYXRlZ29yeSArICc8L2xpPic7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBzID0gcmcuam9pbignJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgJCgnI3JlZmluZS1tZW51LWNhdGVnb3JpZXMnKS5odG1sKHMpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmF0dGFjaENhdGVnb3JpZXNDbGlja0hhbmRsZXJzKCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBEb21haW5zXG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuYXR0YWNoRG9tYWluc0NsaWNrSGFuZGxlcnMoKTtcblxuICAgICAgICAkKCcjcmVmaW5lLW1lbnUtZG9tYWlucy12aWV3LW1vcmUnKS5jbGljayhmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuXG4gICAgICAgICAgICBjb250cm9sbGVyLmdldERvbWFpbnMoKVxuICAgICAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciByZyA9IGRhdGEucmVzdWx0cy5tYXAoZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJzxsaT4nICsgcmVzdWx0LmRvbWFpbiArICc8L2xpPic7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBzID0gcmcuam9pbignJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgJCgnI3JlZmluZS1tZW51LWRvbWFpbnMnKS5odG1sKHMpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmF0dGFjaERvbWFpbnNDbGlja0hhbmRsZXJzKCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIFN0YW5kYXJkc1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLmF0dGFjaFN0YW5kYXJkc0NsaWNrSGFuZGxlcnMoKTtcbiAgICBcbiAgICAgICAgLy8gVG9rZW5zXG4gICAgICAgIC8vXG4gICAgICAgICQoJy5yZWdpb24tdG9rZW4gLmZhLXRpbWVzLWNpcmNsZScpLmNsaWNrKGZ1bmN0aW9uKCkgeyBcbiAgICBcbiAgICAgICAgICAgIHNlbGYucmVtb3ZlUmVnaW9uKCQodGhpcykucGFyZW50KCkuaW5kZXgoKSk7XG4gICAgICAgICAgICBzZWxmLm5hdmlnYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICAkKCcuY2F0ZWdvcnktdG9rZW4gLmZhLXRpbWVzLWNpcmNsZScpLmNsaWNrKGZ1bmN0aW9uKCkgeyBcbiAgICBcbiAgICAgICAgICAgIHNlbGYudG9nZ2xlQ2F0ZWdvcnkoJCh0aGlzKS5wYXJlbnQoKS50ZXh0KCkudG9Mb3dlckNhc2UoKS50cmltKCkpO1xuICAgICAgICAgICAgc2VsZi5uYXZpZ2F0ZSgpO1xuICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgJCgnLmRvbWFpbi10b2tlbiAuZmEtdGltZXMtY2lyY2xlJykuY2xpY2soZnVuY3Rpb24oKSB7IFxuICAgIFxuICAgICAgICAgICAgc2VsZi50b2dnbGVEb21haW4oJCh0aGlzKS5wYXJlbnQoKS50ZXh0KCkudG9Mb3dlckNhc2UoKS50cmltKCkpO1xuICAgICAgICAgICAgc2VsZi5uYXZpZ2F0ZSgpO1xuICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgJCgnLnN0YW5kYXJkLXRva2VuIC5mYS10aW1lcy1jaXJjbGUnKS5jbGljayhmdW5jdGlvbigpIHsgXG4gICAgXG4gICAgICAgICAgICBzZWxmLnRvZ2dsZVN0YW5kYXJkKCQodGhpcykucGFyZW50KCkudGV4dCgpLnRvTG93ZXJDYXNlKCkudHJpbSgpKTtcbiAgICAgICAgICAgIHNlbGYubmF2aWdhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgXG4gICAgICAgIC8vIEluZmluaXRlIHNjcm9sbCBzZWFyY2ggcmVzdWx0c1xuICAgICAgICAvL1xuICAgICAgICAkKHdpbmRvdykub24oJ3Njcm9sbCcsIGZ1bmN0aW9uKCkge1xuICAgIFxuICAgICAgICAgICAgdmFyIGJvdHRvbU9mZnNldFRvQmVnaW5SZXF1ZXN0ID0gMTAwMDtcbiAgICBcbiAgICAgICAgICAgIGlmICgkKHdpbmRvdykuc2Nyb2xsVG9wKCkgPj0gJChkb2N1bWVudCkuaGVpZ2h0KCkgLSAkKHdpbmRvdykuaGVpZ2h0KCkgLSBib3R0b21PZmZzZXRUb0JlZ2luUmVxdWVzdCkge1xuICAgICAgICAgICAgICAgIHNlbGYuZmV0Y2hOZXh0UGFnZSgpO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICB9KS5zY3JvbGwoKTtcbiAgICBcbiAgICAgICAgLy8gQWRkIGxvY2F0aW9uXG4gICAgICAgIC8vXG4gICAgICAgIG5ldyBBdXRvU3VnZ2VzdFJlZ2lvbkNvbnRyb2xsZXIoJy5hZGQtcmVnaW9uIGlucHV0W3R5cGU9XCJ0ZXh0XCJdJywgJy5hZGQtcmVnaW9uIHVsJywgZnVuY3Rpb24ocmVnaW9uKSB7XG4gICAgXG4gICAgICAgICAgICBzZWxmLnNldEF1dG9TdWdnZXN0ZWRSZWdpb24ocmVnaW9uLCBmYWxzZSk7XG4gICAgICAgICAgICBzZWxmLm5hdmlnYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICAkKCcuYWRkLXJlZ2lvbiAuZmEtcGx1cycpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgICAgICAgICAgJCgnLmFkZC1yZWdpb24gaW5wdXRbdHlwZT1cInRleHRcIl0nKS5mb2N1cygpO1xuICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgLy8gU2ltaWxhciByZWdpb25zXG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuZHJhd1NpbWlsYXJSZWdpb25zKGZ1bmN0aW9uKHJlZ2lvbikge1xuICAgIFxuICAgICAgICAgICAgc2VsZi5zZXRBdXRvU3VnZ2VzdGVkUmVnaW9uKHJlZ2lvbiwgZmFsc2UpO1xuICAgICAgICAgICAgc2VsZi5uYXZpZ2F0ZSgpO1xuICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgLy8gUGxhY2VzIGluIHJlZ2lvblxuICAgICAgICAvL1xuICAgICAgICB0aGlzLmRyYXdQbGFjZXNJblJlZ2lvbigpO1xuICAgIH1cblxuICAgIC8vIFB1YmxpYyBtZXRob2RzXG4gICAgLy9cbiAgICBhdHRhY2hDYXRlZ29yaWVzQ2xpY2tIYW5kbGVycygpIHtcbiAgICBcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIFxuICAgICAgICAkKCcjcmVmaW5lLW1lbnUtY2F0ZWdvcmllcyBsaTpub3QoLnJlZmluZS12aWV3LW1vcmUpJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICAgICAgICBzZWxmLnRvZ2dsZUNhdGVnb3J5KCQodGhpcykudGV4dCgpLnRvTG93ZXJDYXNlKCkudHJpbSgpKTtcbiAgICAgICAgICAgIHNlbGYubmF2aWdhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGF0dGFjaERvbWFpbnNDbGlja0hhbmRsZXJzKCkge1xuICAgIFxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIFxuICAgICAgICAkKCcjcmVmaW5lLW1lbnUtZG9tYWlucyBsaTpub3QoLnJlZmluZS12aWV3LW1vcmUpJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgZG9tYWluID0gJCh0aGlzKS50ZXh0KCkudG9Mb3dlckNhc2UoKS50cmltKCk7XG4gICAgXG4gICAgICAgICAgICBzZWxmLnRvZ2dsZURvbWFpbihkb21haW4pO1xuICAgICAgICAgICAgc2VsZi5uYXZpZ2F0ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhdHRhY2hTdGFuZGFyZHNDbGlja0hhbmRsZXJzKCkge1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAkKCcjcmVmaW5lLW1lbnUtc3RhbmRhcmRzIGxpJykuY2xpY2soZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHZhciBzdGFuZGFyZCA9ICQodGhpcykudGV4dCgpLnRvTG93ZXJDYXNlKCkudHJpbSgpO1xuXG4gICAgICAgICAgICBzZWxmLnRvZ2dsZVN0YW5kYXJkKHN0YW5kYXJkKTtcbiAgICAgICAgICAgIHNlbGYubmF2aWdhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZGVjcmVtZW50UGFnZSgpIHtcblxuICAgICAgICB0aGlzLnBhcmFtcy5wYWdlLS07XG4gICAgfVxuXG4gICAgLy8gQ29zdCBvZiBsaXZpbmdcbiAgICAvL1xuICAgIGRyYXdDb3N0T2ZMaXZpbmdEYXRhKCkge1xuXG4gICAgICAgIGdvb2dsZS5zZXRPbkxvYWRDYWxsYmFjaygoKSA9PiB7XG5cbiAgICAgICAgICAgIHZhciByZWdpb25JZHMgPSB0aGlzLnBhcmFtcy5yZWdpb25zLm1hcChmdW5jdGlvbihyZWdpb24pIHsgcmV0dXJuIHJlZ2lvbi5pZDsgfSk7XG4gICAgICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG5cbiAgICAgICAgICAgIGNvbnRyb2xsZXIuZ2V0Q29zdE9mTGl2aW5nRGF0YShyZWdpb25JZHMpXG4gICAgICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7IFxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd0Nvc3RPZkxpdmluZ0NoYXJ0KHJlZ2lvbklkcywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd0Nvc3RPZkxpdmluZ1RhYmxlKHJlZ2lvbklkcywgZGF0YSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZHJhd0Nvc3RPZkxpdmluZ0NoYXJ0KHJlZ2lvbklkcywgZGF0YSkge1xuICAgIFxuICAgICAgICB0aGlzLmRyYXdDb3N0T2ZMaXZpbmdDaGFydEZvckNvbXBvbmVudCgnY29zdC1vZi1saXZpbmctYWxsLWNoYXJ0JywgJ0FsbCcsIHJlZ2lvbklkcywgZGF0YSk7XG4gICAgICAgIHRoaXMuZHJhd0Nvc3RPZkxpdmluZ0NoYXJ0Rm9yQ29tcG9uZW50KCdjb3N0LW9mLWxpdmluZy1nb29kcy1jaGFydCcsICdHb29kcycsIHJlZ2lvbklkcywgZGF0YSk7XG4gICAgICAgIHRoaXMuZHJhd0Nvc3RPZkxpdmluZ0NoYXJ0Rm9yQ29tcG9uZW50KCdjb3N0LW9mLWxpdmluZy1yZW50cy1jaGFydCcsICdSZW50cycsIHJlZ2lvbklkcywgZGF0YSk7XG4gICAgICAgIHRoaXMuZHJhd0Nvc3RPZkxpdmluZ0NoYXJ0Rm9yQ29tcG9uZW50KCdjb3N0LW9mLWxpdmluZy1vdGhlci1jaGFydCcsICdPdGhlcicsIHJlZ2lvbklkcywgZGF0YSk7XG4gICAgfVxuICAgIFxuICAgIGRyYXdDb3N0T2ZMaXZpbmdDaGFydEZvckNvbXBvbmVudChpZCwgY29tcG9uZW50LCByZWdpb25JZHMsIGRhdGEpIHtcbiAgICBcbiAgICAgICAgdmFyIGNoYXJ0RGF0YSA9IFtdXG4gICAgXG4gICAgICAgIC8vIEhlYWRlclxuICAgICAgICAvL1xuICAgICAgICB2YXIgaGVhZGVyID0gWydZZWFyJ107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBoZWFkZXJbaSArIDFdID0gdGhpcy5wYXJhbXMucmVnaW9uc1tpXS5uYW1lO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGNoYXJ0RGF0YS5wdXNoKGhlYWRlcik7XG4gICAgXG4gICAgICAgIC8vIEZvcm1hdCB0aGUgZGF0YVxuICAgICAgICAvL1xuICAgICAgICB2YXIgbyA9IHt9O1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgIGlmIChkYXRhW2ldLmNvbXBvbmVudCAhPSBjb21wb25lbnQpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgXG4gICAgICAgICAgICBpZiAob1tkYXRhW2ldLnllYXJdID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG9bZGF0YVtpXS55ZWFyXSA9IFtkYXRhW2ldLnllYXJdO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgb1tkYXRhW2ldLnllYXJdLnB1c2gocGFyc2VGbG9hdChkYXRhW2ldLmluZGV4KSk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgZm9yICh2YXIga2V5IGluIG8pIHtcbiAgICAgICAgICAgIGNoYXJ0RGF0YS5wdXNoKG9ba2V5XSk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgdGhpcy5kcmF3TGluZUNoYXJ0KGlkLCBjaGFydERhdGEsIHtcbiAgICBcbiAgICAgICAgICAgIGN1cnZlVHlwZSA6ICdmdW5jdGlvbicsXG4gICAgICAgICAgICBsZWdlbmQgOiB7IHBvc2l0aW9uIDogJ2JvdHRvbScgfSxcbiAgICAgICAgICAgIHBvaW50U2hhcGUgOiAnc3F1YXJlJyxcbiAgICAgICAgICAgIHBvaW50U2l6ZSA6IDgsXG4gICAgICAgICAgICB0aXRsZSA6IGNvbXBvbmVudCxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRyYXdDb3N0T2ZMaXZpbmdUYWJsZShyZWdpb25JZHMsIGRhdGEpIHtcbiAgICBcbiAgICAgICAgLy8gRm9ybWF0IHRoZSBkYXRhXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBjb21wb25lbnRzID0gWydBbGwnLCAnR29vZHMnLCAnT3RoZXInLCAnUmVudHMnXTtcbiAgICAgICAgdmFyIHJvd3MgPSBbXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb21wb25lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgY29tcG9uZW50ID0gY29tcG9uZW50c1tpXTtcbiAgICAgICAgICAgIHZhciByb3cgPSBbY29tcG9uZW50XTtcbiAgICBcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcmVnaW9uSWRzLmxlbmd0aDsgaisrKSB7XG4gICAgXG4gICAgICAgICAgICAgICAgdmFyIG8gPSB0aGlzLmdldExhdGVzdENvc3RPZkxpdmluZyhkYXRhLCByZWdpb25JZHNbal0sIGNvbXBvbmVudCk7XG4gICAgXG4gICAgICAgICAgICAgICAgcm93LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBpbmRleCA6IChvICE9IG51bGwpID8gcGFyc2VGbG9hdChvLmluZGV4KSA6ICdOQScsXG4gICAgICAgICAgICAgICAgICAgIHBlcmNlbnRpbGUgOiAobyAhPSBudWxsKSA/IHRoaXMuZ2V0UGVyY2VudGlsZShvLnJhbmssIG8udG90YWxfcmFua3MpIDogJ05BJyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIHJvd3MucHVzaChyb3cpO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8vIEhlYWRlclxuICAgICAgICAvL1xuICAgICAgICB2YXIgcyA9ICc8dHI+PHRoPjwvdGg+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0aCBjb2xzcGFuPVxcJzJcXCc+JyArIHRoaXMucGFyYW1zLnJlZ2lvbnNbaV0ubmFtZSArICc8L3RoPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgLy8gU3ViIGhlYWRlclxuICAgICAgICAvL1xuICAgICAgICBzICs9ICc8L3RyPjx0cj48dGQgY2xhc3M9XFwnY29sdW1uLWhlYWRlclxcJz48L3RkPic7XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzICs9ICc8dGQgY2xhc3M9XFwnY29sdW1uLWhlYWRlclxcJz5WYWx1ZTwvdGQ+PHRkIGNsYXNzPVxcJ2NvbHVtbi1oZWFkZXJcXCc+UGVyY2VudGlsZTwvdGQ+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBzICs9ICc8L3RyPic7XG4gICAgICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJvd3MubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgIHZhciByb3cgPSByb3dzW2ldO1xuICAgIFxuICAgICAgICAgICAgcyArPSAnPHRyPic7XG4gICAgICAgICAgICBzICs9ICc8dGQ+JyArIHJvd1swXSArICc8L3RkPic7XG4gICAgXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMTsgaiA8IHJvdy5sZW5ndGg7IGorKykge1xuICAgIFxuICAgICAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgcm93W2pdLmluZGV4ICsgJzwvdGQ+JztcbiAgICAgICAgICAgICAgICBzICs9ICc8dGQ+JyArIHJvd1tqXS5wZXJjZW50aWxlICsgJzwvdGQ+JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcyArPSAnPC90cj4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgICQoJyNjb3N0LW9mLWxpdmluZy10YWJsZScpLmh0bWwocyk7XG4gICAgfVxuICAgIFxuICAgIGdldFBlcmNlbnRpbGUocmFuaywgdG90YWxSYW5rcykge1xuICAgIFxuICAgICAgICB2YXIgdG90YWxSYW5rcyA9IHBhcnNlSW50KHRvdGFsUmFua3MpO1xuICAgICAgICB2YXIgcmFuayA9IHBhcnNlSW50KHJhbmspO1xuICAgICAgICB2YXIgcGVyY2VudGlsZSA9IHBhcnNlSW50KCgodG90YWxSYW5rcyAtIHJhbmspIC8gdG90YWxSYW5rcykgKiAxMDApO1xuICAgIFxuICAgICAgICByZXR1cm4gbnVtZXJhbChwZXJjZW50aWxlKS5mb3JtYXQoJzBvJyk7XG4gICAgfVxuICAgIFxuICAgIGdldExhdGVzdENvc3RPZkxpdmluZyhkYXRhLCByZWdpb25JZCwgY29tcG9uZW50KSB7XG4gICAgXG4gICAgICAgIHZhciBkYXR1bSA9IG51bGw7XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIFxuICAgICAgICAgICAgaWYgKGRhdGFbaV0uaWQgIT0gcmVnaW9uSWQpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgXG4gICAgICAgICAgICBpZiAoZGF0YVtpXS5jb21wb25lbnQgIT0gY29tcG9uZW50KVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgIFxuICAgICAgICAgICAgaWYgKGRhdHVtID09IG51bGwpIHtcbiAgICBcbiAgICAgICAgICAgICAgICBkYXR1bSA9IGRhdGFbaV07XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICBpZiAocGFyc2VJbnQoZGF0YVtpXS55ZWFyKSA8PSBwYXJzZUludChkYXR1bS55ZWFyKSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICBcbiAgICAgICAgICAgIGRhdHVtID0gZGF0YVtpXTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGRhdHVtO1xuICAgIH1cbiAgICBcbiAgICAvLyBFYXJuaW5nc1xuICAgIC8vXG4gICAgZHJhd0Vhcm5pbmdzRGF0YSgpIHtcblxuICAgICAgICBnb29nbGUuc2V0T25Mb2FkQ2FsbGJhY2soKCkgPT4ge1xuICAgIFxuICAgICAgICAgICAgdmFyIHJlZ2lvbklkcyA9IHRoaXMucGFyYW1zLnJlZ2lvbnMubWFwKGZ1bmN0aW9uKHJlZ2lvbikgeyByZXR1cm4gcmVnaW9uLmlkOyB9KTtcbiAgICAgICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcbiAgICBcbiAgICAgICAgICAgIGNvbnRyb2xsZXIuZ2V0RWFybmluZ3NEYXRhKHJlZ2lvbklkcylcbiAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IHsgXG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3RWFybmluZ3NNYXAoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3RWFybmluZ3NDaGFydChyZWdpb25JZHMsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdFYXJuaW5nc1RhYmxlKHJlZ2lvbklkcywgZGF0YSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkcmF3RWFybmluZ3NDaGFydChyZWdpb25JZHMsIGRhdGEpIHtcbiAgICBcbiAgICAgICAgdmFyIGVhcm5pbmdzID0gW107XG4gICAgXG4gICAgICAgIC8vIEhlYWRlclxuICAgICAgICAvL1xuICAgICAgICB2YXIgaGVhZGVyID0gWydFZHVjYXRpb24gTGV2ZWwnXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGhlYWRlcltpICsgMV0gPSB0aGlzLnBhcmFtcy5yZWdpb25zW2ldLm5hbWU7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgZWFybmluZ3MucHVzaChoZWFkZXIpO1xuICAgIFxuICAgICAgICAvLyBMZXNzIHRoYW4gaGlnaCBzY2hvb2xcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIHNvbWVIaWdoU2Nob29sRWFybmluZ3MgPSBbJ1NvbWUgSGlnaCBTY2hvb2wnXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHNvbWVIaWdoU2Nob29sRWFybmluZ3NbaSArIDFdID0gcGFyc2VJbnQoZGF0YVtpXS5tZWRpYW5fZWFybmluZ3NfbGVzc190aGFuX2hpZ2hfc2Nob29sKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBlYXJuaW5ncy5wdXNoKHNvbWVIaWdoU2Nob29sRWFybmluZ3MpO1xuICAgIFxuICAgICAgICAvLyBIaWdoIHNjaG9vbFxuICAgICAgICAvL1xuICAgICAgICB2YXIgaGlnaFNjaG9vbEVhcm5pbmdzID0gWydIaWdoIFNjaG9vbCddO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaGlnaFNjaG9vbEVhcm5pbmdzW2kgKyAxXSA9IHBhcnNlSW50KGRhdGFbaV0ubWVkaWFuX2Vhcm5pbmdzX2hpZ2hfc2Nob29sKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBlYXJuaW5ncy5wdXNoKGhpZ2hTY2hvb2xFYXJuaW5ncyk7XG4gICAgXG4gICAgICAgIC8vIFNvbWUgY29sbGVnZVxuICAgICAgICAvL1xuICAgICAgICB2YXIgc29tZUNvbGxlZ2VFYXJuaW5ncyA9IFsnU29tZSBDb2xsZWdlJ107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzb21lQ29sbGVnZUVhcm5pbmdzW2kgKyAxXSA9IHBhcnNlSW50KGRhdGFbaV0ubWVkaWFuX2Vhcm5pbmdzX3NvbWVfY29sbGVnZV9vcl9hc3NvY2lhdGVzKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBlYXJuaW5ncy5wdXNoKHNvbWVDb2xsZWdlRWFybmluZ3MpO1xuICAgIFxuICAgICAgICAvLyBCYWNoZWxvcidzXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBiYWNoZWxvcnNFYXJuaW5ncyA9IFsnQmFjaGVsb3JcXCdzJ107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBiYWNoZWxvcnNFYXJuaW5nc1tpICsgMV0gPSBwYXJzZUludChkYXRhW2ldLm1lZGlhbl9lYXJuaW5nc19iYWNoZWxvcl9kZWdyZWUpO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGVhcm5pbmdzLnB1c2goYmFjaGVsb3JzRWFybmluZ3MpO1xuICAgIFxuICAgICAgICAvLyBHcmFkdWF0ZSBkZWdyZWVcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGdyYWR1YXRlRGVncmVlRWFybmluZ3MgPSBbJ0dyYWR1YXRlIERlZ3JlZSddO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZ3JhZHVhdGVEZWdyZWVFYXJuaW5nc1tpICsgMV0gPSBwYXJzZUludChkYXRhW2ldLm1lZGlhbl9lYXJuaW5nc19ncmFkdWF0ZV9vcl9wcm9mZXNzaW9uYWxfZGVncmVlKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBlYXJuaW5ncy5wdXNoKGdyYWR1YXRlRGVncmVlRWFybmluZ3MpO1xuICAgIFxuICAgICAgICB0aGlzLmRyYXdTdGVwcGVkQXJlYUNoYXJ0KCdlYXJuaW5ncy1jaGFydCcsIGVhcm5pbmdzLCB7XG4gICAgXG4gICAgICAgICAgICBhcmVhT3BhY2l0eSA6IDAsXG4gICAgICAgICAgICBjb25uZWN0U3RlcHM6IHRydWUsXG4gICAgICAgICAgICBjdXJ2ZVR5cGUgOiAnZnVuY3Rpb24nLFxuICAgICAgICAgICAgZm9jdXNUYXJnZXQgOiAnY2F0ZWdvcnknLFxuICAgICAgICAgICAgbGVnZW5kIDogeyBwb3NpdGlvbiA6ICdib3R0b20nIH0sXG4gICAgICAgICAgICB0aXRsZSA6ICdFYXJuaW5ncyBieSBFZHVjYXRpb24gTGV2ZWwnLFxuICAgICAgICAgICAgdkF4aXMgOiB7IGZvcm1hdCA6ICdjdXJyZW5jeScgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZHJhd0Vhcm5pbmdzTWFwKCkge1xuXG4gICAgICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuICAgICAgICBjb25zdCBwbGFjZXNQcm9taXNlID0gY29udHJvbGxlci5nZXRQbGFjZXMoKTtcbiAgICAgICAgY29uc3QgZWFybmluZ3NQcm9taXNlID0gY29udHJvbGxlci5nZXRFYXJuaW5nc0J5UGxhY2UoKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChbcGxhY2VzUHJvbWlzZSwgZWFybmluZ3NQcm9taXNlXSlcbiAgICAgICAgICAgIC50aGVuKHZhbHVlcyA9PiB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBwbGFjZXNSZXNwb25zZSA9IHZhbHVlc1swXTtcbiAgICAgICAgICAgICAgICBjb25zdCBlYXJuaW5nc1Jlc3BvbnNlID0gdmFsdWVzWzFdO1xuXG4gICAgICAgICAgICAgICAgLy8gR2V0IHRoZSBnZW8gY29vcmRpbmF0ZXMgZm9yIGVhY2ggcmVnaW9uXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICBjb25zdCByZWdpb25QbGFjZXMgPSB0aGlzLmdldFBsYWNlc0ZvclJlZ2lvbihwbGFjZXNSZXNwb25zZSk7XG5cbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgYSBwbGFjZSBsb29rdXAgdGFibGVcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIGNvbnN0IHBsYWNlTWFwID0ge307XG4gICAgICAgICAgICAgICAgcGxhY2VzUmVzcG9uc2UuZm9yRWFjaChwbGFjZSA9PiBwbGFjZU1hcFtwbGFjZS5pZF0gPSBwbGFjZSk7IC8vIGluaXQgdGhlIHBsYWNlIG1hcFxuXG4gICAgICAgICAgICAgICAgLy8gR2V0IG1hcCBkYXRhXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICBjb25zdCBlYXJuaW5nc1BsYWNlcyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgZWFybmluZ3NSZXNwb25zZS5mb3JFYWNoKGl0ZW0gPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLm1lZGlhbl9lYXJuaW5ncyA9PSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmlkIGluIHBsYWNlTWFwKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGVhcm5pbmdzUGxhY2VzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzIDogcGxhY2VNYXBbaXRlbS5pZF0ubG9jYXRpb24uY29vcmRpbmF0ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQgOiBpdGVtLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgOiBpdGVtLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgOiBwYXJzZUludChpdGVtLm1lZGlhbl9lYXJuaW5ncyksXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBlYXJuaW5nc1BsYWNlcy5zb3J0KChhLCBiKSA9PiBiLnZhbHVlIC0gYS52YWx1ZSk7IC8vIGRlc2NcbiAgICAgICAgICAgICAgICBjb25zdCBlYXJuaW5ncyA9IF8ubWFwKGVhcm5pbmdzUGxhY2VzLCB4ID0+IHsgcmV0dXJuIHgudmFsdWUgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBJbml0IG1hcFxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgY29uc3QgcmFkaXVzU2NhbGUgPSB0aGlzLmdldFJhZGl1c1NjYWxlTGluZWFyKGVhcm5pbmdzKVxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9yU2NhbGUgPSB0aGlzLmdldENvbG9yU2NhbGUoZWFybmluZ3MpXG5cbiAgICAgICAgICAgICAgICBjb25zdCBjb29yZGluYXRlcyA9IHJlZ2lvblBsYWNlc1swXS5sb2NhdGlvbi5jb29yZGluYXRlcztcbiAgICAgICAgICAgICAgICBjb25zdCBjZW50ZXIgPSBbY29vcmRpbmF0ZXNbMV0sIGNvb3JkaW5hdGVzWzBdXTtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXAgPSBMLm1hcCgnbWFwJywgeyB6b29tQ29udHJvbCA6IHRydWUgfSk7XG5cbiAgICAgICAgICAgICAgICBMLnRpbGVMYXllcignaHR0cHM6Ly9hLnRpbGVzLm1hcGJveC5jb20vdjMvc29jcmF0YS1hcHBzLmlicDBsODk5L3t6fS97eH0ve3l9LnBuZycpLmFkZFRvKG1hcCk7XG4gICAgICAgICAgICAgICAgbWFwLnNldFZpZXcoY2VudGVyLCB0aGlzLk1BUF9JTklUSUFMX1pPT00pO1xuXG4gICAgICAgICAgICAgICAgLy8gUG9wdWxhdGUgbWFwXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdDaXJjbGVzRm9yUGxhY2VzKG1hcCwgZWFybmluZ3NQbGFjZXMsIHJhZGl1c1NjYWxlLCBjb2xvclNjYWxlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdNYXJrZXJzRm9yUGxhY2VzKG1hcCwgcmVnaW9uUGxhY2VzKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgIH1cblxuICAgIGRyYXdFYXJuaW5nc1RhYmxlKHJlZ2lvbklkcywgZGF0YSkge1xuXG4gICAgICAgIHZhciBzID0gJzx0cj48dGg+PC90aD4nO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzICs9ICc8dGg+JyArIHRoaXMucGFyYW1zLnJlZ2lvbnNbaV0ubmFtZSArICc8L3RoPic7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNZWRpYW4gZWFybmluZ3MgYWxsXG4gICAgICAgIC8vXG4gICAgICAgIHMgKz0gJzwvdHI+PHRyPjx0ZD5NZWRpYW4gRWFybmluZ3MgKEFsbCBXb3JrZXJzKTwvdGQ+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgbnVtZXJhbChkYXRhW2ldLm1lZGlhbl9lYXJuaW5ncykuZm9ybWF0KCckMCwwJykgKyAnPC90ZD4nO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTWVkaWFuIGVhcm5pbmdzIGZlbWFsZVxuICAgICAgICAvL1xuICAgICAgICBzICs9ICc8L3RyPjx0cj48dGQ+TWVkaWFuIEZlbWFsZSBFYXJuaW5ncyAoRnVsbCBUaW1lKTwvdGQ+JztcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcyArPSAnPHRkPicgKyBudW1lcmFsKGRhdGFbaV0uZmVtYWxlX2Z1bGxfdGltZV9tZWRpYW5fZWFybmluZ3MpLmZvcm1hdCgnJDAsMCcpICsgJzwvdGQ+JztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE1lZGlhbiBlYXJuaW5ncyBtYWxlXG4gICAgICAgIC8vXG4gICAgICAgIHMgKz0gJzwvdHI+PHRyPjx0ZD5NZWRpYW4gTWFsZSBFYXJuaW5ncyAoRnVsbCBUaW1lKTwvdGQ+JztcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcyArPSAnPHRkPicgKyBudW1lcmFsKGRhdGFbaV0ubWFsZV9mdWxsX3RpbWVfbWVkaWFuX2Vhcm5pbmdzKS5mb3JtYXQoJyQwLDAnKSArICc8L3RkPic7XG4gICAgICAgIH1cblxuICAgICAgICBzICs9ICc8L3RyPic7XG5cbiAgICAgICAgJCgnI2Vhcm5pbmdzLXRhYmxlJykuaHRtbChzKTtcbiAgICB9XG5cbiAgICAvLyBIZWFsdGhcbiAgICAvL1xuICAgIGRyYXdIZWFsdGhEYXRhKCkge1xuICAgIFxuICAgICAgICBnb29nbGUuc2V0T25Mb2FkQ2FsbGJhY2soKCkgPT4ge1xuXG4gICAgICAgICAgICB2YXIgcmVnaW9uSWRzID0gdGhpcy5wYXJhbXMucmVnaW9ucy5tYXAoZnVuY3Rpb24ocmVnaW9uKSB7IHJldHVybiByZWdpb24uaWQ7IH0pO1xuICAgICAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuXG4gICAgICAgICAgICBjb250cm9sbGVyLmdldEhlYWx0aFJ3amZDaHJEYXRhKHJlZ2lvbklkcylcbiAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IHRoaXMuZHJhd1J3amZDaHJUYWJsZShyZWdpb25JZHMsIGRhdGEpKVxuICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgICAgIH0pO1xuICAgIFxuICAgIH1cbiAgICBcbiAgICBkcmF3UndqZkNoclRhYmxlUm93KHJlZ2lvbklkcywgZGF0YSwgZmlyc3RfdGQsIHZhcl9sYWJlbCwgdmFyX2tleSwgZm10X3N0ciwgYWRkbF9mbXQgPSAnJykge1xuICAgICAgICB2YXIgcyA9ICc8dHI+JytmaXJzdF90ZCsnPHRkPicrdmFyX2xhYmVsKyc8L3RkPidcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0ZD4nXG4gICAgICAgICAgICBpZihkYXRhW2ldICYmIGRhdGFbaV1bdmFyX2tleV0pe1xuICAgICAgICAgICAgICAgIHMgKz0gbnVtZXJhbChkYXRhW2ldW3Zhcl9rZXldLnJlcGxhY2UoJywnLCcnKSkuZm9ybWF0KGZtdF9zdHIpICsgYWRkbF9mbXRcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcyArPSAnJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcyArPSAnPC90ZD4nO1xuICAgICAgICB9XG4gICAgICAgIHMgKz0gJzwvdHI+J1xuICAgICAgICByZXR1cm4gc1xuICAgIH1cblxuICAgIGRyYXdSd2pmQ2hyVGFibGUocmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIHZhciBzID0gJyc7XG5cbiAgICAgICAgLy8gZmlyc3Qgcm93LCB3aGljaCBpcyByZWdpb24gbmFtZXNcbiAgICAgICAgcyArPSAnPHRyPjx0aD48L3RoPjx0aD48L3RoPic7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzICs9ICc8dGg+JyArIHRoaXMucGFyYW1zLnJlZ2lvbnNbaV0ubmFtZSArICc8L3RoPic7XG4gICAgICAgIH1cbiAgICAgICAgcyArPSAnPC90cj4nXG5cbiAgICAgICAgLy8gSEVBTFRIIE9VVENPTUVTXG4gICAgICAgIHMgKz0gJzx0cj48dGQgY29sc3Bhbj0nK251bWVyYWwocmVnaW9uSWRzLmxlbmd0aCkrMSsnPkhFQUxUSCBPVVRDT01FUzwvdGQ+PC90cj4nXG4gICAgICAgIC8vIGhlYWx0aCBvdXRjb21lcyAtIGxlbmd0aCBvZiBsaWZlIC0gMSBtZWFzdXJlXG4gICAgICAgIHMgKz0gdGhpcy5kcmF3UndqZkNoclRhYmxlUm93KHJlZ2lvbklkcywgZGF0YSwgJzx0ZCByb3dzcGFuPTE+TGVuZ3RoIG9mIExpZmU8L3RkPicsICdQcmVtYXR1cmUgRGVhdGgnLCdwcmVtYXR1cmVfZGVhdGhfdmFsdWUnLCcwLDAnKVxuICAgICAgICAvLyBoZWFsdGggb3V0Y29tZXMgLSBxdWFsaXR5IG9mIGxpZmUgLSA0IG1lYXN1cmVzXG4gICAgICAgIHMgKz0gdGhpcy5kcmF3UndqZkNoclRhYmxlUm93KHJlZ2lvbklkcywgZGF0YSwgJzx0ZCByb3dzcGFuPTQ+UXVhbGl0eSBvZiBMaWZlPC90ZD4nLCAnUG9vciBvciBmYWlyIGhlYWx0aCcsJ3Bvb3Jfb3JfZmFpcl9oZWFsdGhfdmFsdWUnLCcwLjAlJylcbiAgICAgICAgcyArPSB0aGlzLmRyYXdSd2pmQ2hyVGFibGVSb3cocmVnaW9uSWRzLCBkYXRhLCAnJywgJ1Bvb3IgcGh5c2ljYWwgaGVhbHRoIGRheXMnLCdwb29yX3BoeXNpY2FsX2hlYWx0aF9kYXlzX3ZhbHVlJywnMC4wJylcbiAgICAgICAgcyArPSB0aGlzLmRyYXdSd2pmQ2hyVGFibGVSb3cocmVnaW9uSWRzLCBkYXRhLCAnJywgJ1Bvb3IgbWVudGFsIGhlYWx0aCBkYXlzJywncG9vcl9tZW50YWxfaGVhbHRoX2RheXNfdmFsdWUnLCcwLjAnKVxuICAgICAgICBzICs9IHRoaXMuZHJhd1J3amZDaHJUYWJsZVJvdyhyZWdpb25JZHMsIGRhdGEsICcnLCAnTG93IGJpcnRod2VpZ2h0JywnbG93X2JpcnRod2VpZ2h0X3ZhbHVlJywnMC4wJScpXG5cbiAgICAgICAgLy8gSEVBTFRIIEZBQ1RPUlNcbiAgICAgICAgcyArPSAnPHRyPjx0ZCBjb2xzcGFuPScrbnVtZXJhbChyZWdpb25JZHMubGVuZ3RoKSsxKyc+SEVBTFRIIEZBQ1RPUlM8L3RkPjwvdHI+J1xuICAgICAgICAvLyBoZWFsdGggb3V0Y29tZXMgLSBoZWFsdGggZmFjdG9ycyAtIDkgbWVhc3VyZXNcbiAgICAgICAgcyArPSB0aGlzLmRyYXdSd2pmQ2hyVGFibGVSb3cocmVnaW9uSWRzLCBkYXRhLCAnPHRkIHJvd3NwYW49OT5IZWFsdGggQmVoYXZpb3JzPC90ZD4nLCAnQWR1bHQgc21va2luZycsJ2FkdWx0X3Ntb2tpbmdfdmFsdWUnLCcwLjAlJylcbiAgICAgICAgcyArPSB0aGlzLmRyYXdSd2pmQ2hyVGFibGVSb3cocmVnaW9uSWRzLCBkYXRhLCAnJywgJ0FkdWx0IG9iZXNpdHknLCdhZHVsdF9vYmVzaXR5X3ZhbHVlJywnMC4wJScpXG4gICAgICAgIHMgKz0gdGhpcy5kcmF3UndqZkNoclRhYmxlUm93KHJlZ2lvbklkcywgZGF0YSwgJycsICdGb29kIGVudmlyb25tZW50IGluZGV4JywnZm9vZF9lbnZpcm9ubWVudF9pbmRleF92YWx1ZScsJzAuMCcpXG4gICAgICAgIHMgKz0gdGhpcy5kcmF3UndqZkNoclRhYmxlUm93KHJlZ2lvbklkcywgZGF0YSwgJycsICdQaHlzaWNhbCBpbmFjdGl2aXR5JywncGh5c2ljYWxfaW5hY3Rpdml0eV92YWx1ZScsJzAuMCUnKVxuICAgICAgICBzICs9IHRoaXMuZHJhd1J3amZDaHJUYWJsZVJvdyhyZWdpb25JZHMsIGRhdGEsICcnLCAnQWNjZXNzIHRvIGV4ZXJjaXNlIG9wcG9ydHVuaXRpZXMnLCdhY2Nlc3NfdG9fZXhlcmNpc2Vfb3Bwb3J0dW5pdGllc192YWx1ZScsJzAuMCUnKVxuICAgICAgICBzICs9IHRoaXMuZHJhd1J3amZDaHJUYWJsZVJvdyhyZWdpb25JZHMsIGRhdGEsICcnLCAnRXhjZXNzaXZlIGRyaW5raW5nJywnZXhjZXNzaXZlX2RyaW5raW5nX3ZhbHVlJywnMC4wJScpXG4gICAgICAgIHMgKz0gdGhpcy5kcmF3UndqZkNoclRhYmxlUm93KHJlZ2lvbklkcywgZGF0YSwgJycsICdBbGNvaG9sLWltcGFpcmVkIGRyaXZpbmcgZGVhdGhzJywnYWxjb2hvbF9pbXBhaXJlZF9kcml2aW5nX2RlYXRoc192YWx1ZScsJzAuMCUnKVxuICAgICAgICBzICs9IHRoaXMuZHJhd1J3amZDaHJUYWJsZVJvdyhyZWdpb25JZHMsIGRhdGEsICcnLCAnU2V4dWFsbHkgdHJhbnNtaXR0ZWQgaW5mZWN0aW9ucycsJ3NleHVhbGx5X3RyYW5zbWl0dGVkX2luZmVjdGlvbnNfdmFsdWUnLCcwLDAnKVxuICAgICAgICBzICs9IHRoaXMuZHJhd1J3amZDaHJUYWJsZVJvdyhyZWdpb25JZHMsIGRhdGEsICcnLCAnVGVlbiBiaXJ0aHMnLCdhbGNvaG9sX2ltcGFpcmVkX2RyaXZpbmdfZGVhdGhzX3ZhbHVlJywnMCwwJylcbiAgICAgICAgLy8gaGVhbHRoIG91dGNvbWVzIC0gY2xpbmljYWwgY2FyZSAtIDcgbWVhc3VyZXNcbiAgICAgICAgcyArPSB0aGlzLmRyYXdSd2pmQ2hyVGFibGVSb3cocmVnaW9uSWRzLCBkYXRhLCAnPHRkIHJvd3NwYW49Nz5DbGluaWNhbCBDYXJlPC90ZD4nLCAnVW5pbnN1cmVkJywndW5pbnN1cmVkX3ZhbHVlJywnMC4wJScpXG4gICAgICAgIHMgKz0gdGhpcy5kcmF3UndqZkNoclRhYmxlUm93KHJlZ2lvbklkcywgZGF0YSwgJycsICdQcmltYXJ5IGNhcmUgcGh5c2ljaWFucycsJ3ByaW1hcnlfY2FyZV9waHlzaWNpYW5zX3ZhbHVlJywnMCwwJylcbiAgICAgICAgcyArPSB0aGlzLmRyYXdSd2pmQ2hyVGFibGVSb3cocmVnaW9uSWRzLCBkYXRhLCAnJywgJ0RlbnRpc3RzJywnZGVudGlzdHNfdmFsdWUnLCcwLDAnKVxuICAgICAgICBzICs9IHRoaXMuZHJhd1J3amZDaHJUYWJsZVJvdyhyZWdpb25JZHMsIGRhdGEsICcnLCAnTWVudGFsIGhlYWx0aCBwcm92aWRlcnMnLCdtZW50YWxfaGVhbHRoX3Byb3ZpZGVyc192YWx1ZScsJzAsMCcpXG4gICAgICAgIHMgKz0gdGhpcy5kcmF3UndqZkNoclRhYmxlUm93KHJlZ2lvbklkcywgZGF0YSwgJycsICdQcmV2ZW50YWJsZSBob3NwaXRhbCBzdGF5cycsJ3ByZXZlbnRhYmxlX2hvc3BpdGFsX3N0YXlzX3ZhbHVlJywnMCwwJylcbiAgICAgICAgcyArPSB0aGlzLmRyYXdSd2pmQ2hyVGFibGVSb3cocmVnaW9uSWRzLCBkYXRhLCAnJywgJ0RpYWJldGljIG1vbml0b3JpbmcnLCdkaWFiZXRpY19zY3JlZW5pbmdfdmFsdWUnLCcwLjAlJylcbiAgICAgICAgcyArPSB0aGlzLmRyYXdSd2pmQ2hyVGFibGVSb3cocmVnaW9uSWRzLCBkYXRhLCAnJywgJ01hbW1vZ3JhcGh5IHNjcmVlbmluZycsJ21hbW1vZ3JhcGh5X3NjcmVlbmluZ192YWx1ZScsJzAuMCUnKVxuXG4gICAgICAgIC8vIGhlYWx0aCBvdXRjb21lcyAtIHNvY2lhbCBhbmQgZWNvbm9taWMgZmFjdG9ycyAtIDkgbWVhc3VyZXNcbiAgICAgICAgcyArPSB0aGlzLmRyYXdSd2pmQ2hyVGFibGVSb3cocmVnaW9uSWRzLCBkYXRhLCAnPHRkIHJvd3NwYW49OT5Tb2NpYWwgJiBFY29ub21pYyBGYWN0b3JzPC90ZD4nLCAnSGlnaCBzY2hvb2wgZ3JhZHVhdGlvbicsJ2hpZ2hfc2Nob29sX2dyYWR1YXRpb25fdmFsdWUnLCcwLjAlJylcbiAgICAgICAgcyArPSB0aGlzLmRyYXdSd2pmQ2hyVGFibGVSb3cocmVnaW9uSWRzLCBkYXRhLCAnJywgJ1NvbWUgY29sbGVnZScsJ3NvbWVfY29sbGVnZV92YWx1ZScsJzAuMCUnKVxuICAgICAgICBzICs9IHRoaXMuZHJhd1J3amZDaHJUYWJsZVJvdyhyZWdpb25JZHMsIGRhdGEsICcnLCAnVW5lbXBsb3ltZW50JywndW5lbXBsb3ltZW50X3ZhbHVlJywnMC4wJScpXG4gICAgICAgIHMgKz0gdGhpcy5kcmF3UndqZkNoclRhYmxlUm93KHJlZ2lvbklkcywgZGF0YSwgJycsICdDaGlsZHJlbiBpbiBwb3ZlcnR5JywnY2hpbGRyZW5faW5fcG92ZXJ0eV92YWx1ZScsJzAuMCUnKVxuICAgICAgICBzICs9IHRoaXMuZHJhd1J3amZDaHJUYWJsZVJvdyhyZWdpb25JZHMsIGRhdGEsICcnLCAnSW5jb21lIGluZXF1YWxpdHknLCdpbmNvbWVfaW5lcXVhbGl0eV92YWx1ZScsJzAuMCcpXG4gICAgICAgIHMgKz0gdGhpcy5kcmF3UndqZkNoclRhYmxlUm93KHJlZ2lvbklkcywgZGF0YSwgJycsICdDaGlsZHJlbiBpbiBzaW5nbGUtcGFyZW50IGhvdXNlaG9sZHMnLCdjaGlsZHJlbl9pbl9zaW5nbGVfcGFyZW50X2hvdXNlaG9sZHNfdmFsdWUnLCcwLjAlJylcbiAgICAgICAgcyArPSB0aGlzLmRyYXdSd2pmQ2hyVGFibGVSb3cocmVnaW9uSWRzLCBkYXRhLCAnJywgJ1NvY2lhbCBhc3NvY2lhdGlvbnMnLCdzb2NpYWxfYXNzb2NpYXRpb25zX3ZhbHVlJywnMC4wJylcbiAgICAgICAgcyArPSB0aGlzLmRyYXdSd2pmQ2hyVGFibGVSb3cocmVnaW9uSWRzLCBkYXRhLCAnJywgJ1Zpb2xlbnQgY3JpbWUnLCd2aW9sZW50X2NyaW1lX3ZhbHVlJywnMC4wJylcbiAgICAgICAgcyArPSB0aGlzLmRyYXdSd2pmQ2hyVGFibGVSb3cocmVnaW9uSWRzLCBkYXRhLCAnJywgJ0luanVyeSBkZWF0aHMnLCdpbmp1cnlfZGVhdGhzX3ZhbHVlJywnMC4wJylcblxuICAgICAgICAvLyBoZWFsdGggb3V0Y29tZXMgLSBwaHlzaWNhbCBlbnZpcm9ubWVudCAtIDUgbWVhc3VyZXNcbiAgICAgICAgcyArPSB0aGlzLmRyYXdSd2pmQ2hyVGFibGVSb3cocmVnaW9uSWRzLCBkYXRhLCAnPHRkIHJvd3NwYW49NT5QaHlzaWNhbCBFbnZpcm9ubWVudDwvdGQ+JywgJ0FpciBwb2xsdXRpb24gLSBwYXJ0aWN1bGF0ZSBtYXR0ZXInLCdhaXJfcG9sbHV0aW9uX3BhcnRpY3VsYXRlX21hdHRlcl92YWx1ZScsJzAuMCcpXG4gICAgICAgIHMgKz0gdGhpcy5kcmF3UndqZkNoclRhYmxlUm93KHJlZ2lvbklkcywgZGF0YSwgJycsICdEcmlua2luZyB3YXRlciB2aW9sYXRpb25zJywnZHJpbmtpbmdfd2F0ZXJfdmlvbGF0aW9uc192YWx1ZScsJzAuMCUnKVxuICAgICAgICBzICs9IHRoaXMuZHJhd1J3amZDaHJUYWJsZVJvdyhyZWdpb25JZHMsIGRhdGEsICcnLCAnU2V2ZXJlIGhvdXNpbmcgcHJvYmxlbXMnLCdzZXZlcmVfaG91c2luZ19wcm9ibGVtc192YWx1ZScsJzAuMCUnKVxuICAgICAgICBzICs9IHRoaXMuZHJhd1J3amZDaHJUYWJsZVJvdyhyZWdpb25JZHMsIGRhdGEsICcnLCAnRHJpdmluZyBhbG9uZSB0byB3b3JrJywnZHJpdmluZ19hbG9uZV90b193b3JrX3ZhbHVlJywnMC4wJScpXG4gICAgICAgIHMgKz0gdGhpcy5kcmF3UndqZkNoclRhYmxlUm93KHJlZ2lvbklkcywgZGF0YSwgJycsICdMb25nIGNvbW11dGUgLSBkcml2aW5nIGFsb25lJywnbG9uZ19jb21tdXRlX2RyaXZpbmdfYWxvbmVfdmFsdWUnLCcwLjAlJylcblxuICAgICAgICAkKCcjcndqZi1jb3VudHktaGVhbHRoLXJhbmtpbmdzLXRhYmxlJykuaHRtbChzKTtcbiAgICB9XG4gICAgXG4gICAgLy8gRWR1Y2F0aW9uXG4gICAgLy9cbiAgICBkcmF3RWR1Y2F0aW9uRGF0YSgpIHtcblxuICAgICAgICBnb29nbGUuc2V0T25Mb2FkQ2FsbGJhY2soKCkgPT4ge1xuXG4gICAgICAgICAgICB2YXIgcmVnaW9uSWRzID0gdGhpcy5wYXJhbXMucmVnaW9ucy5tYXAoZnVuY3Rpb24ocmVnaW9uKSB7IHJldHVybiByZWdpb24uaWQ7IH0pO1xuICAgICAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuXG4gICAgICAgICAgICBjb250cm9sbGVyLmdldEVkdWNhdGlvbkRhdGEocmVnaW9uSWRzKVxuICAgICAgICAgICAgICAgIC50aGVuKGRhdGEgPT4gdGhpcy5kcmF3RWR1Y2F0aW9uVGFibGUocmVnaW9uSWRzLCBkYXRhKSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkcmF3RWR1Y2F0aW9uVGFibGUocmVnaW9uSWRzLCBkYXRhKSB7XG5cbiAgICAgICAgLy8gSGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBzID0gJzx0cj48dGg+PC90aD4nO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcyArPSAnPHRoIGNvbHNwYW49XFwnMlxcJz4nICsgdGhpcy5wYXJhbXMucmVnaW9uc1tpXS5uYW1lICsgJzwvdGg+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvLyBTdWIgaGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHMgKz0gJzwvdHI+PHRyPjx0ZCBjbGFzcz1cXCdjb2x1bW4taGVhZGVyXFwnPjwvdGQ+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0ZCBjbGFzcz1cXCdjb2x1bW4taGVhZGVyXFwnPlBlcmNlbnQ8L3RkPjx0ZCBjbGFzcz1cXCdjb2x1bW4taGVhZGVyXFwnPlBlcmNlbnRpbGU8L3RkPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgLy8gQXQgbGVhc3QgYmFjaGVsb3Inc1xuICAgICAgICAvL1xuICAgICAgICBzICs9ICc8L3RyPjx0cj48dGQ+QXQgTGVhc3QgQmFjaGVsb3JcXCdzIERlZ3JlZTwvdGQ+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgIHZhciB0b3RhbFJhbmtzID0gcGFyc2VJbnQoZGF0YVtpXS50b3RhbF9yYW5rcyk7XG4gICAgICAgICAgICB2YXIgcmFuayA9IHBhcnNlSW50KGRhdGFbaV0ucGVyY2VudF9iYWNoZWxvcnNfZGVncmVlX29yX2hpZ2hlcl9yYW5rKTtcbiAgICAgICAgICAgIHZhciBwZXJjZW50aWxlID0gcGFyc2VJbnQoKCh0b3RhbFJhbmtzIC0gcmFuaykgLyB0b3RhbFJhbmtzKSAqIDEwMCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgZGF0YVtpXS5wZXJjZW50X2JhY2hlbG9yc19kZWdyZWVfb3JfaGlnaGVyICsgJyU8L3RkPic7XG4gICAgICAgICAgICBzICs9ICc8dGQ+JyArIG51bWVyYWwocGVyY2VudGlsZSkuZm9ybWF0KCcwbycpICsgJzwvdGQ+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvLyBBdCBsZWFzdCBoaWdoIHNjaG9vbCBkaXBsb21hXG4gICAgICAgIC8vXG4gICAgICAgIHMgKz0gJzwvdHI+PHRyPjx0ZD5BdCBMZWFzdCBIaWdoIFNjaG9vbCBEaXBsb21hPC90ZD4nO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgIFxuICAgICAgICAgICAgdmFyIHRvdGFsUmFua3MgPSBwYXJzZUludChkYXRhW2ldLnRvdGFsX3JhbmtzKTtcbiAgICAgICAgICAgIHZhciByYW5rID0gcGFyc2VJbnQoZGF0YVtpXS5wZXJjZW50X2hpZ2hfc2Nob29sX2dyYWR1YXRlX29yX2hpZ2hlcik7XG4gICAgICAgICAgICB2YXIgcGVyY2VudGlsZSA9IHBhcnNlSW50KCgodG90YWxSYW5rcyAtIHJhbmspIC8gdG90YWxSYW5rcykgKiAxMDApO1xuICAgIFxuICAgICAgICAgICAgcyArPSAnPHRkPicgKyBkYXRhW2ldLnBlcmNlbnRfaGlnaF9zY2hvb2xfZ3JhZHVhdGVfb3JfaGlnaGVyICsgJyU8L3RkPic7XG4gICAgICAgICAgICBzICs9ICc8dGQ+JyArIG51bWVyYWwocGVyY2VudGlsZSkuZm9ybWF0KCcwbycpICsgJzwvdGQ+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBzICs9ICc8L3RyPic7XG4gICAgXG4gICAgICAgICQoJyNlZHVjYXRpb24tdGFibGUnKS5odG1sKHMpO1xuICAgIH1cbiAgICBcbiAgICAvLyBHRFAgZGF0YVxuICAgIC8vXG4gICAgZHJhd0dkcERhdGEoKSB7XG5cbiAgICAgICAgZ29vZ2xlLnNldE9uTG9hZENhbGxiYWNrKCgpID0+IHtcblxuICAgICAgICAgICAgdmFyIHJlZ2lvbklkcyA9IHRoaXMucGFyYW1zLnJlZ2lvbnMubWFwKGZ1bmN0aW9uKHJlZ2lvbikgeyByZXR1cm4gcmVnaW9uLmlkOyB9KTtcbiAgICAgICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcblxuICAgICAgICAgICAgY29udHJvbGxlci5nZXRHZHBEYXRhKHJlZ2lvbklkcylcbiAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IHsgXG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3R2RwQ2hhcnQocmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3R2RwQ2hhbmdlQ2hhcnQocmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBkcmF3R2RwQ2hhcnQocmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIHZhciBjaGFydERhdGEgPSBbXTtcbiAgICBcbiAgICAgICAgLy8gSGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBoZWFkZXIgPSBbJ1llYXInXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGhlYWRlcltpICsgMV0gPSB0aGlzLnBhcmFtcy5yZWdpb25zW2ldLm5hbWU7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgY2hhcnREYXRhLnB1c2goaGVhZGVyKTtcbiAgICBcbiAgICAgICAgLy8gRm9ybWF0IHRoZSBkYXRhXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBvID0ge307XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIFxuICAgICAgICAgICAgaWYgKG9bZGF0YVtpXS55ZWFyXSA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBvW2RhdGFbaV0ueWVhcl0gPSBbZGF0YVtpXS55ZWFyXTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIG9bZGF0YVtpXS55ZWFyXS5wdXNoKHBhcnNlRmxvYXQoZGF0YVtpXS5wZXJfY2FwaXRhX2dkcCkpO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvKSB7XG4gICAgICAgICAgICBjaGFydERhdGEucHVzaChvW2tleV0pO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8vIERyYXcgY2hhcnRcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5kcmF3TGluZUNoYXJ0KCdwZXItY2FwaXRhLWdkcC1jaGFydCcsIGNoYXJ0RGF0YSwge1xuICAgIFxuICAgICAgICAgICAgY3VydmVUeXBlIDogJ2Z1bmN0aW9uJyxcbiAgICAgICAgICAgIGxlZ2VuZCA6IHsgcG9zaXRpb24gOiAnYm90dG9tJyB9LFxuICAgICAgICAgICAgcG9pbnRTaGFwZSA6ICdzcXVhcmUnLFxuICAgICAgICAgICAgcG9pbnRTaXplIDogOCxcbiAgICAgICAgICAgIHRpdGxlIDogJ1BlciBDYXBpdGEgUmVhbCBHRFAgb3ZlciBUaW1lJyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRyYXdHZHBDaGFuZ2VDaGFydChyZWdpb25JZHMsIGRhdGEpIHtcbiAgICBcbiAgICAgICAgdmFyIGNoYXJ0RGF0YSA9IFtdO1xuICAgIFxuICAgICAgICAvLyBIZWFkZXJcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGhlYWRlciA9IFsnWWVhciddO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaGVhZGVyW2kgKyAxXSA9IHRoaXMucGFyYW1zLnJlZ2lvbnNbaV0ubmFtZTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBjaGFydERhdGEucHVzaChoZWFkZXIpO1xuICAgIFxuICAgICAgICAvLyBGb3JtYXQgdGhlIGRhdGFcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIG8gPSB7fTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICBpZiAob1tkYXRhW2ldLnllYXJdID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG9bZGF0YVtpXS55ZWFyXSA9IFtkYXRhW2ldLnllYXJdO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgb1tkYXRhW2ldLnllYXJdLnB1c2gocGFyc2VGbG9hdChkYXRhW2ldLnBlcl9jYXBpdGFfZ2RwX3BlcmNlbnRfY2hhbmdlKSAvIDEwMCk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgZm9yICh2YXIga2V5IGluIG8pIHtcbiAgICAgICAgICAgIGNoYXJ0RGF0YS5wdXNoKG9ba2V5XSk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgLy8gRHJhdyBjaGFydFxuICAgICAgICAvL1xuICAgICAgICB0aGlzLmRyYXdMaW5lQ2hhcnQoJ3Blci1jYXBpdGEtZ2RwLWNoYW5nZS1jaGFydCcsIGNoYXJ0RGF0YSwge1xuICAgIFxuICAgICAgICAgICAgY3VydmVUeXBlIDogJ2Z1bmN0aW9uJyxcbiAgICAgICAgICAgIGxlZ2VuZCA6IHsgcG9zaXRpb24gOiAnYm90dG9tJyB9LFxuICAgICAgICAgICAgcG9pbnRTaGFwZSA6ICdzcXVhcmUnLFxuICAgICAgICAgICAgcG9pbnRTaXplIDogOCxcbiAgICAgICAgICAgIHRpdGxlIDogJ0FubnVhbCBDaGFuZ2UgaW4gUGVyIENhcGl0YSBHRFAgb3ZlciBUaW1lJyxcbiAgICAgICAgICAgIHZBeGlzIDogeyBmb3JtYXQgOiAnIy4jJScgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIC8vIE9jY3VwYXRpb25zXG4gICAgLy9cbiAgICBkcmF3T2NjdXBhdGlvbnNEYXRhKCkge1xuXG4gICAgICAgIGdvb2dsZS5zZXRPbkxvYWRDYWxsYmFjaygoKSA9PiB7XG5cbiAgICAgICAgICAgIHZhciByZWdpb25JZHMgPSB0aGlzLnBhcmFtcy5yZWdpb25zLm1hcChmdW5jdGlvbihyZWdpb24pIHsgcmV0dXJuIHJlZ2lvbi5pZDsgfSk7XG4gICAgICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG5cbiAgICAgICAgICAgIGNvbnRyb2xsZXIuZ2V0T2NjdXBhdGlvbnNEYXRhKHJlZ2lvbklkcylcbiAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IHRoaXMuZHJhd09jY3VwYXRpb25zVGFibGUocmVnaW9uSWRzLCBkYXRhKSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZHJhd09jY3VwYXRpb25zVGFibGUocmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIHZhciBzID0gJzx0cj48dGg+PC90aD4nO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcyArPSAnPHRoIGNvbHNwYW49XFwnMlxcJz4nICsgdGhpcy5wYXJhbXMucmVnaW9uc1tpXS5uYW1lICsgJzwvdGg+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvLyBTdWIgaGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHMgKz0gJzwvdHI+PHRyPjx0ZCBjbGFzcz1cXCdjb2x1bW4taGVhZGVyXFwnPjwvdGQ+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0ZCBjbGFzcz1cXCdjb2x1bW4taGVhZGVyXFwnPlBlcmNlbnQ8L3RkPjx0ZCBjbGFzcz1cXCdjb2x1bW4taGVhZGVyXFwnPlBlcmNlbnRpbGU8L3RkPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICBpZiAoKGkgJSByZWdpb25JZHMubGVuZ3RoKSA9PSAwKVxuICAgICAgICAgICAgICAgIHMgKz0gJzwvdHI+PHRyPjx0ZD4nICsgZGF0YVtpXS5vY2N1cGF0aW9uICsgJzwvdGQ+JzsgXG4gICAgXG4gICAgICAgICAgICB2YXIgdG90YWxSYW5rcyA9IHBhcnNlSW50KGRhdGFbaV0udG90YWxfcmFua3MpO1xuICAgICAgICAgICAgdmFyIHJhbmsgPSBwYXJzZUludChkYXRhW2ldLnBlcmNlbnRfZW1wbG95ZWRfcmFuayk7XG4gICAgICAgICAgICB2YXIgcGVyY2VudGlsZSA9IHBhcnNlSW50KCgodG90YWxSYW5rcyAtIHJhbmspIC8gdG90YWxSYW5rcykgKiAxMDApO1xuICAgIFxuICAgICAgICAgICAgcyArPSAnPHRkPicgKyBudW1lcmFsKGRhdGFbaV0ucGVyY2VudF9lbXBsb3llZCkuZm9ybWF0KCcwLjAnKSArICclPC90ZD4nO1xuICAgICAgICAgICAgcyArPSAnPHRkPicgKyBudW1lcmFsKHBlcmNlbnRpbGUpLmZvcm1hdCgnMG8nKSArICc8L3RkPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgcyArPSAnPC90cj4nO1xuICAgIFxuICAgICAgICAkKCcjb2NjdXBhdGlvbnMtdGFibGUnKS5odG1sKHMpO1xuICAgIH1cbiAgICBcbiAgICAvLyBQb3B1bGF0aW9uXG4gICAgLy9cbiAgICBkcmF3UG9wdWxhdGlvbkRhdGEoKSB7XG5cbiAgICAgICAgZ29vZ2xlLnNldE9uTG9hZENhbGxiYWNrKCgpID0+IHtcblxuICAgICAgICAgICAgdmFyIHJlZ2lvbklkcyA9IHRoaXMucGFyYW1zLnJlZ2lvbnMubWFwKGZ1bmN0aW9uKHJlZ2lvbikgeyByZXR1cm4gcmVnaW9uLmlkOyB9KTtcbiAgICAgICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcblxuICAgICAgICAgICAgY29udHJvbGxlci5nZXRQb3B1bGF0aW9uRGF0YShyZWdpb25JZHMpXG4gICAgICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7IFxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BvcHVsYXRpb25NYXAoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3UG9wdWxhdGlvbkNoYXJ0KHJlZ2lvbklkcywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BvcHVsYXRpb25DaGFuZ2VDaGFydChyZWdpb25JZHMsIGRhdGEpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRyYXdQb3B1bGF0aW9uQ2hhcnQocmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIHZhciBjaGFydERhdGEgPSBbXTtcbiAgICAgICAgdmFyIHllYXI7XG4gICAgXG4gICAgICAgIC8vIEhlYWRlclxuICAgICAgICAvL1xuICAgICAgICB2YXIgaGVhZGVyID0gWydZZWFyJ107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBoZWFkZXJbaSArIDFdID0gdGhpcy5wYXJhbXMucmVnaW9uc1tpXS5uYW1lO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGNoYXJ0RGF0YS5wdXNoKGhlYWRlcik7XG4gICAgXG4gICAgICAgIC8vIERhdGFcbiAgICAgICAgLy9cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgbSA9IChpICUgcmVnaW9uSWRzLmxlbmd0aCk7XG4gICAgXG4gICAgICAgICAgICBpZiAobSA9PSAwKSB7XG4gICAgXG4gICAgICAgICAgICAgICAgeWVhciA9IFtdO1xuICAgICAgICAgICAgICAgIHllYXJbMF0gPSBkYXRhW2ldLnllYXI7XG4gICAgICAgICAgICAgICAgY2hhcnREYXRhLnB1c2goeWVhcik7XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICB5ZWFyW20gKyAxXSA9IHBhcnNlSW50KGRhdGFbaV0ucG9wdWxhdGlvbik7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgdGhpcy5kcmF3TGluZUNoYXJ0KCdwb3B1bGF0aW9uLWNoYXJ0JywgY2hhcnREYXRhLCB7XG4gICAgXG4gICAgICAgICAgICBjdXJ2ZVR5cGUgOiAnZnVuY3Rpb24nLFxuICAgICAgICAgICAgbGVnZW5kIDogeyBwb3NpdGlvbiA6ICdib3R0b20nIH0sXG4gICAgICAgICAgICBwb2ludFNoYXBlIDogJ3NxdWFyZScsXG4gICAgICAgICAgICBwb2ludFNpemUgOiA4LFxuICAgICAgICAgICAgdGl0bGUgOiAnUG9wdWxhdGlvbicsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBkcmF3UG9wdWxhdGlvbkNoYW5nZUNoYXJ0KHJlZ2lvbklkcywgZGF0YSkge1xuICAgIFxuICAgICAgICB2YXIgY2hhcnREYXRhID0gW107XG4gICAgICAgIHZhciB5ZWFyO1xuICAgIFxuICAgICAgICAvLyBIZWFkZXJcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGhlYWRlciA9IFsnWWVhciddO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaGVhZGVyW2kgKyAxXSA9IHRoaXMucGFyYW1zLnJlZ2lvbnNbaV0ubmFtZTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBjaGFydERhdGEucHVzaChoZWFkZXIpO1xuICAgIFxuICAgICAgICAvLyBEYXRhXG4gICAgICAgIC8vXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIFxuICAgICAgICAgICAgdmFyIG0gPSAoaSAlIHJlZ2lvbklkcy5sZW5ndGgpO1xuICAgIFxuICAgICAgICAgICAgaWYgKG0gPT0gMCkge1xuICAgIFxuICAgICAgICAgICAgICAgIHllYXIgPSBbXTtcbiAgICAgICAgICAgICAgICB5ZWFyWzBdID0gZGF0YVtpXS55ZWFyO1xuICAgICAgICAgICAgICAgIGNoYXJ0RGF0YS5wdXNoKHllYXIpO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgeWVhclttICsgMV0gPSBwYXJzZUZsb2F0KGRhdGFbaV0ucG9wdWxhdGlvbl9wZXJjZW50X2NoYW5nZSkgLyAxMDA7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgdGhpcy5kcmF3TGluZUNoYXJ0KCdwb3B1bGF0aW9uLWNoYW5nZS1jaGFydCcsIGNoYXJ0RGF0YSwge1xuICAgIFxuICAgICAgICAgICAgY3VydmVUeXBlIDogJ2Z1bmN0aW9uJyxcbiAgICAgICAgICAgIGxlZ2VuZCA6IHsgcG9zaXRpb24gOiAnYm90dG9tJyB9LFxuICAgICAgICAgICAgcG9pbnRTaGFwZSA6ICdzcXVhcmUnLFxuICAgICAgICAgICAgcG9pbnRTaXplIDogOCxcbiAgICAgICAgICAgIHRpdGxlIDogJ1BvcHVsYXRpb24gQ2hhbmdlJyxcbiAgICAgICAgICAgIHZBeGlzIDogeyBmb3JtYXQgOiAnIy4jJScgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZHJhd1BvcHVsYXRpb25NYXAoKSB7XG5cbiAgICAgICAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG4gICAgICAgIGNvbnN0IHBsYWNlcyA9IFtdO1xuXG4gICAgICAgIGNvbnRyb2xsZXIuZ2V0UGxhY2VzKClcbiAgICAgICAgICAgIC50aGVuKHBsYWNlc1Jlc3BvbnNlID0+IHtcblxuICAgICAgICAgICAgICAgIC8vIFNldCBwbGFjZSB2YWx1ZSB0byBlYXJuaW5ncyBkYXRhXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICBwbGFjZXNSZXNwb25zZS5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAgICAgICBwbGFjZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlcyA6IGl0ZW0ubG9jYXRpb24uY29vcmRpbmF0ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lIDogaXRlbS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWQgOiBpdGVtLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgOiBwYXJzZUludChpdGVtLnBvcHVsYXRpb24pLFxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gR2V0IG1hcCBkYXRhXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICBjb25zdCBwb3B1bGF0ZWRQbGFjZXMgPSBwbGFjZXMuc29ydCgoYSwgYikgPT4gYi52YWx1ZSAtIGEudmFsdWUpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlZ2lvblBsYWNlcyA9IHRoaXMuZ2V0UGxhY2VzRm9yUmVnaW9uKHBsYWNlc1Jlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwb3B1bGF0aW9ucyA9IF8ubWFwKHBvcHVsYXRlZFBsYWNlcywgeCA9PiB7IHJldHVybiB4LnZhbHVlIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gSW5pdCBtYXBcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIGNvbnN0IHJhZGl1c1NjYWxlID0gdGhpcy5nZXRSYWRpdXNTY2FsZUxvZyhwb3B1bGF0aW9ucylcbiAgICAgICAgICAgICAgICBjb25zdCBjb2xvclNjYWxlID0gdGhpcy5nZXRDb2xvclNjYWxlKHBvcHVsYXRpb25zKVxuXG4gICAgICAgICAgICAgICAgY29uc3QgY29vcmRpbmF0ZXMgPSByZWdpb25QbGFjZXNbMF0ubG9jYXRpb24uY29vcmRpbmF0ZXM7XG4gICAgICAgICAgICAgICAgY29uc3QgY2VudGVyID0gW2Nvb3JkaW5hdGVzWzFdLCBjb29yZGluYXRlc1swXV07XG4gICAgICAgICAgICAgICAgY29uc3QgbWFwID0gTC5tYXAoJ21hcCcsIHsgem9vbUNvbnRyb2wgOiB0cnVlIH0pO1xuXG4gICAgICAgICAgICAgICAgTC50aWxlTGF5ZXIoJ2h0dHBzOi8vYS50aWxlcy5tYXBib3guY29tL3YzL3NvY3JhdGEtYXBwcy5pYnAwbDg5OS97en0ve3h9L3t5fS5wbmcnKS5hZGRUbyhtYXApO1xuICAgICAgICAgICAgICAgIG1hcC5zZXRWaWV3KGNlbnRlciwgdGhpcy5NQVBfSU5JVElBTF9aT09NKTtcblxuICAgICAgICAgICAgICAgIC8vIFBvcHVsYXRlIG1hcFxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3Q2lyY2xlc0ZvclBsYWNlcyhtYXAsIHBvcHVsYXRlZFBsYWNlcywgcmFkaXVzU2NhbGUsIGNvbG9yU2NhbGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhd01hcmtlcnNGb3JQbGFjZXMobWFwLCByZWdpb25QbGFjZXMpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgfVxuXG4gICAgLy8gUGxhY2VzIGluIHJlZ2lvblxuICAgIC8vXG4gICAgZHJhd1BsYWNlc0luUmVnaW9uKCkge1xuXG4gICAgICAgIGlmICh0aGlzLnBhcmFtcy5yZWdpb25zLmxlbmd0aCA9PSAwKSBcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICB2YXIgcmVnaW9uID0gdGhpcy5wYXJhbXMucmVnaW9uc1swXTtcblxuICAgICAgICBzd2l0Y2ggKHJlZ2lvbi50eXBlKSB7XG5cbiAgICAgICAgICAgIGNhc2UgJ25hdGlvbic6IHRoaXMuZHJhd0NoaWxkUGxhY2VzSW5SZWdpb24ocmVnaW9uLCAnUmVnaW9ucyBpbiB7MH0nLmZvcm1hdChyZWdpb24ubmFtZSkpOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3JlZ2lvbic6IHRoaXMuZHJhd0NoaWxkUGxhY2VzSW5SZWdpb24ocmVnaW9uLCAnRGl2aXNpb25zIGluIHswfScuZm9ybWF0KHJlZ2lvbi5uYW1lKSk7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZGl2aXNpb24nOiB0aGlzLmRyYXdDaGlsZFBsYWNlc0luUmVnaW9uKHJlZ2lvbiwgJ1N0YXRlcyBpbiB7MH0nLmZvcm1hdChyZWdpb24ubmFtZSkpOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3N0YXRlJzogdGhpcy5kcmF3Q2l0aWVzQW5kQ291bnRpZXNJblN0YXRlKHJlZ2lvbik7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY291bnR5JzogdGhpcy5kcmF3T3RoZXJDb3VudGllc0luU3RhdGUocmVnaW9uKTsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdtc2EnOiB0aGlzLmRyYXdPdGhlck1ldHJvc0luU3RhdGUocmVnaW9uKTsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdwbGFjZSc6IHRoaXMuZHJhd090aGVyQ2l0aWVzSW5TdGF0ZShyZWdpb24pOyBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRyYXdDaGlsZFBsYWNlc0luUmVnaW9uKHJlZ2lvbiwgbGFiZWwpIHtcblxuICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG5cbiAgICAgICAgY29udHJvbGxlci5nZXRDaGlsZFJlZ2lvbnMocmVnaW9uLmlkKVxuICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdQbGFjZXNJblJlZ2lvbkhlYWRlcignI3BsYWNlcy1pbi1yZWdpb24taGVhZGVyLTAnLCBsYWJlbCk7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3UGxhY2VzSW5SZWdpb25MaXN0KCcjcGxhY2VzLWluLXJlZ2lvbi1saXN0LTAnLCByZXNwb25zZSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICB9XG5cbiAgICBkcmF3Q2l0aWVzQW5kQ291bnRpZXNJblN0YXRlKHJlZ2lvbikge1xuXG4gICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcbiAgICAgICAgdmFyIGNpdGllc1Byb21pc2UgPSBjb250cm9sbGVyLmdldENpdGllc0luU3RhdGUocmVnaW9uLmlkKTtcbiAgICAgICAgdmFyIGNvdW50aWVzUHJvbWlzZSA9IGNvbnRyb2xsZXIuZ2V0Q291bnRpZXNJblN0YXRlKHJlZ2lvbi5pZCk7XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFtjaXRpZXNQcm9taXNlLCBjb3VudGllc1Byb21pc2VdKVxuICAgICAgICAgICAgLnRoZW4odmFsdWVzID0+IHtcblxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZXMubGVuZ3RoID09IDApXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZXNbMF0ubGVuZ3RoID4gMCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BsYWNlc0luUmVnaW9uSGVhZGVyKCcjcGxhY2VzLWluLXJlZ2lvbi1oZWFkZXItMCcsICdQbGFjZXMgaW4gezB9Jy5mb3JtYXQocmVnaW9uLm5hbWUpKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3UGxhY2VzSW5SZWdpb25MaXN0KCcjcGxhY2VzLWluLXJlZ2lvbi1saXN0LTAnLCB2YWx1ZXNbMF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAodmFsdWVzWzFdLmxlbmd0aCA+IDApIHtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdQbGFjZXNJblJlZ2lvbkhlYWRlcignI3BsYWNlcy1pbi1yZWdpb24taGVhZGVyLTEnLCAnQ291bnRpZXMgaW4gezB9Jy5mb3JtYXQocmVnaW9uLm5hbWUpKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3UGxhY2VzSW5SZWdpb25MaXN0KCcjcGxhY2VzLWluLXJlZ2lvbi1saXN0LTEnLCB2YWx1ZXNbMV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgIH1cblxuICAgIGRyYXdPdGhlckNpdGllc0luU3RhdGUocmVnaW9uKSB7XG5cbiAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuXG4gICAgICAgIGNvbnRyb2xsZXIuZ2V0UGFyZW50U3RhdGUocmVnaW9uKVxuICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgIFxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5sZW5ndGggPT0gMClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgIFxuICAgICAgICAgICAgICAgIHZhciBzdGF0ZSA9IHJlc3BvbnNlWzBdO1xuICAgIFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIuZ2V0Q2l0aWVzSW5TdGF0ZShzdGF0ZS5wYXJlbnRfaWQpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UubGVuZ3RoID09IDApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BsYWNlc0luUmVnaW9uSGVhZGVyKCcjcGxhY2VzLWluLXJlZ2lvbi1oZWFkZXItMCcsICdQbGFjZXMgaW4gezB9Jy5mb3JtYXQoc3RhdGUucGFyZW50X25hbWUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BsYWNlc0luUmVnaW9uTGlzdCgnI3BsYWNlcy1pbi1yZWdpb24tbGlzdC0wJywgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZHJhd090aGVyQ291bnRpZXNJblN0YXRlKHJlZ2lvbikge1xuXG4gICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcblxuICAgICAgICBjb250cm9sbGVyLmdldFBhcmVudFN0YXRlKHJlZ2lvbilcbiAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICBcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UubGVuZ3RoID09IDApXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICBcbiAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSByZXNwb25zZVswXTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyLmdldENvdW50aWVzSW5TdGF0ZShzdGF0ZS5wYXJlbnRfaWQpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UubGVuZ3RoID09IDApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BsYWNlc0luUmVnaW9uSGVhZGVyKCcjcGxhY2VzLWluLXJlZ2lvbi1oZWFkZXItMCcsICdDb3VudGllcyBpbiB7MH0nLmZvcm1hdChzdGF0ZS5wYXJlbnRfbmFtZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3UGxhY2VzSW5SZWdpb25MaXN0KCcjcGxhY2VzLWluLXJlZ2lvbi1saXN0LTAnLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkcmF3T3RoZXJNZXRyb3NJblN0YXRlKHJlZ2lvbikge1xuXG4gICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcblxuICAgICAgICBjb250cm9sbGVyLmdldFBhcmVudFN0YXRlKHJlZ2lvbilcbiAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICBcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UubGVuZ3RoID09IDApXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICBcbiAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSByZXNwb25zZVswXTtcbiAgICBcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyLmdldE1ldHJvc0luU3RhdGUoc3RhdGUucGFyZW50X2lkKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmxlbmd0aCA9PSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdQbGFjZXNJblJlZ2lvbkhlYWRlcignI3BsYWNlcy1pbi1yZWdpb24taGVhZGVyLTAnLCAnTWV0cm9wb2xpdGFuIEFyZWFzIGluIHswfScuZm9ybWF0KHN0YXRlLnBhcmVudF9uYW1lKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdQbGFjZXNJblJlZ2lvbkxpc3QoJyNwbGFjZXMtaW4tcmVnaW9uLWxpc3QtMCcsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbW92ZUN1cnJlbnRSZWdpb25zKHJlZ2lvbnMsIG1heENvdW50ID0gNSkge1xuXG4gICAgICAgIHZhciBjb3VudCA9IDA7XG4gICAgICAgIHZhciByZyA9IFtdO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9ucy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5pc1JlZ2lvbklkQ29udGFpbmVkSW5DdXJyZW50UmVnaW9ucyhyZWdpb25zW2ldLmNoaWxkX2lkKSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgcmcucHVzaChyZWdpb25zW2ldKTtcblxuICAgICAgICAgICAgaWYgKGNvdW50ID09IChtYXhDb3VudCAtIDEpKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJnO1xuICAgIH1cblxuICAgIGRyYXdQbGFjZXNJblJlZ2lvbkhlYWRlcihoZWFkZXJJZCwgbGFiZWwpIHtcblxuICAgICAgICAkKGhlYWRlcklkKS50ZXh0KGxhYmVsKS5zbGlkZVRvZ2dsZSgxMDApO1xuICAgIH1cblxuICAgIGRyYXdQbGFjZXNJblJlZ2lvbkxpc3QobGlzdElkLCBkYXRhLCBtYXhDb3VudCA9IDUpIHtcblxuICAgICAgICBpZiAoZGF0YS5sZW5ndGggPT0gMClcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICB2YXIgY291bnQgPSAwO1xuICAgICAgICB2YXIgcyA9ICcnO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5pc1JlZ2lvbklkQ29udGFpbmVkSW5DdXJyZW50UmVnaW9ucyhkYXRhW2ldLmNoaWxkX2lkKSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgcyArPSAnPGxpPjxhIGhyZWY9XCInO1xuICAgICAgICAgICAgcyArPSB0aGlzLmdldFNlYXJjaFBhZ2VGb3JSZWdpb25zQW5kVmVjdG9yVXJsKGRhdGFbaV0uY2hpbGRfbmFtZSkgKyAnXCI+JztcbiAgICAgICAgICAgIHMgKz0gZGF0YVtpXS5jaGlsZF9uYW1lO1xuICAgICAgICAgICAgcyArPSAnPC9hPjwvbGk+JztcblxuICAgICAgICAgICAgaWYgKGNvdW50ID09IChtYXhDb3VudCAtIDEpKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICB9XG5cbiAgICAgICAgJChsaXN0SWQpLmh0bWwocyk7XG4gICAgICAgICQobGlzdElkKS5zbGlkZVRvZ2dsZSgxMDApO1xuICAgIH1cblxuICAgIGlzUmVnaW9uSWRDb250YWluZWRJbkN1cnJlbnRSZWdpb25zKHJlZ2lvbklkKSB7XG5cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLnBhcmFtcy5yZWdpb25zLmxlbmd0aDsgaisrKSB7XG5cbiAgICAgICAgICAgIGlmIChyZWdpb25JZCA9PSB0aGlzLnBhcmFtcy5yZWdpb25zW2pdLmlkKVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFNpbWlsYXIgcmVnaW9uc1xuICAgIC8vXG4gICAgZHJhd1NpbWlsYXJSZWdpb25zKG9uQ2xpY2tSZWdpb24pIHtcblxuICAgICAgICBpZiAodGhpcy5wYXJhbXMucmVnaW9ucy5sZW5ndGggPT0gMCkgXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgdmFyIHJlZ2lvbiA9IHRoaXMucGFyYW1zLnJlZ2lvbnNbMF07XG4gICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcblxuICAgICAgICBjb250cm9sbGVyLmdldFNpbWlsYXJSZWdpb25zKHJlZ2lvbi5pZClcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4gdGhpcy5kcmF3U2ltaWxhclJlZ2lvbnNMaXN0KGRhdGEsIG9uQ2xpY2tSZWdpb24pKVxuICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICB9XG5cbiAgICBkcmF3U2ltaWxhclJlZ2lvbnNMaXN0KGRhdGEsIG9uQ2xpY2tSZWdpb24pIHtcblxuICAgICAgICBpZiAoZGF0YS5tb3N0X3NpbWlsYXIgPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHZhciBjb3VudCA9IDA7XG4gICAgICAgIHZhciBzID0gJyc7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLm1vc3Rfc2ltaWxhci5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5pc1JlZ2lvbklkQ29udGFpbmVkSW5DdXJyZW50UmVnaW9ucyhkYXRhLm1vc3Rfc2ltaWxhcltpXS5pZCkpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgIHMgKz0gJzxsaT48YT48aSBjbGFzcz1cImZhIGZhLXBsdXNcIj48L2k+JyArIGRhdGEubW9zdF9zaW1pbGFyW2ldLm5hbWUgKyAnPC9hPjwvbGk+J1xuXG4gICAgICAgICAgICBpZiAoY291bnQgPT0gNClcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAkKCcjc2ltaWxhci1yZWdpb25zJykuaHRtbChzKTtcbiAgICAgICAgJCgnI3NpbWlsYXItcmVnaW9ucycpLnNsaWRlVG9nZ2xlKDEwMCk7XG4gICAgICAgIFxuICAgICAgICAkKCcjc2ltaWxhci1yZWdpb25zIGxpIGEnKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICBcbiAgICAgICAgICAgIHZhciBpbmRleCA9ICQodGhpcykucGFyZW50KCkuaW5kZXgoKTtcbiAgICAgICAgICAgIG9uQ2xpY2tSZWdpb24oZGF0YS5tb3N0X3NpbWlsYXJbaW5kZXhdLm5hbWUpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgLy8gRHJhdyBjaGFydHNcbiAgICAvL1xuICAgIGRyYXdMaW5lQ2hhcnQoY2hhcnRJZCwgZGF0YSwgb3B0aW9ucykge1xuICAgIFxuICAgICAgICB2YXIgZGF0YVRhYmxlID0gZ29vZ2xlLnZpc3VhbGl6YXRpb24uYXJyYXlUb0RhdGFUYWJsZShkYXRhKTtcbiAgICAgICAgdmFyIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkxpbmVDaGFydChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjaGFydElkKSk7XG4gICAgXG4gICAgICAgIGNoYXJ0LmRyYXcoZGF0YVRhYmxlLCBvcHRpb25zKTtcbiAgICB9XG4gICAgXG4gICAgZHJhd1N0ZXBwZWRBcmVhQ2hhcnQoY2hhcnRJZCwgZGF0YSwgb3B0aW9ucykge1xuICAgIFxuICAgICAgICB2YXIgZGF0YVRhYmxlID0gZ29vZ2xlLnZpc3VhbGl6YXRpb24uYXJyYXlUb0RhdGFUYWJsZShkYXRhKTtcbiAgICAgICAgdmFyIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLlN0ZXBwZWRBcmVhQ2hhcnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY2hhcnRJZCkpO1xuICAgIFxuICAgICAgICBjaGFydC5kcmF3KGRhdGFUYWJsZSwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLy8gTWFwc1xuICAgIC8vXG4gICAgZ2V0UmFkaXVzU2NhbGVMaW5lYXIodmFsdWVzKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnNjYWxlLmxpbmVhcigpXG4gICAgICAgICAgICAuZG9tYWluKGQzLmV4dGVudCh2YWx1ZXMpKVxuICAgICAgICAgICAgLnJhbmdlKHRoaXMuTUFQX1JBRElVU19TQ0FMRSk7XG4gICAgfVxuXG4gICAgZ2V0UmFkaXVzU2NhbGVMb2codmFsdWVzKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnNjYWxlLmxvZygpXG4gICAgICAgICAgICAuZG9tYWluKGQzLmV4dGVudCh2YWx1ZXMpKVxuICAgICAgICAgICAgLnJhbmdlKHRoaXMuTUFQX1JBRElVU19TQ0FMRSk7XG4gICAgfVxuXG4gICAgZ2V0Q29sb3JTY2FsZSh2YWx1ZXMpIHtcblxuICAgICAgICBjb25zdCBkb21haW4gPSAoKCkgPT4ge1xuXG4gICAgICAgICAgICBjb25zdCBzdGVwID0gMS4wIC8gdGhpcy5NQVBfQ09MT1JfU0NBTEUubGVuZ3RoO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBxdWFudGlsZSh2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZDMucXVhbnRpbGUodmFsdWVzLCAoaW5kZXggKyAxKSAqIHN0ZXApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gXy5tYXAodGhpcy5NQVBfQ09MT1JfU0NBTEUuc2xpY2UoMSksIHF1YW50aWxlKTtcbiAgICAgICAgfSkoKTtcblxuICAgICAgICByZXR1cm4gZDMuc2NhbGUucXVhbnRpbGUoKVxuICAgICAgICAgICAgLmRvbWFpbihkb21haW4pXG4gICAgICAgICAgICAucmFuZ2UodGhpcy5NQVBfQ09MT1JfU0NBTEUpO1xuICAgIH1cblxuICAgIGRyYXdDaXJjbGVzRm9yUGxhY2VzKG1hcCwgcGxhY2VzLCByYWRpdXNTY2FsZSwgY29sb3JTY2FsZSkge1xuXG4gICAgICAgIHBsYWNlcy5mb3JFYWNoKHBsYWNlID0+IHtcblxuICAgICAgICAgICAgdmFyIGZlYXR1cmUgPSB7XG4gICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgICAgICAgICAgIFwicHJvcGVydGllc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwibmFtZVwiOiBwbGFjZS5uYW1lXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcImdlb21ldHJ5XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJjb29yZGluYXRlc1wiOiBwbGFjZS5jb29yZGluYXRlcyxcbiAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIGZpbGxDb2xvcjogY29sb3JTY2FsZShwbGFjZS52YWx1ZSksXG4gICAgICAgICAgICAgICAgZmlsbE9wYWNpdHk6IDEsXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMCxcbiAgICAgICAgICAgICAgICByYWRpdXM6IDgsXG4gICAgICAgICAgICAgICAgc3Ryb2tlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB3ZWlnaHQ6IDAsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBMLmdlb0pzb24oXG4gICAgICAgICAgICAgICAgZmVhdHVyZSwgXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBwb2ludFRvTGF5ZXI6IChmZWF0dXJlLCBsYXRsbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBMLmNpcmNsZShsYXRsbmcsIHJhZGl1c1NjYWxlKHBsYWNlLnZhbHVlICksIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKS5hZGRUbyhtYXApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkcmF3TWFya2Vyc0ZvclBsYWNlcyhtYXAsIHBsYWNlcykge1xuXG4gICAgICAgIHBsYWNlcy5mb3JFYWNoKHBsYWNlID0+IHtcblxuICAgICAgICAgICAgdmFyIGZlYXR1cmUgPSB7XG4gICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgICAgICAgICAgIFwicHJvcGVydGllc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwibmFtZVwiOiBwbGFjZS5uYW1lXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcImdlb21ldHJ5XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJjb29yZGluYXRlc1wiOiBwbGFjZS5sb2NhdGlvbi5jb29yZGluYXRlcyxcbiAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBMLmdlb0pzb24oZmVhdHVyZSkuYWRkVG8obWFwKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0UGxhY2VzRm9yUmVnaW9uKGRhdGEpIHtcblxuICAgICAgICB2YXIgcGxhY2VzID0gW107XG5cbiAgICAgICAgZGF0YS5mb3JFYWNoKHBsYWNlID0+IHtcblxuICAgICAgICAgICAgdGhpcy5wYXJhbXMucmVnaW9ucy5mb3JFYWNoKHJlZ2lvbiA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZiAocGxhY2UuaWQgPT0gcmVnaW9uLmlkKVxuICAgICAgICAgICAgICAgICAgICBwbGFjZXMucHVzaChwbGFjZSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcGxhY2VzO1xuICAgIH1cblxuICAgIC8vIFBhZ2luZ1xuICAgIC8vXG4gICAgZmV0Y2hOZXh0UGFnZSgpIHtcbiAgICBcbiAgICAgICAgaWYgKHRoaXMuZmV0Y2hpbmcgfHwgdGhpcy5mZXRjaGVkQWxsKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgIFxuICAgICAgICB0aGlzLmZldGNoaW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pbmNyZW1lbnRQYWdlKCk7XG4gICAgXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBcbiAgICAgICAgJC5hamF4KHRoaXMuZ2V0U2VhcmNoUmVzdWx0c1VybCgpKS5kb25lKGZ1bmN0aW9uKGRhdGEsIHRleHRTdGF0dXMsIGpxWEhSKSB7XG5cbiAgICAgICAgICAgIGlmIChqcVhIUi5zdGF0dXMgPT0gMjA0KSB7IC8vIG5vIGNvbnRlbnRcbiAgICBcbiAgICAgICAgICAgICAgICBzZWxmLmRlY3JlbWVudFBhZ2UoKTtcbiAgICAgICAgICAgICAgICBzZWxmLmZldGNoaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc2VsZi5mZXRjaGVkQWxsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICAkKCcuZGF0YXNldHMnKS5hcHBlbmQoZGF0YSk7XG4gICAgICAgICAgICBzZWxmLmZldGNoaW5nID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBnZXRTZWFyY2hQYWdlRm9yUmVnaW9uc0FuZFZlY3RvclVybChyZWdpb25zLCB2ZWN0b3IsIHNlYXJjaFJlc3VsdHMsIHF1ZXJ5U3RyaW5nKSB7XG4gICAgXG4gICAgICAgIHZhciB1cmwgPSAnLyc7XG4gICAgXG4gICAgICAgIGlmICh0eXBlb2YocmVnaW9ucykgPT09ICdzdHJpbmcnKSB7XG4gICAgXG4gICAgICAgICAgICB1cmwgKz0gcmVnaW9ucy5yZXBsYWNlKC8sL2csICcnKS5yZXBsYWNlKC8gL2csICdfJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZWdpb25zKSkge1xuICAgIFxuICAgICAgICAgICAgdmFyIHJlZ2lvbk5hbWVzID0gW107XG4gICAgXG4gICAgICAgICAgICByZWdpb25OYW1lcyA9IHJlZ2lvbnMubWFwKGZ1bmN0aW9uKHJlZ2lvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWdpb24ucmVwbGFjZSgvLC9nLCAnJykucmVwbGFjZSgvIC9nLCAnXycpO1xuICAgICAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICAgICB1cmwgKz0gcmVnaW9uTmFtZXMuam9pbignX3ZzXycpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgIFxuICAgICAgICAgICAgdXJsICs9ICdzZWFyY2gnO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGlmICh2ZWN0b3IpXG4gICAgICAgICAgICB1cmwgKz0gJy8nICsgdmVjdG9yO1xuICAgIFxuICAgICAgICBpZiAoc2VhcmNoUmVzdWx0cylcbiAgICAgICAgICAgIHVybCArPSAnL3NlYXJjaC1yZXN1bHRzJztcbiAgICBcbiAgICAgICAgaWYgKHF1ZXJ5U3RyaW5nKSBcbiAgICAgICAgICAgIHVybCArPSBxdWVyeVN0cmluZztcbiAgICBcbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICB9XG4gICAgXG4gICAgZ2V0U2VhcmNoUGFnZVVybChzZWFyY2hSZXN1bHRzKSB7XG5cbiAgICAgICAgaWYgKCh0aGlzLnBhcmFtcy5yZWdpb25zLmxlbmd0aCA+IDApIHx8IHRoaXMucGFyYW1zLmF1dG9TdWdnZXN0ZWRSZWdpb24pIHtcblxuICAgICAgICAgICAgdmFyIHJlZ2lvbk5hbWVzID0gW107XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmFtcy5yZXNldFJlZ2lvbnMgPT0gZmFsc2UpIHtcblxuICAgICAgICAgICAgICAgIHJlZ2lvbk5hbWVzID0gdGhpcy5wYXJhbXMucmVnaW9ucy5tYXAoZnVuY3Rpb24ocmVnaW9uKSB7IFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVnaW9uLm5hbWU7IFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJhbXMuYXV0b1N1Z2dlc3RlZFJlZ2lvbilcbiAgICAgICAgICAgICAgICByZWdpb25OYW1lcy5wdXNoKHRoaXMucGFyYW1zLmF1dG9TdWdnZXN0ZWRSZWdpb24pO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRTZWFyY2hQYWdlRm9yUmVnaW9uc0FuZFZlY3RvclVybChyZWdpb25OYW1lcywgdGhpcy5wYXJhbXMudmVjdG9yLCBzZWFyY2hSZXN1bHRzLCB0aGlzLmdldFNlYXJjaFF1ZXJ5U3RyaW5nKCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRTZWFyY2hQYWdlRm9yUmVnaW9uc0FuZFZlY3RvclVybChudWxsLCB0aGlzLnBhcmFtcy52ZWN0b3IsIHNlYXJjaFJlc3VsdHMsIHRoaXMuZ2V0U2VhcmNoUXVlcnlTdHJpbmcoKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRTZWFyY2hSZXN1bHRzVXJsKCkge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmdldFNlYXJjaFBhZ2VVcmwodHJ1ZSk7XG4gICAgfVxuXG4gICAgZ2V0U2VhcmNoUXVlcnlTdHJpbmcoKSB7XG5cbiAgICAgICAgdmFyIHVybCA9ICc/cT0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMucGFyYW1zLnEpO1xuXG4gICAgICAgIGlmICh0aGlzLnBhcmFtcy5wYWdlID4gMSlcbiAgICAgICAgICAgIHVybCArPSAnJnBhZ2U9JyArIHRoaXMucGFyYW1zLnBhZ2U7XG5cbiAgICAgICAgaWYgKHRoaXMucGFyYW1zLmNhdGVnb3JpZXMubGVuZ3RoID4gMClcbiAgICAgICAgICAgIHVybCArPSAnJmNhdGVnb3JpZXM9JyArIGVuY29kZVVSSUNvbXBvbmVudCh0aGlzLnBhcmFtcy5jYXRlZ29yaWVzLmpvaW4oJywnKSk7XG5cbiAgICAgICAgaWYgKHRoaXMucGFyYW1zLmRvbWFpbnMubGVuZ3RoID4gMClcbiAgICAgICAgICAgIHVybCArPSAnJmRvbWFpbnM9JyArIGVuY29kZVVSSUNvbXBvbmVudCh0aGlzLnBhcmFtcy5kb21haW5zLmpvaW4oJywnKSk7XG5cbiAgICAgICAgaWYgKHRoaXMucGFyYW1zLnN0YW5kYXJkcy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgdXJsICs9ICcmc3RhbmRhcmRzPScgKyBlbmNvZGVVUklDb21wb25lbnQodGhpcy5wYXJhbXMuc3RhbmRhcmRzLmpvaW4oJywnKSk7XG5cbiAgICAgICAgaWYgKHRoaXMucGFyYW1zLmRlYnVnKVxuICAgICAgICAgICAgdXJsICs9ICcmZGVidWc9JztcblxuICAgICAgICByZXR1cm4gdXJsO1xuICAgIH1cblxuICAgIGluY3JlbWVudFBhZ2UoKSB7XG4gICAgXG4gICAgICAgIHRoaXMucGFyYW1zLnBhZ2UrKztcbiAgICB9XG4gICAgXG4gICAgbmF2aWdhdGUoKSB7XG4gICAgXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdGhpcy5nZXRTZWFyY2hQYWdlVXJsKCk7XG4gICAgfVxuICAgIFxuICAgIHJlbW92ZVJlZ2lvbihyZWdpb25JbmRleCkge1xuICAgIFxuICAgICAgICB0aGlzLnBhcmFtcy5yZWdpb25zLnNwbGljZShyZWdpb25JbmRleCwgMSk7IC8vIHJlbW92ZSBhdCBpbmRleCBpXG4gICAgICAgIHRoaXMucGFyYW1zLnBhZ2UgPSAxO1xuICAgIH1cbiAgICBcbiAgICBzZXRBdXRvU3VnZ2VzdGVkUmVnaW9uKHJlZ2lvbiwgcmVzZXRSZWdpb25zKSB7XG4gICAgXG4gICAgICAgIHRoaXMucGFyYW1zLmF1dG9TdWdnZXN0ZWRSZWdpb24gPSByZWdpb247XG4gICAgICAgIHRoaXMucGFyYW1zLnJlc2V0UmVnaW9ucyA9IHJlc2V0UmVnaW9ucztcbiAgICAgICAgdGhpcy5wYXJhbXMucGFnZSA9IDE7XG4gICAgfVxuICAgIFxuICAgIHRvZ2dsZUNhdGVnb3J5KGNhdGVnb3J5KSB7XG4gICAgXG4gICAgICAgIHZhciBpID0gdGhpcy5wYXJhbXMuY2F0ZWdvcmllcy5pbmRleE9mKGNhdGVnb3J5KTtcbiAgICBcbiAgICAgICAgaWYgKGkgPiAtMSlcbiAgICAgICAgICAgIHRoaXMucGFyYW1zLmNhdGVnb3JpZXMuc3BsaWNlKGksIDEpOyAvLyByZW1vdmUgYXQgaW5kZXggaVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLnBhcmFtcy5jYXRlZ29yaWVzLnB1c2goY2F0ZWdvcnkpO1xuICAgIH1cbiAgICBcbiAgICB0b2dnbGVEb21haW4oZG9tYWluKSB7XG4gICAgXG4gICAgICAgIHZhciBpID0gdGhpcy5wYXJhbXMuZG9tYWlucy5pbmRleE9mKGRvbWFpbik7XG4gICAgXG4gICAgICAgIGlmIChpID4gLTEpXG4gICAgICAgICAgICB0aGlzLnBhcmFtcy5kb21haW5zLnNwbGljZShpLCAxKTsgLy8gcmVtb3ZlIGF0IGluZGV4IGlcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5wYXJhbXMuZG9tYWlucy5wdXNoKGRvbWFpbik7XG4gICAgfVxuICAgIFxuICAgIHRvZ2dsZVN0YW5kYXJkKHN0YW5kYXJkKSB7XG4gICAgXG4gICAgICAgIHZhciBpID0gdGhpcy5wYXJhbXMuc3RhbmRhcmRzLmluZGV4T2Yoc3RhbmRhcmQpO1xuICAgIFxuICAgICAgICBpZiAoaSA+IC0xKVxuICAgICAgICAgICAgdGhpcy5wYXJhbXMuc3RhbmRhcmRzLnNwbGljZShpLCAxKTsgLy8gcmVtb3ZlIGF0IGluZGV4IGlcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5wYXJhbXMuc3RhbmRhcmRzLnB1c2goc3RhbmRhcmQpO1xuICAgIH1cbn0iXX0=
//# sourceMappingURL=v4-search-page-controller.js.map
