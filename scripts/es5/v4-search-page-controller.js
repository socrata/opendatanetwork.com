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

                    _this5.drawEducationMap();
                    _this5.drawEducationTable(regionIds, data);
                }).catch(function (error) {
                    return console.error(error);
                });
            });
        }
    }, {
        key: 'drawEducationMap',
        value: function drawEducationMap() {
            var _this6 = this;

            var controller = new ApiController();
            var placesPromise = controller.getPlaces();
            var educationPromise = controller.getEducationByPlace();

            return Promise.all([placesPromise, educationPromise]).then(function (values) {

                var placesResponse = values[0];
                var educationResponse = values[1];

                // Get the geo coordinates for each region
                //
                var regionPlaces = _this6.getPlacesForRegion(placesResponse);

                // Create a place lookup table
                //
                var placeMap = {};
                placesResponse.forEach(function (place) {
                    return placeMap[place.id] = place;
                }); // init the place map

                // Get map data
                //
                var educationPlaces = [];

                educationResponse.forEach(function (item) {

                    if (item.percent_bachelors_degree_or_higher == 0) return;

                    if (item.id in placeMap) {

                        educationPlaces.push({
                            coordinates: placeMap[item.id].location.coordinates,
                            id: item.id,
                            name: item.name,
                            value: parseInt(item.percent_bachelors_degree_or_higher)
                        });
                    }
                });

                educationPlaces.sort(function (a, b) {
                    return b.value - a.value;
                }); // desc
                var earnings = _.map(educationPlaces, function (x) {
                    return x.value;
                });

                // Init map
                //
                var radiusScale = _this6.getRadiusScaleLinear(earnings);
                var colorScale = _this6.getColorScale(earnings);

                var coordinates = regionPlaces[0].location.coordinates;
                var center = [coordinates[1], coordinates[0]];
                var map = L.map('map', { zoomControl: true });

                L.tileLayer('https://a.tiles.mapbox.com/v3/socrata-apps.ibp0l899/{z}/{x}/{y}.png').addTo(map);
                map.setView(center, _this6.MAP_INITIAL_ZOOM);

                // Populate map
                //
                _this6.drawCirclesForPlaces(map, educationPlaces, radiusScale, colorScale);
                _this6.drawMarkersForPlaces(map, regionPlaces);
            }).catch(function (error) {
                return console.error(error);
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
            var _this7 = this;

            google.setOnLoadCallback(function () {

                var regionIds = _this7.params.regions.map(function (region) {
                    return region.id;
                });
                var controller = new ApiController();

                controller.getGdpData(regionIds).then(function (data) {

                    _this7.drawGdpChart(regionIds, data);
                    _this7.drawGdpChangeChart(regionIds, data);
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
            var _this8 = this;

            google.setOnLoadCallback(function () {

                var regionIds = _this8.params.regions.map(function (region) {
                    return region.id;
                });
                var controller = new ApiController();

                controller.getOccupationsData(regionIds).then(function (data) {
                    return _this8.drawOccupationsTable(regionIds, data);
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
            var _this9 = this;

            google.setOnLoadCallback(function () {

                var regionIds = _this9.params.regions.map(function (region) {
                    return region.id;
                });
                var controller = new ApiController();

                controller.getPopulationData(regionIds).then(function (data) {

                    _this9.drawPopulationMap();
                    _this9.drawPopulationChart(regionIds, data);
                    _this9.drawPopulationChangeChart(regionIds, data);
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
            var _this10 = this;

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
                var regionPlaces = _this10.getPlacesForRegion(placesResponse);
                var populations = _.map(populatedPlaces, function (x) {
                    return x.value;
                });

                // Init map
                //
                var radiusScale = _this10.getRadiusScaleLog(populations);
                var colorScale = _this10.getColorScale(populations);

                var coordinates = regionPlaces[0].location.coordinates;
                var center = [coordinates[1], coordinates[0]];
                var map = L.map('map', { zoomControl: true });

                L.tileLayer('https://a.tiles.mapbox.com/v3/socrata-apps.ibp0l899/{z}/{x}/{y}.png').addTo(map);
                map.setView(center, _this10.MAP_INITIAL_ZOOM);

                // Populate map
                //
                _this10.drawCirclesForPlaces(map, populatedPlaces, radiusScale, colorScale);
                _this10.drawMarkersForPlaces(map, regionPlaces);
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
            var _this11 = this;

            var controller = new ApiController();

            controller.getChildRegions(region.id).then(function (response) {

                _this11.drawPlacesInRegionHeader('#places-in-region-header-0', label);
                _this11.drawPlacesInRegionList('#places-in-region-list-0', response);
            }).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'drawCitiesAndCountiesInState',
        value: function drawCitiesAndCountiesInState(region) {
            var _this12 = this;

            var controller = new ApiController();
            var citiesPromise = controller.getCitiesInState(region.id);
            var countiesPromise = controller.getCountiesInState(region.id);

            return Promise.all([citiesPromise, countiesPromise]).then(function (values) {

                if (values.length == 0) return;

                if (values[0].length > 0) {

                    _this12.drawPlacesInRegionHeader('#places-in-region-header-0', 'Places in {0}'.format(region.name));
                    _this12.drawPlacesInRegionList('#places-in-region-list-0', values[0]);
                }

                if (values[1].length > 0) {

                    _this12.drawPlacesInRegionHeader('#places-in-region-header-1', 'Counties in {0}'.format(region.name));
                    _this12.drawPlacesInRegionList('#places-in-region-list-1', values[1]);
                }
            }).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'drawOtherCitiesInState',
        value: function drawOtherCitiesInState(region) {
            var _this13 = this;

            var controller = new ApiController();

            controller.getParentState(region).then(function (response) {

                if (response.length == 0) return;

                var state = response[0];

                controller.getCitiesInState(state.parent_id).then(function (response) {

                    if (response.length == 0) return;

                    _this13.drawPlacesInRegionHeader('#places-in-region-header-0', 'Places in {0}'.format(state.parent_name));
                    _this13.drawPlacesInRegionList('#places-in-region-list-0', response);
                }).catch(function (error) {
                    return console.error(error);
                });
            });
        }
    }, {
        key: 'drawOtherCountiesInState',
        value: function drawOtherCountiesInState(region) {
            var _this14 = this;

            var controller = new ApiController();

            controller.getParentState(region).then(function (response) {

                if (response.length == 0) return;

                var state = response[0];

                controller.getCountiesInState(state.parent_id).then(function (response) {

                    if (response.length == 0) return;

                    _this14.drawPlacesInRegionHeader('#places-in-region-header-0', 'Counties in {0}'.format(state.parent_name));
                    _this14.drawPlacesInRegionList('#places-in-region-list-0', response);
                }).catch(function (error) {
                    return console.error(error);
                });
            });
        }
    }, {
        key: 'drawOtherMetrosInState',
        value: function drawOtherMetrosInState(region) {
            var _this15 = this;

            var controller = new ApiController();

            controller.getParentState(region).then(function (response) {

                if (response.length == 0) return;

                var state = response[0];

                controller.getMetrosInState(state.parent_id).then(function (response) {

                    if (response.length == 0) return;

                    _this15.drawPlacesInRegionHeader('#places-in-region-header-0', 'Metropolitan Areas in {0}'.format(state.parent_name));
                    _this15.drawPlacesInRegionList('#places-in-region-list-0', response);
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
            var _this16 = this;

            if (this.params.regions.length == 0) return;

            var region = this.params.regions[0];
            var controller = new ApiController();

            controller.getSimilarRegions(region.id).then(function (data) {
                return _this16.drawSimilarRegionsList(data, onClickRegion);
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
            var _this17 = this;

            var domain = (function () {

                var step = 1.0 / _this17.MAP_COLOR_SCALE.length;

                function quantile(value, index, list) {
                    return d3.quantile(values, (index + 1) * step);
                }

                return _.map(_this17.MAP_COLOR_SCALE.slice(1), quantile);
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
            var _this18 = this;

            var places = [];

            data.forEach(function (place) {

                _this18.params.regions.forEach(function (region) {

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Y0LXNlYXJjaC1wYWdlLWNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBQU0sb0JBQW9CO0FBRXRCLGFBRkUsb0JBQW9CLENBRVYsTUFBTSxFQUFFOzhCQUZsQixvQkFBb0I7O0FBSWxCLFlBQUksQ0FBQyxlQUFlLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFDNUMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztBQUM3QixZQUFJLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRXBDLFlBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLFlBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0FBQ3RCLFlBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO0FBQ3hCLFlBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDOztBQUV0QixZQUFJLElBQUksR0FBRyxJQUFJOzs7O0FBQUMsQUFJaEIsU0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxZQUFXOztBQUVwQyxhQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDekMsYUFBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUM1RixhQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN6QyxDQUFDLENBQUM7O0FBRUgsU0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxZQUFXOztBQUVwQyxhQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFD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LEVBQUU7O0FBRWpCLGdCQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRTVDLGdCQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDTixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUFDLGlCQUVqQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDeEM7Ozt1Q0FFYyxRQUFRLEVBQUU7O0FBRXJCLGdCQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRWhELGdCQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDTixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUFDLGlCQUVuQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDNUM7OztXQW5sREMsb0JBQW9CIiwiZmlsZSI6InY0LXNlYXJjaC1wYWdlLWNvbnRyb2xsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBTZWFyY2hQYWdlQ29udHJvbGxlciB7XG5cbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMpIHtcblxuICAgICAgICB0aGlzLk1BUF9DT0xPUl9TQ0FMRSA9IGNvbG9yYnJld2VyLlJkWWxCdVs5XSxcbiAgICAgICAgdGhpcy5NQVBfSU5JVElBTF9aT09NID0gMTAuMDtcbiAgICAgICAgdGhpcy5NQVBfUkFESVVTX1NDQUxFID0gWzUwMCwgMjAwMF07XG5cbiAgICAgICAgdGhpcy5wYXJhbXMgPSBwYXJhbXM7XG4gICAgICAgIHRoaXMuZmV0Y2hpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5mZXRjaGVkQWxsID0gZmFsc2U7XG4gICAgICAgIHRoaXMubW9zdFNpbWlsYXIgPSBbXTtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgLy8gUmVmaW5lIG1lbnVzXG4gICAgICAgIC8vXG4gICAgICAgICQoJy5yZWZpbmUtbGluaycpLm1vdXNlZW50ZXIoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3JlZmluZS1saW5rLXNlbGVjdGVkJyk7XG4gICAgICAgICAgICAkKHRoaXMpLmNoaWxkcmVuKCdzcGFuJykuY2hpbGRyZW4oJ2knKS5yZW1vdmVDbGFzcygnZmEtY2FyZXQtZG93bicpLmFkZENsYXNzKCdmYS1jYXJldC11cCcpO1xuICAgICAgICAgICAgJCh0aGlzKS5jaGlsZHJlbigndWwnKS5zbGlkZURvd24oMTAwKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJCgnLnJlZmluZS1saW5rJykubW91c2VsZWF2ZShmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygncmVmaW5lLWxpbmstc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgICQodGhpcykuY2hpbGRyZW4oJ3NwYW4nKS5jaGlsZHJlbignaScpLnJlbW92ZUNsYXNzKCdmYS1jYXJldC11cCcpLmFkZENsYXNzKCdmYS1jYXJldC1kb3duJyk7XG4gICAgICAgICAgICAkKHRoaXMpLmNoaWxkcmVuKCd1bCcpLnNsaWRlVXAoMTAwKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQ2F0ZWdvcmllc1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLmF0dGFjaENhdGVnb3JpZXNDbGlja0hhbmRsZXJzKCk7XG5cbiAgICAgICAgJCgnI3JlZmluZS1tZW51LWNhdGVnb3JpZXMtdmlldy1tb3JlJykuY2xpY2soZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcblxuICAgICAgICAgICAgY29udHJvbGxlci5nZXRDYXRlZ29yaWVzKClcbiAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgcmcgPSBkYXRhLnJlc3VsdHMubWFwKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICc8bGk+PGkgY2xhc3M9XCJmYSAnICsgcmVzdWx0Lm1ldGFkYXRhLmljb24gKyAnXCI+PC9pPicgKyByZXN1bHQuY2F0ZWdvcnkgKyAnPC9saT4nO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgcyA9IHJnLmpvaW4oJycpO1xuXG4gICAgICAgICAgICAgICAgICAgICQoJyNyZWZpbmUtbWVudS1jYXRlZ29yaWVzJykuaHRtbChzKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5hdHRhY2hDYXRlZ29yaWVzQ2xpY2tIYW5kbGVycygpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gRG9tYWluc1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLmF0dGFjaERvbWFpbnNDbGlja0hhbmRsZXJzKCk7XG5cbiAgICAgICAgJCgnI3JlZmluZS1tZW51LWRvbWFpbnMtdmlldy1tb3JlJykuY2xpY2soZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcblxuICAgICAgICAgICAgY29udHJvbGxlci5nZXREb21haW5zKClcbiAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgcmcgPSBkYXRhLnJlc3VsdHMubWFwKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICc8bGk+JyArIHJlc3VsdC5kb21haW4gKyAnPC9saT4nO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgcyA9IHJnLmpvaW4oJycpO1xuXG4gICAgICAgICAgICAgICAgICAgICQoJyNyZWZpbmUtbWVudS1kb21haW5zJykuaHRtbChzKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5hdHRhY2hEb21haW5zQ2xpY2tIYW5kbGVycygpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvLyBTdGFuZGFyZHNcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5hdHRhY2hTdGFuZGFyZHNDbGlja0hhbmRsZXJzKCk7XG4gICAgXG4gICAgICAgIC8vIFRva2Vuc1xuICAgICAgICAvL1xuICAgICAgICAkKCcucmVnaW9uLXRva2VuIC5mYS10aW1lcy1jaXJjbGUnKS5jbGljayhmdW5jdGlvbigpIHsgXG4gICAgXG4gICAgICAgICAgICBzZWxmLnJlbW92ZVJlZ2lvbigkKHRoaXMpLnBhcmVudCgpLmluZGV4KCkpO1xuICAgICAgICAgICAgc2VsZi5uYXZpZ2F0ZSgpO1xuICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgJCgnLmNhdGVnb3J5LXRva2VuIC5mYS10aW1lcy1jaXJjbGUnKS5jbGljayhmdW5jdGlvbigpIHsgXG4gICAgXG4gICAgICAgICAgICBzZWxmLnRvZ2dsZUNhdGVnb3J5KCQodGhpcykucGFyZW50KCkudGV4dCgpLnRvTG93ZXJDYXNlKCkudHJpbSgpKTtcbiAgICAgICAgICAgIHNlbGYubmF2aWdhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICQoJy5kb21haW4tdG9rZW4gLmZhLXRpbWVzLWNpcmNsZScpLmNsaWNrKGZ1bmN0aW9uKCkgeyBcbiAgICBcbiAgICAgICAgICAgIHNlbGYudG9nZ2xlRG9tYWluKCQodGhpcykucGFyZW50KCkudGV4dCgpLnRvTG93ZXJDYXNlKCkudHJpbSgpKTtcbiAgICAgICAgICAgIHNlbGYubmF2aWdhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICQoJy5zdGFuZGFyZC10b2tlbiAuZmEtdGltZXMtY2lyY2xlJykuY2xpY2soZnVuY3Rpb24oKSB7IFxuICAgIFxuICAgICAgICAgICAgc2VsZi50b2dnbGVTdGFuZGFyZCgkKHRoaXMpLnBhcmVudCgpLnRleHQoKS50b0xvd2VyQ2FzZSgpLnRyaW0oKSk7XG4gICAgICAgICAgICBzZWxmLm5hdmlnYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICAvLyBJbmZpbml0ZSBzY3JvbGwgc2VhcmNoIHJlc3VsdHNcbiAgICAgICAgLy9cbiAgICAgICAgJCh3aW5kb3cpLm9uKCdzY3JvbGwnLCBmdW5jdGlvbigpIHtcbiAgICBcbiAgICAgICAgICAgIHZhciBib3R0b21PZmZzZXRUb0JlZ2luUmVxdWVzdCA9IDEwMDA7XG4gICAgXG4gICAgICAgICAgICBpZiAoJCh3aW5kb3cpLnNjcm9sbFRvcCgpID49ICQoZG9jdW1lbnQpLmhlaWdodCgpIC0gJCh3aW5kb3cpLmhlaWdodCgpIC0gYm90dG9tT2Zmc2V0VG9CZWdpblJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmZldGNoTmV4dFBhZ2UoKTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgfSkuc2Nyb2xsKCk7XG4gICAgXG4gICAgICAgIC8vIEFkZCBsb2NhdGlvblxuICAgICAgICAvL1xuICAgICAgICBuZXcgQXV0b1N1Z2dlc3RSZWdpb25Db250cm9sbGVyKCcuYWRkLXJlZ2lvbiBpbnB1dFt0eXBlPVwidGV4dFwiXScsICcuYWRkLXJlZ2lvbiB1bCcsIGZ1bmN0aW9uKHJlZ2lvbikge1xuICAgIFxuICAgICAgICAgICAgc2VsZi5zZXRBdXRvU3VnZ2VzdGVkUmVnaW9uKHJlZ2lvbiwgZmFsc2UpO1xuICAgICAgICAgICAgc2VsZi5uYXZpZ2F0ZSgpO1xuICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgJCgnLmFkZC1yZWdpb24gLmZhLXBsdXMnKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICBcbiAgICAgICAgICAgICQoJy5hZGQtcmVnaW9uIGlucHV0W3R5cGU9XCJ0ZXh0XCJdJykuZm9jdXMoKTtcbiAgICAgICAgfSk7XG4gICAgXG4gICAgICAgIC8vIFNpbWlsYXIgcmVnaW9uc1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLmRyYXdTaW1pbGFyUmVnaW9ucyhmdW5jdGlvbihyZWdpb24pIHtcbiAgICBcbiAgICAgICAgICAgIHNlbGYuc2V0QXV0b1N1Z2dlc3RlZFJlZ2lvbihyZWdpb24sIGZhbHNlKTtcbiAgICAgICAgICAgIHNlbGYubmF2aWdhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgXG4gICAgICAgIC8vIFBsYWNlcyBpbiByZWdpb25cbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5kcmF3UGxhY2VzSW5SZWdpb24oKTtcbiAgICB9XG5cbiAgICAvLyBQdWJsaWMgbWV0aG9kc1xuICAgIC8vXG4gICAgYXR0YWNoQ2F0ZWdvcmllc0NsaWNrSGFuZGxlcnMoKSB7XG4gICAgXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBcbiAgICAgICAgJCgnI3JlZmluZS1tZW51LWNhdGVnb3JpZXMgbGk6bm90KC5yZWZpbmUtdmlldy1tb3JlKScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgICAgICAgICAgc2VsZi50b2dnbGVDYXRlZ29yeSgkKHRoaXMpLnRleHQoKS50b0xvd2VyQ2FzZSgpLnRyaW0oKSk7XG4gICAgICAgICAgICBzZWxmLm5hdmlnYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBhdHRhY2hEb21haW5zQ2xpY2tIYW5kbGVycygpIHtcbiAgICBcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBcbiAgICAgICAgJCgnI3JlZmluZS1tZW51LWRvbWFpbnMgbGk6bm90KC5yZWZpbmUtdmlldy1tb3JlKScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgICAgICAgICAgdmFyIGRvbWFpbiA9ICQodGhpcykudGV4dCgpLnRvTG93ZXJDYXNlKCkudHJpbSgpO1xuICAgIFxuICAgICAgICAgICAgc2VsZi50b2dnbGVEb21haW4oZG9tYWluKTtcbiAgICAgICAgICAgIHNlbGYubmF2aWdhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXR0YWNoU3RhbmRhcmRzQ2xpY2tIYW5kbGVycygpIHtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgJCgnI3JlZmluZS1tZW51LXN0YW5kYXJkcyBsaScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB2YXIgc3RhbmRhcmQgPSAkKHRoaXMpLnRleHQoKS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcblxuICAgICAgICAgICAgc2VsZi50b2dnbGVTdGFuZGFyZChzdGFuZGFyZCk7XG4gICAgICAgICAgICBzZWxmLm5hdmlnYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRlY3JlbWVudFBhZ2UoKSB7XG5cbiAgICAgICAgdGhpcy5wYXJhbXMucGFnZS0tO1xuICAgIH1cblxuICAgIC8vIENvc3Qgb2YgbGl2aW5nXG4gICAgLy9cbiAgICBkcmF3Q29zdE9mTGl2aW5nRGF0YSgpIHtcblxuICAgICAgICBnb29nbGUuc2V0T25Mb2FkQ2FsbGJhY2soKCkgPT4ge1xuXG4gICAgICAgICAgICB2YXIgcmVnaW9uSWRzID0gdGhpcy5wYXJhbXMucmVnaW9ucy5tYXAoZnVuY3Rpb24ocmVnaW9uKSB7IHJldHVybiByZWdpb24uaWQ7IH0pO1xuICAgICAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuXG4gICAgICAgICAgICBjb250cm9sbGVyLmdldENvc3RPZkxpdmluZ0RhdGEocmVnaW9uSWRzKVxuICAgICAgICAgICAgICAgIC50aGVuKGRhdGEgPT4geyBcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdDb3N0T2ZMaXZpbmdDaGFydChyZWdpb25JZHMsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdDb3N0T2ZMaXZpbmdUYWJsZShyZWdpb25JZHMsIGRhdGEpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRyYXdDb3N0T2ZMaXZpbmdDaGFydChyZWdpb25JZHMsIGRhdGEpIHtcbiAgICBcbiAgICAgICAgdGhpcy5kcmF3Q29zdE9mTGl2aW5nQ2hhcnRGb3JDb21wb25lbnQoJ2Nvc3Qtb2YtbGl2aW5nLWFsbC1jaGFydCcsICdBbGwnLCByZWdpb25JZHMsIGRhdGEpO1xuICAgICAgICB0aGlzLmRyYXdDb3N0T2ZMaXZpbmdDaGFydEZvckNvbXBvbmVudCgnY29zdC1vZi1saXZpbmctZ29vZHMtY2hhcnQnLCAnR29vZHMnLCByZWdpb25JZHMsIGRhdGEpO1xuICAgICAgICB0aGlzLmRyYXdDb3N0T2ZMaXZpbmdDaGFydEZvckNvbXBvbmVudCgnY29zdC1vZi1saXZpbmctcmVudHMtY2hhcnQnLCAnUmVudHMnLCByZWdpb25JZHMsIGRhdGEpO1xuICAgICAgICB0aGlzLmRyYXdDb3N0T2ZMaXZpbmdDaGFydEZvckNvbXBvbmVudCgnY29zdC1vZi1saXZpbmctb3RoZXItY2hhcnQnLCAnT3RoZXInLCByZWdpb25JZHMsIGRhdGEpO1xuICAgIH1cbiAgICBcbiAgICBkcmF3Q29zdE9mTGl2aW5nQ2hhcnRGb3JDb21wb25lbnQoaWQsIGNvbXBvbmVudCwgcmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIHZhciBjaGFydERhdGEgPSBbXVxuICAgIFxuICAgICAgICAvLyBIZWFkZXJcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGhlYWRlciA9IFsnWWVhciddO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaGVhZGVyW2kgKyAxXSA9IHRoaXMucGFyYW1zLnJlZ2lvbnNbaV0ubmFtZTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBjaGFydERhdGEucHVzaChoZWFkZXIpO1xuICAgIFxuICAgICAgICAvLyBGb3JtYXQgdGhlIGRhdGFcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIG8gPSB7fTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICBpZiAoZGF0YVtpXS5jb21wb25lbnQgIT0gY29tcG9uZW50KVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgIFxuICAgICAgICAgICAgaWYgKG9bZGF0YVtpXS55ZWFyXSA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBvW2RhdGFbaV0ueWVhcl0gPSBbZGF0YVtpXS55ZWFyXTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIG9bZGF0YVtpXS55ZWFyXS5wdXNoKHBhcnNlRmxvYXQoZGF0YVtpXS5pbmRleCkpO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvKSB7XG4gICAgICAgICAgICBjaGFydERhdGEucHVzaChvW2tleV0pO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIHRoaXMuZHJhd0xpbmVDaGFydChpZCwgY2hhcnREYXRhLCB7XG4gICAgXG4gICAgICAgICAgICBjdXJ2ZVR5cGUgOiAnZnVuY3Rpb24nLFxuICAgICAgICAgICAgbGVnZW5kIDogeyBwb3NpdGlvbiA6ICdib3R0b20nIH0sXG4gICAgICAgICAgICBwb2ludFNoYXBlIDogJ3NxdWFyZScsXG4gICAgICAgICAgICBwb2ludFNpemUgOiA4LFxuICAgICAgICAgICAgdGl0bGUgOiBjb21wb25lbnQsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBkcmF3Q29zdE9mTGl2aW5nVGFibGUocmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIC8vIEZvcm1hdCB0aGUgZGF0YVxuICAgICAgICAvL1xuICAgICAgICB2YXIgY29tcG9uZW50cyA9IFsnQWxsJywgJ0dvb2RzJywgJ090aGVyJywgJ1JlbnRzJ107XG4gICAgICAgIHZhciByb3dzID0gW107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29tcG9uZW50cy5sZW5ndGg7IGkrKykge1xuICAgIFxuICAgICAgICAgICAgdmFyIGNvbXBvbmVudCA9IGNvbXBvbmVudHNbaV07XG4gICAgICAgICAgICB2YXIgcm93ID0gW2NvbXBvbmVudF07XG4gICAgXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHJlZ2lvbklkcy5sZW5ndGg7IGorKykge1xuICAgIFxuICAgICAgICAgICAgICAgIHZhciBvID0gdGhpcy5nZXRMYXRlc3RDb3N0T2ZMaXZpbmcoZGF0YSwgcmVnaW9uSWRzW2pdLCBjb21wb25lbnQpO1xuICAgIFxuICAgICAgICAgICAgICAgIHJvdy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggOiAobyAhPSBudWxsKSA/IHBhcnNlRmxvYXQoby5pbmRleCkgOiAnTkEnLFxuICAgICAgICAgICAgICAgICAgICBwZXJjZW50aWxlIDogKG8gIT0gbnVsbCkgPyB0aGlzLmdldFBlcmNlbnRpbGUoby5yYW5rLCBvLnRvdGFsX3JhbmtzKSA6ICdOQScsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICByb3dzLnB1c2gocm93KTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvLyBIZWFkZXJcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIHMgPSAnPHRyPjx0aD48L3RoPic7XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzICs9ICc8dGggY29sc3Bhbj1cXCcyXFwnPicgKyB0aGlzLnBhcmFtcy5yZWdpb25zW2ldLm5hbWUgKyAnPC90aD4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8vIFN1YiBoZWFkZXJcbiAgICAgICAgLy9cbiAgICAgICAgcyArPSAnPC90cj48dHI+PHRkIGNsYXNzPVxcJ2NvbHVtbi1oZWFkZXJcXCc+PC90ZD4nO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcyArPSAnPHRkIGNsYXNzPVxcJ2NvbHVtbi1oZWFkZXJcXCc+VmFsdWU8L3RkPjx0ZCBjbGFzcz1cXCdjb2x1bW4taGVhZGVyXFwnPlBlcmNlbnRpbGU8L3RkPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgcyArPSAnPC90cj4nO1xuICAgICAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb3dzLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgcm93ID0gcm93c1tpXTtcbiAgICBcbiAgICAgICAgICAgIHMgKz0gJzx0cj4nO1xuICAgICAgICAgICAgcyArPSAnPHRkPicgKyByb3dbMF0gKyAnPC90ZD4nO1xuICAgIFxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDE7IGogPCByb3cubGVuZ3RoOyBqKyspIHtcbiAgICBcbiAgICAgICAgICAgICAgICBzICs9ICc8dGQ+JyArIHJvd1tqXS5pbmRleCArICc8L3RkPic7XG4gICAgICAgICAgICAgICAgcyArPSAnPHRkPicgKyByb3dbal0ucGVyY2VudGlsZSArICc8L3RkPic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHMgKz0gJzwvdHI+JztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAkKCcjY29zdC1vZi1saXZpbmctdGFibGUnKS5odG1sKHMpO1xuICAgIH1cbiAgICBcbiAgICBnZXRQZXJjZW50aWxlKHJhbmssIHRvdGFsUmFua3MpIHtcbiAgICBcbiAgICAgICAgdmFyIHRvdGFsUmFua3MgPSBwYXJzZUludCh0b3RhbFJhbmtzKTtcbiAgICAgICAgdmFyIHJhbmsgPSBwYXJzZUludChyYW5rKTtcbiAgICAgICAgdmFyIHBlcmNlbnRpbGUgPSBwYXJzZUludCgoKHRvdGFsUmFua3MgLSByYW5rKSAvIHRvdGFsUmFua3MpICogMTAwKTtcbiAgICBcbiAgICAgICAgcmV0dXJuIG51bWVyYWwocGVyY2VudGlsZSkuZm9ybWF0KCcwbycpO1xuICAgIH1cbiAgICBcbiAgICBnZXRMYXRlc3RDb3N0T2ZMaXZpbmcoZGF0YSwgcmVnaW9uSWQsIGNvbXBvbmVudCkge1xuICAgIFxuICAgICAgICB2YXIgZGF0dW0gPSBudWxsO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgIGlmIChkYXRhW2ldLmlkICE9IHJlZ2lvbklkKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgIFxuICAgICAgICAgICAgaWYgKGRhdGFbaV0uY29tcG9uZW50ICE9IGNvbXBvbmVudClcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICBcbiAgICAgICAgICAgIGlmIChkYXR1bSA9PSBudWxsKSB7XG4gICAgXG4gICAgICAgICAgICAgICAgZGF0dW0gPSBkYXRhW2ldO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgaWYgKHBhcnNlSW50KGRhdGFbaV0ueWVhcikgPD0gcGFyc2VJbnQoZGF0dW0ueWVhcikpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgXG4gICAgICAgICAgICBkYXR1bSA9IGRhdGFbaV07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBkYXR1bTtcbiAgICB9XG4gICAgXG4gICAgLy8gRWFybmluZ3NcbiAgICAvL1xuICAgIGRyYXdFYXJuaW5nc0RhdGEoKSB7XG5cbiAgICAgICAgZ29vZ2xlLnNldE9uTG9hZENhbGxiYWNrKCgpID0+IHtcbiAgICBcbiAgICAgICAgICAgIHZhciByZWdpb25JZHMgPSB0aGlzLnBhcmFtcy5yZWdpb25zLm1hcChmdW5jdGlvbihyZWdpb24pIHsgcmV0dXJuIHJlZ2lvbi5pZDsgfSk7XG4gICAgICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG4gICAgXG4gICAgICAgICAgICBjb250cm9sbGVyLmdldEVhcm5pbmdzRGF0YShyZWdpb25JZHMpXG4gICAgICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7IFxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd0Vhcm5pbmdzTWFwKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd0Vhcm5pbmdzQ2hhcnQocmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3RWFybmluZ3NUYWJsZShyZWdpb25JZHMsIGRhdGEpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZHJhd0Vhcm5pbmdzQ2hhcnQocmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIHZhciBlYXJuaW5ncyA9IFtdO1xuICAgIFxuICAgICAgICAvLyBIZWFkZXJcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGhlYWRlciA9IFsnRWR1Y2F0aW9uIExldmVsJ107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBoZWFkZXJbaSArIDFdID0gdGhpcy5wYXJhbXMucmVnaW9uc1tpXS5uYW1lO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGVhcm5pbmdzLnB1c2goaGVhZGVyKTtcbiAgICBcbiAgICAgICAgLy8gTGVzcyB0aGFuIGhpZ2ggc2Nob29sXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBzb21lSGlnaFNjaG9vbEVhcm5pbmdzID0gWydTb21lIEhpZ2ggU2Nob29sJ107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzb21lSGlnaFNjaG9vbEVhcm5pbmdzW2kgKyAxXSA9IHBhcnNlSW50KGRhdGFbaV0ubWVkaWFuX2Vhcm5pbmdzX2xlc3NfdGhhbl9oaWdoX3NjaG9vbCk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgZWFybmluZ3MucHVzaChzb21lSGlnaFNjaG9vbEVhcm5pbmdzKTtcbiAgICBcbiAgICAgICAgLy8gSGlnaCBzY2hvb2xcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGhpZ2hTY2hvb2xFYXJuaW5ncyA9IFsnSGlnaCBTY2hvb2wnXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGhpZ2hTY2hvb2xFYXJuaW5nc1tpICsgMV0gPSBwYXJzZUludChkYXRhW2ldLm1lZGlhbl9lYXJuaW5nc19oaWdoX3NjaG9vbCk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgZWFybmluZ3MucHVzaChoaWdoU2Nob29sRWFybmluZ3MpO1xuICAgIFxuICAgICAgICAvLyBTb21lIGNvbGxlZ2VcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIHNvbWVDb2xsZWdlRWFybmluZ3MgPSBbJ1NvbWUgQ29sbGVnZSddO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc29tZUNvbGxlZ2VFYXJuaW5nc1tpICsgMV0gPSBwYXJzZUludChkYXRhW2ldLm1lZGlhbl9lYXJuaW5nc19zb21lX2NvbGxlZ2Vfb3JfYXNzb2NpYXRlcyk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgZWFybmluZ3MucHVzaChzb21lQ29sbGVnZUVhcm5pbmdzKTtcbiAgICBcbiAgICAgICAgLy8gQmFjaGVsb3Inc1xuICAgICAgICAvL1xuICAgICAgICB2YXIgYmFjaGVsb3JzRWFybmluZ3MgPSBbJ0JhY2hlbG9yXFwncyddO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYmFjaGVsb3JzRWFybmluZ3NbaSArIDFdID0gcGFyc2VJbnQoZGF0YVtpXS5tZWRpYW5fZWFybmluZ3NfYmFjaGVsb3JfZGVncmVlKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBlYXJuaW5ncy5wdXNoKGJhY2hlbG9yc0Vhcm5pbmdzKTtcbiAgICBcbiAgICAgICAgLy8gR3JhZHVhdGUgZGVncmVlXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBncmFkdWF0ZURlZ3JlZUVhcm5pbmdzID0gWydHcmFkdWF0ZSBEZWdyZWUnXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGdyYWR1YXRlRGVncmVlRWFybmluZ3NbaSArIDFdID0gcGFyc2VJbnQoZGF0YVtpXS5tZWRpYW5fZWFybmluZ3NfZ3JhZHVhdGVfb3JfcHJvZmVzc2lvbmFsX2RlZ3JlZSk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgZWFybmluZ3MucHVzaChncmFkdWF0ZURlZ3JlZUVhcm5pbmdzKTtcbiAgICBcbiAgICAgICAgdGhpcy5kcmF3U3RlcHBlZEFyZWFDaGFydCgnZWFybmluZ3MtY2hhcnQnLCBlYXJuaW5ncywge1xuICAgIFxuICAgICAgICAgICAgYXJlYU9wYWNpdHkgOiAwLFxuICAgICAgICAgICAgY29ubmVjdFN0ZXBzOiB0cnVlLFxuICAgICAgICAgICAgY3VydmVUeXBlIDogJ2Z1bmN0aW9uJyxcbiAgICAgICAgICAgIGZvY3VzVGFyZ2V0IDogJ2NhdGVnb3J5JyxcbiAgICAgICAgICAgIGxlZ2VuZCA6IHsgcG9zaXRpb24gOiAnYm90dG9tJyB9LFxuICAgICAgICAgICAgdGl0bGUgOiAnRWFybmluZ3MgYnkgRWR1Y2F0aW9uIExldmVsJyxcbiAgICAgICAgICAgIHZBeGlzIDogeyBmb3JtYXQgOiAnY3VycmVuY3knIH0sXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRyYXdFYXJuaW5nc01hcCgpIHtcblxuICAgICAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcbiAgICAgICAgY29uc3QgcGxhY2VzUHJvbWlzZSA9IGNvbnRyb2xsZXIuZ2V0UGxhY2VzKCk7XG4gICAgICAgIGNvbnN0IGVhcm5pbmdzUHJvbWlzZSA9IGNvbnRyb2xsZXIuZ2V0RWFybmluZ3NCeVBsYWNlKCk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoW3BsYWNlc1Byb21pc2UsIGVhcm5pbmdzUHJvbWlzZV0pXG4gICAgICAgICAgICAudGhlbih2YWx1ZXMgPT4ge1xuXG4gICAgICAgICAgICAgICAgY29uc3QgcGxhY2VzUmVzcG9uc2UgPSB2YWx1ZXNbMF07XG4gICAgICAgICAgICAgICAgY29uc3QgZWFybmluZ3NSZXNwb25zZSA9IHZhbHVlc1sxXTtcblxuICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgZ2VvIGNvb3JkaW5hdGVzIGZvciBlYWNoIHJlZ2lvblxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgY29uc3QgcmVnaW9uUGxhY2VzID0gdGhpcy5nZXRQbGFjZXNGb3JSZWdpb24ocGxhY2VzUmVzcG9uc2UpO1xuXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGEgcGxhY2UgbG9va3VwIHRhYmxlXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICBjb25zdCBwbGFjZU1hcCA9IHt9O1xuICAgICAgICAgICAgICAgIHBsYWNlc1Jlc3BvbnNlLmZvckVhY2gocGxhY2UgPT4gcGxhY2VNYXBbcGxhY2UuaWRdID0gcGxhY2UpOyAvLyBpbml0IHRoZSBwbGFjZSBtYXBcblxuICAgICAgICAgICAgICAgIC8vIEdldCBtYXAgZGF0YVxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgY29uc3QgZWFybmluZ3NQbGFjZXMgPSBbXTtcblxuICAgICAgICAgICAgICAgIGVhcm5pbmdzUmVzcG9uc2UuZm9yRWFjaChpdGVtID0+IHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5tZWRpYW5fZWFybmluZ3MgPT0gMClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5pZCBpbiBwbGFjZU1hcCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBlYXJuaW5nc1BsYWNlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlcyA6IHBsYWNlTWFwW2l0ZW0uaWRdLmxvY2F0aW9uLmNvb3JkaW5hdGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkIDogaXRlbS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lIDogaXRlbS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlIDogcGFyc2VJbnQoaXRlbS5tZWRpYW5fZWFybmluZ3MpLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgZWFybmluZ3NQbGFjZXMuc29ydCgoYSwgYikgPT4gYi52YWx1ZSAtIGEudmFsdWUpOyAvLyBkZXNjXG4gICAgICAgICAgICAgICAgY29uc3QgZWFybmluZ3MgPSBfLm1hcChlYXJuaW5nc1BsYWNlcywgeCA9PiB7IHJldHVybiB4LnZhbHVlIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gSW5pdCBtYXBcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIGNvbnN0IHJhZGl1c1NjYWxlID0gdGhpcy5nZXRSYWRpdXNTY2FsZUxpbmVhcihlYXJuaW5ncylcbiAgICAgICAgICAgICAgICBjb25zdCBjb2xvclNjYWxlID0gdGhpcy5nZXRDb2xvclNjYWxlKGVhcm5pbmdzKVxuXG4gICAgICAgICAgICAgICAgY29uc3QgY29vcmRpbmF0ZXMgPSByZWdpb25QbGFjZXNbMF0ubG9jYXRpb24uY29vcmRpbmF0ZXM7XG4gICAgICAgICAgICAgICAgY29uc3QgY2VudGVyID0gW2Nvb3JkaW5hdGVzWzFdLCBjb29yZGluYXRlc1swXV07XG4gICAgICAgICAgICAgICAgY29uc3QgbWFwID0gTC5tYXAoJ21hcCcsIHsgem9vbUNvbnRyb2wgOiB0cnVlIH0pO1xuXG4gICAgICAgICAgICAgICAgTC50aWxlTGF5ZXIoJ2h0dHBzOi8vYS50aWxlcy5tYXBib3guY29tL3YzL3NvY3JhdGEtYXBwcy5pYnAwbDg5OS97en0ve3h9L3t5fS5wbmcnKS5hZGRUbyhtYXApO1xuICAgICAgICAgICAgICAgIG1hcC5zZXRWaWV3KGNlbnRlciwgdGhpcy5NQVBfSU5JVElBTF9aT09NKTtcblxuICAgICAgICAgICAgICAgIC8vIFBvcHVsYXRlIG1hcFxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3Q2lyY2xlc0ZvclBsYWNlcyhtYXAsIGVhcm5pbmdzUGxhY2VzLCByYWRpdXNTY2FsZSwgY29sb3JTY2FsZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3TWFya2Vyc0ZvclBsYWNlcyhtYXAsIHJlZ2lvblBsYWNlcyk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICB9XG5cbiAgICBkcmF3RWFybmluZ3NUYWJsZShyZWdpb25JZHMsIGRhdGEpIHtcblxuICAgICAgICB2YXIgcyA9ICc8dHI+PHRoPjwvdGg+JztcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcyArPSAnPHRoPicgKyB0aGlzLnBhcmFtcy5yZWdpb25zW2ldLm5hbWUgKyAnPC90aD4nO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTWVkaWFuIGVhcm5pbmdzIGFsbFxuICAgICAgICAvL1xuICAgICAgICBzICs9ICc8L3RyPjx0cj48dGQ+TWVkaWFuIEVhcm5pbmdzIChBbGwgV29ya2Vycyk8L3RkPic7XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzICs9ICc8dGQ+JyArIG51bWVyYWwoZGF0YVtpXS5tZWRpYW5fZWFybmluZ3MpLmZvcm1hdCgnJDAsMCcpICsgJzwvdGQ+JztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE1lZGlhbiBlYXJuaW5ncyBmZW1hbGVcbiAgICAgICAgLy9cbiAgICAgICAgcyArPSAnPC90cj48dHI+PHRkPk1lZGlhbiBGZW1hbGUgRWFybmluZ3MgKEZ1bGwgVGltZSk8L3RkPic7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgbnVtZXJhbChkYXRhW2ldLmZlbWFsZV9mdWxsX3RpbWVfbWVkaWFuX2Vhcm5pbmdzKS5mb3JtYXQoJyQwLDAnKSArICc8L3RkPic7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNZWRpYW4gZWFybmluZ3MgbWFsZVxuICAgICAgICAvL1xuICAgICAgICBzICs9ICc8L3RyPjx0cj48dGQ+TWVkaWFuIE1hbGUgRWFybmluZ3MgKEZ1bGwgVGltZSk8L3RkPic7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgbnVtZXJhbChkYXRhW2ldLm1hbGVfZnVsbF90aW1lX21lZGlhbl9lYXJuaW5ncykuZm9ybWF0KCckMCwwJykgKyAnPC90ZD4nO1xuICAgICAgICB9XG5cbiAgICAgICAgcyArPSAnPC90cj4nO1xuXG4gICAgICAgICQoJyNlYXJuaW5ncy10YWJsZScpLmh0bWwocyk7XG4gICAgfVxuXG4gICAgLy8gSGVhbHRoXG4gICAgLy9cbiAgICBkcmF3SGVhbHRoRGF0YSgpIHtcbiAgICBcbiAgICAgICAgZ29vZ2xlLnNldE9uTG9hZENhbGxiYWNrKCgpID0+IHtcblxuICAgICAgICAgICAgdmFyIHJlZ2lvbklkcyA9IHRoaXMucGFyYW1zLnJlZ2lvbnMubWFwKGZ1bmN0aW9uKHJlZ2lvbikgeyByZXR1cm4gcmVnaW9uLmlkOyB9KTtcbiAgICAgICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcblxuICAgICAgICAgICAgY29udHJvbGxlci5nZXRIZWFsdGhSd2pmQ2hyRGF0YShyZWdpb25JZHMpXG4gICAgICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB0aGlzLmRyYXdSd2pmQ2hyVGFibGUocmVnaW9uSWRzLCBkYXRhKSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgICAgICB9KTtcbiAgICBcbiAgICB9XG4gICAgXG4gICAgZHJhd1J3amZDaHJUYWJsZVJvdyhyZWdpb25JZHMsIGRhdGEsIGZpcnN0X3RkLCB2YXJfbGFiZWwsIHZhcl9rZXksIGZtdF9zdHIsIGFkZGxfZm10ID0gJycpIHtcbiAgICAgICAgdmFyIHMgPSAnPHRyPicrZmlyc3RfdGQrJzx0ZD4nK3Zhcl9sYWJlbCsnPC90ZD4nXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzICs9ICc8dGQ+J1xuICAgICAgICAgICAgaWYoZGF0YVtpXSAmJiBkYXRhW2ldW3Zhcl9rZXldKXtcbiAgICAgICAgICAgICAgICBzICs9IG51bWVyYWwoZGF0YVtpXVt2YXJfa2V5XS5yZXBsYWNlKCcsJywnJykpLmZvcm1hdChmbXRfc3RyKSArIGFkZGxfZm10XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHMgKz0gJydcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHMgKz0gJzwvdGQ+JztcbiAgICAgICAgfVxuICAgICAgICBzICs9ICc8L3RyPidcbiAgICAgICAgcmV0dXJuIHNcbiAgICB9XG5cbiAgICBkcmF3UndqZkNoclRhYmxlKHJlZ2lvbklkcywgZGF0YSkge1xuICAgIFxuICAgICAgICB2YXIgcyA9ICcnO1xuXG4gICAgICAgIC8vIGZpcnN0IHJvdywgd2hpY2ggaXMgcmVnaW9uIG5hbWVzXG4gICAgICAgIHMgKz0gJzx0cj48dGg+PC90aD48dGg+PC90aD4nO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcyArPSAnPHRoPicgKyB0aGlzLnBhcmFtcy5yZWdpb25zW2ldLm5hbWUgKyAnPC90aD4nO1xuICAgICAgICB9XG4gICAgICAgIHMgKz0gJzwvdHI+J1xuXG4gICAgICAgIC8vIEhFQUxUSCBPVVRDT01FU1xuICAgICAgICBzICs9ICc8dHI+PHRkIGNvbHNwYW49JytudW1lcmFsKHJlZ2lvbklkcy5sZW5ndGgpKzErJz5IRUFMVEggT1VUQ09NRVM8L3RkPjwvdHI+J1xuICAgICAgICAvLyBoZWFsdGggb3V0Y29tZXMgLSBsZW5ndGggb2YgbGlmZSAtIDEgbWVhc3VyZVxuICAgICAgICBzICs9IHRoaXMuZHJhd1J3amZDaHJUYWJsZVJvdyhyZWdpb25JZHMsIGRhdGEsICc8dGQgcm93c3Bhbj0xPkxlbmd0aCBvZiBMaWZlPC90ZD4nLCAnUHJlbWF0dXJlIERlYXRoJywncHJlbWF0dXJlX2RlYXRoX3ZhbHVlJywnMCwwJylcbiAgICAgICAgLy8gaGVhbHRoIG91dGNvbWVzIC0gcXVhbGl0eSBvZiBsaWZlIC0gNCBtZWFzdXJlc1xuICAgICAgICBzICs9IHRoaXMuZHJhd1J3amZDaHJUYWJsZVJvdyhyZWdpb25JZHMsIGRhdGEsICc8dGQgcm93c3Bhbj00PlF1YWxpdHkgb2YgTGlmZTwvdGQ+JywgJ1Bvb3Igb3IgZmFpciBoZWFsdGgnLCdwb29yX29yX2ZhaXJfaGVhbHRoX3ZhbHVlJywnMC4wJScpXG4gICAgICAgIHMgKz0gdGhpcy5kcmF3UndqZkNoclRhYmxlUm93KHJlZ2lvbklkcywgZGF0YSwgJycsICdQb29yIHBoeXNpY2FsIGhlYWx0aCBkYXlzJywncG9vcl9waHlzaWNhbF9oZWFsdGhfZGF5c192YWx1ZScsJzAuMCcpXG4gICAgICAgIHMgKz0gdGhpcy5kcmF3UndqZkNoclRhYmxlUm93KHJlZ2lvbklkcywgZGF0YSwgJycsICdQb29yIG1lbnRhbCBoZWFsdGggZGF5cycsJ3Bvb3JfbWVudGFsX2hlYWx0aF9kYXlzX3ZhbHVlJywnMC4wJylcbiAgICAgICAgcyArPSB0aGlzLmRyYXdSd2pmQ2hyVGFibGVSb3cocmVnaW9uSWRzLCBkYXRhLCAnJywgJ0xvdyBiaXJ0aHdlaWdodCcsJ2xvd19iaXJ0aHdlaWdodF92YWx1ZScsJzAuMCUnKVxuXG4gICAgICAgIC8vIEhFQUxUSCBGQUNUT1JTXG4gICAgICAgIHMgKz0gJzx0cj48dGQgY29sc3Bhbj0nK251bWVyYWwocmVnaW9uSWRzLmxlbmd0aCkrMSsnPkhFQUxUSCBGQUNUT1JTPC90ZD48L3RyPidcbiAgICAgICAgLy8gaGVhbHRoIG91dGNvbWVzIC0gaGVhbHRoIGZhY3RvcnMgLSA5IG1lYXN1cmVzXG4gICAgICAgIHMgKz0gdGhpcy5kcmF3UndqZkNoclRhYmxlUm93KHJlZ2lvbklkcywgZGF0YSwgJzx0ZCByb3dzcGFuPTk+SGVhbHRoIEJlaGF2aW9yczwvdGQ+JywgJ0FkdWx0IHNtb2tpbmcnLCdhZHVsdF9zbW9raW5nX3ZhbHVlJywnMC4wJScpXG4gICAgICAgIHMgKz0gdGhpcy5kcmF3UndqZkNoclRhYmxlUm93KHJlZ2lvbklkcywgZGF0YSwgJycsICdBZHVsdCBvYmVzaXR5JywnYWR1bHRfb2Jlc2l0eV92YWx1ZScsJzAuMCUnKVxuICAgICAgICBzICs9IHRoaXMuZHJhd1J3amZDaHJUYWJsZVJvdyhyZWdpb25JZHMsIGRhdGEsICcnLCAnRm9vZCBlbnZpcm9ubWVudCBpbmRleCcsJ2Zvb2RfZW52aXJvbm1lbnRfaW5kZXhfdmFsdWUnLCcwLjAnKVxuICAgICAgICBzICs9IHRoaXMuZHJhd1J3amZDaHJUYWJsZVJvdyhyZWdpb25JZHMsIGRhdGEsICcnLCAnUGh5c2ljYWwgaW5hY3Rpdml0eScsJ3BoeXNpY2FsX2luYWN0aXZpdHlfdmFsdWUnLCcwLjAlJylcbiAgICAgICAgcyArPSB0aGlzLmRyYXdSd2pmQ2hyVGFibGVSb3cocmVnaW9uSWRzLCBkYXRhLCAnJywgJ0FjY2VzcyB0byBleGVyY2lzZSBvcHBvcnR1bml0aWVzJywnYWNjZXNzX3RvX2V4ZXJjaXNlX29wcG9ydHVuaXRpZXNfdmFsdWUnLCcwLjAlJylcbiAgICAgICAgcyArPSB0aGlzLmRyYXdSd2pmQ2hyVGFibGVSb3cocmVnaW9uSWRzLCBkYXRhLCAnJywgJ0V4Y2Vzc2l2ZSBkcmlua2luZycsJ2V4Y2Vzc2l2ZV9kcmlua2luZ192YWx1ZScsJzAuMCUnKVxuICAgICAgICBzICs9IHRoaXMuZHJhd1J3amZDaHJUYWJsZVJvdyhyZWdpb25JZHMsIGRhdGEsICcnLCAnQWxjb2hvbC1pbXBhaXJlZCBkcml2aW5nIGRlYXRocycsJ2FsY29ob2xfaW1wYWlyZWRfZHJpdmluZ19kZWF0aHNfdmFsdWUnLCcwLjAlJylcbiAgICAgICAgcyArPSB0aGlzLmRyYXdSd2pmQ2hyVGFibGVSb3cocmVnaW9uSWRzLCBkYXRhLCAnJywgJ1NleHVhbGx5IHRyYW5zbWl0dGVkIGluZmVjdGlvbnMnLCdzZXh1YWxseV90cmFuc21pdHRlZF9pbmZlY3Rpb25zX3ZhbHVlJywnMCwwJylcbiAgICAgICAgcyArPSB0aGlzLmRyYXdSd2pmQ2hyVGFibGVSb3cocmVnaW9uSWRzLCBkYXRhLCAnJywgJ1RlZW4gYmlydGhzJywnYWxjb2hvbF9pbXBhaXJlZF9kcml2aW5nX2RlYXRoc192YWx1ZScsJzAsMCcpXG4gICAgICAgIC8vIGhlYWx0aCBvdXRjb21lcyAtIGNsaW5pY2FsIGNhcmUgLSA3IG1lYXN1cmVzXG4gICAgICAgIHMgKz0gdGhpcy5kcmF3UndqZkNoclRhYmxlUm93KHJlZ2lvbklkcywgZGF0YSwgJzx0ZCByb3dzcGFuPTc+Q2xpbmljYWwgQ2FyZTwvdGQ+JywgJ1VuaW5zdXJlZCcsJ3VuaW5zdXJlZF92YWx1ZScsJzAuMCUnKVxuICAgICAgICBzICs9IHRoaXMuZHJhd1J3amZDaHJUYWJsZVJvdyhyZWdpb25JZHMsIGRhdGEsICcnLCAnUHJpbWFyeSBjYXJlIHBoeXNpY2lhbnMnLCdwcmltYXJ5X2NhcmVfcGh5c2ljaWFuc192YWx1ZScsJzAsMCcpXG4gICAgICAgIHMgKz0gdGhpcy5kcmF3UndqZkNoclRhYmxlUm93KHJlZ2lvbklkcywgZGF0YSwgJycsICdEZW50aXN0cycsJ2RlbnRpc3RzX3ZhbHVlJywnMCwwJylcbiAgICAgICAgcyArPSB0aGlzLmRyYXdSd2pmQ2hyVGFibGVSb3cocmVnaW9uSWRzLCBkYXRhLCAnJywgJ01lbnRhbCBoZWFsdGggcHJvdmlkZXJzJywnbWVudGFsX2hlYWx0aF9wcm92aWRlcnNfdmFsdWUnLCcwLDAnKVxuICAgICAgICBzICs9IHRoaXMuZHJhd1J3amZDaHJUYWJsZVJvdyhyZWdpb25JZHMsIGRhdGEsICcnLCAnUHJldmVudGFibGUgaG9zcGl0YWwgc3RheXMnLCdwcmV2ZW50YWJsZV9ob3NwaXRhbF9zdGF5c192YWx1ZScsJzAsMCcpXG4gICAgICAgIHMgKz0gdGhpcy5kcmF3UndqZkNoclRhYmxlUm93KHJlZ2lvbklkcywgZGF0YSwgJycsICdEaWFiZXRpYyBtb25pdG9yaW5nJywnZGlhYmV0aWNfc2NyZWVuaW5nX3ZhbHVlJywnMC4wJScpXG4gICAgICAgIHMgKz0gdGhpcy5kcmF3UndqZkNoclRhYmxlUm93KHJlZ2lvbklkcywgZGF0YSwgJycsICdNYW1tb2dyYXBoeSBzY3JlZW5pbmcnLCdtYW1tb2dyYXBoeV9zY3JlZW5pbmdfdmFsdWUnLCcwLjAlJylcblxuICAgICAgICAvLyBoZWFsdGggb3V0Y29tZXMgLSBzb2NpYWwgYW5kIGVjb25vbWljIGZhY3RvcnMgLSA5IG1lYXN1cmVzXG4gICAgICAgIHMgKz0gdGhpcy5kcmF3UndqZkNoclRhYmxlUm93KHJlZ2lvbklkcywgZGF0YSwgJzx0ZCByb3dzcGFuPTk+U29jaWFsICYgRWNvbm9taWMgRmFjdG9yczwvdGQ+JywgJ0hpZ2ggc2Nob29sIGdyYWR1YXRpb24nLCdoaWdoX3NjaG9vbF9ncmFkdWF0aW9uX3ZhbHVlJywnMC4wJScpXG4gICAgICAgIHMgKz0gdGhpcy5kcmF3UndqZkNoclRhYmxlUm93KHJlZ2lvbklkcywgZGF0YSwgJycsICdTb21lIGNvbGxlZ2UnLCdzb21lX2NvbGxlZ2VfdmFsdWUnLCcwLjAlJylcbiAgICAgICAgcyArPSB0aGlzLmRyYXdSd2pmQ2hyVGFibGVSb3cocmVnaW9uSWRzLCBkYXRhLCAnJywgJ1VuZW1wbG95bWVudCcsJ3VuZW1wbG95bWVudF92YWx1ZScsJzAuMCUnKVxuICAgICAgICBzICs9IHRoaXMuZHJhd1J3amZDaHJUYWJsZVJvdyhyZWdpb25JZHMsIGRhdGEsICcnLCAnQ2hpbGRyZW4gaW4gcG92ZXJ0eScsJ2NoaWxkcmVuX2luX3BvdmVydHlfdmFsdWUnLCcwLjAlJylcbiAgICAgICAgcyArPSB0aGlzLmRyYXdSd2pmQ2hyVGFibGVSb3cocmVnaW9uSWRzLCBkYXRhLCAnJywgJ0luY29tZSBpbmVxdWFsaXR5JywnaW5jb21lX2luZXF1YWxpdHlfdmFsdWUnLCcwLjAnKVxuICAgICAgICBzICs9IHRoaXMuZHJhd1J3amZDaHJUYWJsZVJvdyhyZWdpb25JZHMsIGRhdGEsICcnLCAnQ2hpbGRyZW4gaW4gc2luZ2xlLXBhcmVudCBob3VzZWhvbGRzJywnY2hpbGRyZW5faW5fc2luZ2xlX3BhcmVudF9ob3VzZWhvbGRzX3ZhbHVlJywnMC4wJScpXG4gICAgICAgIHMgKz0gdGhpcy5kcmF3UndqZkNoclRhYmxlUm93KHJlZ2lvbklkcywgZGF0YSwgJycsICdTb2NpYWwgYXNzb2NpYXRpb25zJywnc29jaWFsX2Fzc29jaWF0aW9uc192YWx1ZScsJzAuMCcpXG4gICAgICAgIHMgKz0gdGhpcy5kcmF3UndqZkNoclRhYmxlUm93KHJlZ2lvbklkcywgZGF0YSwgJycsICdWaW9sZW50IGNyaW1lJywndmlvbGVudF9jcmltZV92YWx1ZScsJzAuMCcpXG4gICAgICAgIHMgKz0gdGhpcy5kcmF3UndqZkNoclRhYmxlUm93KHJlZ2lvbklkcywgZGF0YSwgJycsICdJbmp1cnkgZGVhdGhzJywnaW5qdXJ5X2RlYXRoc192YWx1ZScsJzAuMCcpXG5cbiAgICAgICAgLy8gaGVhbHRoIG91dGNvbWVzIC0gcGh5c2ljYWwgZW52aXJvbm1lbnQgLSA1IG1lYXN1cmVzXG4gICAgICAgIHMgKz0gdGhpcy5kcmF3UndqZkNoclRhYmxlUm93KHJlZ2lvbklkcywgZGF0YSwgJzx0ZCByb3dzcGFuPTU+UGh5c2ljYWwgRW52aXJvbm1lbnQ8L3RkPicsICdBaXIgcG9sbHV0aW9uIC0gcGFydGljdWxhdGUgbWF0dGVyJywnYWlyX3BvbGx1dGlvbl9wYXJ0aWN1bGF0ZV9tYXR0ZXJfdmFsdWUnLCcwLjAnKVxuICAgICAgICBzICs9IHRoaXMuZHJhd1J3amZDaHJUYWJsZVJvdyhyZWdpb25JZHMsIGRhdGEsICcnLCAnRHJpbmtpbmcgd2F0ZXIgdmlvbGF0aW9ucycsJ2RyaW5raW5nX3dhdGVyX3Zpb2xhdGlvbnNfdmFsdWUnLCcwLjAlJylcbiAgICAgICAgcyArPSB0aGlzLmRyYXdSd2pmQ2hyVGFibGVSb3cocmVnaW9uSWRzLCBkYXRhLCAnJywgJ1NldmVyZSBob3VzaW5nIHByb2JsZW1zJywnc2V2ZXJlX2hvdXNpbmdfcHJvYmxlbXNfdmFsdWUnLCcwLjAlJylcbiAgICAgICAgcyArPSB0aGlzLmRyYXdSd2pmQ2hyVGFibGVSb3cocmVnaW9uSWRzLCBkYXRhLCAnJywgJ0RyaXZpbmcgYWxvbmUgdG8gd29yaycsJ2RyaXZpbmdfYWxvbmVfdG9fd29ya192YWx1ZScsJzAuMCUnKVxuICAgICAgICBzICs9IHRoaXMuZHJhd1J3amZDaHJUYWJsZVJvdyhyZWdpb25JZHMsIGRhdGEsICcnLCAnTG9uZyBjb21tdXRlIC0gZHJpdmluZyBhbG9uZScsJ2xvbmdfY29tbXV0ZV9kcml2aW5nX2Fsb25lX3ZhbHVlJywnMC4wJScpXG5cbiAgICAgICAgJCgnI3J3amYtY291bnR5LWhlYWx0aC1yYW5raW5ncy10YWJsZScpLmh0bWwocyk7XG4gICAgfVxuICAgIFxuICAgIC8vIEVkdWNhdGlvblxuICAgIC8vXG4gICAgZHJhd0VkdWNhdGlvbkRhdGEoKSB7XG5cbiAgICAgICAgZ29vZ2xlLnNldE9uTG9hZENhbGxiYWNrKCgpID0+IHtcblxuICAgICAgICAgICAgdmFyIHJlZ2lvbklkcyA9IHRoaXMucGFyYW1zLnJlZ2lvbnMubWFwKGZ1bmN0aW9uKHJlZ2lvbikgeyByZXR1cm4gcmVnaW9uLmlkOyB9KTtcbiAgICAgICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcblxuICAgICAgICAgICAgY29udHJvbGxlci5nZXRFZHVjYXRpb25EYXRhKHJlZ2lvbklkcylcbiAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IHtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdFZHVjYXRpb25NYXAoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3RWR1Y2F0aW9uVGFibGUocmVnaW9uSWRzLCBkYXRhKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZHJhd0VkdWNhdGlvbk1hcCgpIHtcblxuICAgICAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcbiAgICAgICAgY29uc3QgcGxhY2VzUHJvbWlzZSA9IGNvbnRyb2xsZXIuZ2V0UGxhY2VzKCk7XG4gICAgICAgIGNvbnN0IGVkdWNhdGlvblByb21pc2UgPSBjb250cm9sbGVyLmdldEVkdWNhdGlvbkJ5UGxhY2UoKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChbcGxhY2VzUHJvbWlzZSwgZWR1Y2F0aW9uUHJvbWlzZV0pXG4gICAgICAgICAgICAudGhlbih2YWx1ZXMgPT4ge1xuXG4gICAgICAgICAgICAgICAgY29uc3QgcGxhY2VzUmVzcG9uc2UgPSB2YWx1ZXNbMF07XG4gICAgICAgICAgICAgICAgY29uc3QgZWR1Y2F0aW9uUmVzcG9uc2UgPSB2YWx1ZXNbMV07XG5cbiAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIGdlbyBjb29yZGluYXRlcyBmb3IgZWFjaCByZWdpb25cbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlZ2lvblBsYWNlcyA9IHRoaXMuZ2V0UGxhY2VzRm9yUmVnaW9uKHBsYWNlc1Jlc3BvbnNlKTtcblxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhIHBsYWNlIGxvb2t1cCB0YWJsZVxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgY29uc3QgcGxhY2VNYXAgPSB7fTtcbiAgICAgICAgICAgICAgICBwbGFjZXNSZXNwb25zZS5mb3JFYWNoKHBsYWNlID0+IHBsYWNlTWFwW3BsYWNlLmlkXSA9IHBsYWNlKTsgLy8gaW5pdCB0aGUgcGxhY2UgbWFwXG5cbiAgICAgICAgICAgICAgICAvLyBHZXQgbWFwIGRhdGFcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIGNvbnN0IGVkdWNhdGlvblBsYWNlcyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgZWR1Y2F0aW9uUmVzcG9uc2UuZm9yRWFjaChpdGVtID0+IHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5wZXJjZW50X2JhY2hlbG9yc19kZWdyZWVfb3JfaGlnaGVyID09IDApXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uaWQgaW4gcGxhY2VNYXApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZWR1Y2F0aW9uUGxhY2VzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzIDogcGxhY2VNYXBbaXRlbS5pZF0ubG9jYXRpb24uY29vcmRpbmF0ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQgOiBpdGVtLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgOiBpdGVtLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgOiBwYXJzZUludChpdGVtLnBlcmNlbnRfYmFjaGVsb3JzX2RlZ3JlZV9vcl9oaWdoZXIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgZWR1Y2F0aW9uUGxhY2VzLnNvcnQoKGEsIGIpID0+IGIudmFsdWUgLSBhLnZhbHVlKTsgLy8gZGVzY1xuICAgICAgICAgICAgICAgIGNvbnN0IGVhcm5pbmdzID0gXy5tYXAoZWR1Y2F0aW9uUGxhY2VzLCB4ID0+IHsgcmV0dXJuIHgudmFsdWUgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBJbml0IG1hcFxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgY29uc3QgcmFkaXVzU2NhbGUgPSB0aGlzLmdldFJhZGl1c1NjYWxlTGluZWFyKGVhcm5pbmdzKVxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9yU2NhbGUgPSB0aGlzLmdldENvbG9yU2NhbGUoZWFybmluZ3MpXG5cbiAgICAgICAgICAgICAgICBjb25zdCBjb29yZGluYXRlcyA9IHJlZ2lvblBsYWNlc1swXS5sb2NhdGlvbi5jb29yZGluYXRlcztcbiAgICAgICAgICAgICAgICBjb25zdCBjZW50ZXIgPSBbY29vcmRpbmF0ZXNbMV0sIGNvb3JkaW5hdGVzWzBdXTtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXAgPSBMLm1hcCgnbWFwJywgeyB6b29tQ29udHJvbCA6IHRydWUgfSk7XG5cbiAgICAgICAgICAgICAgICBMLnRpbGVMYXllcignaHR0cHM6Ly9hLnRpbGVzLm1hcGJveC5jb20vdjMvc29jcmF0YS1hcHBzLmlicDBsODk5L3t6fS97eH0ve3l9LnBuZycpLmFkZFRvKG1hcCk7XG4gICAgICAgICAgICAgICAgbWFwLnNldFZpZXcoY2VudGVyLCB0aGlzLk1BUF9JTklUSUFMX1pPT00pO1xuXG4gICAgICAgICAgICAgICAgLy8gUG9wdWxhdGUgbWFwXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdDaXJjbGVzRm9yUGxhY2VzKG1hcCwgZWR1Y2F0aW9uUGxhY2VzLCByYWRpdXNTY2FsZSwgY29sb3JTY2FsZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3TWFya2Vyc0ZvclBsYWNlcyhtYXAsIHJlZ2lvblBsYWNlcyk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICAgICAgfVxuXG4gICAgZHJhd0VkdWNhdGlvblRhYmxlKHJlZ2lvbklkcywgZGF0YSkge1xuXG4gICAgICAgIC8vIEhlYWRlclxuICAgICAgICAvL1xuICAgICAgICB2YXIgcyA9ICc8dHI+PHRoPjwvdGg+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0aCBjb2xzcGFuPVxcJzJcXCc+JyArIHRoaXMucGFyYW1zLnJlZ2lvbnNbaV0ubmFtZSArICc8L3RoPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgLy8gU3ViIGhlYWRlclxuICAgICAgICAvL1xuICAgICAgICBzICs9ICc8L3RyPjx0cj48dGQgY2xhc3M9XFwnY29sdW1uLWhlYWRlclxcJz48L3RkPic7XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzICs9ICc8dGQgY2xhc3M9XFwnY29sdW1uLWhlYWRlclxcJz5QZXJjZW50PC90ZD48dGQgY2xhc3M9XFwnY29sdW1uLWhlYWRlclxcJz5QZXJjZW50aWxlPC90ZD4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8vIEF0IGxlYXN0IGJhY2hlbG9yJ3NcbiAgICAgICAgLy9cbiAgICAgICAgcyArPSAnPC90cj48dHI+PHRkPkF0IExlYXN0IEJhY2hlbG9yXFwncyBEZWdyZWU8L3RkPic7XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgdG90YWxSYW5rcyA9IHBhcnNlSW50KGRhdGFbaV0udG90YWxfcmFua3MpO1xuICAgICAgICAgICAgdmFyIHJhbmsgPSBwYXJzZUludChkYXRhW2ldLnBlcmNlbnRfYmFjaGVsb3JzX2RlZ3JlZV9vcl9oaWdoZXJfcmFuayk7XG4gICAgICAgICAgICB2YXIgcGVyY2VudGlsZSA9IHBhcnNlSW50KCgodG90YWxSYW5rcyAtIHJhbmspIC8gdG90YWxSYW5rcykgKiAxMDApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBzICs9ICc8dGQ+JyArIGRhdGFbaV0ucGVyY2VudF9iYWNoZWxvcnNfZGVncmVlX29yX2hpZ2hlciArICclPC90ZD4nO1xuICAgICAgICAgICAgcyArPSAnPHRkPicgKyBudW1lcmFsKHBlcmNlbnRpbGUpLmZvcm1hdCgnMG8nKSArICc8L3RkPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgLy8gQXQgbGVhc3QgaGlnaCBzY2hvb2wgZGlwbG9tYVxuICAgICAgICAvL1xuICAgICAgICBzICs9ICc8L3RyPjx0cj48dGQ+QXQgTGVhc3QgSGlnaCBTY2hvb2wgRGlwbG9tYTwvdGQ+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgIHZhciB0b3RhbFJhbmtzID0gcGFyc2VJbnQoZGF0YVtpXS50b3RhbF9yYW5rcyk7XG4gICAgICAgICAgICB2YXIgcmFuayA9IHBhcnNlSW50KGRhdGFbaV0ucGVyY2VudF9oaWdoX3NjaG9vbF9ncmFkdWF0ZV9vcl9oaWdoZXIpO1xuICAgICAgICAgICAgdmFyIHBlcmNlbnRpbGUgPSBwYXJzZUludCgoKHRvdGFsUmFua3MgLSByYW5rKSAvIHRvdGFsUmFua3MpICogMTAwKTtcbiAgICBcbiAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgZGF0YVtpXS5wZXJjZW50X2hpZ2hfc2Nob29sX2dyYWR1YXRlX29yX2hpZ2hlciArICclPC90ZD4nO1xuICAgICAgICAgICAgcyArPSAnPHRkPicgKyBudW1lcmFsKHBlcmNlbnRpbGUpLmZvcm1hdCgnMG8nKSArICc8L3RkPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgcyArPSAnPC90cj4nO1xuICAgIFxuICAgICAgICAkKCcjZWR1Y2F0aW9uLXRhYmxlJykuaHRtbChzKTtcbiAgICB9XG4gICAgXG4gICAgLy8gR0RQIGRhdGFcbiAgICAvL1xuICAgIGRyYXdHZHBEYXRhKCkge1xuXG4gICAgICAgIGdvb2dsZS5zZXRPbkxvYWRDYWxsYmFjaygoKSA9PiB7XG5cbiAgICAgICAgICAgIHZhciByZWdpb25JZHMgPSB0aGlzLnBhcmFtcy5yZWdpb25zLm1hcChmdW5jdGlvbihyZWdpb24pIHsgcmV0dXJuIHJlZ2lvbi5pZDsgfSk7XG4gICAgICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG5cbiAgICAgICAgICAgIGNvbnRyb2xsZXIuZ2V0R2RwRGF0YShyZWdpb25JZHMpXG4gICAgICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7IFxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd0dkcENoYXJ0KHJlZ2lvbklkcywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd0dkcENoYW5nZUNoYXJ0KHJlZ2lvbklkcywgZGF0YSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZHJhd0dkcENoYXJ0KHJlZ2lvbklkcywgZGF0YSkge1xuICAgIFxuICAgICAgICB2YXIgY2hhcnREYXRhID0gW107XG4gICAgXG4gICAgICAgIC8vIEhlYWRlclxuICAgICAgICAvL1xuICAgICAgICB2YXIgaGVhZGVyID0gWydZZWFyJ107XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBoZWFkZXJbaSArIDFdID0gdGhpcy5wYXJhbXMucmVnaW9uc1tpXS5uYW1lO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGNoYXJ0RGF0YS5wdXNoKGhlYWRlcik7XG4gICAgXG4gICAgICAgIC8vIEZvcm1hdCB0aGUgZGF0YVxuICAgICAgICAvL1xuICAgICAgICB2YXIgbyA9IHt9O1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgIGlmIChvW2RhdGFbaV0ueWVhcl0gPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgb1tkYXRhW2ldLnllYXJdID0gW2RhdGFbaV0ueWVhcl07XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICBvW2RhdGFbaV0ueWVhcl0ucHVzaChwYXJzZUZsb2F0KGRhdGFbaV0ucGVyX2NhcGl0YV9nZHApKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gbykge1xuICAgICAgICAgICAgY2hhcnREYXRhLnB1c2gob1trZXldKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvLyBEcmF3IGNoYXJ0XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuZHJhd0xpbmVDaGFydCgncGVyLWNhcGl0YS1nZHAtY2hhcnQnLCBjaGFydERhdGEsIHtcbiAgICBcbiAgICAgICAgICAgIGN1cnZlVHlwZSA6ICdmdW5jdGlvbicsXG4gICAgICAgICAgICBsZWdlbmQgOiB7IHBvc2l0aW9uIDogJ2JvdHRvbScgfSxcbiAgICAgICAgICAgIHBvaW50U2hhcGUgOiAnc3F1YXJlJyxcbiAgICAgICAgICAgIHBvaW50U2l6ZSA6IDgsXG4gICAgICAgICAgICB0aXRsZSA6ICdQZXIgQ2FwaXRhIFJlYWwgR0RQIG92ZXIgVGltZScsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBkcmF3R2RwQ2hhbmdlQ2hhcnQocmVnaW9uSWRzLCBkYXRhKSB7XG4gICAgXG4gICAgICAgIHZhciBjaGFydERhdGEgPSBbXTtcbiAgICBcbiAgICAgICAgLy8gSGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBoZWFkZXIgPSBbJ1llYXInXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGhlYWRlcltpICsgMV0gPSB0aGlzLnBhcmFtcy5yZWdpb25zW2ldLm5hbWU7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgY2hhcnREYXRhLnB1c2goaGVhZGVyKTtcbiAgICBcbiAgICAgICAgLy8gRm9ybWF0IHRoZSBkYXRhXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBvID0ge307XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIFxuICAgICAgICAgICAgaWYgKG9bZGF0YVtpXS55ZWFyXSA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBvW2RhdGFbaV0ueWVhcl0gPSBbZGF0YVtpXS55ZWFyXTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIG9bZGF0YVtpXS55ZWFyXS5wdXNoKHBhcnNlRmxvYXQoZGF0YVtpXS5wZXJfY2FwaXRhX2dkcF9wZXJjZW50X2NoYW5nZSkgLyAxMDApO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvKSB7XG4gICAgICAgICAgICBjaGFydERhdGEucHVzaChvW2tleV0pO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8vIERyYXcgY2hhcnRcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5kcmF3TGluZUNoYXJ0KCdwZXItY2FwaXRhLWdkcC1jaGFuZ2UtY2hhcnQnLCBjaGFydERhdGEsIHtcbiAgICBcbiAgICAgICAgICAgIGN1cnZlVHlwZSA6ICdmdW5jdGlvbicsXG4gICAgICAgICAgICBsZWdlbmQgOiB7IHBvc2l0aW9uIDogJ2JvdHRvbScgfSxcbiAgICAgICAgICAgIHBvaW50U2hhcGUgOiAnc3F1YXJlJyxcbiAgICAgICAgICAgIHBvaW50U2l6ZSA6IDgsXG4gICAgICAgICAgICB0aXRsZSA6ICdBbm51YWwgQ2hhbmdlIGluIFBlciBDYXBpdGEgR0RQIG92ZXIgVGltZScsXG4gICAgICAgICAgICB2QXhpcyA6IHsgZm9ybWF0IDogJyMuIyUnIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICAvLyBPY2N1cGF0aW9uc1xuICAgIC8vXG4gICAgZHJhd09jY3VwYXRpb25zRGF0YSgpIHtcblxuICAgICAgICBnb29nbGUuc2V0T25Mb2FkQ2FsbGJhY2soKCkgPT4ge1xuXG4gICAgICAgICAgICB2YXIgcmVnaW9uSWRzID0gdGhpcy5wYXJhbXMucmVnaW9ucy5tYXAoZnVuY3Rpb24ocmVnaW9uKSB7IHJldHVybiByZWdpb24uaWQ7IH0pO1xuICAgICAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuXG4gICAgICAgICAgICBjb250cm9sbGVyLmdldE9jY3VwYXRpb25zRGF0YShyZWdpb25JZHMpXG4gICAgICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB0aGlzLmRyYXdPY2N1cGF0aW9uc1RhYmxlKHJlZ2lvbklkcywgZGF0YSkpXG4gICAgICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRyYXdPY2N1cGF0aW9uc1RhYmxlKHJlZ2lvbklkcywgZGF0YSkge1xuICAgIFxuICAgICAgICB2YXIgcyA9ICc8dHI+PHRoPjwvdGg+JztcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJzx0aCBjb2xzcGFuPVxcJzJcXCc+JyArIHRoaXMucGFyYW1zLnJlZ2lvbnNbaV0ubmFtZSArICc8L3RoPic7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgLy8gU3ViIGhlYWRlclxuICAgICAgICAvL1xuICAgICAgICBzICs9ICc8L3RyPjx0cj48dGQgY2xhc3M9XFwnY29sdW1uLWhlYWRlclxcJz48L3RkPic7XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzICs9ICc8dGQgY2xhc3M9XFwnY29sdW1uLWhlYWRlclxcJz5QZXJjZW50PC90ZD48dGQgY2xhc3M9XFwnY29sdW1uLWhlYWRlclxcJz5QZXJjZW50aWxlPC90ZD4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIFxuICAgICAgICAgICAgaWYgKChpICUgcmVnaW9uSWRzLmxlbmd0aCkgPT0gMClcbiAgICAgICAgICAgICAgICBzICs9ICc8L3RyPjx0cj48dGQ+JyArIGRhdGFbaV0ub2NjdXBhdGlvbiArICc8L3RkPic7IFxuICAgIFxuICAgICAgICAgICAgdmFyIHRvdGFsUmFua3MgPSBwYXJzZUludChkYXRhW2ldLnRvdGFsX3JhbmtzKTtcbiAgICAgICAgICAgIHZhciByYW5rID0gcGFyc2VJbnQoZGF0YVtpXS5wZXJjZW50X2VtcGxveWVkX3JhbmspO1xuICAgICAgICAgICAgdmFyIHBlcmNlbnRpbGUgPSBwYXJzZUludCgoKHRvdGFsUmFua3MgLSByYW5rKSAvIHRvdGFsUmFua3MpICogMTAwKTtcbiAgICBcbiAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgbnVtZXJhbChkYXRhW2ldLnBlcmNlbnRfZW1wbG95ZWQpLmZvcm1hdCgnMC4wJykgKyAnJTwvdGQ+JztcbiAgICAgICAgICAgIHMgKz0gJzx0ZD4nICsgbnVtZXJhbChwZXJjZW50aWxlKS5mb3JtYXQoJzBvJykgKyAnPC90ZD4nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIHMgKz0gJzwvdHI+JztcbiAgICBcbiAgICAgICAgJCgnI29jY3VwYXRpb25zLXRhYmxlJykuaHRtbChzKTtcbiAgICB9XG4gICAgXG4gICAgLy8gUG9wdWxhdGlvblxuICAgIC8vXG4gICAgZHJhd1BvcHVsYXRpb25EYXRhKCkge1xuXG4gICAgICAgIGdvb2dsZS5zZXRPbkxvYWRDYWxsYmFjaygoKSA9PiB7XG5cbiAgICAgICAgICAgIHZhciByZWdpb25JZHMgPSB0aGlzLnBhcmFtcy5yZWdpb25zLm1hcChmdW5jdGlvbihyZWdpb24pIHsgcmV0dXJuIHJlZ2lvbi5pZDsgfSk7XG4gICAgICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG5cbiAgICAgICAgICAgIGNvbnRyb2xsZXIuZ2V0UG9wdWxhdGlvbkRhdGEocmVnaW9uSWRzKVxuICAgICAgICAgICAgICAgIC50aGVuKGRhdGEgPT4geyBcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdQb3B1bGF0aW9uTWFwKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BvcHVsYXRpb25DaGFydChyZWdpb25JZHMsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdQb3B1bGF0aW9uQ2hhbmdlQ2hhcnQocmVnaW9uSWRzLCBkYXRhKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBkcmF3UG9wdWxhdGlvbkNoYXJ0KHJlZ2lvbklkcywgZGF0YSkge1xuICAgIFxuICAgICAgICB2YXIgY2hhcnREYXRhID0gW107XG4gICAgICAgIHZhciB5ZWFyO1xuICAgIFxuICAgICAgICAvLyBIZWFkZXJcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGhlYWRlciA9IFsnWWVhciddO1xuICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaGVhZGVyW2kgKyAxXSA9IHRoaXMucGFyYW1zLnJlZ2lvbnNbaV0ubmFtZTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBjaGFydERhdGEucHVzaChoZWFkZXIpO1xuICAgIFxuICAgICAgICAvLyBEYXRhXG4gICAgICAgIC8vXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIFxuICAgICAgICAgICAgdmFyIG0gPSAoaSAlIHJlZ2lvbklkcy5sZW5ndGgpO1xuICAgIFxuICAgICAgICAgICAgaWYgKG0gPT0gMCkge1xuICAgIFxuICAgICAgICAgICAgICAgIHllYXIgPSBbXTtcbiAgICAgICAgICAgICAgICB5ZWFyWzBdID0gZGF0YVtpXS55ZWFyO1xuICAgICAgICAgICAgICAgIGNoYXJ0RGF0YS5wdXNoKHllYXIpO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgeWVhclttICsgMV0gPSBwYXJzZUludChkYXRhW2ldLnBvcHVsYXRpb24pO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIHRoaXMuZHJhd0xpbmVDaGFydCgncG9wdWxhdGlvbi1jaGFydCcsIGNoYXJ0RGF0YSwge1xuICAgIFxuICAgICAgICAgICAgY3VydmVUeXBlIDogJ2Z1bmN0aW9uJyxcbiAgICAgICAgICAgIGxlZ2VuZCA6IHsgcG9zaXRpb24gOiAnYm90dG9tJyB9LFxuICAgICAgICAgICAgcG9pbnRTaGFwZSA6ICdzcXVhcmUnLFxuICAgICAgICAgICAgcG9pbnRTaXplIDogOCxcbiAgICAgICAgICAgIHRpdGxlIDogJ1BvcHVsYXRpb24nLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZHJhd1BvcHVsYXRpb25DaGFuZ2VDaGFydChyZWdpb25JZHMsIGRhdGEpIHtcbiAgICBcbiAgICAgICAgdmFyIGNoYXJ0RGF0YSA9IFtdO1xuICAgICAgICB2YXIgeWVhcjtcbiAgICBcbiAgICAgICAgLy8gSGVhZGVyXG4gICAgICAgIC8vXG4gICAgICAgIHZhciBoZWFkZXIgPSBbJ1llYXInXTtcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpb25JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGhlYWRlcltpICsgMV0gPSB0aGlzLnBhcmFtcy5yZWdpb25zW2ldLm5hbWU7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgY2hhcnREYXRhLnB1c2goaGVhZGVyKTtcbiAgICBcbiAgICAgICAgLy8gRGF0YVxuICAgICAgICAvL1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgIHZhciBtID0gKGkgJSByZWdpb25JZHMubGVuZ3RoKTtcbiAgICBcbiAgICAgICAgICAgIGlmIChtID09IDApIHtcbiAgICBcbiAgICAgICAgICAgICAgICB5ZWFyID0gW107XG4gICAgICAgICAgICAgICAgeWVhclswXSA9IGRhdGFbaV0ueWVhcjtcbiAgICAgICAgICAgICAgICBjaGFydERhdGEucHVzaCh5ZWFyKTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIHllYXJbbSArIDFdID0gcGFyc2VGbG9hdChkYXRhW2ldLnBvcHVsYXRpb25fcGVyY2VudF9jaGFuZ2UpIC8gMTAwO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIHRoaXMuZHJhd0xpbmVDaGFydCgncG9wdWxhdGlvbi1jaGFuZ2UtY2hhcnQnLCBjaGFydERhdGEsIHtcbiAgICBcbiAgICAgICAgICAgIGN1cnZlVHlwZSA6ICdmdW5jdGlvbicsXG4gICAgICAgICAgICBsZWdlbmQgOiB7IHBvc2l0aW9uIDogJ2JvdHRvbScgfSxcbiAgICAgICAgICAgIHBvaW50U2hhcGUgOiAnc3F1YXJlJyxcbiAgICAgICAgICAgIHBvaW50U2l6ZSA6IDgsXG4gICAgICAgICAgICB0aXRsZSA6ICdQb3B1bGF0aW9uIENoYW5nZScsXG4gICAgICAgICAgICB2QXhpcyA6IHsgZm9ybWF0IDogJyMuIyUnIH0sXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRyYXdQb3B1bGF0aW9uTWFwKCkge1xuXG4gICAgICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuICAgICAgICBjb25zdCBwbGFjZXMgPSBbXTtcblxuICAgICAgICBjb250cm9sbGVyLmdldFBsYWNlcygpXG4gICAgICAgICAgICAudGhlbihwbGFjZXNSZXNwb25zZSA9PiB7XG5cbiAgICAgICAgICAgICAgICAvLyBTZXQgcGxhY2UgdmFsdWUgdG8gZWFybmluZ3MgZGF0YVxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgcGxhY2VzUmVzcG9uc2UuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcGxhY2VzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXMgOiBpdGVtLmxvY2F0aW9uLmNvb3JkaW5hdGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA6IGl0ZW0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkIDogaXRlbS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlIDogcGFyc2VJbnQoaXRlbS5wb3B1bGF0aW9uKSxcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIEdldCBtYXAgZGF0YVxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgY29uc3QgcG9wdWxhdGVkUGxhY2VzID0gcGxhY2VzLnNvcnQoKGEsIGIpID0+IGIudmFsdWUgLSBhLnZhbHVlKTtcbiAgICAgICAgICAgICAgICBjb25zdCByZWdpb25QbGFjZXMgPSB0aGlzLmdldFBsYWNlc0ZvclJlZ2lvbihwbGFjZXNSZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgY29uc3QgcG9wdWxhdGlvbnMgPSBfLm1hcChwb3B1bGF0ZWRQbGFjZXMsIHggPT4geyByZXR1cm4geC52YWx1ZSB9KTtcblxuICAgICAgICAgICAgICAgIC8vIEluaXQgbWFwXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICBjb25zdCByYWRpdXNTY2FsZSA9IHRoaXMuZ2V0UmFkaXVzU2NhbGVMb2cocG9wdWxhdGlvbnMpXG4gICAgICAgICAgICAgICAgY29uc3QgY29sb3JTY2FsZSA9IHRoaXMuZ2V0Q29sb3JTY2FsZShwb3B1bGF0aW9ucylcblxuICAgICAgICAgICAgICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gcmVnaW9uUGxhY2VzWzBdLmxvY2F0aW9uLmNvb3JkaW5hdGVzO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNlbnRlciA9IFtjb29yZGluYXRlc1sxXSwgY29vcmRpbmF0ZXNbMF1dO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hcCA9IEwubWFwKCdtYXAnLCB7IHpvb21Db250cm9sIDogdHJ1ZSB9KTtcblxuICAgICAgICAgICAgICAgIEwudGlsZUxheWVyKCdodHRwczovL2EudGlsZXMubWFwYm94LmNvbS92My9zb2NyYXRhLWFwcHMuaWJwMGw4OTkve3p9L3t4fS97eX0ucG5nJykuYWRkVG8obWFwKTtcbiAgICAgICAgICAgICAgICBtYXAuc2V0VmlldyhjZW50ZXIsIHRoaXMuTUFQX0lOSVRJQUxfWk9PTSk7XG5cbiAgICAgICAgICAgICAgICAvLyBQb3B1bGF0ZSBtYXBcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhd0NpcmNsZXNGb3JQbGFjZXMobWFwLCBwb3B1bGF0ZWRQbGFjZXMsIHJhZGl1c1NjYWxlLCBjb2xvclNjYWxlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdNYXJrZXJzRm9yUGxhY2VzKG1hcCwgcmVnaW9uUGxhY2VzKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgIH1cblxuICAgIC8vIFBsYWNlcyBpbiByZWdpb25cbiAgICAvL1xuICAgIGRyYXdQbGFjZXNJblJlZ2lvbigpIHtcblxuICAgICAgICBpZiAodGhpcy5wYXJhbXMucmVnaW9ucy5sZW5ndGggPT0gMCkgXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgdmFyIHJlZ2lvbiA9IHRoaXMucGFyYW1zLnJlZ2lvbnNbMF07XG5cbiAgICAgICAgc3dpdGNoIChyZWdpb24udHlwZSkge1xuXG4gICAgICAgICAgICBjYXNlICduYXRpb24nOiB0aGlzLmRyYXdDaGlsZFBsYWNlc0luUmVnaW9uKHJlZ2lvbiwgJ1JlZ2lvbnMgaW4gezB9Jy5mb3JtYXQocmVnaW9uLm5hbWUpKTsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdyZWdpb24nOiB0aGlzLmRyYXdDaGlsZFBsYWNlc0luUmVnaW9uKHJlZ2lvbiwgJ0RpdmlzaW9ucyBpbiB7MH0nLmZvcm1hdChyZWdpb24ubmFtZSkpOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2RpdmlzaW9uJzogdGhpcy5kcmF3Q2hpbGRQbGFjZXNJblJlZ2lvbihyZWdpb24sICdTdGF0ZXMgaW4gezB9Jy5mb3JtYXQocmVnaW9uLm5hbWUpKTsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdzdGF0ZSc6IHRoaXMuZHJhd0NpdGllc0FuZENvdW50aWVzSW5TdGF0ZShyZWdpb24pOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NvdW50eSc6IHRoaXMuZHJhd090aGVyQ291bnRpZXNJblN0YXRlKHJlZ2lvbik7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbXNhJzogdGhpcy5kcmF3T3RoZXJNZXRyb3NJblN0YXRlKHJlZ2lvbik7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncGxhY2UnOiB0aGlzLmRyYXdPdGhlckNpdGllc0luU3RhdGUocmVnaW9uKTsgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmF3Q2hpbGRQbGFjZXNJblJlZ2lvbihyZWdpb24sIGxhYmVsKSB7XG5cbiAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuXG4gICAgICAgIGNvbnRyb2xsZXIuZ2V0Q2hpbGRSZWdpb25zKHJlZ2lvbi5pZClcbiAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3UGxhY2VzSW5SZWdpb25IZWFkZXIoJyNwbGFjZXMtaW4tcmVnaW9uLWhlYWRlci0wJywgbGFiZWwpO1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BsYWNlc0luUmVnaW9uTGlzdCgnI3BsYWNlcy1pbi1yZWdpb24tbGlzdC0wJywgcmVzcG9uc2UpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgfVxuXG4gICAgZHJhd0NpdGllc0FuZENvdW50aWVzSW5TdGF0ZShyZWdpb24pIHtcblxuICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG4gICAgICAgIHZhciBjaXRpZXNQcm9taXNlID0gY29udHJvbGxlci5nZXRDaXRpZXNJblN0YXRlKHJlZ2lvbi5pZCk7XG4gICAgICAgIHZhciBjb3VudGllc1Byb21pc2UgPSBjb250cm9sbGVyLmdldENvdW50aWVzSW5TdGF0ZShyZWdpb24uaWQpO1xuXG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChbY2l0aWVzUHJvbWlzZSwgY291bnRpZXNQcm9taXNlXSlcbiAgICAgICAgICAgIC50aGVuKHZhbHVlcyA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZiAodmFsdWVzLmxlbmd0aCA9PSAwKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgICAgICBpZiAodmFsdWVzWzBdLmxlbmd0aCA+IDApIHtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdQbGFjZXNJblJlZ2lvbkhlYWRlcignI3BsYWNlcy1pbi1yZWdpb24taGVhZGVyLTAnLCAnUGxhY2VzIGluIHswfScuZm9ybWF0KHJlZ2lvbi5uYW1lKSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BsYWNlc0luUmVnaW9uTGlzdCgnI3BsYWNlcy1pbi1yZWdpb24tbGlzdC0wJywgdmFsdWVzWzBdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlc1sxXS5sZW5ndGggPiAwKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3UGxhY2VzSW5SZWdpb25IZWFkZXIoJyNwbGFjZXMtaW4tcmVnaW9uLWhlYWRlci0xJywgJ0NvdW50aWVzIGluIHswfScuZm9ybWF0KHJlZ2lvbi5uYW1lKSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BsYWNlc0luUmVnaW9uTGlzdCgnI3BsYWNlcy1pbi1yZWdpb24tbGlzdC0xJywgdmFsdWVzWzFdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICB9XG5cbiAgICBkcmF3T3RoZXJDaXRpZXNJblN0YXRlKHJlZ2lvbikge1xuXG4gICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcblxuICAgICAgICBjb250cm9sbGVyLmdldFBhcmVudFN0YXRlKHJlZ2lvbilcbiAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICBcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UubGVuZ3RoID09IDApXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICBcbiAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSByZXNwb25zZVswXTtcbiAgICBcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyLmdldENpdGllc0luU3RhdGUoc3RhdGUucGFyZW50X2lkKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmxlbmd0aCA9PSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdQbGFjZXNJblJlZ2lvbkhlYWRlcignI3BsYWNlcy1pbi1yZWdpb24taGVhZGVyLTAnLCAnUGxhY2VzIGluIHswfScuZm9ybWF0KHN0YXRlLnBhcmVudF9uYW1lKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdQbGFjZXNJblJlZ2lvbkxpc3QoJyNwbGFjZXMtaW4tcmVnaW9uLWxpc3QtMCcsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRyYXdPdGhlckNvdW50aWVzSW5TdGF0ZShyZWdpb24pIHtcblxuICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG5cbiAgICAgICAgY29udHJvbGxlci5nZXRQYXJlbnRTdGF0ZShyZWdpb24pXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmxlbmd0aCA9PSAwKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgXG4gICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gcmVzcG9uc2VbMF07XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29udHJvbGxlci5nZXRDb3VudGllc0luU3RhdGUoc3RhdGUucGFyZW50X2lkKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmxlbmd0aCA9PSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdQbGFjZXNJblJlZ2lvbkhlYWRlcignI3BsYWNlcy1pbi1yZWdpb24taGVhZGVyLTAnLCAnQ291bnRpZXMgaW4gezB9Jy5mb3JtYXQoc3RhdGUucGFyZW50X25hbWUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BsYWNlc0luUmVnaW9uTGlzdCgnI3BsYWNlcy1pbi1yZWdpb24tbGlzdC0wJywgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZHJhd090aGVyTWV0cm9zSW5TdGF0ZShyZWdpb24pIHtcblxuICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG5cbiAgICAgICAgY29udHJvbGxlci5nZXRQYXJlbnRTdGF0ZShyZWdpb24pXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmxlbmd0aCA9PSAwKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgXG4gICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gcmVzcG9uc2VbMF07XG4gICAgXG4gICAgICAgICAgICAgICAgY29udHJvbGxlci5nZXRNZXRyb3NJblN0YXRlKHN0YXRlLnBhcmVudF9pZClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5sZW5ndGggPT0gMClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3UGxhY2VzSW5SZWdpb25IZWFkZXIoJyNwbGFjZXMtaW4tcmVnaW9uLWhlYWRlci0wJywgJ01ldHJvcG9saXRhbiBBcmVhcyBpbiB7MH0nLmZvcm1hdChzdGF0ZS5wYXJlbnRfbmFtZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3UGxhY2VzSW5SZWdpb25MaXN0KCcjcGxhY2VzLWluLXJlZ2lvbi1saXN0LTAnLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZW1vdmVDdXJyZW50UmVnaW9ucyhyZWdpb25zLCBtYXhDb3VudCA9IDUpIHtcblxuICAgICAgICB2YXIgY291bnQgPSAwO1xuICAgICAgICB2YXIgcmcgPSBbXTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lvbnMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgaWYgKHRoaXMuaXNSZWdpb25JZENvbnRhaW5lZEluQ3VycmVudFJlZ2lvbnMocmVnaW9uc1tpXS5jaGlsZF9pZCkpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgIHJnLnB1c2gocmVnaW9uc1tpXSk7XG5cbiAgICAgICAgICAgIGlmIChjb3VudCA9PSAobWF4Q291bnQgLSAxKSlcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZztcbiAgICB9XG5cbiAgICBkcmF3UGxhY2VzSW5SZWdpb25IZWFkZXIoaGVhZGVySWQsIGxhYmVsKSB7XG5cbiAgICAgICAgJChoZWFkZXJJZCkudGV4dChsYWJlbCkuc2xpZGVUb2dnbGUoMTAwKTtcbiAgICB9XG5cbiAgICBkcmF3UGxhY2VzSW5SZWdpb25MaXN0KGxpc3RJZCwgZGF0YSwgbWF4Q291bnQgPSA1KSB7XG5cbiAgICAgICAgaWYgKGRhdGEubGVuZ3RoID09IDApXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgdmFyIGNvdW50ID0gMDtcbiAgICAgICAgdmFyIHMgPSAnJztcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgaWYgKHRoaXMuaXNSZWdpb25JZENvbnRhaW5lZEluQ3VycmVudFJlZ2lvbnMoZGF0YVtpXS5jaGlsZF9pZCkpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgIHMgKz0gJzxsaT48YSBocmVmPVwiJztcbiAgICAgICAgICAgIHMgKz0gdGhpcy5nZXRTZWFyY2hQYWdlRm9yUmVnaW9uc0FuZFZlY3RvclVybChkYXRhW2ldLmNoaWxkX25hbWUpICsgJ1wiPic7XG4gICAgICAgICAgICBzICs9IGRhdGFbaV0uY2hpbGRfbmFtZTtcbiAgICAgICAgICAgIHMgKz0gJzwvYT48L2xpPic7XG5cbiAgICAgICAgICAgIGlmIChjb3VudCA9PSAobWF4Q291bnQgLSAxKSlcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgfVxuXG4gICAgICAgICQobGlzdElkKS5odG1sKHMpO1xuICAgICAgICAkKGxpc3RJZCkuc2xpZGVUb2dnbGUoMTAwKTtcbiAgICB9XG5cbiAgICBpc1JlZ2lvbklkQ29udGFpbmVkSW5DdXJyZW50UmVnaW9ucyhyZWdpb25JZCkge1xuXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5wYXJhbXMucmVnaW9ucy5sZW5ndGg7IGorKykge1xuXG4gICAgICAgICAgICBpZiAocmVnaW9uSWQgPT0gdGhpcy5wYXJhbXMucmVnaW9uc1tqXS5pZClcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBTaW1pbGFyIHJlZ2lvbnNcbiAgICAvL1xuICAgIGRyYXdTaW1pbGFyUmVnaW9ucyhvbkNsaWNrUmVnaW9uKSB7XG5cbiAgICAgICAgaWYgKHRoaXMucGFyYW1zLnJlZ2lvbnMubGVuZ3RoID09IDApIFxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHZhciByZWdpb24gPSB0aGlzLnBhcmFtcy5yZWdpb25zWzBdO1xuICAgICAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBcGlDb250cm9sbGVyKCk7XG5cbiAgICAgICAgY29udHJvbGxlci5nZXRTaW1pbGFyUmVnaW9ucyhyZWdpb24uaWQpXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHRoaXMuZHJhd1NpbWlsYXJSZWdpb25zTGlzdChkYXRhLCBvbkNsaWNrUmVnaW9uKSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgfVxuXG4gICAgZHJhd1NpbWlsYXJSZWdpb25zTGlzdChkYXRhLCBvbkNsaWNrUmVnaW9uKSB7XG5cbiAgICAgICAgaWYgKGRhdGEubW9zdF9zaW1pbGFyID09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICB2YXIgY291bnQgPSAwO1xuICAgICAgICB2YXIgcyA9ICcnO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5tb3N0X3NpbWlsYXIubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgaWYgKHRoaXMuaXNSZWdpb25JZENvbnRhaW5lZEluQ3VycmVudFJlZ2lvbnMoZGF0YS5tb3N0X3NpbWlsYXJbaV0uaWQpKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBzICs9ICc8bGk+PGE+PGkgY2xhc3M9XCJmYSBmYS1wbHVzXCI+PC9pPicgKyBkYXRhLm1vc3Rfc2ltaWxhcltpXS5uYW1lICsgJzwvYT48L2xpPidcblxuICAgICAgICAgICAgaWYgKGNvdW50ID09IDQpXG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgJCgnI3NpbWlsYXItcmVnaW9ucycpLmh0bWwocyk7XG4gICAgICAgICQoJyNzaW1pbGFyLXJlZ2lvbnMnKS5zbGlkZVRvZ2dsZSgxMDApO1xuICAgICAgICBcbiAgICAgICAgJCgnI3NpbWlsYXItcmVnaW9ucyBsaSBhJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgaW5kZXggPSAkKHRoaXMpLnBhcmVudCgpLmluZGV4KCk7XG4gICAgICAgICAgICBvbkNsaWNrUmVnaW9uKGRhdGEubW9zdF9zaW1pbGFyW2luZGV4XS5uYW1lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIC8vIERyYXcgY2hhcnRzXG4gICAgLy9cbiAgICBkcmF3TGluZUNoYXJ0KGNoYXJ0SWQsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBcbiAgICAgICAgdmFyIGRhdGFUYWJsZSA9IGdvb2dsZS52aXN1YWxpemF0aW9uLmFycmF5VG9EYXRhVGFibGUoZGF0YSk7XG4gICAgICAgIHZhciBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5MaW5lQ2hhcnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY2hhcnRJZCkpO1xuICAgIFxuICAgICAgICBjaGFydC5kcmF3KGRhdGFUYWJsZSwgb3B0aW9ucyk7XG4gICAgfVxuICAgIFxuICAgIGRyYXdTdGVwcGVkQXJlYUNoYXJ0KGNoYXJ0SWQsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBcbiAgICAgICAgdmFyIGRhdGFUYWJsZSA9IGdvb2dsZS52aXN1YWxpemF0aW9uLmFycmF5VG9EYXRhVGFibGUoZGF0YSk7XG4gICAgICAgIHZhciBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5TdGVwcGVkQXJlYUNoYXJ0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNoYXJ0SWQpKTtcbiAgICBcbiAgICAgICAgY2hhcnQuZHJhdyhkYXRhVGFibGUsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIC8vIE1hcHNcbiAgICAvL1xuICAgIGdldFJhZGl1c1NjYWxlTGluZWFyKHZhbHVlcykge1xuXG4gICAgICAgIHJldHVybiBkMy5zY2FsZS5saW5lYXIoKVxuICAgICAgICAgICAgLmRvbWFpbihkMy5leHRlbnQodmFsdWVzKSlcbiAgICAgICAgICAgIC5yYW5nZSh0aGlzLk1BUF9SQURJVVNfU0NBTEUpO1xuICAgIH1cblxuICAgIGdldFJhZGl1c1NjYWxlTG9nKHZhbHVlcykge1xuXG4gICAgICAgIHJldHVybiBkMy5zY2FsZS5sb2coKVxuICAgICAgICAgICAgLmRvbWFpbihkMy5leHRlbnQodmFsdWVzKSlcbiAgICAgICAgICAgIC5yYW5nZSh0aGlzLk1BUF9SQURJVVNfU0NBTEUpO1xuICAgIH1cblxuICAgIGdldENvbG9yU2NhbGUodmFsdWVzKSB7XG5cbiAgICAgICAgY29uc3QgZG9tYWluID0gKCgpID0+IHtcblxuICAgICAgICAgICAgY29uc3Qgc3RlcCA9IDEuMCAvIHRoaXMuTUFQX0NPTE9SX1NDQUxFLmxlbmd0aDtcblxuICAgICAgICAgICAgZnVuY3Rpb24gcXVhbnRpbGUodmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGQzLnF1YW50aWxlKHZhbHVlcywgKGluZGV4ICsgMSkgKiBzdGVwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIF8ubWFwKHRoaXMuTUFQX0NPTE9SX1NDQUxFLnNsaWNlKDEpLCBxdWFudGlsZSk7XG4gICAgICAgIH0pKCk7XG5cbiAgICAgICAgcmV0dXJuIGQzLnNjYWxlLnF1YW50aWxlKClcbiAgICAgICAgICAgIC5kb21haW4oZG9tYWluKVxuICAgICAgICAgICAgLnJhbmdlKHRoaXMuTUFQX0NPTE9SX1NDQUxFKTtcbiAgICB9XG5cbiAgICBkcmF3Q2lyY2xlc0ZvclBsYWNlcyhtYXAsIHBsYWNlcywgcmFkaXVzU2NhbGUsIGNvbG9yU2NhbGUpIHtcblxuICAgICAgICBwbGFjZXMuZm9yRWFjaChwbGFjZSA9PiB7XG5cbiAgICAgICAgICAgIHZhciBmZWF0dXJlID0ge1xuICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgICAgICAgICAgICBcInByb3BlcnRpZXNcIjoge1xuICAgICAgICAgICAgICAgICAgICBcIm5hbWVcIjogcGxhY2UubmFtZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJnZW9tZXRyeVwiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiY29vcmRpbmF0ZXNcIjogcGxhY2UuY29vcmRpbmF0ZXMsXG4gICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcIlBvaW50XCIsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICBmaWxsQ29sb3I6IGNvbG9yU2NhbGUocGxhY2UudmFsdWUpLFxuICAgICAgICAgICAgICAgIGZpbGxPcGFjaXR5OiAxLFxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAsXG4gICAgICAgICAgICAgICAgcmFkaXVzOiA4LFxuICAgICAgICAgICAgICAgIHN0cm9rZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgd2VpZ2h0OiAwLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgTC5nZW9Kc29uKFxuICAgICAgICAgICAgICAgIGZlYXR1cmUsIFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRUb0xheWVyOiAoZmVhdHVyZSwgbGF0bG5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gTC5jaXJjbGUobGF0bG5nLCByYWRpdXNTY2FsZShwbGFjZS52YWx1ZSApLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICkuYWRkVG8obWFwKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZHJhd01hcmtlcnNGb3JQbGFjZXMobWFwLCBwbGFjZXMpIHtcblxuICAgICAgICBwbGFjZXMuZm9yRWFjaChwbGFjZSA9PiB7XG5cbiAgICAgICAgICAgIHZhciBmZWF0dXJlID0ge1xuICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgICAgICAgICAgICBcInByb3BlcnRpZXNcIjoge1xuICAgICAgICAgICAgICAgICAgICBcIm5hbWVcIjogcGxhY2UubmFtZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJnZW9tZXRyeVwiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiY29vcmRpbmF0ZXNcIjogcGxhY2UubG9jYXRpb24uY29vcmRpbmF0ZXMsXG4gICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcIlBvaW50XCIsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgTC5nZW9Kc29uKGZlYXR1cmUpLmFkZFRvKG1hcCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFBsYWNlc0ZvclJlZ2lvbihkYXRhKSB7XG5cbiAgICAgICAgdmFyIHBsYWNlcyA9IFtdO1xuXG4gICAgICAgIGRhdGEuZm9yRWFjaChwbGFjZSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXMucGFyYW1zLnJlZ2lvbnMuZm9yRWFjaChyZWdpb24gPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYgKHBsYWNlLmlkID09IHJlZ2lvbi5pZClcbiAgICAgICAgICAgICAgICAgICAgcGxhY2VzLnB1c2gocGxhY2UpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHBsYWNlcztcbiAgICB9XG5cbiAgICAvLyBQYWdpbmdcbiAgICAvL1xuICAgIGZldGNoTmV4dFBhZ2UoKSB7XG4gICAgXG4gICAgICAgIGlmICh0aGlzLmZldGNoaW5nIHx8IHRoaXMuZmV0Y2hlZEFsbClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICBcbiAgICAgICAgdGhpcy5mZXRjaGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuaW5jcmVtZW50UGFnZSgpO1xuICAgIFxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgXG4gICAgICAgICQuYWpheCh0aGlzLmdldFNlYXJjaFJlc3VsdHNVcmwoKSkuZG9uZShmdW5jdGlvbihkYXRhLCB0ZXh0U3RhdHVzLCBqcVhIUikge1xuXG4gICAgICAgICAgICBpZiAoanFYSFIuc3RhdHVzID09IDIwNCkgeyAvLyBubyBjb250ZW50XG4gICAgXG4gICAgICAgICAgICAgICAgc2VsZi5kZWNyZW1lbnRQYWdlKCk7XG4gICAgICAgICAgICAgICAgc2VsZi5mZXRjaGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHNlbGYuZmV0Y2hlZEFsbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgJCgnLmRhdGFzZXRzJykuYXBwZW5kKGRhdGEpO1xuICAgICAgICAgICAgc2VsZi5mZXRjaGluZyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZ2V0U2VhcmNoUGFnZUZvclJlZ2lvbnNBbmRWZWN0b3JVcmwocmVnaW9ucywgdmVjdG9yLCBzZWFyY2hSZXN1bHRzLCBxdWVyeVN0cmluZykge1xuICAgIFxuICAgICAgICB2YXIgdXJsID0gJy8nO1xuICAgIFxuICAgICAgICBpZiAodHlwZW9mKHJlZ2lvbnMpID09PSAnc3RyaW5nJykge1xuICAgIFxuICAgICAgICAgICAgdXJsICs9IHJlZ2lvbnMucmVwbGFjZSgvLC9nLCAnJykucmVwbGFjZSgvIC9nLCAnXycpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocmVnaW9ucykpIHtcbiAgICBcbiAgICAgICAgICAgIHZhciByZWdpb25OYW1lcyA9IFtdO1xuICAgIFxuICAgICAgICAgICAgcmVnaW9uTmFtZXMgPSByZWdpb25zLm1hcChmdW5jdGlvbihyZWdpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVnaW9uLnJlcGxhY2UoLywvZywgJycpLnJlcGxhY2UoLyAvZywgJ18nKTtcbiAgICAgICAgICAgIH0pO1xuICAgIFxuICAgICAgICAgICAgdXJsICs9IHJlZ2lvbk5hbWVzLmpvaW4oJ192c18nKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICBcbiAgICAgICAgICAgIHVybCArPSAnc2VhcmNoJztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBpZiAodmVjdG9yKVxuICAgICAgICAgICAgdXJsICs9ICcvJyArIHZlY3RvcjtcbiAgICBcbiAgICAgICAgaWYgKHNlYXJjaFJlc3VsdHMpXG4gICAgICAgICAgICB1cmwgKz0gJy9zZWFyY2gtcmVzdWx0cyc7XG4gICAgXG4gICAgICAgIGlmIChxdWVyeVN0cmluZykgXG4gICAgICAgICAgICB1cmwgKz0gcXVlcnlTdHJpbmc7XG4gICAgXG4gICAgICAgIHJldHVybiB1cmw7XG4gICAgfVxuICAgIFxuICAgIGdldFNlYXJjaFBhZ2VVcmwoc2VhcmNoUmVzdWx0cykge1xuXG4gICAgICAgIGlmICgodGhpcy5wYXJhbXMucmVnaW9ucy5sZW5ndGggPiAwKSB8fCB0aGlzLnBhcmFtcy5hdXRvU3VnZ2VzdGVkUmVnaW9uKSB7XG5cbiAgICAgICAgICAgIHZhciByZWdpb25OYW1lcyA9IFtdO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJhbXMucmVzZXRSZWdpb25zID09IGZhbHNlKSB7XG5cbiAgICAgICAgICAgICAgICByZWdpb25OYW1lcyA9IHRoaXMucGFyYW1zLnJlZ2lvbnMubWFwKGZ1bmN0aW9uKHJlZ2lvbikgeyBcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlZ2lvbi5uYW1lOyBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMucGFyYW1zLmF1dG9TdWdnZXN0ZWRSZWdpb24pXG4gICAgICAgICAgICAgICAgcmVnaW9uTmFtZXMucHVzaCh0aGlzLnBhcmFtcy5hdXRvU3VnZ2VzdGVkUmVnaW9uKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U2VhcmNoUGFnZUZvclJlZ2lvbnNBbmRWZWN0b3JVcmwocmVnaW9uTmFtZXMsIHRoaXMucGFyYW1zLnZlY3Rvciwgc2VhcmNoUmVzdWx0cywgdGhpcy5nZXRTZWFyY2hRdWVyeVN0cmluZygpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U2VhcmNoUGFnZUZvclJlZ2lvbnNBbmRWZWN0b3JVcmwobnVsbCwgdGhpcy5wYXJhbXMudmVjdG9yLCBzZWFyY2hSZXN1bHRzLCB0aGlzLmdldFNlYXJjaFF1ZXJ5U3RyaW5nKCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0U2VhcmNoUmVzdWx0c1VybCgpIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZXRTZWFyY2hQYWdlVXJsKHRydWUpO1xuICAgIH1cblxuICAgIGdldFNlYXJjaFF1ZXJ5U3RyaW5nKCkge1xuXG4gICAgICAgIHZhciB1cmwgPSAnP3E9JyArIGVuY29kZVVSSUNvbXBvbmVudCh0aGlzLnBhcmFtcy5xKTtcblxuICAgICAgICBpZiAodGhpcy5wYXJhbXMucGFnZSA+IDEpXG4gICAgICAgICAgICB1cmwgKz0gJyZwYWdlPScgKyB0aGlzLnBhcmFtcy5wYWdlO1xuXG4gICAgICAgIGlmICh0aGlzLnBhcmFtcy5jYXRlZ29yaWVzLmxlbmd0aCA+IDApXG4gICAgICAgICAgICB1cmwgKz0gJyZjYXRlZ29yaWVzPScgKyBlbmNvZGVVUklDb21wb25lbnQodGhpcy5wYXJhbXMuY2F0ZWdvcmllcy5qb2luKCcsJykpO1xuXG4gICAgICAgIGlmICh0aGlzLnBhcmFtcy5kb21haW5zLmxlbmd0aCA+IDApXG4gICAgICAgICAgICB1cmwgKz0gJyZkb21haW5zPScgKyBlbmNvZGVVUklDb21wb25lbnQodGhpcy5wYXJhbXMuZG9tYWlucy5qb2luKCcsJykpO1xuXG4gICAgICAgIGlmICh0aGlzLnBhcmFtcy5zdGFuZGFyZHMubGVuZ3RoID4gMClcbiAgICAgICAgICAgIHVybCArPSAnJnN0YW5kYXJkcz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMucGFyYW1zLnN0YW5kYXJkcy5qb2luKCcsJykpO1xuXG4gICAgICAgIGlmICh0aGlzLnBhcmFtcy5kZWJ1ZylcbiAgICAgICAgICAgIHVybCArPSAnJmRlYnVnPSc7XG5cbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICB9XG5cbiAgICBpbmNyZW1lbnRQYWdlKCkge1xuICAgIFxuICAgICAgICB0aGlzLnBhcmFtcy5wYWdlKys7XG4gICAgfVxuICAgIFxuICAgIG5hdmlnYXRlKCkge1xuICAgIFxuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHRoaXMuZ2V0U2VhcmNoUGFnZVVybCgpO1xuICAgIH1cbiAgICBcbiAgICByZW1vdmVSZWdpb24ocmVnaW9uSW5kZXgpIHtcbiAgICBcbiAgICAgICAgdGhpcy5wYXJhbXMucmVnaW9ucy5zcGxpY2UocmVnaW9uSW5kZXgsIDEpOyAvLyByZW1vdmUgYXQgaW5kZXggaVxuICAgICAgICB0aGlzLnBhcmFtcy5wYWdlID0gMTtcbiAgICB9XG4gICAgXG4gICAgc2V0QXV0b1N1Z2dlc3RlZFJlZ2lvbihyZWdpb24sIHJlc2V0UmVnaW9ucykge1xuICAgIFxuICAgICAgICB0aGlzLnBhcmFtcy5hdXRvU3VnZ2VzdGVkUmVnaW9uID0gcmVnaW9uO1xuICAgICAgICB0aGlzLnBhcmFtcy5yZXNldFJlZ2lvbnMgPSByZXNldFJlZ2lvbnM7XG4gICAgICAgIHRoaXMucGFyYW1zLnBhZ2UgPSAxO1xuICAgIH1cbiAgICBcbiAgICB0b2dnbGVDYXRlZ29yeShjYXRlZ29yeSkge1xuICAgIFxuICAgICAgICB2YXIgaSA9IHRoaXMucGFyYW1zLmNhdGVnb3JpZXMuaW5kZXhPZihjYXRlZ29yeSk7XG4gICAgXG4gICAgICAgIGlmIChpID4gLTEpXG4gICAgICAgICAgICB0aGlzLnBhcmFtcy5jYXRlZ29yaWVzLnNwbGljZShpLCAxKTsgLy8gcmVtb3ZlIGF0IGluZGV4IGlcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5wYXJhbXMuY2F0ZWdvcmllcy5wdXNoKGNhdGVnb3J5KTtcbiAgICB9XG4gICAgXG4gICAgdG9nZ2xlRG9tYWluKGRvbWFpbikge1xuICAgIFxuICAgICAgICB2YXIgaSA9IHRoaXMucGFyYW1zLmRvbWFpbnMuaW5kZXhPZihkb21haW4pO1xuICAgIFxuICAgICAgICBpZiAoaSA+IC0xKVxuICAgICAgICAgICAgdGhpcy5wYXJhbXMuZG9tYWlucy5zcGxpY2UoaSwgMSk7IC8vIHJlbW92ZSBhdCBpbmRleCBpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMucGFyYW1zLmRvbWFpbnMucHVzaChkb21haW4pO1xuICAgIH1cbiAgICBcbiAgICB0b2dnbGVTdGFuZGFyZChzdGFuZGFyZCkge1xuICAgIFxuICAgICAgICB2YXIgaSA9IHRoaXMucGFyYW1zLnN0YW5kYXJkcy5pbmRleE9mKHN0YW5kYXJkKTtcbiAgICBcbiAgICAgICAgaWYgKGkgPiAtMSlcbiAgICAgICAgICAgIHRoaXMucGFyYW1zLnN0YW5kYXJkcy5zcGxpY2UoaSwgMSk7IC8vIHJlbW92ZSBhdCBpbmRleCBpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMucGFyYW1zLnN0YW5kYXJkcy5wdXNoKHN0YW5kYXJkKTtcbiAgICB9XG59Il19
//# sourceMappingURL=v4-search-page-controller.js.map
