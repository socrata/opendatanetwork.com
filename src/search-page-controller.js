
class SearchPageController {

    constructor(params) {

        this.params = params;
        this.fetching = false;
        this.fetchedAll = false;
        this.mostSimilar = [];
        this.educationData = [];
        this.earningsData = [];
        this.costOfLivingData = [];
        this.healthData = [];
        this.occupationsData = [];

        const self = this;

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

            const controller = new ApiController();

            controller.getCategories()
                .then(data => {

                    const rg = data.results.map(result => '<li><i class="fa ' + result.metadata.icon + '"></i>' + result.category + '</li>');
                    const s = rg.join('');

                    $('#refine-menu-categories').html(s);
                    self.attachCategoriesClickHandlers();
                })
                .catch(error => console.error(error));
        });

        // Domains
        //
        this.attachDomainsClickHandlers();

        $('#refine-menu-domains-view-more').click(function() {

            const controller = new ApiController();

            controller.getDomains()
                .then(data => {

                    const rg = data.results.map(result => '<li>' + result.domain + '</li>');
                    const s = rg.join('');

                    $('#refine-menu-domains').html(s);
                    self.attachDomainsClickHandlers();
                })
                .catch(error => console.error(error));
        });

        // Standards
        //
        this.attachTagsClickHandlers();

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

            self.toggleTag($(this).parent().text().toLowerCase().trim());
            self.navigate();
        });

        // Infinite scroll search results
        //
        $(window).on('scroll', function() {

            const bottomOffsetToBeginRequest = 1000;

            if ($(window).scrollTop() >= $(document).height() - $(window).height() - bottomOffsetToBeginRequest) {
                self.fetchNextPage();
            }

        }).scroll();

        // Add location
        //
        function selectRegion(option) {

            RegionLookup.byID(option.id)
                .then(region => {
                    self.setAutoSuggestedRegion({ id : region.id, name : region.name }, false);
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

        // Resize / redraw
        //
        $(window).resize(() => {

            if ($('#education-table-container').length) self.drawEducationTable();
            if ($('#earnings-table-container').length) self.drawEarningsTable();
            if ($('#cost-of-living-table-container').length) self.drawCostOfLivingTable();
            if ($('#health-outcomes-table-container').length) self.drawHealthTables();
            if ($('#occupations-table-container').length) self.drawOccupationsTable();
        });
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

        const self = this;

        $('#refine-menu-categories li:not(.refine-view-more)').click(function() {

            self.toggleCategory($(this).text().toLowerCase().trim());
            self.navigate();
        });
    }

    attachDomainsClickHandlers() {

        const self = this;

        $('#refine-menu-domains li:not(.refine-view-more)').click(function() {

            const domain = $(this).text().toLowerCase().trim();

            self.toggleDomain(domain);
            self.navigate();
        });
    }

    attachTagsClickHandlers() {

        const self = this;

        $('#refine-menu-tags li').click(function() {

            const tag = $(this).text().toLowerCase().trim();

            self.toggleTag(tag);
            self.navigate();
        });
    }

    decrementPage() {

        this.params.page--;
    }

    // Cost of living
    //
    drawCostOfLivingData() {

        this.drawMap(MapSources.rpp);

        google.setOnLoadCallback(() => {

            const controller = new ApiController();
            const promises = this.params.regions.map(region => controller.getCostOfLivingData(region.id));

            Promise.all(promises)
                .then(data => {

                    this.costOfLivingData = data;
                    this.drawCostOfLivingChart();
                    this.drawCostOfLivingTable();
                })
                .catch(error => console.error(error));
        });
    }

    drawCostOfLivingChart() {

        this.drawCostOfLivingChartForComponent('cost-of-living-all-chart', 'All');
        this.drawCostOfLivingChartForComponent('cost-of-living-goods-chart', 'Goods');
        this.drawCostOfLivingChartForComponent('cost-of-living-rents-chart', 'Rents');
        this.drawCostOfLivingChartForComponent('cost-of-living-other-chart', 'Other');
    }

    drawCostOfLivingChartForComponent(id, component) {

        const chartData = []

        // Header
        //
        const header = ['Year'];

        for (var i = 0; i < this.params.regions.length; i++) {
            header.push(this.params.regions[i].name);
        }

        chartData.push(header);

        // Format the data
        //
        const o = {};

        for (var i = 0; i < this.costOfLivingData.length; i++) {

            const regionValues = this.costOfLivingData[i];

            for (var j = 0; j < regionValues.length; j++) {

                if (regionValues[j].component != component)
                    continue;

                if (o[regionValues[j].year] == undefined)
                    o[regionValues[j].year] = [regionValues[j].year];

                o[regionValues[j].year].push(parseFloat(regionValues[j].index));
            }
        }

        for (var key in o) {
            chartData.push(o[key]);
        }

        const dataTable = google.visualization.arrayToDataTable(chartData);
        this.drawLineChart(id, dataTable, {

            curveType : 'function',
            legend : { position : 'bottom' },
            pointShape : 'square',
            pointSize : 8,
            title : component,
        });
    }

    drawCostOfLivingTable() {

        const width = $(window).width();

        if ((this.params.regions.length >= 3) || (width >= 1600)) 
            this.drawCostOfLivingTableHorizontal();    // horizontal colored lines
        else
            this.drawCostOfLivingTableVertical();      // vertical colored lines
    }
    
    drawCostOfLivingTableVertical() {

        var s = '<table class="vertical">';

        // Header
        //
        s += '<tr>';
        s += '<th class="empty"></th>';

        for (var i = 0; i < this.costOfLivingData.length; i++) {
            s += '<th colspan="2" class="color-' + i + '">' + this.params.regions[i].name + '<div></div></th>';
        }

        s += '</tr>'

        // Sub header
        //
        s += '<tr class="sub-header-row"><td class="empty"></td>';

        for (var i = 0; i < this.costOfLivingData.length; i++) {
            s += '<td>Value</td><td class="color-' + i + '">Percentile<div></div></td>';
        }

        // Component types
        //
        const components = ['All', 'Goods', 'Other', 'Rents'];

        for (var i = 0; i < components.length; i++) {

            s += '<tr>';
            s += '<td class="category-header">' + components[i] + '</td>';

            for (var j = 0; j < this.params.regions.length; j++) {

                const o = this.getLatestCostOfLiving(this.costOfLivingData[j], this.params.regions[j].id, components[i]);
                const value = (o != null) ? parseFloat(o.index) : 'NA';
                const percentile = (o != null) ? this.getPercentile(o.rank, o.total_ranks) : 'NA';

                s += '<td>' + value + '<div></div></td>';
                s += '<td class="color-' + j + '">' + percentile + '<div></div></td>';
            }

            s += '</tr>';
        }
        
        s += '</table>';

        $('#cost-of-living-table-container').html(s);
    }
    
    drawCostOfLivingTableHorizontal() {

        var s = '<table class="horizontal">';

        s += '<tr>';
        s += '<td class="empty"></td>';
        s += '<td class="category-header">All<br>(Value)</td>';
        s += '<td class="category-header">All<br>(Percentile)</td>';
        s += '<td class="category-header">Goods<br>(Value)</td>';
        s += '<td class="category-header">Goods<br>(Percentile)</td>';
        s += '<td class="category-header">Other<br>(Value)</td>';
        s += '<td class="category-header">Other<br>(Percentile)</td>';
        s += '<td class="category-header">Rents<br>(Value)</td>';
        s += '<td class="category-header">Rents<br>(Percentile)</td>';
        s += '</tr>';

        const components = ['All', 'Goods', 'Other', 'Rents'];

        for (var i = 0; i < this.params.regions.length; i++) {

            s += '<tr class="color-' + i + '">';
            s += '<td>' + this.params.regions[i].name + '<div></div></td>';

            for (var j = 0; j < components.length; j++) {

                const o = this.getLatestCostOfLiving(this.costOfLivingData[i], this.params.regions[i].id, components[j]);
                const value = (o != null) ? parseFloat(o.index) : 'NA';
                const percentile = (o != null) ? this.getPercentile(o.rank, o.total_ranks) : 'NA';

                s += '<td>' + value + '<div></div></td>';
                s += '<td>' + percentile + '<div></div></td>';
            }

            s += '</tr>';
        }
        
        s += '</table>';

        $('#cost-of-living-table-container').html(s);
    }

    getPercentile(rankString, totalRanksString) {

        const totalRanks = parseInt(totalRanksString);
        const rank = parseInt(rankString);
        const percentile = parseInt(((totalRanks - rank) / totalRanks) * 100);

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

        this.drawMap(MapSources.earnings);

        google.setOnLoadCallback(() => {

            const controller = new ApiController();
            const promises = this.params.regions.map(region => controller.getEarningsData(region.id));

            Promise.all(promises)
                .then(data => {

                    this.earningsData = data;
                    this.drawEarningsChart();
                    this.drawEarningsTable();
                })
                .catch(error => console.error(error));
        });
    }

    drawEarningsChart() {

        const earnings = [];

        // Header
        //
        const header = ['Education Level'];

        for (var i = 0; i < this.params.regions.length; i++) {
            header.push(this.params.regions[i].name);
        }

        earnings.push(header);

        // Less than high school
        //
        const someHighSchoolEarnings = ['Some High School'];

        for (var i = 0; i < this.params.regions.length; i++) {
            someHighSchoolEarnings.push(parseInt(this.earningsData[i][0].median_earnings_less_than_high_school));
        }

        earnings.push(someHighSchoolEarnings);

        // High school
        //
        const highSchoolEarnings = ['High School'];

        for (var i = 0; i < this.params.regions.length; i++) {
            highSchoolEarnings.push(parseInt(this.earningsData[i][0].median_earnings_high_school));
        }

        earnings.push(highSchoolEarnings);

        // Some college
        //
        const someCollegeEarnings = ['Some College'];

        for (var i = 0; i < this.params.regions.length; i++) {
            someCollegeEarnings.push(parseInt(this.earningsData[i][0].median_earnings_some_college_or_associates));
        }

        earnings.push(someCollegeEarnings);

        // Bachelor's
        //
        const bachelorsEarnings = ['Bachelor\'s'];

        for (var i = 0; i < this.params.regions.length; i++) {
            bachelorsEarnings.push(parseInt(this.earningsData[i][0].median_earnings_bachelor_degree));
        }

        earnings.push(bachelorsEarnings);

        // Graduate degree
        //
        const graduateDegreeEarnings = ['Graduate Degree'];

        for (var i = 0; i < this.params.regions.length; i++) {
            graduateDegreeEarnings.push(parseInt(this.earningsData[i][0].median_earnings_graduate_or_professional_degree));
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

    drawEarningsTable() {

        const width = $(window).width();

        if ((this.params.regions.length >= 3) || (width >= 1600)) 
            this.drawEarningsTableHorizontal();    // horizontal colored lines
        else
            this.drawEarningsTableVertical();      // vertical colored lines
    }

    drawEarningsTableVertical() {

        var s = '<table class="vertical">';

        // Header
        //
        s += '<tr>';
        s += '<th class="empty"></th>';

        for (var i = 0; i < this.earningsData.length; i++) {
            s += '<th class="color-' + i + '">' + this.params.regions[i].name + '<div></div></th>';
        }

        s += '</tr>'

        // Median (all)
        //
        s += '<tr><td class="category-header">Median Earnings<br>(All Workers)</td>';

        for (var i = 0; i < this.earningsData.length; i++) {
            s += '<td class="color-' + i + '">' + numeral(this.earningsData[i][0].median_earnings).format('$0,0')  + '<div></div></td>';
        }
        s += '</tr>';

        // Median (female)
        //
        s += '<tr><td class="category-header">Median Female Earnings<br>(Full Time)</td>';

        for (var i = 0; i < this.earningsData.length; i++) {
            s += '<td class="color-' + i + '">' + numeral(this.earningsData[i][0].female_full_time_median_earnings).format('$0,0')  + '<div></div></td>';
        }
        s += '</tr>';

        // Median (male)
        //
        s += '<tr><td class="category-header">Median Male Earnings<br>(Full Time)</td>';

        for (var i = 0; i < this.earningsData.length; i++) {
            s += '<td class="color-' + i + '">' + numeral(this.earningsData[i][0].male_full_time_median_earnings).format('$0,0')  + '<div></div></td>';
        }
        s += '</tr>';

        s += '</table>';

        $('#earnings-table-container').html(s);
    }

    drawEarningsTableHorizontal() {

        var s = '<table class="horizontal">';

        s += '<tr>';
        s += '<td class="empty"></td>';
        s += '<td class="category-header">Median Earnings<br>(All Workers)</td>';
        s += '<td class="category-header">Median Female Earnings<br>(Full Time)</td>';
        s += '<td class="category-header">Median Male Earnings<br>(Full Time)</td>';
        s += '</tr>';

        for (var i = 0; i < this.earningsData.length; i++) {

            s += '<tr class="color-' + i + '">'
            s += '<td>' + this.params.regions[i].name + '<div></div></td>';
            s += '<td>' + numeral(this.earningsData[i][0].median_earnings).format('$0,0') + '<div></div></td>';
            s += '<td>' + numeral(this.earningsData[i][0].female_full_time_median_earnings).format('$0,0') + '<div></div></td>';
            s += '<td>' + numeral(this.earningsData[i][0].male_full_time_median_earnings).format('$0,0') + '<div></div></td>';
            s += '</tr>';
        }

        s += '</table>';

        $('#earnings-table-container').html(s);
    }

    // Health
    //
    drawHealthData() {

        this.drawMap(MapSources.health);

        google.setOnLoadCallback(() => {

            const controller = new ApiController();
            const promises = this.params.regions.map(region => controller.getHealthRwjfChrData(region.id));

            Promise.all(promises)
                .then(data => {

                    this.healthData = data;
                    this.drawHealthTables();
                })
                .catch(error => console.error(error));
        });
    }

    drawHealthTables() {

        const width = $(window).width();

        if ((this.params.regions.length >= 8) || (width >= 1600)) {

            this.drawHealthOutcomesTableHorizontal();   // horizontal colored lines
            this.drawHealthFactorsTableHorizontal();
            this.drawHealthClinicalCareTableHorizontal();
            this.drawHealthSocialEconomicFactorsTableHorizontal();
            this.drawHealthPhysicalEnvironmentTableHorizontal();
        } 
        else {

            this.drawHealthOutcomesTableVertical();     // vertical colored lines
            this.drawHealthFactorsTableVertical();
            this.drawHealthClinicalCareTableVertical();
            this.drawHealthSocialEconomicFactorsTableVertical();
            this.drawHealthPhysicalEnvironmentTableVertical();
        }
    }

    drawHealthOutcomesTableVertical() {

        // Life length table
        //
        var s = '<table class="vertical">';

        s += '<tr>';
        s += '<th class="sub-header">Life Length</th>';

        for (var i = 0; i < this.healthData.length; i++) {
            s += '<th class="color-' + i + '">' + this.params.regions[i].name + '<div></div></th>';
        }

        s += '</tr>';

        s += this.drawHealthOutcomesTableRowVertical('Premature Death', 'premature_death_value', '0,0');

        s += '</table>';
        
        // Quality of life table
        //
        s += '<table class="vertical">';
        s += '<tr>';
        s += '<th class="sub-header">Quality of Life</th>';

        for (var i = 0; i < this.healthData.length; i++) {
            s += '<th class="color-' + i + '">' + this.params.regions[i].name + '<div></div></th>';
        }

        s += '</tr>';

        s += this.drawHealthOutcomesTableRowVertical('Poor or Fair Health', 'poor_or_fair_health_value', '0.0%');
        s += this.drawHealthOutcomesTableRowVertical('Poor Physical Health Days', 'poor_physical_health_days_value', '0.0');
        s += this.drawHealthOutcomesTableRowVertical('Poor Mental Health Days', 'poor_mental_health_days_value', '0.0');
        s += this.drawHealthOutcomesTableRowVertical('Low Birth Weight', 'low_birthweight_value', '0.0');
        
        s += '</table>';

        $('#health-outcomes-table-container').html(s);
    }
    
    drawHealthOutcomesTableHorizontal() {

        var s = '<table class="horizontal">';

        s += '<tr>';
        s += '<th class="empty"></th>';
        s += '<th>Life Length</th>';
        s += '<th class="empty"></th>';
        s += '<th colspan="4">Quality of Life</th>';
        s += '</tr>';

        s += '<tr>';
        s += '<td class="empty"></td>';
        s += '<td class="category-header">Premature Death</td>';
        s += '<td class="empty"></td>';
        s += '<td class="category-header">Poor or Fair Health</td>';
        s += '<td class="category-header">Poor Physical Health Days</td>';
        s += '<td class="category-header">Poor Mental Health Days</td>';
        s += '<td class="category-header">Low Birth Weight</td>';
        s += '</tr>';

        for (var i = 0; i < this.healthData.length; i++) {

            const regionData = this.healthData[i][0];

            s += '<tr class="color-' + i + '">';
            s += '<td>' + this.params.regions[i].name + '<div></div></td>';
            s += this.drawHealthDataTableCellHorizontal(regionData, 'premature_death_value', '0,0');
            s += '<td class="empty"></td>';
            s += this.drawHealthDataTableCellHorizontal(regionData, 'poor_or_fair_health_value', '0.0%');
            s += this.drawHealthDataTableCellHorizontal(regionData, 'poor_physical_health_days_value', '0.0');
            s += this.drawHealthDataTableCellHorizontal(regionData, 'poor_mental_health_days_value', '0.0');
            s += this.drawHealthDataTableCellHorizontal(regionData, 'low_birthweight_value', '0.0');
            s += '</tr>';
        }

        s += '</table>';

        $('#health-outcomes-table-container').html(s);
    };

    drawHealthFactorsTableVertical() {

        var s = '<table class="vertical">';

        // Header
        //
        s += '<tr>';
        s += '<th class="sub-header">Health Behaviors</th>';

        for (var i = 0; i < this.healthData.length; i++) {
            s += '<th class="color-' + i + '">' + this.params.regions[i].name + '<div></div></th>';
        }

        s += '</tr>'

        s += this.drawHealthOutcomesTableRowVertical('Adult Smoking', 'adult_smoking_value', '0.0%');
        s += this.drawHealthOutcomesTableRowVertical('Adult Obesity', 'adult_obesity_value', '0.0%');
        s += this.drawHealthOutcomesTableRowVertical('Food Environment Index', 'food_environment_index_value', '0.0');
        s += this.drawHealthOutcomesTableRowVertical('Physical Inactivity', 'physical_inactivity_value', '0.0%');
        s += this.drawHealthOutcomesTableRowVertical('Access to Exercise', 'access_to_exercise_opportunities_value', '0.0%');
        s += this.drawHealthOutcomesTableRowVertical('Excessive Drinking', 'excessive_drinking_value', '0.0%');
        s += this.drawHealthOutcomesTableRowVertical('Alcohol Impaired Driving Deaths', 'alcohol_impaired_driving_deaths_value', '0.0%');
        s += this.drawHealthOutcomesTableRowVertical('Sexually Transmitted Infections', 'sexually_transmitted_infections_value', '0,0');
        s += this.drawHealthOutcomesTableRowVertical('Teen Births', 'teen_births_value', '0,0');
        
        s += '</table>';

        $('#health-factors-table-container').html(s);
    }
    
    drawHealthFactorsTableHorizontal() {

        var s = '<table class="horizontal">';

        s += '<tr>';
        s += '<th class="empty"></th>';
        s += '<th colspan="9">Health Behaviors</th>';
        s += '</tr>';

        s += '<tr>';
        s += '<td class="empty"></td>';
        s += '<td class="category-header">Adult Smoking</td>';
        s += '<td class="category-header">Adult Obesity</td>';
        s += '<td class="category-header">Food Environment Index</td>';
        s += '<td class="category-header">Physical Inactivity</td>';
        s += '<td class="category-header">Access to Exercise</td>';
        s += '<td class="category-header">Excessive Drinking</td>';
        s += '<td class="category-header">Alcohol Impaired Driving Deaths</td>';
        s += '<td class="category-header">Sexually Transmitted Infections</td>';
        s += '<td class="category-header">Teen Births</td>';
        s += '</tr>';

        for (var i = 0; i < this.params.regions.length; i++) {

            const regionData = this.healthData[i][0];

            s += '<tr class="color-' + i + '">';
            s += '<td>' + this.params.regions[i].name + '<div></div></td>';
            s += this.drawHealthDataTableCellHorizontal(regionData, 'adult_smoking_value', '0.0%');
            s += this.drawHealthDataTableCellHorizontal(regionData, 'adult_obesity_value', '0.0%');
            s += this.drawHealthDataTableCellHorizontal(regionData, 'food_environment_index_value', '0.0');
            s += this.drawHealthDataTableCellHorizontal(regionData, 'physical_inactivity_value', '0.0%');
            s += this.drawHealthDataTableCellHorizontal(regionData, 'access_to_exercise_opportunities_value', '0.0%');
            s += this.drawHealthDataTableCellHorizontal(regionData, 'excessive_drinking_value', '0.0%');
            s += this.drawHealthDataTableCellHorizontal(regionData, 'alcohol_impaired_driving_deaths_value', '0.0%');
            s += this.drawHealthDataTableCellHorizontal(regionData, 'sexually_transmitted_infections_value', '0,0');
            s += this.drawHealthDataTableCellHorizontal(regionData, 'teen_births_value', '0,0');
            s += '</tr>';
        }
        
        s += '</table>';

        $('#health-factors-table-container').html(s);
    };

    drawHealthClinicalCareTableVertical() {

        var s = '<table class="vertical">';

        // Header
        //
        s += '<tr>';
        s += '<th class="sub-header">Clinical Care</th>';

        for (var i = 0; i < this.healthData.length; i++) {
            s += '<th class="color-' + i + '">' + this.params.regions[i].name + '<div></div></th>';
        }

        s += '</tr>'

        s += this.drawHealthOutcomesTableRowVertical('Uninsured', 'uninsured_value', '0.0%');
        s += this.drawHealthOutcomesTableRowVertical('Primary Care Physicians', 'primary_care_physicians_value', '0,0');
        s += this.drawHealthOutcomesTableRowVertical('Dentists', 'dentists_value', '0,0');
        s += this.drawHealthOutcomesTableRowVertical('Mental Health Providers', 'mental_health_providers_value', '0,0');
        s += this.drawHealthOutcomesTableRowVertical('Preventable Hospital Stays', 'preventable_hospital_stays_value', '0,0');
        s += this.drawHealthOutcomesTableRowVertical('Diabetic Monitoring', 'diabetic_screening_value', '0.0%');
        s += this.drawHealthOutcomesTableRowVertical('Mammography Screening', 'mammography_screening_value', '0.0%');

        s += '</table>';

        $('#health-clinical-care-table-container').html(s);
    }

    drawHealthClinicalCareTableHorizontal() {

        var s = '<table class="horizontal">';

        s += '<tr>';
        s += '<th class="empty"></th>';
        s += '<th colspan="7">Clinical Care</th>';
        s += '</tr>';

        s += '<tr>';
        s += '<td class="empty"></td>';
        s += '<td class="category-header">Uninsured</td>';
        s += '<td class="category-header">Primary Care Physicians</td>';
        s += '<td class="category-header">Dentists</td>';
        s += '<td class="category-header">Mental Health Providers</td>';
        s += '<td class="category-header">Preventable Hospital Stays</td>';
        s += '<td class="category-header">Diabetic Monitoring</td>';
        s += '<td class="category-header">Mammography Screening</td>';
        s += '</tr>';

        for (var i = 0; i < this.params.regions.length; i++) {

            const regionData = this.healthData[i][0];

            s += '<tr class="color-' + i + '">';
            s += '<td>' + this.params.regions[i].name + '<div></div></td>';
            s += this.drawHealthDataTableCellHorizontal(regionData, 'uninsured_value', '0.0%');
            s += this.drawHealthDataTableCellHorizontal(regionData, 'primary_care_physicians_value', '0,0');
            s += this.drawHealthDataTableCellHorizontal(regionData, 'dentists_value', '0,0');
            s += this.drawHealthDataTableCellHorizontal(regionData, 'mental_health_providers_value', '0,0');
            s += this.drawHealthDataTableCellHorizontal(regionData, 'preventable_hospital_stays_value', '0,0');
            s += this.drawHealthDataTableCellHorizontal(regionData, 'diabetic_screening_value', '0.0%');
            s += this.drawHealthDataTableCellHorizontal(regionData, 'mammography_screening_value', '0.0%');
            s += '</tr>';
        }

        s += "</table>";

        $('#health-clinical-care-table-container').html(s);
    };

    drawHealthSocialEconomicFactorsTableVertical() {

        var s = '<table class="vertical">';

        // Header
        //
        s += '<tr>';
        s += '<th class="sub-header">Social &amp; Economic Factors</th>';

        for (var i = 0; i < this.healthData.length; i++) {
            s += '<th class="color-' + i + '">' + this.params.regions[i].name + '<div></div></th>';
        }

        s += '</tr>'

        s += this.drawHealthOutcomesTableRowVertical('High School Graduation', 'high_school_graduation_value', '0.0%');
        s += this.drawHealthOutcomesTableRowVertical('Some College', 'some_college_value', '0.0%');
        s += this.drawHealthOutcomesTableRowVertical('Unemployment', 'unemployment_value', '0.0%');
        s += this.drawHealthOutcomesTableRowVertical('Children in Poverty', 'children_in_poverty_value', '0.0%');
        s += this.drawHealthOutcomesTableRowVertical('Income Inequality', 'income_inequality_value', '0.0');
        s += this.drawHealthOutcomesTableRowVertical('Children in Single-Parent Households', 'children_in_single_parent_households_value', '0.0%');
        s += this.drawHealthOutcomesTableRowVertical('Social Associations', 'social_associations_value', '0.0');
        s += this.drawHealthOutcomesTableRowVertical('Violent Crime', 'violent_crime_value', '0.0');
        s += this.drawHealthOutcomesTableRowVertical('Injury Deaths', 'injury_deaths_value', '0.0');

        s += '</table>';

        $('#health-social-economic-factors-table-container').html(s);
    }

    drawHealthSocialEconomicFactorsTableHorizontal() {

        var s = '<table class="horizontal">';

        s += '<tr>';
        s += '<th class="empty"></th>';
        s += '<th colspan="9">Social &amp; Economic Factors</th>';
        s += '</tr>';

        s += '<tr>';
        s += '<td class="empty"></td>';
        s += '<td class="category-header">High School Graduation</td>';
        s += '<td class="category-header">Some College</td>';
        s += '<td class="category-header">Unemployment</td>';
        s += '<td class="category-header">Children in Poverty</td>';
        s += '<td class="category-header">Income Inequality</td>';
        s += '<td class="category-header">Children in Single-Parent Households</td>';
        s += '<td class="category-header">Social Associations</td>';
        s += '<td class="category-header">Violent Crime</td>';
        s += '<td class="category-header">Injury Deaths</td>';
        s += '</tr>';

        for (var i = 0; i < this.params.regions.length; i++) {

            const regionData = this.healthData[i][0];

            s += '<tr class="color-' + i + '">';
            s += '<td>' + this.params.regions[i].name + '<div></div></td>';
            s += this.drawHealthDataTableCellHorizontal(regionData, 'high_school_graduation_value', '0.0%');
            s += this.drawHealthDataTableCellHorizontal(regionData, 'some_college_value', '0.0%');
            s += this.drawHealthDataTableCellHorizontal(regionData, 'unemployment_value', '0.0%');
            s += this.drawHealthDataTableCellHorizontal(regionData, 'children_in_poverty_value', '0.0%');
            s += this.drawHealthDataTableCellHorizontal(regionData, 'income_inequality_value', '0.0');
            s += this.drawHealthDataTableCellHorizontal(regionData, 'children_in_single_parent_households_value', '0.0%');
            s += this.drawHealthDataTableCellHorizontal(regionData, 'social_associations_value', '0.0');
            s += this.drawHealthDataTableCellHorizontal(regionData, 'violent_crime_value', '0.0');
            s += this.drawHealthDataTableCellHorizontal(regionData, 'injury_deaths_value', '0.0');
            s += '</tr>';
        }

        s += '</table>';

        $('#health-social-economic-factors-table-container').html(s);
    }

    drawHealthPhysicalEnvironmentTableVertical() {

        var s = '<table class="vertical">';

        // Header
        //
        s += '<tr>';
        s += '<th class="sub-header">Physical Environment</th>';

        for (var i = 0; i < this.healthData.length; i++) {
            s += '<th class="color-' + i + '">' + this.params.regions[i].name + '<div></div></th>';
        }

        s += '</tr>'

        s += this.drawHealthOutcomesTableRowVertical('Air Pollution - Particulate Matter', 'air_pollution_particulate_matter_value', '0.0');
        s += this.drawHealthOutcomesTableRowVertical('Drinking Water Violations', 'drinking_water_violations_value', '0.0%');
        s += this.drawHealthOutcomesTableRowVertical('Severe Housing Problems', 'severe_housing_problems_value', '0.0%');
        s += this.drawHealthOutcomesTableRowVertical('Driving Alone to Work', 'driving_alone_to_work_value', '0.0%');
        s += this.drawHealthOutcomesTableRowVertical('Long Commute - Driving Alone', 'long_commute_driving_alone_value', '0.0%');

        s += '</table>';

        $('#health-physical-environment-table-container').html(s);
    }

    drawHealthPhysicalEnvironmentTableHorizontal() {

        var s = '<table class="horizontal">';

        s += '<tr>';
        s += '<th class="empty"></th>';
        s += '<th colspan="5">Physical Environment</th>';
        s += '</tr>';

        s += '<tr>';
        s += '<td class="empty"></td>';
        s += '<td class="category-header">Air Pollution - Particulate Matter</td>';
        s += '<td class="category-header">Drinking Water Violations</td>';
        s += '<td class="category-header">Severe Housing Problems</td>';
        s += '<td class="category-header">Driving Alone to Work</td>';
        s += '<td class="category-header">Long Commute - Driving Alone</td>';
        s += '</tr>';

        for (var i = 0; i < this.params.regions.length; i++) {

            const regionData = this.healthData[i][0];

            s += '<tr class="color-' + i + '">';
            s += '<td>' + this.params.regions[i].name + '<div></div></td>';
            s += this.drawHealthDataTableCellHorizontal(regionData, 'air_pollution_particulate_matter_value', '0.0');
            s += this.drawHealthDataTableCellHorizontal(regionData, 'drinking_water_violations_value', '0.0%');
            s += this.drawHealthDataTableCellHorizontal(regionData, 'severe_housing_problems_value', '0.0%');
            s += this.drawHealthDataTableCellHorizontal(regionData, 'driving_alone_to_work_value', '0.0%');
            s += this.drawHealthDataTableCellHorizontal(regionData, 'long_commute_driving_alone_value', '0.0%');
            s += '</tr>';
        }

        s += '</table>';

        $('#health-physical-environment-table-container').html(s);
    }

    drawHealthOutcomesTableRowVertical(header, key, format) {

        var s = '<tr><td class="category-header">' + header + '</td>';

        for (var i = 0; i < this.healthData.length; i++) {

            const regionData = this.healthData[i][0];
            s += this.drawHealthDataTableCellVertical(i, regionData, key, format);
        }

        s += '</tr>';

        return s;
    }

    drawHealthDataTableCellVertical(i, data, key, format) {

        var s = '<td class="color-' + i + '">';
        
        if (data[key] != undefined)
            s += numeral(data[key].replace(',','')).format(format);
        else
            s += '';

        s += '<div></div></td>';

        return s;
    }

    drawHealthDataTableCellHorizontal(data, key, format) {

        var s = '<td>';

        if (data[key] != undefined)
            s += numeral(data[key].replace(',','')).format(format);
        else
            s += '';

        s += '<div></div></td>';

        return s;
    }


    // Education
    //
    drawEducationData() {

        this.drawMap(MapSources.education);

        google.setOnLoadCallback(() => {

            const controller = new ApiController();
            const promises = this.params.regions.map(region => controller.getEducationData(region.id));

            Promise.all(promises)
                .then(data => {

                    this.educationData = data;
                    this.drawEducationTable();
                })
                .catch(error => console.error(error));
        });
    }

    drawEducationTable() {
        
        const width = $(window).width();

        if ((this.params.regions.length >= 3) || (width >= 1600)) 
            this.drawEducationTableHorizontal();    // horizontal colored lines
        else
            this.drawEducationTableVertical();      // vertical colored lines
    }

    drawEducationTableVertical() {

        var s = '<table class="vertical">';

        // Header
        //
        s += '<tr>';
        s += '<th class="empty"></th>';

        for (var i = 0; i < this.educationData.length; i++) {
            s += '<th colspan="2" class="color-' + i + '">' + this.params.regions[i].name + '<div></div></th>';
        }

        s += '</tr>'

        // Sub header
        //
        s += '<tr class="sub-header-row"><td class="empty"></td>';

        for (var i = 0; i < this.educationData.length; i++) {
            s += '<td>Percent</td><td class="color-' + i + '">Percentile<div></div></td>';
        }

        // Bachelor's or higher
        //
        s += '<tr><td class="category-header">At Least Bachelor\'s Degree</td>';

        for (var i = 0; i < this.educationData.length; i++) {

            const regionData = this.educationData[i][0];
            const totalRanks = parseInt(regionData.total_ranks);

            const bachelorsRank = parseInt(regionData.percent_bachelors_degree_or_higher_rank);
            const bachelorsPercentile = parseInt(((totalRanks - bachelorsRank) / totalRanks) * 100);

            s += '<td>' + regionData.percent_bachelors_degree_or_higher + '%</td>';
            s += '<td class="color-' + i + '">' + numeral(bachelorsPercentile).format('0o') + '<div></div></td>';
        }

        s += '</tr>';

        // High school or higher
        //
        s += '<tr><td class="category-header">At Least High School Diploma</td>';

        for (var i = 0; i < this.educationData.length; i++) {
            
            const regionData = this.educationData[i][0];
            const totalRanks = parseInt(regionData.total_ranks);

            const highSchoolRank = parseInt(regionData.percent_high_school_graduate_or_higher_rank);
            const highSchoolPercentile = parseInt(((totalRanks - highSchoolRank) / totalRanks) * 100);

            s += '<td>' + regionData.percent_high_school_graduate_or_higher + '%</td>';
            s += '<td class="color-' + i + '">' + numeral(highSchoolPercentile).format('0o') + '<div></div></td>';
        }

        s += '</tr>';
        s += '</table>';

        $('#education-table-container').html(s);
    }

    drawEducationTableHorizontal() {

        var s = '<table class="horizontal">';

        s += '<tr>';
        s += '<td class="empty"></td>';
        s += '<td class="category-header">At Least Bachelor\'s Degree<br>(Percent)</td>';
        s += '<td class="category-header">At Least Bachelor\'s Degree<br>(Percentile)</td>';
        s += '<td class="category-header">At Least High School Diploma<br>(Percent)</td>';
        s += '<td class="category-header">At Least High School Diploma<br>(Percentile)</td>';
        s += '</tr>';

        for (var i = 0; i < this.educationData.length; i++) {

            const regionData = this.educationData[i][0];

            s += '<tr class="color-' + i + '">'
            s += '<td>' + this.params.regions[i].name + '<div></div></td>';

            const totalRanks = parseInt(regionData.total_ranks);
            const bachelorsRank = parseInt(regionData.percent_bachelors_degree_or_higher_rank);
            const bachelorsPercentile = parseInt(((totalRanks - bachelorsRank) / totalRanks) * 100);

            s += '<td>' + regionData.percent_bachelors_degree_or_higher + '%<div></div></td>';
            s += '<td>' + numeral(bachelorsPercentile).format('0o') + '<div></div></td>';

            const highSchoolRank = parseInt(regionData.percent_high_school_graduate_or_higher_rank);
            const highSchoolPercentile = parseInt(((totalRanks - highSchoolRank) / totalRanks) * 100);

            s += '<td>' + regionData.percent_high_school_graduate_or_higher + '%<div></div></td>';
            s += '<td>' + numeral(highSchoolPercentile).format('0o') + '<div></div></td>';
            s += '</tr>'
        }

        s += '</table>';

        $('#education-table-container').html(s);
    }

    // GDP data
    //
    drawGdpData() {

        this.drawMap(MapSources.gdp);

        google.setOnLoadCallback(() => {

            const controller = new ApiController();
            const promises = this.params.regions.map(region => controller.getGdpData(region.id));

            Promise.all(promises)
                .then(data => {

                    this.drawGdpChart(data);
                    this.drawGdpChangeChart(data);
                })
               .catch(error => console.error(error));
        });
    }

    drawGdpChart(data) {

        const chartData = [];

        // Header
        //
        const header = ['Year'];

        for (var i = 0; i < this.params.regions.length; i++) {
            header[i + 1] = this.params.regions[i].name;
        }

        chartData.push(header);

        // Format the data
        //
        const o = {};

        for (var i = 0; i < data.length; i++) {

            const regionValues = data[i];

            for (var j = 0; j < regionValues.length; j++) {

                if (o[regionValues[j].year] == undefined)
                    o[regionValues[j].year] = [regionValues[j].year];

                o[regionValues[j].year].push(parseFloat(regionValues[j].per_capita_gdp));
            }
        }

        for (var key in o) {
            chartData.push(o[key]);
        }

        // Draw chart
        //
        const dataTable = google.visualization.arrayToDataTable(chartData);
        this.drawLineChart('per-capita-gdp-chart', dataTable, {

            curveType : 'function',
            legend : { position : 'bottom' },
            pointShape : 'square',
            pointSize : 8,
            title : 'Per Capita Real GDP over Time',
        });
    }

    drawGdpChangeChart(data) {

        const chartData = [];

        // Header
        //
        const header = ['Year'];

        for (var i = 0; i < this.params.regions.length; i++) {
            header[i + 1] = this.params.regions[i].name;
        }

        chartData.push(header);

        // Format the data
        //
        const o = {};

        for (var i = 0; i < data.length; i++) {

            const regionValues = data[i];

            for (var j = 0; j < regionValues.length; j++) {

                if (o[regionValues[j].year] == undefined)
                    o[regionValues[j].year] = [regionValues[j].year];

                o[regionValues[j].year].push(parseFloat(regionValues[j].per_capita_gdp_percent_change) / 100);
            }
        }

        for (var key in o) {
            chartData.push(o[key]);
        }

        // Draw chart
        //
        const dataTable = google.visualization.arrayToDataTable(chartData);
        this.drawLineChart('per-capita-gdp-change-chart', dataTable, {

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

        this.drawMap(MapSources.occupations);

        google.setOnLoadCallback(() => {

            const controller = new ApiController();
            const promises = this.params.regions.map(region => controller.getOccupationsData(region.id));

            Promise.all(promises)
                .then(data => {

                    this.occupationsData = data;
                    this.drawOccupationsTable();
                })
                .catch(error => console.error(error));
        });
    }

    drawOccupationsTable() {

        var s = '<table class="vertical">';
        s += '<tr>'
        s += '<th class="empty"></th>';

        for (var i = 0; i < this.params.regions.length; i++) {
            s += '<th colspan="2" class="color-' + i + '">' + this.params.regions[i].name + '<div></div></th>';
        }

        s += '</tr>'

        // Sub header
        //
        s += '<tr class="sub-header-row"><td class="empty"></td>';

        for (var i = 0; i < this.params.regions.length; i++) {
            s += '<td>Percent</td><td class="color-' + i + '">Percentile<div></div></td>';
        }
        
        s += '</tr>';

        for (var i = 0; i < this.occupationsData[0].length; i++) {

            s += '<tr><td class="category-header">' + this.occupationsData[0][i].occupation + '</td>';

            for (var j = 0; j < this.params.regions.length; j++) {

                const regionData = this.occupationsData[j];
                const totalRanks = parseInt(regionData[i].total_ranks);
                const rank = parseInt(regionData[i].percent_employed_rank);
                const percentile = parseInt(((totalRanks - rank) / totalRanks) * 100);

                s += '<td>' + numeral(regionData[i].percent_employed).format('0.0') + '%</td>';
                s += '<td class="color-' + j + '">' + numeral(percentile).format('0o') + '<div></div></td>';
            }

            s += '</tr>';
        }
        
        s += '</table>'

        $('#occupations-table-container').html(s);
    }

    // Population
    //
    drawPopulationData() {

        this.drawMap(MapSources.population);

        google.setOnLoadCallback(() => {

            const controller = new ApiController();
            const promises = this.params.regions.map(region => controller.getPopulationData(region.id));

            Promise.all(promises)
                .then(data => {

                    this.drawPopulationChart(data);
                    this.drawPopulationChangeChart(data);
                })
                .catch(error => console.error(error));
        });
    }

    drawPopulationChart(data) {

        const chartData = [];

        // Header
        //
        const header = ['Year'];

        for (var i = 0; i < this.params.regions.length; i++) {
            header[i + 1] = this.params.regions[i].name;
        }

        chartData.push(header);

        // Data
        //
        const o = {};

        for (var i = 0; i < data.length; i++) {

            const regionValues = data[i];

            for (var j = 0; j < regionValues.length; j++) {

                if (o[regionValues[j].year] == undefined)
                    o[regionValues[j].year] = [regionValues[j].year];

                o[regionValues[j].year].push(parseInt(regionValues[j].population));
            }
        }

        for (var key in o) {
            chartData.push(o[key]);
        }

        const dataTable = google.visualization.arrayToDataTable(chartData);
        this.drawLineChart('population-chart', dataTable, {

            curveType : 'function',
            legend : { position : 'bottom' },
            pointShape : 'square',
            pointSize : 8,
            title : 'Population',
        });
    }

    drawPopulationChangeChart(data) {

        const chartData = [];

        // Header
        //
        const header = ['Year'];

        for (var i = 0; i < this.params.regions.length; i++) {
            header[i + 1] = this.params.regions[i].name;
        }

        chartData.push(header);

        // Data
        //
        const o = {};

        for (var i = 0; i < data.length; i++) {

            const regionValues = data[i];

            for (var j = 0; j < regionValues.length; j++) {

                if (o[regionValues[j].year] == undefined)
                    o[regionValues[j].year] = [regionValues[j].year];

                o[regionValues[j].year].push(parseFloat(regionValues[j].population_percent_change) / 100);
            }
        }

        for (var key in o) {
            chartData.push(o[key]);
        }

        const dataTable = google.visualization.arrayToDataTable(chartData);
        const formatter = new google.visualization.NumberFormat( { pattern : '#.##%' } );

        for (var i = 0; i < this.params.regions.length; i++) {
            formatter.format(dataTable, i + 1);
        }

        this.drawLineChart('population-change-chart', dataTable, {

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

        const region = this.params.regions[0];

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

        const controller = new ApiController();

        controller.getChildRegions(region.id)
            .then(response => {

                this.drawPlacesInRegionHeader('#places-in-region-header-0', label);
                this.drawPlacesInRegionList('#places-in-region-list-0', response);
            })
            .catch(error => console.error(error));
    }

    drawCitiesAndCountiesInState(region) {

        const controller = new ApiController();
        const citiesPromise = controller.getCitiesInState(region.id);
        const countiesPromise = controller.getCountiesInState(region.id);

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

        const controller = new ApiController();

        controller.getParentState(region)
            .then(response => {

                if (response.length == 0)
                    return;

                const state = response[0];

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

        const controller = new ApiController();

        controller.getParentState(region)
            .then(response => {

                if (response.length == 0)
                    return;

                const state = response[0];

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

        const controller = new ApiController();

        controller.getParentState(region)
            .then(response => {

                if (response.length == 0)
                    return;

                const state = response[0];

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
            s += this.getSearchPageForRegionsAndVectorUrl([data[i].child_id], [data[i].child_name]) + '">';
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
            const selectedRegionsIDs = this.params.regions.map(region => region.id);
            const unselectedRegions = regions.filter(region => {
                return ! _.contains(selectedRegionsIDs, region.id);
            });

            const links = selection
                .selectAll('li')
                .data(unselectedRegions.slice(0, Constants.PEER_REGIONS))
                .enter()
                .append('li')
                .append('a')
                .on('click', region => onClickRegion({ id : region.id, name : region.name }))
                .text(region => region.name)
                .append('i')
                .attr('class', 'fa fa-plus');

            selection.style('display', 'block');
        }, error => { throw error; });
    }

    // Draw charts
    //
    drawLineChart(chartId, dataTable, options) {

        const chart = new google.visualization.LineChart(document.getElementById(chartId));

        this.applyStandardOptions(options);

        chart.draw(dataTable, options);
    }

    drawSteppedAreaChart(chartId, data, options) {

        const dataTable = google.visualization.arrayToDataTable(data);
        const chart = new google.visualization.SteppedAreaChart(document.getElementById(chartId));

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
            5: { color: '#0099c6' },
            6: { color: '#dd4477' },
            7: { color: '#66aa00' },
            8: { color: '#b82e2e' },
            9: { color: '#316395' },
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

    drawMarkersForPlaces(map, places) {

        places.forEach(place => {

            const feature = {
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

        const places = [];

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

        const self = this;

        $.ajax(this.getSearchResultsUrl()).done(function(data, textStatus, jqXHR) {

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

    getSearchPageForRegionsAndVectorUrl(regionIds, regionNames, vector, searchResults, queryString) {

        var url = '';

        if (regionIds && (regionIds.length > 0)) {

            url += '/region/' + regionIds.join('-');

            if (regionNames && (regionNames.length > 0)) {

                const parts = regionNames.map(regionName => regionName.replace(/ /g, '_').replace(/,/g, ''))
                url += '/' + parts.join('-');
            }
            else
                url += '/-';
        }
        else {

            url += '/search';
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

            var regionIds = [];
            var regionNames = [];

            if (this.params.resetRegions == false) {

                regionIds = this.params.regions.map(region => region.id);
                regionNames = this.params.regions.map(region => region.name);
            }

            if (this.params.autoSuggestedRegion) {

                regionIds.push(this.params.autoSuggestedRegion.id);
                regionNames.push(this.params.autoSuggestedRegion.name);
            }

            return this.getSearchPageForRegionsAndVectorUrl(regionIds, regionNames, this.params.vector, searchResults, this.getSearchQueryString());
        }
        else {

            return this.getSearchPageForRegionsAndVectorUrl(null, null, this.params.vector, searchResults, this.getSearchQueryString());
        }
    }

    getSearchResultsUrl() {

        return this.getSearchPageUrl(true);
    }

    getSearchQueryString() {

        const parts = [];

        if (this.params.q.length > 0)
            parts.push('q=' + encodeURIComponent(this.params.q));

        if (this.params.page > 1)
            parts.push('page=' + this.params.page);

        if (this.params.categories.length > 0)
            parts.push('categories=' + encodeURIComponent(this.params.categories.join(',')));

        if (this.params.domains.length > 0)
            parts.push('domains=' + encodeURIComponent(this.params.domains.join(',')));

        if (this.params.tags.length > 0)
            parts.push('tags=' + encodeURIComponent(this.params.tags.join(',')));

        if (this.params.debug)
            parts.push('debug=');

        return (parts.length > 0) ? '?' + parts.join('&') : '';
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

        if (this.params.regions.length == 0) // when the last region is removed so should the vector be removed.
            this.params.vector = '';
    }

    setAutoSuggestedRegion(region, resetRegions) {

        this.params.autoSuggestedRegion = region;
        this.params.resetRegions = resetRegions;
        this.params.page = 1;
    }

    toggleCategory(category) {

        const i = this.params.categories.indexOf(category);

        if (i > -1)
            this.params.categories.splice(i, 1); // remove at index i
        else
            this.params.categories.push(category);

        this.params.page = 1;
    }

    toggleDomain(domain) {

        const i = this.params.domains.indexOf(domain);

        if (i > -1)
            this.params.domains.splice(i, 1); // remove at index i
        else
            this.params.domains.push(domain);

        this.params.page = 1;
    }

    toggleTag(tag) {

        // Selecting a standard (tag) resets any other search filter
        //
        const i = this.params.tags.indexOf(tag);

        if (i > -1)
            this.params.tags.splice(i, 1); // remove at index i
        else
            this.params.tags = [tag];

        this.params.page = 1;
        this.params.categories = [];
        this.params.domains = [];
        this.params.q = '';
        this.params.regions = [];
        this.params.vector = '';
    }
}
