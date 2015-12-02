
class SearchPageController {

    constructor(params) {
        this.MAP_COLOR_SCALE = colorbrewer.RdYlBu[9],
        this.MAP_INITIAL_ZOOM = 10.0;
        this.MAP_RADIUS_SCALE = [500, 2000];

        this.params = params;
        this.fetching = false;
        this.fetchedAll = false;
        this.mostSimilar = [];

        var self = this;

        // Refine menus
        //
        $('.refine-link').mouseenter(function() {

            $(this).addClass('refine-link-selected');
            $(this).children('span').children('i').removeClass('fa-caret-down').addClass('fa-caret-up');
            $(this).children('ul').slideDown(100);
        });

        $('.refine-link').mouseleave(function() {

            $(this).removeClass('refine-link-selected');
            $(this).children('span').children('i').removeClass('fa-caret-up').addClass('fa-caret-down');
            $(this).children('ul').slideUp(100);
        });

        // Categories
        //
        this.attachCategoriesClickHandlers();

        $('#refine-menu-categories-view-more').click(function() {

            var controller = new ApiController();

            controller.getCategories()
                .then(data => {

                    var rg = data.results.map(function(result) {
                        return '<li><i class="fa ' + result.metadata.icon + '"></i>' + result.category + '</li>';
                    });

                    var s = rg.join('');

                    $('#refine-menu-categories').html(s);
                    self.attachCategoriesClickHandlers();
                })
                .catch(error => console.error(error));
        });

        // Domains
        //
        this.attachDomainsClickHandlers();

        $('#refine-menu-domains-view-more').click(function() {

            var controller = new ApiController();

            controller.getDomains()
                .then(data => {

                    var rg = data.results.map(function(result) {
                        return '<li>' + result.domain + '</li>';
                    });

                    var s = rg.join('');

                    $('#refine-menu-domains').html(s);
                    self.attachDomainsClickHandlers();
                })
                .catch(error => console.error(error));
        });

        // Standards
        //
        this.attachStandardsClickHandlers();

        // Tokens
        //
        $('.region-token .fa-times-circle').click(function() {

            self.removeRegion($(this).parent().index());
            self.navigate();
        });

        $('.category-token .fa-times-circle').click(function() {

            self.toggleCategory($(this).parent().text().toLowerCase().trim());
            self.navigate();
        });

        $('.domain-token .fa-times-circle').click(function() {

            self.toggleDomain($(this).parent().text().toLowerCase().trim());
            self.navigate();
        });

        $('.standard-token .fa-times-circle').click(function() {

            self.toggleStandard($(this).parent().text().toLowerCase().trim());
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
        function selectRegion(option) {
            RegionLookup.byID(option.id).then(region => {
                self.setAutoSuggestedRegion(region.name, false);
                self.navigate();
            }, error => { throw error; });
        }

        const sources = regionsWithData(this.params.vector, selectRegion);
        const autosuggest = new Autosuggest('.add-region-results', sources);
        autosuggest.listen('.add-region-input');

        $('.add-region .fa-plus').click(function() {

            $('.add-region input[type="text"]').focus();
        });

        // Similar regions
        //
        this.drawSimilarRegions(region => {

            self.setAutoSuggestedRegion(region, false);
            self.navigate();
        });

        // Places in region
        //
        this.drawPlacesInRegion();
    }

    // Public methods
    //

    drawMap(source) {
        const selector = '#map';
        const regions = this.params.regions;

        MapView.create(source, regions)
            .then(view => view.show(selector), error => { throw error; });
    }

    attachCategoriesClickHandlers() {

        var self = this;

        $('#refine-menu-categories li:not(.refine-view-more)').click(function() {

            self.toggleCategory($(this).text().toLowerCase().trim());
            self.navigate();
        });
    }

    attachDatasetClickHandlers() {

        const self = this;

        $('.datasets .name').unbind('click').click(function() {

            const controller = new ApiController();
            const domain = $(this).attr('dataset-publisher');
            const id = $(this).attr('dataset-id');

            controller.getDatasetSummary(domain, id)
                .then(result => {

                    DatasetPopup.show({
                        apiLink : $(this).attr('dataset-api-link'),
                        description: result.description || '',
                        domain : $(this).attr('dataset-publisher'),
                        id : $(this).attr('dataset-id'),
                        lastUpdated : $(this).attr('dataset-last-updated'),
                        link : $(this).attr('dataset-link'),
                        name : $(this).text(),
                        tags : $(this).attr('dataset-tags'),
                    });
                });
        });
    }

    attachDomainsClickHandlers() {

        var self = this;

        $('#refine-menu-domains li:not(.refine-view-more)').click(function() {

            var domain = $(this).text().toLowerCase().trim();

            self.toggleDomain(domain);
            self.navigate();
        });
    }

    attachStandardsClickHandlers() {

        var self = this;

        $('#refine-menu-standards li').click(function() {

            var standard = $(this).text().toLowerCase().trim();

            self.toggleStandard(standard);
            self.navigate();
        });
    }

    decrementPage() {

        this.params.page--;
    }

    // Cost of living
    //
    drawCostOfLivingData() {

        google.setOnLoadCallback(() => {

            var regionIds = this.params.regions.map(function(region) { return region.id; });
            var controller = new ApiController();

            controller.getCostOfLivingData(regionIds)
                .then(data => {

                    this.drawMap(MapSources.rpp);
                    this.drawCostOfLivingChart(regionIds, data);
                    this.drawCostOfLivingTable(regionIds, data);
                })
                .catch(error => console.error(error));
        });
    }

    drawCostOfLivingChart(regionIds, data) {

        this.drawCostOfLivingChartForComponent('cost-of-living-all-chart', 'All', regionIds, data);
        this.drawCostOfLivingChartForComponent('cost-of-living-goods-chart', 'Goods', regionIds, data);
        this.drawCostOfLivingChartForComponent('cost-of-living-rents-chart', 'Rents', regionIds, data);
        this.drawCostOfLivingChartForComponent('cost-of-living-other-chart', 'Other', regionIds, data);
    }

    drawCostOfLivingChartForComponent(id, component, regionIds, data) {

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

        this.drawLineChart(id, chartData, {

            curveType : 'function',
            legend : { position : 'bottom' },
            pointShape : 'square',
            pointSize : 8,
            title : component,
        });
    }

    drawCostOfLivingTable(regionIds, data) {

        // Headers
        //
        var s = '<tr>';
        s += '<th class=\'empty\'></th>';
        s += '<th>All<br>(Value)</th>';
        s += '<th>All<br>(Percentile)</th>';
        s += '<th>Goods<br>(Value)</th>';
        s += '<th>Goods<br>(Percentile)</th>';
        s += '<th>Other<br>(Value)</th>';
        s += '<th>Other<br>(Percentile)</th>';
        s += '<th>Rents<br>(Value)</th>';
        s += '<th>Rents<br>(Percentile)</th>';
        s += '</tr>';

        const components = ['All', 'Goods', 'Other', 'Rents'];

        for (var i = 0; i < regionIds.length; i++) {

            s += '<tr class=\'color-' + i + '\'>';
            s += '<td>' + this.params.regions[i].name + '<div></div></td>';

            for (var j = 0; j < components.length; j++) {

                const o = this.getLatestCostOfLiving(data, regionIds[i], components[j]);
                const value = (o != null) ? parseFloat(o.index) : 'NA';
                const percentile = (o != null) ? this.getPercentile(o.rank, o.total_ranks) : 'NA';

                s += '<td>' + value + '<div></div></td>';
                s += '<td>' + percentile + '<div></div></td>';
            }

            s += '</tr>';
        }

        $('#cost-of-living-table').html(s);
    }

    getPercentile(rank, totalRanks) {

        var totalRanks = parseInt(totalRanks);
        var rank = parseInt(rank);
        var percentile = parseInt(((totalRanks - rank) / totalRanks) * 100);

        return numeral(percentile).format('0o');
    }

    getLatestCostOfLiving(data, regionId, component) {

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
    }

    // Earnings
    //
    drawEarningsData() {

        google.setOnLoadCallback(() => {

            var regionIds = this.params.regions.map(function(region) { return region.id; });
            var controller = new ApiController();

            controller.getEarningsData(regionIds)
                .then(data => {
                    this.drawMap(MapSources.earnings);
                    this.drawEarningsChart(regionIds, data);
                    this.drawEarningsTable(regionIds, data);
                })
                .catch(error => console.error(error));
        });
    }

    drawEarningsChart(regionIds, data) {

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

            areaOpacity : 0,
            connectSteps: true,
            curveType : 'function',
            focusTarget : 'category',
            legend : { position : 'bottom' },
            title : 'Earnings by Education Level',
            vAxis : { format : 'currency' },
        });
    }

    drawEarningsTable(regionIds, data) {

        var s = '<tr>';
        s += '<th class=\'empty\'></th>';
        s += '<th>Median Earnings<br>(All Workers)</th>';
        s += '<th>Median Female Earnings<br>(Full Time)</th>';
        s += '<th>Median Male Earnings<br>(Full Time)</th>';
        s += '</tr>';

        for (var i = 0; i < regionIds.length; i++) {

            s += '<tr class=\'color-' + i + '\'>'
            s += '<td>' + this.params.regions[i].name + '<div></div></td>';
            s += '<td>' + numeral(data[i].median_earnings).format('$0,0') + '<div></div></td>';
            s += '<td>' + numeral(data[i].female_full_time_median_earnings).format('$0,0') + '<div></div></td>';
            s += '<td>' + numeral(data[i].male_full_time_median_earnings).format('$0,0') + '<div></div></td>';
            s += '</tr>';
        }

        $('#earnings-table').html(s);
    }

    // Health
    //
    drawHealthData() {

        google.setOnLoadCallback(() => {

            const regionIds = this.params.regions.map(function(region) { return region.id; });
            const controller = new ApiController();

            controller.getHealthRwjfChrData(regionIds)
                .then(data => {

                    this.drawHealthDataOutcomesTable(regionIds, data);
                    this.drawHealthDataFactorsTable(regionIds, data);
                    this.drawHealthDataClinicalCare(regionIds, data);
                    this.drawHealthDataSocialEconomicFactors(regionIds, data);
                    this.drawHealthDataPhysicalEnvironment(regionIds, data);
                })
                .catch(error => console.error(error));
        });
    }

    drawHealthDataOutcomesTable(regionIds, data) {

        var s = '<tr>';
        s += '<th class=\'empty\'></th>';
        s += '<th>Premature Death</th>';
        s += '<th class=\'empty\'></th>';
        s += '<th>Poor or Fair Health</th>';
        s += '<th>Poor Physical Health Days</th>';
        s += '<th>Poor Mental Health Days</th>';
        s += '<th>Low Birth Weight</th>';
        s += '</tr>';

        for (var i = 0; i < regionIds.length; i++) {

            s += '<tr class=\'color-' + i + '\'>';
            s += '<td>' + this.params.regions[i].name + '<div></div></td>';
            s += this.drawHealthDataTableCell(i, data, 'premature_death_value', '0,0');
            s += '<td class=\'empty\'></td>';
            s += this.drawHealthDataTableCell(i, data, 'poor_or_fair_health_value', '0.0%');
            s += this.drawHealthDataTableCell(i, data, 'poor_physical_health_days_value', '0.0');
            s += this.drawHealthDataTableCell(i, data, 'poor_mental_health_days_value', '0.0');
            s += this.drawHealthDataTableCell(i, data, 'low_birthweight_value', '0.0');
            s += '</tr>';
        }

        $('#rwjf-county-health-outcomes-table').html(s);
    };

    drawHealthDataFactorsTable(regionIds, data) {

        var s = '<tr>';
        s += '<th class=\'empty\'></th>';
        s += '<th>Adult Smoking</th>';
        s += '<th>Adult Obesity</th>';
        s += '<th>Food Environment Index</th>';
        s += '<th>Physical Inactivity</th>';
        s += '<th>Access to Exercise</th>';
        s += '<th>Excessive Drinking</th>';
        s += '<th>Alcohol Impaired Driving Deaths</th>';
        s += '<th>Sexually Transmitted Infections</th>';
        s += '<th>Teen Births</th>';
        s += '</tr>';

        for (var i = 0; i < regionIds.length; i++) {

            s += '<tr class=\'color-' + i + '\'>';
            s += '<td>' + this.params.regions[i].name + '<div></div></td>';
            s += this.drawHealthDataTableCell(i, data, 'adult_smoking_value', '0.0%');
            s += this.drawHealthDataTableCell(i, data, 'adult_obesity_value', '0.0%');
            s += this.drawHealthDataTableCell(i, data, 'food_environment_index_value', '0.0');
            s += this.drawHealthDataTableCell(i, data, 'physical_inactivity_value', '0.0%');
            s += this.drawHealthDataTableCell(i, data, 'access_to_exercise_opportunities_value', '0.0%');
            s += this.drawHealthDataTableCell(i, data, 'excessive_drinking_value', '0.0%');
            s += this.drawHealthDataTableCell(i, data, 'alcohol_impaired_driving_deaths_value', '0.0%');
            s += this.drawHealthDataTableCell(i, data, 'sexually_transmitted_infections_value', '0,0');
            s += this.drawHealthDataTableCell(i, data, 'alcohol_impaired_driving_deaths_value', '0,0');
            s += '</tr>';
        }

        $('#rwjf-county-health-factors-table').html(s);
    };

    drawHealthDataClinicalCare(regionIds, data) {

        var s = '<tr>';
        s += '<th class=\'empty\'></th>';
        s += '<th>Uninsured</th>';
        s += '<th>Primary Care Physicians</th>';
        s += '<th>Dentists</th>';
        s += '<th>Mental Health Providers</th>';
        s += '<th>Preventable Hospital Stays</th>';
        s += '<th>Diabetic Monitoring</th>';
        s += '<th>Mammography Screening</th>';
        s += '</tr>';

        for (var i = 0; i < regionIds.length; i++) {

            s += '<tr class=\'color-' + i + '\'>';
            s += '<td>' + this.params.regions[i].name + '<div></div></td>';
            s += this.drawHealthDataTableCell(i, data, 'uninsured_value', '0.0%');
            s += this.drawHealthDataTableCell(i, data, 'primary_care_physicians_value', '0,0');
            s += this.drawHealthDataTableCell(i, data, 'dentists_value', '0,0');
            s += this.drawHealthDataTableCell(i, data, 'mental_health_providers_value', '0,0');
            s += this.drawHealthDataTableCell(i, data, 'preventable_hospital_stays_value', '0,0');
            s += this.drawHealthDataTableCell(i, data, 'diabetic_screening_value', '0.0%');
            s += this.drawHealthDataTableCell(i, data, 'mammography_screening_value', '0.0%');
            s += '</tr>';
        }

        $('#rwjf-county-health-clinical-care-table').html(s);
    };

    drawHealthDataSocialEconomicFactors(regionIds, data) {

        var s = '<tr>';
        s += '<th class=\'empty\'></th>';
        s += '<th>High School Graduation</th>';
        s += '<th>Some College</th>';
        s += '<th>Unemployment</th>';
        s += '<th>Children in Poverty</th>';
        s += '<th>Income Inequality</th>';
        s += '<th>Children in Single-Parent Households</th>';
        s += '<th>Social Associations</th>';
        s += '<th>Violent Crime</th>';
        s += '<th>Injury Deaths</th>';
        s += '</tr>';

        for (var i = 0; i < regionIds.length; i++) {

            s += '<tr class=\'color-' + i + '\'>';
            s += '<td>' + this.params.regions[i].name + '<div></div></td>';
            s += this.drawHealthDataTableCell(i, data, 'high_school_graduation_value', '0.0%');
            s += this.drawHealthDataTableCell(i, data, 'some_college_value', '0.0%');
            s += this.drawHealthDataTableCell(i, data, 'unemployment_value', '0.0%');
            s += this.drawHealthDataTableCell(i, data, 'children_in_poverty_value', '0.0%');
            s += this.drawHealthDataTableCell(i, data, 'income_inequality_value', '0.0');
            s += this.drawHealthDataTableCell(i, data, 'children_in_single_parent_households_value', '0.0%');
            s += this.drawHealthDataTableCell(i, data, 'social_associations_value', '0.0');
            s += this.drawHealthDataTableCell(i, data, 'violent_crime_value', '0.0');
            s += this.drawHealthDataTableCell(i, data, 'injury_deaths_value', '0.0');
            s += '</tr>';
        }

        $('#rwjf-county-health-social-economic-factors-table').html(s);
    };

    drawHealthDataPhysicalEnvironment(regionIds, data) {

        var s = '<tr>';
        s += '<th class=\'empty\'></th>';
        s += '<th>Air Pollution - Particulate Matter</th>';
        s += '<th>Drinking Water Violations</th>';
        s += '<th>Severe Housing Problems</th>';
        s += '<th>Driving Alone to Work</th>';
        s += '<th>Long Commute - Driving Alone</th>';
        s += '</tr>';

        for (var i = 0; i < regionIds.length; i++) {

            s += '<tr class=\'color-' + i + '\'>';
            s += '<td>' + this.params.regions[i].name + '<div></div></td>';
            s += this.drawHealthDataTableCell(i, data, 'air_pollution_particulate_matter_value', '0.0');
            s += this.drawHealthDataTableCell(i, data, 'drinking_water_violations_value', '0.0%');
            s += this.drawHealthDataTableCell(i, data, 'severe_housing_problems_value', '0.0%');
            s += this.drawHealthDataTableCell(i, data, 'driving_alone_to_work_value', '0.0%');
            s += this.drawHealthDataTableCell(i, data, 'long_commute_driving_alone_value', '0.0%');
            s += '</tr>';
        }

        $('#rwjf-county-health-physical-environment-table').html(s);
    };

    drawHealthDataTableCell(i, data, var_key, fmt_str, addl_fmt = '') {

        var s = '<td>';

        if (data[i] && data[i][var_key])
            s += numeral(data[i][var_key].replace(',','')).format(fmt_str) + addl_fmt;
        else
            s += '';

        s += '<div></div></td>';

        return s;
    }

    // Education
    //
    drawEducationData() {

        google.setOnLoadCallback(() => {

            var regionIds = this.params.regions.map(function(region) { return region.id; });
            var controller = new ApiController();

            controller.getEducationData(regionIds)
                .then(data => {
                    this.drawMap(MapSources.education);
                    this.drawEducationTable(regionIds, data)
                })
                .catch(error => console.error(error));
        });
    }

    drawEducationTable(regionIds, data) {

        var s = '<tr>';
        s += '<th class=\'empty\'></th>';
        s += '<th>At Least Bachelor\'s Degree<br>(Percent)</th>';
        s += '<th>At Least Bachelor\'s Degree<br>(Percentile)</th>';
        s += '<th>At Least High School Diploma<br>(Percent)</th>';
        s += '<th>At Least High School Diploma<br>(Percentile)</th>';
        s += '</tr>';

        for (var i = 0; i < regionIds.length; i++) {

            s += '<tr class=\'color-' + i + '\'>'
            s += '<td>' + this.params.regions[i].name + '<div></div></td>';

            const totalRanks = parseInt(data[i].total_ranks);
            const bachelorsRank = parseInt(data[i].percent_bachelors_degree_or_higher_rank);
            const bachelorsPercentile = parseInt(((totalRanks - bachelorsRank) / totalRanks) * 100);

            s += '<td>' + data[i].percent_bachelors_degree_or_higher + '%<div></div></td>';
            s += '<td>' + numeral(bachelorsPercentile).format('0o') + '<div></div></td>';

            const highSchoolRank = parseInt(data[i].percent_high_school_graduate_or_higher);
            const highSchoolPercentile = parseInt(((totalRanks - highSchoolRank) / totalRanks) * 100);

            s += '<td>' + data[i].percent_high_school_graduate_or_higher + '%<div></div></td>';
            s += '<td>' + numeral(highSchoolPercentile).format('0o') + '<div></div></td>';
            s += '</tr>'
        }

        $('#education-table').html(s);
    }

    // GDP data
    //
    drawGdpData() {

        google.setOnLoadCallback(() => {

            var regionIds = this.params.regions.map(function(region) { return region.id; });
            var controller = new ApiController();

            controller.getGdpData(regionIds)
                .then(data => {
                    this.drawMap(MapSources.gdp);
                    this.drawGdpChart(regionIds, data);
                    this.drawGdpChangeChart(regionIds, data);
                })
                .catch(error => console.error(error));
        });
    }

    drawGdpChart(regionIds, data) {

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

            curveType : 'function',
            legend : { position : 'bottom' },
            pointShape : 'square',
            pointSize : 8,
            title : 'Per Capita Real GDP over Time',
        });
    }

    drawGdpChangeChart(regionIds, data) {

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

            curveType : 'function',
            legend : { position : 'bottom' },
            pointShape : 'square',
            pointSize : 8,
            title : 'Annual Change in Per Capita GDP over Time',
            vAxis : { format : '#.#%' },
        });
    }

    // Occupations
    //
    drawOccupationsData() {

        google.setOnLoadCallback(() => {

            var regionIds = this.params.regions.map(function(region) { return region.id; });
            var controller = new ApiController();

            controller.getOccupationsData(regionIds)
                .then(data => {
                    this.drawMap(MapSources.occupations);
                    this.drawOccupationsTable(regionIds, data)
                })
                .catch(error => console.error(error));
        });
    }

    drawOccupationsTable(regionIds, data) {

        var s = '<tr>'
        s += '<th class=\'empty\'></th>';

        for (var i = 0; i < regionIds.length; i++) {
            s += '<th colspan=\'2\' class=\'color-' + i + '\'>' + this.params.regions[i].name + '<div></div></th>';
        }

        s+= '</tr>'

        // Sub header
        //
        s += '<tr><td class=\'empty\'></td>';

        for (var i = 0; i < regionIds.length; i++) {
            s += '<td>Percent</td><td class=\'color-' + i + '\'>Percentile<div></div></td>';
        }

        for (var i = 0; i < data.length; i++) {

            const regionIndex = (i % regionIds.length);

            if (regionIndex == 0)
                s += '</tr><tr><td>' + data[i].occupation + '</td>';

            const totalRanks = parseInt(data[i].total_ranks);
            const rank = parseInt(data[i].percent_employed_rank);
            const percentile = parseInt(((totalRanks - rank) / totalRanks) * 100);

            s += '<td>' + numeral(data[i].percent_employed).format('0.0') + '%</td>';
            s += '<td class=\'color-' + regionIndex + '\'>' + numeral(percentile).format('0o') + '<div></div></td>';
        }

        s += '</tr>';

        $('#occupations-table').html(s);
    }

    // Population
    //
    drawPopulationData() {

        google.setOnLoadCallback(() => {

            const regionIds = this.params.regions.map(function(region) { return region.id; });
            const controller = new ApiController();

            controller.getPopulationData(regionIds)
                .then(data => {

                    this.drawMap(MapSources.population);
                    this.drawPopulationChart(regionIds, data);
                    this.drawPopulationChangeChart(regionIds, data);
                })
                .catch(error => console.error(error));
        });
    }

    drawPopulationChart(regionIds, data) {

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

        this.drawLineChart('population-chart', chartData, {

            curveType : 'function',
            legend : { position : 'bottom' },
            pointShape : 'square',
            pointSize : 8,
            title : 'Population',
        });
    }

    drawPopulationChangeChart(regionIds, data) {

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

        this.drawLineChart('population-change-chart', chartData, {

            curveType : 'function',
            legend : { position : 'bottom' },
            pointShape : 'square',
            pointSize : 8,
            title : 'Population Change',
            vAxis : { format : '#.#%' },
        });
    }

    // Places in region
    //
    drawPlacesInRegion() {

        if (this.params.regions.length == 0)
            return;

        var region = this.params.regions[0];

        switch (region.type) {

            case 'nation': this.drawChildPlacesInRegion(region, 'Regions in {0}'.format(region.name)); break;
            case 'region': this.drawChildPlacesInRegion(region, 'Divisions in {0}'.format(region.name)); break;
            case 'division': this.drawChildPlacesInRegion(region, 'States in {0}'.format(region.name)); break;
            case 'state': this.drawCitiesAndCountiesInState(region); break;
            case 'county': this.drawOtherCountiesInState(region); break;
            case 'msa': this.drawOtherMetrosInState(region); break;
            case 'place': this.drawOtherCitiesInState(region); break;
        }
    }

    drawChildPlacesInRegion(region, label) {

        var controller = new ApiController();

        controller.getChildRegions(region.id)
            .then(response => {

                this.drawPlacesInRegionHeader('#places-in-region-header-0', label);
                this.drawPlacesInRegionList('#places-in-region-list-0', response);
            })
            .catch(error => console.error(error));
    }

    drawCitiesAndCountiesInState(region) {
        var controller = new ApiController();
        var citiesPromise = controller.getCitiesInState(region.id);
        var countiesPromise = controller.getCountiesInState(region.id);

        return Promise.all([citiesPromise, countiesPromise])
            .then(values => {

                if (values.length == 0)
                    return;

                if (values[0].length > 0) {

                    this.drawPlacesInRegionHeader('#places-in-region-header-0', 'Places in {0}'.format(region.name));
                    this.drawPlacesInRegionList('#places-in-region-list-0', values[0]);
                }

                if (values[1].length > 0) {

                    this.drawPlacesInRegionHeader('#places-in-region-header-1', 'Counties in {0}'.format(region.name));
                    this.drawPlacesInRegionList('#places-in-region-list-1', values[1]);
                }
            })
            .catch(error => console.error(error));
    }

    drawOtherCitiesInState(region) {

        var controller = new ApiController();

        controller.getParentState(region)
            .then(response => {

                if (response.length == 0)
                    return;

                var state = response[0];

                controller.getCitiesInState(state.parent_id)
                    .then(response => {

                        if (response.length == 0)
                            return;

                        this.drawPlacesInRegionHeader('#places-in-region-header-0', 'Places in {0}'.format(state.parent_name));
                        this.drawPlacesInRegionList('#places-in-region-list-0', response);
                    })
                    .catch(error => console.error(error));
            });
    }

    drawOtherCountiesInState(region) {

        var controller = new ApiController();

        controller.getParentState(region)
            .then(response => {

                if (response.length == 0)
                    return;

                var state = response[0];

                controller.getCountiesInState(state.parent_id)
                    .then(response => {

                        if (response.length == 0)
                            return;

                        this.drawPlacesInRegionHeader('#places-in-region-header-0', 'Counties in {0}'.format(state.parent_name));
                        this.drawPlacesInRegionList('#places-in-region-list-0', response);
                    })
                    .catch(error => console.error(error));
            });
    }

    drawOtherMetrosInState(region) {

        var controller = new ApiController();

        controller.getParentState(region)
            .then(response => {

                if (response.length == 0)
                    return;

                var state = response[0];

                controller.getMetrosInState(state.parent_id)
                    .then(response => {

                        if (response.length == 0)
                            return;

                        this.drawPlacesInRegionHeader('#places-in-region-header-0', 'Metropolitan Areas in {0}'.format(state.parent_name));
                        this.drawPlacesInRegionList('#places-in-region-list-0', response);
                    })
                    .catch(error => console.error(error));
            });
    }

    removeCurrentRegions(regions, maxCount = 5) {

        var count = 0;
        var rg = [];

        for (var i = 0; i < regions.length; i++) {

            if (this.isRegionIdContainedInCurrentRegions(regions[i].child_id))
                continue;

            rg.push(regions[i]);

            if (count == (maxCount - 1))
                break;

            count++;
        }

        return rg;
    }

    drawPlacesInRegionHeader(headerId, label) {

        $(headerId).text(label).slideToggle(100);
    }

    drawPlacesInRegionList(listId, data, maxCount = 5) {

        if (data.length == 0)
            return;

        var count = 0;
        var s = '';

        for (var i = 0; i < data.length; i++) {

            if (this.isRegionIdContainedInCurrentRegions(data[i].child_id))
                continue;

            s += '<li><a href="';
            s += this.getSearchPageForRegionsAndVectorUrl(data[i].child_name) + '">';
            s += data[i].child_name;
            s += '</a></li>';

            if (count == (maxCount - 1))
                break;

            count++;
        }

        $(listId).html(s);
        $(listId).slideToggle(100);
    }

    isRegionIdContainedInCurrentRegions(regionId) {

        for (var j = 0; j < this.params.regions.length; j++) {

            if (regionId == this.params.regions[j].id)
                return true;
        }

        return false;
    }

    // Similar regions
    //
    drawSimilarRegions(onClickRegion) {

        if (this.params.regions.length == 0)
            return;

        const region = this.params.regions[0];
        const controller = new ApiController();

        controller.getSupportedVectors(region.id)
            .then(data => controller.getSimilarRegions(region.id, data.available_vectors))
            .then(data => this.drawSimilarRegionsList(data, onClickRegion))
            .catch(error => console.error(error));
    }

    drawSimilarRegionsList(data, onClickRegion) {
        const mostSimilar = data.most_similar;
        const regionPromises = mostSimilar.map(region => RegionLookup.byID(region.id));

        Promise.all(regionPromises).then(regions => {
            const selection = d3.select('#similar-regions');

            const links = selection
                .selectAll('li')
                .data(regions)
                .enter()
                .append('li')
                .append('a')
                .on('click', region => onClickRegion(region.name))
                .text(region => region.name)
                .append('i')
                .attr('class', 'fa fa-plus');

            selection.style('display', 'block');
        }, error => { throw error; });
    }


    // Draw charts
    //
    drawLineChart(chartId, data, options) {

        var dataTable = google.visualization.arrayToDataTable(data);
        var chart = new google.visualization.LineChart(document.getElementById(chartId));

        this.applyStandardOptions(options);

        chart.draw(dataTable, options);
    }

    drawSteppedAreaChart(chartId, data, options) {

        var dataTable = google.visualization.arrayToDataTable(data);
        var chart = new google.visualization.SteppedAreaChart(document.getElementById(chartId));

        this.applyStandardOptions(options);

        chart.draw(dataTable, options);
    }

    applyStandardOptions(options) {

        options.series = {
            0: { color: '#2980b9' },
            1: { color: '#ee3b3b' },
            2: { color: '#3bdbee' },
            3: { color: '#ff9900' },
            4: { color: '#109618' },
        };

        options.legend = {
            position: 'top',
            maxLines: 4,
            textStyle: {
                color: '#222',
                fontSize: 14
            }
        };
    }

    // Maps
    //
    getRadiusScaleLinear(values) {

        return d3.scale.linear()
            .domain(d3.extent(values))
            .range(this.MAP_RADIUS_SCALE);
    }

    getRadiusScaleLog(values) {

        return d3.scale.log()
            .domain(d3.extent(values))
            .range(this.MAP_RADIUS_SCALE);
    }

    getColorScale(values) {

        const domain = (() => {

            const step = 1.0 / this.MAP_COLOR_SCALE.length;

            function quantile(value, index, list) {
                return d3.quantile(values, (index + 1) * step);
            }

            return _.map(this.MAP_COLOR_SCALE.slice(1), quantile);
        })();

        return d3.scale.quantile()
            .domain(domain)
            .range(this.MAP_COLOR_SCALE);
    }

    drawCirclesForPlaces(map, places, radiusScale, colorScale) {

        places.forEach(place => {

            var feature = {
                "type": "Feature",
                "properties": {
                    "name": place.name
                },
                "geometry": {
                    "coordinates": place.coordinates,
                    "type": "Point",
                }
            };

            const options = {
                fillColor: colorScale(place.value),
                fillOpacity: 1,
                opacity: 0,
                radius: 8,
                stroke: false,
                weight: 0,
            };

            L.geoJson(
                feature,
                {
                    pointToLayer: (feature, latlng) => {
                        return L.circle(latlng, radiusScale(place.value ), options);
                    }
                }
            ).addTo(map);
        });
    }

    drawMarkersForPlaces(map, places) {

        places.forEach(place => {

            var feature = {
                "type": "Feature",
                "properties": {
                    "name": place.name
                },
                "geometry": {
                    "coordinates": place.location.coordinates,
                    "type": "Point",
                }
            };

            L.geoJson(feature).addTo(map);
        });
    }

    getPlacesForRegion(data) {

        var places = [];

        data.forEach(place => {

            this.params.regions.forEach(region => {

                if (place.id == region.id)
                    places.push(place);
            })
        });

        return places;
    }

    // Paging
    //
    fetchNextPage() {

        if (this.fetching || this.fetchedAll)
            return;

        this.fetching = true;
        this.incrementPage();

        var self = this;

        $.ajax(this.getSearchResultsUrl()).done(function(data, textStatus, jqXHR) {

            if (jqXHR.status == 204) { // no content

                self.decrementPage();
                self.fetching = false;
                self.fetchedAll = true;
                return;
            }

            $('.datasets').append(data);
            self.fetching = false;

            self.attachDatasetClickHandlers();
        });
    }

    getSearchPageForRegionsAndVectorUrl(regions, vector, searchResults, queryString) {

        var url = '/';

        if (typeof(regions) === 'string') {
            url += regions.replace(/ /g, '_');
        }
        else if (Array.isArray(regions)) {

            var regionNames = [];

            regionNames = regions.map(function(region) {
                return region
                return region.replace(/ /g, '_');
            });

            url += regionNames.join('_vs_');
        }
        else {

            url += 'search';
        }

        if (vector)
            url += '/' + vector;

        if (searchResults)
            url += '/search-results';

        if (queryString)
            url += queryString;

        return url;
    }

    getSearchPageUrl(searchResults) {

        if ((this.params.regions.length > 0) || this.params.autoSuggestedRegion) {

            var regionNames = [];

            if (this.params.resetRegions == false)
                regionNames = this.params.regions.map(region => region.name);

            if (this.params.autoSuggestedRegion)
                regionNames.push(this.params.autoSuggestedRegion);

            return this.getSearchPageForRegionsAndVectorUrl(regionNames, this.params.vector, searchResults, this.getSearchQueryString());
        }
        else {

            return this.getSearchPageForRegionsAndVectorUrl(null, this.params.vector, searchResults, this.getSearchQueryString());
        }
    }

    getSearchResultsUrl() {

        return this.getSearchPageUrl(true);
    }

    getSearchQueryString() {

        var url = '?q=' + encodeURIComponent(this.params.q);

        if (this.params.page > 1)
            url += '&page=' + this.params.page;

        if (this.params.categories.length > 0)
            url += '&categories=' + encodeURIComponent(this.params.categories.join(','));

        if (this.params.domains.length > 0)
            url += '&domains=' + encodeURIComponent(this.params.domains.join(','));

        if (this.params.standards.length > 0)
            url += '&standards=' + encodeURIComponent(this.params.standards.join(','));

        if (this.params.debug)
            url += '&debug=';

        return url;
    }

    incrementPage() {

        this.params.page++;
    }

    navigate() {

        window.location.href = this.getSearchPageUrl();
    }

    removeRegion(regionIndex) {

        this.params.regions.splice(regionIndex, 1); // remove at index i
        this.params.page = 1;
    }

    setAutoSuggestedRegion(region, resetRegions) {

        this.params.autoSuggestedRegion = region;
        this.params.resetRegions = resetRegions;
        this.params.page = 1;
    }

    toggleCategory(category) {

        var i = this.params.categories.indexOf(category);

        if (i > -1)
            this.params.categories.splice(i, 1); // remove at index i
        else
            this.params.categories.push(category);

        this.params.page = 1;
    }

    toggleDomain(domain) {

        var i = this.params.domains.indexOf(domain);

        if (i > -1)
            this.params.domains.splice(i, 1); // remove at index i
        else
            this.params.domains.push(domain);

        this.params.page = 1;
    }

    toggleStandard(standard) {

        var i = this.params.standards.indexOf(standard);

        if (i > -1)
            this.params.standards.splice(i, 1); // remove at index i
        else
            this.params.standards.push(standard);

        this.params.page = 1;
    }
}
