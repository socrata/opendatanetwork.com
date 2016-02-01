
class SearchPageController {

    constructor(params, tableData, mapVariables) {

        this.params = params;
        this.tableData = tableData;
        this.mapVariables = mapVariables;
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
            $('.map-summary-more').text($('.map-summary-more').text() == 'More Information' ? 'Less Information' : 'More Information');
        })
    }

    // Public methods
    //
    drawMap(source, onDisplay) {

        const selector = '#map';
        const regions = this.params.regions;

        _.extend(source, { selectedIndices : this.mapVariables });

        MapView.create(source, regions, onDisplay)
            .then(view => view.show(selector), error => console.warn(error));
    }

    drawMapSummaryLinks(source, variable, year) {

        const variables = _.filter(source.variables, item => item.name != variable.name);
        const list = $('.map-summary-links').empty();

        $.each(variables, i => {

            const item = variables[i];
            const li = $('<li/>').appendTo(list);

            $('<a/>')
                .attr('href', this.getSearchPageUrl(false, item.metric, year))
                .text(item.name)
                .appendTo(li);
        });
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
        this.drawMap(MapSources.rpp, (variable, year) => this.onDrawCostOfLivingMap(variable, year));
        new Tab(costOfLiving).render(d3.select('div.charts'), this.params.regions);
    }

    onDrawCostOfLivingMap(variable, year) {

        this.updateAddressBarUrl(variable.metric, year);

        $('.map-summary').text(
            MapSummary.getCostOfLivingSummaryString(
                this.params.regions,
                this.tableData,
                variable,
                year,
                value => (year == value.year)));

        this.drawMapSummaryLinks(MapSources.rpp, variable,year);
    }

    // Earnings
    //
    drawEarningsData() {
        this.drawMap(MapSources.earnings, (variable, year) => this.onDrawEarningsMap(variable, year));
        new Tab(earnings).render(d3.select('div.charts'), this.params.regions);
    }

    onDrawEarningsMap(variable, year) {

        this.updateAddressBarUrl(variable.metric, year);

        $('.map-summary').text(
            MapSummary.getSummaryString(
                this.params.regions,
                this.tableData,
                variable,
                year,
                value => (year == value.year)));

        this.drawMapSummaryLinks(MapSources.earnings, variable, year);
    }

    // Health
    //
    drawHealthData() {
        this.drawMap(MapSources.health, (variable, year) => this.onDrawHealthMap(variable, year));
        this.drawHealthTables();
    }

    onDrawHealthMap(variable, year) {
        this.updateAddressBarUrl(variable.metric, year);

        $('.map-summary').text(
            MapSummary.getSummaryString(
                this.params.regions,
                this.tableData,
                variable,
                year,
                value => (year == value.year)));

        this.drawMapSummaryLinks(MapSources.health, variable, year);
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

        for (var i = 0; i < this.tableData.length; i++) {
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

        for (var i = 0; i < this.tableData.length; i++) {
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

        for (var i = 0; i < this.tableData.length; i++) {

            const regionData = this.tableData[i][0];

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

        for (var i = 0; i < this.tableData.length; i++) {
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

            const regionData = this.tableData[i][0];

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

        for (var i = 0; i < this.tableData.length; i++) {
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

            const regionData = this.tableData[i][0];

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

        for (var i = 0; i < this.tableData.length; i++) {
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

            const regionData = this.tableData[i][0];

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

        for (var i = 0; i < this.tableData.length; i++) {
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

            const regionData = this.tableData[i][0];

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

        for (var i = 0; i < this.tableData.length; i++) {

            const regionData = this.tableData[i][0];
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

        this.drawMap(MapSources.education, (variable, year) => this.onDrawEducationMap(variable, year));
        const tab = new Tab(education).render(d3.select('div.charts'), this.params.regions);
    }

    onDrawEducationMap(variable, year) {

        this.updateAddressBarUrl(variable.metric, year);

        $('.map-summary').text(
            MapSummary.getSummaryString(
                this.params.regions,
                this.tableData,
                variable,
                year,
                value => (year == value.year)));

        this.drawMapSummaryLinks(MapSources.education, variable, year);
    }

    // GDP data
    //
    drawGdpData() {
        this.drawMap(MapSources.gdp, (variable, year) => this.onDrawGdpMap(variable, year));
        new Tab(gdp).render(d3.select('div.charts'), this.params.regions);

    }

    onDrawGdpMap(variable, year) {

        this.updateAddressBarUrl(variable.metric, year);

        $('.map-summary').text(
            MapSummary.getSummaryString(
                this.params.regions,
                this.tableData,
                variable,
                year,
                value => (year == value.year)));

        this.drawMapSummaryLinks(MapSources.gdp, variable, year);
    }

    // Occupations
    //
    drawOccupationsData() {
        this.drawMap(MapSources.occupations, (variable, year) => this.onDrawOccupationsMap(variable, year));
        new Tab(occupations).render(d3.select('div.charts'), this.params.regions);
    }

    onDrawOccupationsMap(variable, year) {

        this.updateAddressBarUrl(variable.metric, year);

        $('.map-summary').text(
            MapSummary.getOccupationsSummaryString(
                this.params.regions,
                this.tableData,
                variable,
                year,
                value => (year == value.year) && (variable.name == value.occupation)));

        this.drawMapSummaryLinks(MapSources.occupations, variable, year);
    }

    // Population
    //
    drawPopulationData() {
        this.drawMap(MapSources.population, (variable, year) => this.onDrawPopulationMap(variable, year));
        new Tab(demographics).render(d3.select('div.charts'), this.params.regions);
    }

    onDrawPopulationMap(variable, year) {

        this.updateAddressBarUrl(variable.metric, year);

        $('.map-summary').text(
            MapSummary.getSummaryString(
                this.params.regions,
                this.tableData,
                variable,
                year,
                value => (year == value.year)));

        this.drawMapSummaryLinks(MapSources.population, variable, year);
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

        console.log(options);

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

    getSearchPageForRegionVectorMetricYearUrl(regionIds, regionNames, vector, metric, year, isSearchResults, queryString) {

        var url = '';

        if (regionIds && (regionIds.length > 0)) {

            url += '/region/' + regionIds.join('-');

            if (regionNames && (regionNames.length > 0)) {

                const parts = regionNames.map(regionName => regionName.replace(/ /g, '_').replace(/\//g, '_').replace(/,/g, ''))
                url += '/' + parts.join('-');
            }
            else
                url += '/-';
        }
        else {

            url += '/search';
        }

        if (isSearchResults) {

            url += '/search-results';
        }
        else {

            if (vector) url += '/' + vector;
            if (metric) url += '/' + metric;
            if (year) url += '/' + year;
        }

        if (queryString)
            url += queryString;

        return url;
    }

    getSearchPageUrl(isSearchResults, metric, year) {

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

            return this.getSearchPageForRegionVectorMetricYearUrl(
                regionIds,
                regionNames,
                this.params.vector || 'population',
                metric,
                year,
                isSearchResults,
                this.getSearchQueryString(isSearchResults));
        }
        else {

            return this.getSearchPageForRegionVectorMetricYearUrl(
                null,
                null,
                this.params.vector || 'population',
                metric,
                year,
                isSearchResults,
                this.getSearchQueryString(isSearchResults));
        }
    }

    getSearchResultsUrl() {

        return this.getSearchPageUrl(true);
    }

    getSearchQueryString(isSearchResults) {

        const parts = [];

        if (this.params.q.length > 0)
            parts.push('q=' + encodeURIComponent(this.params.q));

        if ((this.params.page > 1) && isSearchResults)
            parts.push('page=' + this.params.page);

        if (this.params.categories.length > 0)
            this.params.categories.forEach(category => parts.push('categories=' + encodeURIComponent(category)));

        if (this.params.domains.length > 0)
            this.params.domains.forEach(domain => parts.push('domains=' + encodeURIComponent(domain)));

        if (this.params.tags.length > 0)
            this.params.tags.forEach(tag => parts.push('tags=' + encodeURIComponent(tag)));

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

    updateAddressBarUrl(metric, year) {

        const url = this.getSearchPageUrl(false, metric, year)
        history.replaceState(null, null, url);
    }
}
