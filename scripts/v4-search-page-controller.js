class SearchPageController {

    constructor(params) {

        this.MAP_INITIAL_CENTER = [37.1669, -95.9669];
        this.MAP_INITIAL_ZOOM = 4.0;
        
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
        new AutoSuggestRegionController('.add-region input[type="text"]', '.add-region ul', function(region) {
    
            self.setAutoSuggestedRegion(region, false);
            self.navigate();
        });
    
        $('.add-region .fa-plus').click(function() {
    
            $('.add-region input[type="text"]').focus();
        });
    
        // Similar regions
        //
        this.drawSimilarRegions(function(region) {
    
            self.setAutoSuggestedRegion(region, false);
            self.navigate();
        });
    
        // Places in region
        //
        this.drawPlacesInRegion();
    }

    // Public methods
    //
    attachCategoriesClickHandlers() {
    
        var self = this;
    
        $('#refine-menu-categories li:not(.refine-view-more)').click(function() {
    
            self.toggleCategory($(this).text().toLowerCase().trim());
            self.navigate();
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
    
        var self = this;
    
        google.setOnLoadCallback(function() {
    
            var regionIds = self.params.regions.map(function(region) { return region.id; });
            var controller = new ApiController();
    
            controller.getCostOfLivingData(regionIds, function(data) { 
    
                self.drawCostOfLivingChart(regionIds, data);
                self.drawCostOfLivingTable(regionIds, data);
            });
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
                    index : (o != null) ? parseFloat(o.index) : 'NA',
                    percentile : (o != null) ? this.getPercentile(o.rank, o.total_ranks) : 'NA',
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
    
        var self = this;
    
        google.setOnLoadCallback(function() {
    
            var regionIds = self.params.regions.map(function(region) { return region.id; });
            var controller = new ApiController();
    
            controller.getEarningsData(regionIds, function(data) { 
    
                self.drawEarningsChart(regionIds, data);
                self.drawEarningsTable(regionIds, data);
            });
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

    // Health
    //
    drawHealthData() {
    
        var self = this;
    
        google.setOnLoadCallback(function() {
    
            var regionIds = self.params.regions.map(function(region) { return region.id; });
            var controller = new ApiController();
    
            // RWJF County Health Rankings data
            controller.getHealthRwjfChrData(regionIds, function(data) { 
                self.drawRwjfChrTable(regionIds, data);
            });
            // CDC BRFSS Prevalence Data
            // controller.getCdcBrfssPrevalenceData(regionIds, function(data) { 
            //     self.drawCdcBrfssPrevalenceTable(regionIds, data);
            // });

        });
    }
    
    drawRwjfChrTableRow(regionIds, data, first_td, var_label, var_key, fmt_str, addl_fmt = '') {
        var s = '<tr>'+first_td+'<td>'+var_label+'</td>'
        for (var i = 0; i < regionIds.length; i++) {
            s += '<td>'
            if(data[i] && data[i][var_key]){
                s += numeral(data[i][var_key].replace(',','')).format(fmt_str) + addl_fmt
            } else {
                s += ''
            }
            s += '</td>';
        }
        s += '</tr>'
        return s
    }

    drawRwjfChrTable(regionIds, data) {
    
        var s = '';

        // first row, which is region names
        s += '<tr><th></th><th></th>';
        for (var i = 0; i < regionIds.length; i++) {
            s += '<th>' + this.params.regions[i].name + '</th>';
        }
        s += '</tr>'

        // HEALTH OUTCOMES
        s += '<tr><td colspan='+numeral(regionIds.length)+1+'>HEALTH OUTCOMES</td></tr>'
        // health outcomes - length of life - 1 measure
        s += this.drawRwjfChrTableRow(regionIds, data, '<td rowspan=1>Length of Life</td>', 'Premature Death','premature_death_value','0,0')
        // health outcomes - quality of life - 4 measures
        s += this.drawRwjfChrTableRow(regionIds, data, '<td rowspan=4>Quality of Life</td>', 'Poor or fair health','poor_or_fair_health_value','0.0%')
        s += this.drawRwjfChrTableRow(regionIds, data, '', 'Poor physical health days','poor_physical_health_days_value','0.0')
        s += this.drawRwjfChrTableRow(regionIds, data, '', 'Poor mental health days','poor_mental_health_days_value','0.0')
        s += this.drawRwjfChrTableRow(regionIds, data, '', 'Low birthweight','low_birthweight_value','0.0%')

        // HEALTH FACTORS
        s += '<tr><td colspan='+numeral(regionIds.length)+1+'>HEALTH FACTORS</td></tr>'
        // health outcomes - health factors - 9 measures
        s += this.drawRwjfChrTableRow(regionIds, data, '<td rowspan=9>Health Behaviors</td>', 'Adult smoking','adult_smoking_value','0.0%')
        s += this.drawRwjfChrTableRow(regionIds, data, '', 'Adult obesity','adult_obesity_value','0.0%')
        s += this.drawRwjfChrTableRow(regionIds, data, '', 'Food environment index','food_environment_index_value','0.0')
        s += this.drawRwjfChrTableRow(regionIds, data, '', 'Physical inactivity','physical_inactivity_value','0.0%')
        s += this.drawRwjfChrTableRow(regionIds, data, '', 'Access to exercise opportunities','access_to_exercise_opportunities_value','0.0%')
        s += this.drawRwjfChrTableRow(regionIds, data, '', 'Excessive drinking','excessive_drinking_value','0.0%')
        s += this.drawRwjfChrTableRow(regionIds, data, '', 'Alcohol-impaired driving deaths','alcohol_impaired_driving_deaths_value','0.0%')
        s += this.drawRwjfChrTableRow(regionIds, data, '', 'Sexually transmitted infections','sexually_transmitted_infections_value','0,0')
        s += this.drawRwjfChrTableRow(regionIds, data, '', 'Teen births','alcohol_impaired_driving_deaths_value','0,0')
        // health outcomes - clinical care - 7 measures
        s += this.drawRwjfChrTableRow(regionIds, data, '<td rowspan=7>Clinical Care</td>', 'Uninsured','uninsured_value','0.0%')
        s += this.drawRwjfChrTableRow(regionIds, data, '', 'Primary care physicians','primary_care_physicians_value','0,0')
        s += this.drawRwjfChrTableRow(regionIds, data, '', 'Dentists','dentists_value','0,0')
        s += this.drawRwjfChrTableRow(regionIds, data, '', 'Mental health providers','mental_health_providers_value','0,0')
        s += this.drawRwjfChrTableRow(regionIds, data, '', 'Preventable hospital stays','preventable_hospital_stays_value','0,0')
        s += this.drawRwjfChrTableRow(regionIds, data, '', 'Diabetic monitoring','diabetic_screening_value','0.0%')
        s += this.drawRwjfChrTableRow(regionIds, data, '', 'Mammography screening','mammography_screening_value','0.0%')

        // health outcomes - social and economic factors - 9 measures
        s += this.drawRwjfChrTableRow(regionIds, data, '<td rowspan=9>Social & Economic Factors</td>', 'High school graduation','high_school_graduation_value','0.0%')
        s += this.drawRwjfChrTableRow(regionIds, data, '', 'Some college','some_college_value','0.0%')
        s += this.drawRwjfChrTableRow(regionIds, data, '', 'Unemployment','unemployment_value','0.0%')
        s += this.drawRwjfChrTableRow(regionIds, data, '', 'Children in poverty','children_in_poverty_value','0.0%')
        s += this.drawRwjfChrTableRow(regionIds, data, '', 'Income inequality','income_inequality_value','0.0')
        s += this.drawRwjfChrTableRow(regionIds, data, '', 'Children in single-parent households','children_in_single_parent_households_value','0.0%')
        s += this.drawRwjfChrTableRow(regionIds, data, '', 'Social associations','social_associations_value','0.0')
        s += this.drawRwjfChrTableRow(regionIds, data, '', 'Violent crime','violent_crime_value','0.0')
        s += this.drawRwjfChrTableRow(regionIds, data, '', 'Injury deaths','injury_deaths_value','0.0')

        // health outcomes - physical environment - 5 measures
        s += this.drawRwjfChrTableRow(regionIds, data, '<td rowspan=5>Physical Environment</td>', 'Air pollution - particulate matter','air_pollution_particulate_matter_value','0.0')
        s += this.drawRwjfChrTableRow(regionIds, data, '', 'Drinking water violations','drinking_water_violations_value','0.0%')
        s += this.drawRwjfChrTableRow(regionIds, data, '', 'Severe housing problems','severe_housing_problems_value','0.0%')
        s += this.drawRwjfChrTableRow(regionIds, data, '', 'Driving alone to work','driving_alone_to_work_value','0.0%')
        s += this.drawRwjfChrTableRow(regionIds, data, '', 'Long commute - driving alone','long_commute_driving_alone_value','0.0%')

        $('#rwjf-county-health-rankings-table').html(s);
    }
    
    // Education
    //
    drawEducationData() {
    
        var self = this;
    
        google.setOnLoadCallback(function() {
    
            var regionIds = self.params.regions.map(function(region) { return region.id; });
            var controller = new ApiController();
    
            controller.getEducationData(regionIds, function(data) { 
    
                self.drawEducationTable(regionIds, data);
            });
        });
    }
    
    drawEducationTable(regionIds, data) {
    
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
            var percentile = parseInt(((totalRanks - rank) / totalRanks) * 100);
            
            s += '<td>' + data[i].percent_bachelors_degree_or_higher + '%</td>';
            s += '<td>' + numeral(percentile).format('0o') + '</td>';
        }
    
        // At least high school diploma
        //
        s += '</tr><tr><td>At Least High School Diploma</td>';
    
        for (var i = 0; i < regionIds.length; i++) {
    
            var totalRanks = parseInt(data[i].total_ranks);
            var rank = parseInt(data[i].percent_high_school_graduate_or_higher);
            var percentile = parseInt(((totalRanks - rank) / totalRanks) * 100);
    
            s += '<td>' + data[i].percent_high_school_graduate_or_higher + '%</td>';
            s += '<td>' + numeral(percentile).format('0o') + '</td>';
        }
    
        s += '</tr>';
    
        $('#education-table').html(s);
    }
    
    // GDP data
    //
    drawGdpData() {
    
        var self = this;
    
        google.setOnLoadCallback(function() {
    
            var regionIds = self.params.regions.map(function(region) { return region.id; });
            var controller = new ApiController();
    
            controller.getGdpData(regionIds, function(data) { 
    
                self.drawGdpChart(regionIds, data);
                self.drawGdpChangeChart(regionIds, data);
            });
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
    
        var self = this;
    
        google.setOnLoadCallback(function() {
    
            var regionIds = self.params.regions.map(function(region) { return region.id; });
            var controller = new ApiController();
    
            controller.getOccupationsData(regionIds, function(data) { 
    
                self.drawOccupationsTable(regionIds, data);
            });
        });
    }
    
    drawOccupationsTable(regionIds, data) {
    
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
    
            if ((i % regionIds.length) == 0)
                s += '</tr><tr><td>' + data[i].occupation + '</td>'; 
    
            var totalRanks = parseInt(data[i].total_ranks);
            var rank = parseInt(data[i].percent_employed_rank);
            var percentile = parseInt(((totalRanks - rank) / totalRanks) * 100);
    
            s += '<td>' + numeral(data[i].percent_employed).format('0.0') + '%</td>';
            s += '<td>' + numeral(percentile).format('0o') + '</td>';
        }
    
        s += '</tr>';
    
        $('#occupations-table').html(s);
    }
    
    // Population
    //
    drawPopulationData() {

        google.setOnLoadCallback(() => {

            var regionIds = this.params.regions.map(function(region) { return region.id; });
            var controller = new ApiController();

            controller.getPopulationData(regionIds, (data) => { 

                this.drawPopulationMap();
                this.drawPopulationChart(regionIds, data);
                this.drawPopulationChangeChart(regionIds, data);
            });
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
    
    drawPopulationMap() {
    
        var map = L.map(
            'map',
            {
                zoomControl : false,
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
    drawPlacesInRegion() {

        if (this.params.regions.length == 0) 
            return;

        var region = this.params.regions[0];

        switch (region.type) {

            case 'nation': 
                return;

            case 'state':

                this.drawPlacesInStateForRegion(region.id, region) // the region is a state
                    .then(response => {

                        if (response.length == 0)
                            return;

                        $('#places-in-region-header').text('Places in {0}'.format(region.name));
                        $('#places-in-region-header').slideToggle(100);

                        this.drawPlacesInRegionList(response, 10);
                    })
                    .catch(error => console.error(error));

            default: 

                var controller = new ApiController();

                controller.getParentState(region)
                    .then(response => {

                        if (response.length == 0)
                            return;

                        var state = response[0];

                        this.drawPlacesInStateForRegion(state.parent_id, region)
                            .then(response => {

                                if (response.length == 0)
                                    return;

                                $('#places-in-region-header').text('Places in {0}'.format(state.parent_name));
                                $('#places-in-region-header').slideToggle(100);

                                this.drawPlacesInRegionList(response);
                            })
                            .catch(error => console.error(error));
                    });
        }
    }

    drawPlacesInStateForRegion(stateId, region) {

        var controller = new ApiController();

        switch (region.type) {

            case 'county': return controller.getCountiesInState(stateId);
            case 'msa': return controller.getMetrosInState(stateId);
            case 'place': return controller.getPlacesInState(stateId);
            case 'state':

                var placesPromise = controller.getPlacesInState(stateId);
                var countiesPromise = controller.getCountiesInState(stateId);

                return Promise.all([placesPromise, countiesPromise])
                    .then(values => {

                        var rg0 = this.removeCurrentRegions(values[0]);
                        var rg1 = this.removeCurrentRegions(values[1]);

                        return Promise.resolve(rg0.concat(rg1));
                    })
                    .catch(error => console.error(error));

            default: return Promise.resolve([]);
        }
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

    drawPlacesInRegionList(data, maxCount = 5) {

        var s = '';

        if (data.length == 0)
            return;

        var count = 0;

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

        $('#places-in-region').html(s);
        $('#places-in-region').slideToggle(100);
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

        var region = this.params.regions[0];
        var controller = new ApiController();

        controller.getSimilarRegions(region.id)
            .then(data => this.drawSimilarRegionsList(data, onClickRegion))
            .catch(error => console.error(error));
    }

    drawSimilarRegionsList(data, onClickRegion) {

        var s = '';

        if (data.most_similar == undefined)
            return;

        var count = 0;

        for (var i = 0; i < data.most_similar.length; i++) {

            if (this.isRegionIdContainedInCurrentRegions(data.most_similar[i].id))
                continue;

            s += '<li><a><i class="fa fa-plus"></i>' + data.most_similar[i].name + '</a></li>'

            if (count == 4)
                break;

            count++;
        }
    
        $('#similar-regions').html(s);
        $('#similar-regions').slideToggle(100);
        
        $('#similar-regions li a').click(function() {
    
            var index = $(this).parent().index();
            onClickRegion(data.most_similar[index].name);
        });
    }
    
    // Draw charts
    //
    drawLineChart(chartId, data, options) {
    
        var dataTable = google.visualization.arrayToDataTable(data);
        var chart = new google.visualization.LineChart(document.getElementById(chartId));
    
        chart.draw(dataTable, options);
    }
    
    drawSteppedAreaChart(chartId, data, options) {
    
        var dataTable = google.visualization.arrayToDataTable(data);
        var chart = new google.visualization.SteppedAreaChart(document.getElementById(chartId));
    
        chart.draw(dataTable, options);
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
    }
    
    getSearchPageForRegionsAndVectorUrl(regions, vector, queryString) {
    
        var url = '/';
    
        if (typeof(regions) === 'string') {
    
            url += regions.replace(/,/g, '').replace(/ /g, '_');
        }
        else if (Array.isArray(regions)) {
    
            var regionNames = [];
    
            regionNames = regions.map(function(region) {
                return region.replace(/,/g, '').replace(/ /g, '_');
            });
    
            url += regionNames.join('_vs_');
        }
        else {
    
            url += 'search';
        }
    
        if (vector)
            url += '/' + vector;
    
        if (queryString) 
            url += queryString;
    
        return url;
    }
    
    getSearchPageUrl() {
    
        if ((this.params.regions.length > 0) || this.params.autoSuggestedRegion) {
    
            var regionNames = [];
    
            if (this.params.resetRegions == false) {
    
                regionNames = this.params.regions.map(function(region) { 
                    return region.name; 
                });
            }
    
            if (this.params.autoSuggestedRegion)
                regionNames.push(this.params.autoSuggestedRegion);
    
            return this.getSearchPageForRegionsAndVectorUrl(regionNames, this.params.vector, this.getSearchQueryString());
        }
        else {
    
            return this.getSearchPageForRegionsAndVectorUrl(null, this.params.vector, this.getSearchQueryString());
        }
    }
    
    getSearchResultsUrl() {
    
        var searchResultsUrl = this.params.regions.length == 0 ? '/search-results' : './search-results'; 
        var url = searchResultsUrl + this.getSearchQueryString(); 
    
        return url;
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
    }
    
    toggleDomain(domain) {
    
        var i = this.params.domains.indexOf(domain);
    
        if (i > -1)
            this.params.domains.splice(i, 1); // remove at index i
        else
            this.params.domains.push(domain);
    }
    
    toggleStandard(standard) {
    
        var i = this.params.standards.indexOf(standard);
    
        if (i > -1)
            this.params.standards.splice(i, 1); // remove at index i
        else
            this.params.standards.push(standard);
    }
}