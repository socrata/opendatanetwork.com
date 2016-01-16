
class SearchPageController {

    constructor(params, tableData) {

        this.params = params;
        this.tableData = tableData;
        this.fetching = false;
        this.fetchedAll = false;
        this.mostSimilar = [];

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

        // Chart column
        //
        if (this.params.regions.length > 0) {

            switch (this.params.vector) {

                case 'cost_of_living': this.drawCostOfLivingData(); break;
                case 'earnings': this.drawEarningsData(); break;
                case 'education': this.drawEducationData(); break;
                case 'gdp': this.drawGdpData(); break;
                case 'health': this.drawHealthData(); break;
                case 'occupations': this.drawOccupationsData(); break;
                case 'population': this.drawPopulationData(); break;
                default: this.drawPopulationData(); break;
            }
        }

        // Map summary
        //
        $('.map-summary-more').click(() => {

            $('.map-summary-links').slideToggle(100);
            $('.map-summary-more').text($('.map-summary-more').text() == 'More Information' ? 'Hide Information' : 'More Information');
        })

        // Resize / redraw event handlers
        //
        $(window).resize(() => {

            if ($('#education-table-container').length) this.drawEducationTable();
            if ($('#earnings-table-container').length) this.drawEarningsTable();
            if ($('#cost-of-living-table-container').length) this.drawCostOfLivingTable();
            if ($('#health-outcomes-table-container').length) this.drawHealthTables();
        });
    }

    // Public methods
    //
    drawMap(source, onDisplay) {

        const selector = '#map';
        const regions = this.params.regions;

        MapView.create(source, regions, onDisplay)
            .then(view => view.show(selector), error => console.warn(error));
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
        this.drawCostOfLivingChart();
        this.drawCostOfLivingTable();
    }

    drawCostOfLivingMapSummary(variable, year) {

        $('#map-summary').text(
            MapSummary.getCostOfLivingSummaryString(
                this.params.regions,
                this.tableData.costOfLivingData,
                variable,
                year,
                value => (year == value.year)));
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

        for (var i = 0; i < this.tableData.costOfLivingData.length; i++) {

            const regionValues = this.tableData.costOfLivingData[i];

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

        if (this.ensureVisibleWithOrientation('#cost-of-living-table-container table', 'vertical'))
            return;

        var s = '<table class="vertical">';

        // Header
        //
        s += '<tr>';
        s += '<th class="empty"></th>';

        for (var i = 0; i < this.tableData.costOfLivingData.length; i++) {
            s += '<th colspan="2" class="color-' + i + '">' + this.params.regions[i].name + '<div></div></th>';
        }

        s += '</tr>'

        // Sub header
        //
        s += '<tr class="sub-header-row"><td class="empty"></td>';

        for (var i = 0; i < this.tableData.costOfLivingData.length; i++) {
            s += '<td>Value</td><td class="color-' + i + '">Percentile<div></div></td>';
        }

        s += '</tr>';

        // Component types
        //
        const components = ['All', 'Goods', 'Other', 'Rents'];

        for (var i = 0; i < components.length; i++) {

            s += '<tr>';
            s += '<td class="category-header">' + components[i] + '</td>';

            for (var j = 0; j < this.params.regions.length; j++) {

                const o = this.getLatestCostOfLiving(this.tableData.costOfLivingData[j], this.params.regions[j].id, components[i]);
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

        if (this.ensureVisibleWithOrientation('#cost-of-living-table-container table', 'horizontal'))
            return;

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

                const o = this.getLatestCostOfLiving(this.tableData.costOfLivingData[i], this.params.regions[i].id, components[j]);
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
        this.drawEarningsChart();
        this.drawEarningsTable();
    }

    drawEarningsMapSummary(variable, year) {

        $('#map-summary').text(
            MapSummary.getSummaryString(
                this.params.regions,
                this.tableData.earningsData,
                variable,
                year,
                value => (year == value.year)));
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
            someHighSchoolEarnings.push(parseInt(this.tableData.earningsData[i][0].median_earnings_less_than_high_school));
        }

        earnings.push(someHighSchoolEarnings);

        // High school
        //
        const highSchoolEarnings = ['High School'];

        for (var i = 0; i < this.params.regions.length; i++) {
            highSchoolEarnings.push(parseInt(this.tableData.earningsData[i][0].median_earnings_high_school));
        }

        earnings.push(highSchoolEarnings);

        // Some college
        //
        const someCollegeEarnings = ['Some College'];

        for (var i = 0; i < this.params.regions.length; i++) {
            someCollegeEarnings.push(parseInt(this.tableData.earningsData[i][0].median_earnings_some_college_or_associates));
        }

        earnings.push(someCollegeEarnings);

        // Bachelor's
        //
        const bachelorsEarnings = ['Bachelor\'s'];

        for (var i = 0; i < this.params.regions.length; i++) {
            bachelorsEarnings.push(parseInt(this.tableData.earningsData[i][0].median_earnings_bachelor_degree));
        }

        earnings.push(bachelorsEarnings);

        // Graduate degree
        //
        const graduateDegreeEarnings = ['Graduate Degree'];

        for (var i = 0; i < this.params.regions.length; i++) {
            graduateDegreeEarnings.push(parseInt(this.tableData.earningsData[i][0].median_earnings_graduate_or_professional_degree));
        }

        earnings.push(graduateDegreeEarnings);

        // Draw chart
        //
        const dataTable = google.visualization.arrayToDataTable(earnings);
        const formatter = new google.visualization.NumberFormat( { pattern : '$###,###' } );

        for (var i = 0; i < this.params.regions.length; i++) {
            formatter.format(dataTable, i + 1);
        }

        this.drawSteppedAreaChart('earnings-chart', dataTable, {

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

        if (this.ensureVisibleWithOrientation('#earnings-table-container table', 'vertical'))
            return;

        var s = '<table class="vertical">';

        // Header
        //
        s += '<tr>';
        s += '<th class="empty"></th>';

        for (var i = 0; i < this.tableData.earningsData.length; i++) {
            s += '<th class="color-' + i + '">' + this.params.regions[i].name + '<div></div></th>';
        }

        s += '</tr>'

        // Median (all)
        //
        s += '<tr><td class="category-header">Median Earnings<br>(All Workers)</td>';

        for (var i = 0; i < this.tableData.earningsData.length; i++) {
            s += '<td class="color-' + i + '">' + numeral(this.tableData.earningsData[i][0].median_earnings).format('$0,0')  + '<div></div></td>';
        }
        s += '</tr>';

        // Median (female)
        //
        s += '<tr><td class="category-header">Median Female Earnings<br>(Full Time)</td>';

        for (var i = 0; i < this.tableData.earningsData.length; i++) {
            s += '<td class="color-' + i + '">' + numeral(this.tableData.earningsData[i][0].female_full_time_median_earnings).format('$0,0')  + '<div></div></td>';
        }
        s += '</tr>';

        // Median (male)
        //
        s += '<tr><td class="category-header">Median Male Earnings<br>(Full Time)</td>';

        for (var i = 0; i < this.tableData.earningsData.length; i++) {
            s += '<td class="color-' + i + '">' + numeral(this.tableData.earningsData[i][0].male_full_time_median_earnings).format('$0,0')  + '<div></div></td>';
        }
        s += '</tr>';

        s += '</table>';

        $('#earnings-table-container').html(s);
    }

    drawEarningsTableHorizontal() {

        if (this.ensureVisibleWithOrientation('#earnings-table-container table', 'horizontal'))
            return;

        var s = '<table class="horizontal">';

        s += '<tr>';
        s += '<td class="empty"></td>';
        s += '<td class="category-header">Median Earnings<br>(All Workers)</td>';
        s += '<td class="category-header">Median Female Earnings<br>(Full Time)</td>';
        s += '<td class="category-header">Median Male Earnings<br>(Full Time)</td>';
        s += '</tr>';

        for (var i = 0; i < this.tableData.earningsData.length; i++) {

            s += '<tr class="color-' + i + '">'
            s += '<td>' + this.params.regions[i].name + '<div></div></td>';
            s += '<td>' + numeral(this.tableData.earningsData[i][0].median_earnings).format('$0,0') + '<div></div></td>';
            s += '<td>' + numeral(this.tableData.earningsData[i][0].female_full_time_median_earnings).format('$0,0') + '<div></div></td>';
            s += '<td>' + numeral(this.tableData.earningsData[i][0].male_full_time_median_earnings).format('$0,0') + '<div></div></td>';
            s += '</tr>';
        }

        s += '</table>';

        $('#earnings-table-container').html(s);
    }

    // Health
    //
    drawHealthData() {

        this.drawMap(MapSources.health);
        this.drawHealthTables();
    }

    drawHealthMapSummary(variable, year) {

        $('#map-summary').text(
            MapSummary.getSummaryString(
                this.params.regions,
                this.tableData.healthData,
                variable,
                year,
                value => (year == value.year)));
    }

    drawHealthTables() {

        const width = $(window).width();

        if ((this.params.regions.length >= 8) || (width >= 1600))
            this.drawHealthTablesHorizontal();  // horizontal colored lines
        else
            this.drawHealthTablesVertical();    // vertical colored lines
    }

    drawHealthTablesVertical() {

        if (this.ensureVisibleWithOrientation('#health-outcomes-table-container table', 'vertical'))
            return;

        this.drawHealthOutcomesTableVertical();
        this.drawHealthFactorsTableVertical();
        this.drawHealthClinicalCareTableVertical();
        this.drawHealthSocialEconomicFactorsTableVertical();
        this.drawHealthPhysicalEnvironmentTableVertical();
    }

    drawHealthTablesHorizontal() {

        if (this.ensureVisibleWithOrientation('#health-outcomes-table-container table', 'horizontal'))
            return;

        this.drawHealthOutcomesTableHorizontal();
        this.drawHealthFactorsTableHorizontal();
        this.drawHealthClinicalCareTableHorizontal();
        this.drawHealthSocialEconomicFactorsTableHorizontal();
        this.drawHealthPhysicalEnvironmentTableHorizontal();
    }

    drawHealthOutcomesTableVertical() {

        // Life length table
        //
        var s = '<table class="vertical">';

        s += '<tr>';
        s += '<th class="sub-header">Life Length</th>';

        for (var i = 0; i < this.tableData.healthData.length; i++) {
            s += '<th class="color-' + i + '">' + this.params.regions[i].name + '<div></div></th>';
        }

        s += '</tr>';

        s += this.drawHealthTableRowVertical('Premature Death', 'premature_death_value', '0,0');

        s += '</table>';

        // Quality of life table
        //
        s += '<table class="vertical">';
        s += '<tr>';
        s += '<th class="sub-header">Quality of Life</th>';

        for (var i = 0; i < this.tableData.healthData.length; i++) {
            s += '<th class="color-' + i + '">' + this.params.regions[i].name + '<div></div></th>';
        }

        s += '</tr>';

        s += this.drawHealthTableRowVertical('Poor or Fair Health', 'poor_or_fair_health_value', '0.0%');
        s += this.drawHealthTableRowVertical('Poor Physical Health Days', 'poor_physical_health_days_value', '0.0');
        s += this.drawHealthTableRowVertical('Poor Mental Health Days', 'poor_mental_health_days_value', '0.0');
        s += this.drawHealthTableRowVertical('Low Birth Weight', 'low_birthweight_value', '0.0');

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

        for (var i = 0; i < this.tableData.healthData.length; i++) {

            const regionData = this.tableData.healthData[i][0];

            s += '<tr class="color-' + i + '">';
            s += '<td>' + this.params.regions[i].name + '<div></div></td>';
            s += this.drawHealthTableCellHorizontal(regionData, 'premature_death_value', '0,0');
            s += '<td class="empty"></td>';
            s += this.drawHealthTableCellHorizontal(regionData, 'poor_or_fair_health_value', '0.0%');
            s += this.drawHealthTableCellHorizontal(regionData, 'poor_physical_health_days_value', '0.0');
            s += this.drawHealthTableCellHorizontal(regionData, 'poor_mental_health_days_value', '0.0');
            s += this.drawHealthTableCellHorizontal(regionData, 'low_birthweight_value', '0.0');
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

        for (var i = 0; i < this.tableData.healthData.length; i++) {
            s += '<th class="color-' + i + '">' + this.params.regions[i].name + '<div></div></th>';
        }

        s += '</tr>'

        s += this.drawHealthTableRowVertical('Adult Smoking', 'adult_smoking_value', '0.0%');
        s += this.drawHealthTableRowVertical('Adult Obesity', 'adult_obesity_value', '0.0%');
        s += this.drawHealthTableRowVertical('Food Environment Index', 'food_environment_index_value', '0.0');
        s += this.drawHealthTableRowVertical('Physical Inactivity', 'physical_inactivity_value', '0.0%');
        s += this.drawHealthTableRowVertical('Access to Exercise', 'access_to_exercise_opportunities_value', '0.0%');
        s += this.drawHealthTableRowVertical('Excessive Drinking', 'excessive_drinking_value', '0.0%');
        s += this.drawHealthTableRowVertical('Alcohol Impaired Driving Deaths', 'alcohol_impaired_driving_deaths_value', '0.0%');
        s += this.drawHealthTableRowVertical('Sexually Transmitted Infections', 'sexually_transmitted_infections_value', '0,0');
        s += this.drawHealthTableRowVertical('Teen Births', 'teen_births_value', '0,0');

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

            const regionData = this.tableData.healthData[i][0];

            s += '<tr class="color-' + i + '">';
            s += '<td>' + this.params.regions[i].name + '<div></div></td>';
            s += this.drawHealthTableCellHorizontal(regionData, 'adult_smoking_value', '0.0%');
            s += this.drawHealthTableCellHorizontal(regionData, 'adult_obesity_value', '0.0%');
            s += this.drawHealthTableCellHorizontal(regionData, 'food_environment_index_value', '0.0');
            s += this.drawHealthTableCellHorizontal(regionData, 'physical_inactivity_value', '0.0%');
            s += this.drawHealthTableCellHorizontal(regionData, 'access_to_exercise_opportunities_value', '0.0%');
            s += this.drawHealthTableCellHorizontal(regionData, 'excessive_drinking_value', '0.0%');
            s += this.drawHealthTableCellHorizontal(regionData, 'alcohol_impaired_driving_deaths_value', '0.0%');
            s += this.drawHealthTableCellHorizontal(regionData, 'sexually_transmitted_infections_value', '0,0');
            s += this.drawHealthTableCellHorizontal(regionData, 'teen_births_value', '0,0');
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

        for (var i = 0; i < this.tableData.healthData.length; i++) {
            s += '<th class="color-' + i + '">' + this.params.regions[i].name + '<div></div></th>';
        }

        s += '</tr>'

        s += this.drawHealthTableRowVertical('Uninsured', 'uninsured_value', '0.0%');
        s += this.drawHealthTableRowVertical('Primary Care Physicians', 'primary_care_physicians_value', '0,0');
        s += this.drawHealthTableRowVertical('Dentists', 'dentists_value', '0,0');
        s += this.drawHealthTableRowVertical('Mental Health Providers', 'mental_health_providers_value', '0,0');
        s += this.drawHealthTableRowVertical('Preventable Hospital Stays', 'preventable_hospital_stays_value', '0,0');
        s += this.drawHealthTableRowVertical('Diabetic Monitoring', 'diabetic_screening_value', '0.0%');
        s += this.drawHealthTableRowVertical('Mammography Screening', 'mammography_screening_value', '0.0%');

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

            const regionData = this.tableData.healthData[i][0];

            s += '<tr class="color-' + i + '">';
            s += '<td>' + this.params.regions[i].name + '<div></div></td>';
            s += this.drawHealthTableCellHorizontal(regionData, 'uninsured_value', '0.0%');
            s += this.drawHealthTableCellHorizontal(regionData, 'primary_care_physicians_value', '0,0');
            s += this.drawHealthTableCellHorizontal(regionData, 'dentists_value', '0,0');
            s += this.drawHealthTableCellHorizontal(regionData, 'mental_health_providers_value', '0,0');
            s += this.drawHealthTableCellHorizontal(regionData, 'preventable_hospital_stays_value', '0,0');
            s += this.drawHealthTableCellHorizontal(regionData, 'diabetic_screening_value', '0.0%');
            s += this.drawHealthTableCellHorizontal(regionData, 'mammography_screening_value', '0.0%');
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

        for (var i = 0; i < this.tableData.healthData.length; i++) {
            s += '<th class="color-' + i + '">' + this.params.regions[i].name + '<div></div></th>';
        }

        s += '</tr>'

        s += this.drawHealthTableRowVertical('High School Graduation', 'high_school_graduation_value', '0.0%');
        s += this.drawHealthTableRowVertical('Some College', 'some_college_value', '0.0%');
        s += this.drawHealthTableRowVertical('Unemployment', 'unemployment_value', '0.0%');
        s += this.drawHealthTableRowVertical('Children in Poverty', 'children_in_poverty_value', '0.0%');
        s += this.drawHealthTableRowVertical('Income Inequality', 'income_inequality_value', '0.0');
        s += this.drawHealthTableRowVertical('Children in Single-Parent Households', 'children_in_single_parent_households_value', '0.0%');
        s += this.drawHealthTableRowVertical('Social Associations', 'social_associations_value', '0.0');
        s += this.drawHealthTableRowVertical('Violent Crime', 'violent_crime_value', '0.0');
        s += this.drawHealthTableRowVertical('Injury Deaths', 'injury_deaths_value', '0.0');

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

            const regionData = this.tableData.healthData[i][0];

            s += '<tr class="color-' + i + '">';
            s += '<td>' + this.params.regions[i].name + '<div></div></td>';
            s += this.drawHealthTableCellHorizontal(regionData, 'high_school_graduation_value', '0.0%');
            s += this.drawHealthTableCellHorizontal(regionData, 'some_college_value', '0.0%');
            s += this.drawHealthTableCellHorizontal(regionData, 'unemployment_value', '0.0%');
            s += this.drawHealthTableCellHorizontal(regionData, 'children_in_poverty_value', '0.0%');
            s += this.drawHealthTableCellHorizontal(regionData, 'income_inequality_value', '0.0');
            s += this.drawHealthTableCellHorizontal(regionData, 'children_in_single_parent_households_value', '0.0%');
            s += this.drawHealthTableCellHorizontal(regionData, 'social_associations_value', '0.0');
            s += this.drawHealthTableCellHorizontal(regionData, 'violent_crime_value', '0.0');
            s += this.drawHealthTableCellHorizontal(regionData, 'injury_deaths_value', '0.0');
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

        for (var i = 0; i < this.tableData.healthData.length; i++) {
            s += '<th class="color-' + i + '">' + this.params.regions[i].name + '<div></div></th>';
        }

        s += '</tr>'

        s += this.drawHealthTableRowVertical('Air Pollution - Particulate Matter', 'air_pollution_particulate_matter_value', '0.0');
        s += this.drawHealthTableRowVertical('Drinking Water Violations', 'drinking_water_violations_value', '0.0%');
        s += this.drawHealthTableRowVertical('Severe Housing Problems', 'severe_housing_problems_value', '0.0%');
        s += this.drawHealthTableRowVertical('Driving Alone to Work', 'driving_alone_to_work_value', '0.0%');
        s += this.drawHealthTableRowVertical('Long Commute - Driving Alone', 'long_commute_driving_alone_value', '0.0%');

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

            const regionData = this.tableData.healthData[i][0];

            s += '<tr class="color-' + i + '">';
            s += '<td>' + this.params.regions[i].name + '<div></div></td>';
            s += this.drawHealthTableCellHorizontal(regionData, 'air_pollution_particulate_matter_value', '0.0');
            s += this.drawHealthTableCellHorizontal(regionData, 'drinking_water_violations_value', '0.0%');
            s += this.drawHealthTableCellHorizontal(regionData, 'severe_housing_problems_value', '0.0%');
            s += this.drawHealthTableCellHorizontal(regionData, 'driving_alone_to_work_value', '0.0%');
            s += this.drawHealthTableCellHorizontal(regionData, 'long_commute_driving_alone_value', '0.0%');
            s += '</tr>';
        }

        s += '</table>';

        $('#health-physical-environment-table-container').html(s);
    }

    drawHealthTableRowVertical(header, key, format) {

        var s = '<tr><td class="category-header">' + header + '</td>';

        for (var i = 0; i < this.tableData.healthData.length; i++) {

            const regionData = this.tableData.healthData[i][0];
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

    drawHealthTableCellHorizontal(data, key, format) {

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
        this.drawEducationTable();
    }

    drawEducationMapSummary(variable, year) {

        $('#map-summary').text(
            MapSummary.getSummaryString(
                this.params.regions,
                this.tableData.educationData,
                variable,
                year,
                value => (year == value.year)));
    }

    drawEducationTable() {

        const width = $(window).width();

        if ((this.params.regions.length >= 3) || (width >= 1600))
            this.drawEducationTableHorizontal();    // horizontal colored lines
        else
            this.drawEducationTableVertical();      // vertical colored lines
    }

    drawEducationTableVertical() {

        if (this.ensureVisibleWithOrientation('#education-table-container table', 'vertical'))
            return;

        var s = '<table class="vertical">';

        // Header
        //
        s += '<tr>';
        s += '<th class="empty"></th>';

        for (var i = 0; i < this.tableData.educationData.length; i++) {
            s += '<th colspan="2" class="color-' + i + '">' + this.params.regions[i].name + '<div></div></th>';
        }

        s += '</tr>'

        // Sub header
        //
        s += '<tr class="sub-header-row"><td class="empty"></td>';

        for (var i = 0; i < this.tableData.educationData.length; i++) {
            s += '<td>Percent</td><td class="color-' + i + '">Percentile<div></div></td>';
        }

        // Bachelor's or higher
        //
        s += '<tr><td class="category-header">At Least Bachelor\'s Degree</td>';

        for (var i = 0; i < this.tableData.educationData.length; i++) {

            const regionData = this.tableData.educationData[i][0];
            const totalRanks = parseInt(regionData.total_ranks);

            const bachelorsRank = parseInt(regionData.percent_bachelors_degree_or_higher_rank);
            const bachelorsPercentile = parseInt(((totalRanks - bachelorsRank) / totalRanks) * 100);

            s += '<td>' + numeral(regionData.percent_bachelors_degree_or_higher).format('0.0') + '%</td>';
            s += '<td class="color-' + i + '">' + numeral(bachelorsPercentile).format('0o') + '<div></div></td>';
        }

        s += '</tr>';

        // High school or higher
        //
        s += '<tr><td class="category-header">At Least High School Diploma</td>';

        for (var i = 0; i < this.tableData.educationData.length; i++) {

            const regionData = this.tableData.educationData[i][0];
            const totalRanks = parseInt(regionData.total_ranks);

            const highSchoolRank = parseInt(regionData.percent_high_school_graduate_or_higher_rank);
            const highSchoolPercentile = parseInt(((totalRanks - highSchoolRank) / totalRanks) * 100);

            s += '<td>' + numeral(regionData.percent_high_school_graduate_or_higher).format('0.0') + '%</td>';
            s += '<td class="color-' + i + '">' + numeral(highSchoolPercentile).format('0o') + '<div></div></td>';
        }

        s += '</tr>';
        s += '</table>';

        $('#education-table-container').html(s);
    }

    drawEducationTableHorizontal() {

        if (this.ensureVisibleWithOrientation('#education-table-container table', 'horizontal'))
            return;

        var s = '<table class="horizontal">';

        s += '<tr>';
        s += '<td class="empty"></td>';
        s += '<td class="category-header">At Least Bachelor\'s Degree<br>(Percent)</td>';
        s += '<td class="category-header">At Least Bachelor\'s Degree<br>(Percentile)</td>';
        s += '<td class="category-header">At Least High School Diploma<br>(Percent)</td>';
        s += '<td class="category-header">At Least High School Diploma<br>(Percentile)</td>';
        s += '</tr>';

        for (var i = 0; i < this.tableData.educationData.length; i++) {

            const regionData = this.tableData.educationData[i][0];

            s += '<tr class="color-' + i + '">'
            s += '<td>' + this.params.regions[i].name + '<div></div></td>';

            const totalRanks = parseInt(regionData.total_ranks);
            const bachelorsRank = parseInt(regionData.percent_bachelors_degree_or_higher_rank);
            const bachelorsPercentile = parseInt(((totalRanks - bachelorsRank) / totalRanks) * 100);

            s += '<td>' + numeral(regionData.percent_bachelors_degree_or_higher).format('0.0') + '%<div></div></td>';
            s += '<td>' + numeral(bachelorsPercentile).format('0o') + '<div></div></td>';

            const highSchoolRank = parseInt(regionData.percent_high_school_graduate_or_higher_rank);
            const highSchoolPercentile = parseInt(((totalRanks - highSchoolRank) / totalRanks) * 100);

            s += '<td>' + numeral(regionData.percent_high_school_graduate_or_higher).format('0.0') + '%<div></div></td>';
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
        this.drawGdpChart();
        this.drawGdpChangeChart();

        // no need to draw GDP table, because it so long it will never switch to a horizontal orientation
    }

    drawGdpMapSummary(variable, year) {

        $('#map-summary').text(
            MapSummary.getSummaryString(
                this.params.regions,
                this.tableData.gdpData,
                variable,
                year,
                value => (year == value.year)));
    }

    drawGdpChart() {

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

        for (var i = 0; i < this.tableData.gdpData.length; i++) {

            const regionValues = this.tableData.gdpData[i];

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
        const formatter = new google.visualization.NumberFormat( { pattern : '$###,###' } );

        for (var i = 0; i < this.params.regions.length; i++) {
            formatter.format(dataTable, i + 1);
        }

        this.drawLineChart('per-capita-gdp-chart', dataTable, {

            curveType : 'function',
            legend : { position : 'bottom' },
            pointShape : 'square',
            pointSize : 8,
            title : 'Per Capita Real GDP over Time',
            vAxis : { format : '$###,###' },
        });
    }

    drawGdpChangeChart() {

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

        for (var i = 0; i < this.tableData.gdpData.length; i++) {

            const regionValues = this.tableData.gdpData[i];

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
        const formatter = new google.visualization.NumberFormat( { pattern : '#.##%' } );

        for (var i = 0; i < this.params.regions.length; i++) {
            formatter.format(dataTable, i + 1);
        }

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
    }

    drawOccupationsMapSummary(variable, year) {

        $('#map-summary').text(
            MapSummary.getOccupationsSummaryString(
                this.params.regions,
                this.tableData.occupationsData,
                variable,
                year,
                value => (year == value.year) && (variable.name == value.occupation)));
    }

    // Population
    //
    drawPopulationData() {

        this.drawMap(MapSources.population);
        this.drawPopulationChart();
        this.drawPopulationChangeChart();
    }

    drawPopulationMapSummary(variable, year) {

        $('#map-summary').text(
            MapSummary.getSummaryString(
                this.params.regions,
                this.tableData.populationData,
                variable,
                year,
                value => (year == value.year)));
    }

    drawPopulationChart() {

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

        for (var i = 0; i < this.tableData.populationData.length; i++) {

            const regionValues = this.tableData.populationData[i];

            for (var j = 0; j < regionValues.length; j++) {

                if (o[regionValues[j].year] == undefined)
                    o[regionValues[j].year] = [regionValues[j].year];

                o[regionValues[j].year].push(parseInt(regionValues[j].population));
            }
        }

        for (var key in o) {
            chartData.push(o[key]);
        }

        // Draw chart
        //
        const dataTable = google.visualization.arrayToDataTable(chartData);
        const formatter = new google.visualization.NumberFormat( { pattern : '###,###' } );

        for (var i = 0; i < this.params.regions.length; i++) {
            formatter.format(dataTable, i + 1);
        }

        this.drawLineChart('population-chart', dataTable, {

            curveType : 'function',
            legend : { position : 'bottom' },
            pointShape : 'square',
            pointSize : 8,
            title : 'Population',
        });
    }

    drawPopulationChangeChart() {

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

        for (var i = 0; i < this.tableData.populationData.length; i++) {

            const regionValues = this.tableData.populationData[i];

            for (var j = 0; j < regionValues.length; j++) {

                if (o[regionValues[j].year] == undefined)
                    o[regionValues[j].year] = [regionValues[j].year];

                o[regionValues[j].year].push(parseFloat(regionValues[j].population_percent_change) / 100);
            }
        }

        for (var key in o) {
            chartData.push(o[key]);
        }

        // Draw chart
        //
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

    ensureVisibleWithOrientation(selector, orientation) {

        var o = $(selector);

        if (!o.is(':visible'))
            o.show();

        return o.hasClass(orientation);
    }

    // Draw charts
    //
    drawLineChart(chartId, dataTable, options) {

        const chart = new google.visualization.LineChart(document.getElementById(chartId));

        this.applyStandardOptions(options);

        chart.draw(dataTable, options);
    }

    drawSteppedAreaChart(chartId, dataTable, options) {

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
            this.params.categories.forEach(category => parts.push('categories=' + encodeURIComponent(category)));

        if (this.params.domains.length > 0)
            this.params.domains.forEach(domain => parts.push('domains=' + encodeURIComponent(domain)));

        if (this.params.tags.length > 0)
            this.params.tags.forEach(tag => parts.push('tags=' + encodeURIComponent(tag)));

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
