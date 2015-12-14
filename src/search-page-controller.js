
class SearchPageController {

    constructor(params) {

        this.MAP_COLOR_SCALE = colorbrewer.RdYlBu[9],
        this.MAP_INITIAL_ZOOM = 10.0;
        this.MAP_RADIUS_SCALE = [500, 2000];

        this.params = params;
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

                    this.drawCostOfLivingChart(data);
                    this.drawCostOfLivingTable(data);
                })
                .catch(error => console.error(error));
        });
    }

    drawCostOfLivingChart(data) {

        this.drawCostOfLivingChartForComponent('cost-of-living-all-chart', 'All', data);
        this.drawCostOfLivingChartForComponent('cost-of-living-goods-chart', 'Goods', data);
        this.drawCostOfLivingChartForComponent('cost-of-living-rents-chart', 'Rents', data);
        this.drawCostOfLivingChartForComponent('cost-of-living-other-chart', 'Other', data);
    }

    drawCostOfLivingChartForComponent(id, component, data) {

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

        for (var i = 0; i < data.length; i++) {

            const regionValues = data[i];

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

    drawCostOfLivingTable(data) {

        // Headers
        //
        var s = '<tr>';
        s += '<td class=\'empty\'></td>';
        s += '<td class=\'category-header\'>All<br>(Value)</td>';
        s += '<td class=\'category-header\'>All<br>(Percentile)</td>';
        s += '<td class=\'category-header\'>Goods<br>(Value)</td>';
        s += '<td class=\'category-header\'>Goods<br>(Percentile)</td>';
        s += '<td class=\'category-header\'>Other<br>(Value)</td>';
        s += '<td class=\'category-header\'>Other<br>(Percentile)</td>';
        s += '<td class=\'category-header\'>Rents<br>(Value)</td>';
        s += '<td class=\'category-header\'>Rents<br>(Percentile)</td>';
        s += '</tr>';

        const components = ['All', 'Goods', 'Other', 'Rents'];

        for (var i = 0; i < this.params.regions.length; i++) {

            s += '<tr class=\'color-' + i + '\'>';
            s += '<td>' + this.params.regions[i].name + '<div></div></td>';

            for (var j = 0; j < components.length; j++) {

                const o = this.getLatestCostOfLiving(data[0], this.params.regions[i].id, components[j]);
                const value = (o != null) ? parseFloat(o.index) : 'NA';
                const percentile = (o != null) ? this.getPercentile(o.rank, o.total_ranks) : 'NA';

                s += '<td>' + value + '<div></div></td>';
                s += '<td>' + percentile + '<div></div></td>';
            }

            s += '</tr>';
        }

        $('#cost-of-living-table').html(s);
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

                    this.drawEarningsChart(data);
                    this.drawEarningsTable(data);
                })
                .catch(error => console.error(error));
        });
    }

    drawEarningsChart(data) {

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
            someHighSchoolEarnings.push(parseInt(data[i][0].median_earnings_less_than_high_school));
        }

        earnings.push(someHighSchoolEarnings);

        // High school
        //
        const highSchoolEarnings = ['High School'];

        for (var i = 0; i < this.params.regions.length; i++) {
            highSchoolEarnings.push(parseInt(data[i][0].median_earnings_high_school));
        }

        earnings.push(highSchoolEarnings);

        // Some college
        //
        const someCollegeEarnings = ['Some College'];

        for (var i = 0; i < this.params.regions.length; i++) {
            someCollegeEarnings.push(parseInt(data[i][0].median_earnings_some_college_or_associates));
        }

        earnings.push(someCollegeEarnings);

        // Bachelor's
        //
        const bachelorsEarnings = ['Bachelor\'s'];

        for (var i = 0; i < this.params.regions.length; i++) {
            bachelorsEarnings.push(parseInt(data[i][0].median_earnings_bachelor_degree));
        }

        earnings.push(bachelorsEarnings);

        // Graduate degree
        //
        const graduateDegreeEarnings = ['Graduate Degree'];

        for (var i = 0; i < this.params.regions.length; i++) {
            graduateDegreeEarnings.push(parseInt(data[i][0].median_earnings_graduate_or_professional_degree));
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

    drawEarningsTable(data) {

        var s = '<tr>';
        s += '<td class=\'empty\'></td>';
        s += '<td class=\'category-header\'>Median Earnings<br>(All Workers)</td>';
        s += '<td class=\'category-header\'>Median Female Earnings<br>(Full Time)</td>';
        s += '<td class=\'category-header\'>Median Male Earnings<br>(Full Time)</td>';
        s += '</tr>';

        for (var i = 0; i < this.params.regions.length; i++) {

            s += '<tr class=\'color-' + i + '\'>'
            s += '<td>' + this.params.regions[i].name + '<div></div></td>';
            s += '<td>' + numeral(data[i][0].median_earnings).format('$0,0') + '<div></div></td>';
            s += '<td>' + numeral(data[i][0].female_full_time_median_earnings).format('$0,0') + '<div></div></td>';
            s += '<td>' + numeral(data[i][0].male_full_time_median_earnings).format('$0,0') + '<div></div></td>';
            s += '</tr>';
        }

        $('#earnings-table').html(s);
    }

    // Health
    //
    drawHealthData() {

        this.drawMap(MapSources.health);
        this.drawBrfssCharts()

        google.setOnLoadCallback(() => {

            const controller = new ApiController();
            const rwjfPromise = this.params.regions.map(region => 
                controller.getHealthRwjfChrData(region.id)
            );

            Promise.all(rwjfPromise)
                .then(data => {

                    this.drawHealthDataOutcomesTable(data);
                    this.drawHealthBehaviorsTable(data);
                    this.drawHealthClinicalCareTable(data);
                    this.drawHealthSocialEconomicFactorsTable(data);
                    this.drawHealthPhysicalEnvironmentTable(data);
                })
                .catch(error => console.error(error));


        });
    }

    drawBrfssCharts(){
      const state_regions = this.params.regions.filter(function(region,n){return region['type'] == "state"})
      if(state_regions.length > 0){
          const response = jQuery("#cdc-brfss-overall-health-chart-selector").val()
          const cdcPromise = state_regions.map(region => 
              new ApiController().getHealthCdcBrfssPrevalenceOverallHealthData(region.id, response)
          );

          Promise.all(cdcPromise)
              .then(data => {
                  this.drawBrfssOverallHealthChart(data, response);
              })
              .catch(error => console.error(error));

      } else {
          jQuery("#cdc-brfss").hide()
      }
    }

    drawBrfssOverallHealthChart(data, response) {
        const state_regions = this.params.regions.filter(function(region,n){return region['type'] == "state"})
        const chartData = [];

        // Header
        //
        const header = ['Year'];
        for (var i = 0; i < state_regions.length; i++) {
          header[i + 1] = state_regions[i].name;
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
              o[regionValues[j].year].push(parseInt(regionValues[j].data_value));
          }
        }

        for (var key in o) {
          chartData.push(o[key]);
        }

        const dataTable = google.visualization.arrayToDataTable(chartData);
        this.drawLineChart('cdc-brfss-overall-health-chart', dataTable, {
            curveType : 'function',
            legend : { position : 'bottom' },
            pointShape : 'square',
            pointSize : 8,
            vAxis: {
              title: "Crude Percentage of Respondents",
            },
            hAxis: {
              title: "Year",
            },
        })
    }

    drawHealthDataOutcomesTable(data) {

        var s = '<tr>';
        s += '<th class=\'empty\'></th>';
        s += '<th>Life Length</th>';
        s += '<th class=\'empty\'></th>';
        s += '<th colspan=\'4\'>Quality of Life</th>';
        s += '</tr>';

        s += '<tr>';
        s += '<td class=\'empty\'></td>';
        s += '<td class=\'category-header\'>Premature Death</td>';
        s += '<td class=\'empty\'></td>';
        s += '<td class=\'category-header\'>Poor or Fair Health</td>';
        s += '<td class=\'category-header\'>Poor Physical Health Days</td>';
        s += '<td class=\'category-header\'>Poor Mental Health Days</td>';
        s += '<td class=\'category-header\'>Low Birth Weight</td>';
        s += '</tr>';

        for (var i = 0; i < this.params.regions.length; i++) {

            const regionData = data[i][0];

            s += '<tr class=\'color-' + i + '\'>';
            s += '<td>' + this.params.regions[i].name + '<div></div></td>';
            s += this.drawHealthDataTableCell(regionData, 'premature_death_value', '0,0');
            s += '<td class=\'empty\'></td>';
            s += this.drawHealthDataTableCell(regionData, 'poor_or_fair_health_value', '0.0%');
            s += this.drawHealthDataTableCell(regionData, 'poor_physical_health_days_value', '0.0');
            s += this.drawHealthDataTableCell(regionData, 'poor_mental_health_days_value', '0.0');
            s += this.drawHealthDataTableCell(regionData, 'low_birthweight_value', '0.0');
            s += '</tr>';
        }

        $('#rwjf-county-health-outcomes-table').html(s);
    };

    drawHealthBehaviorsTable(data) {

        var s = '<tr>';
        s += '<th class=\'empty\'></th>';
        s += '<th colspan=\'9\'>Health Behaviors</th>';
        s += '</tr>';

        s += '<tr>';
        s += '<td class=\'empty\'></td>';
        s += '<td class=\'category-header\'>Adult Smoking</td>';
        s += '<td class=\'category-header\'>Adult Obesity</td>';
        s += '<td class=\'category-header\'>Food Environment Index</td>';
        s += '<td class=\'category-header\'>Physical Inactivity</td>';
        s += '<td class=\'category-header\'>Access to Exercise</td>';
        s += '<td class=\'category-header\'>Excessive Drinking</td>';
        s += '<td class=\'category-header\'>Alcohol Impaired Driving Deaths</td>';
        s += '<td class=\'category-header\'>Sexually Transmitted Infections</td>';
        s += '<td class=\'category-header\'>Teen Births</td>';
        s += '</tr>';

        for (var i = 0; i < this.params.regions.length; i++) {

            const regionData = data[i][0];

            s += '<tr class=\'color-' + i + '\'>';
            s += '<td>' + this.params.regions[i].name + '<div></div></td>';
            s += this.drawHealthDataTableCell(regionData, 'adult_smoking_value', '0.0%');
            s += this.drawHealthDataTableCell(regionData, 'adult_obesity_value', '0.0%');
            s += this.drawHealthDataTableCell(regionData, 'food_environment_index_value', '0.0');
            s += this.drawHealthDataTableCell(regionData, 'physical_inactivity_value', '0.0%');
            s += this.drawHealthDataTableCell(regionData, 'access_to_exercise_opportunities_value', '0.0%');
            s += this.drawHealthDataTableCell(regionData, 'excessive_drinking_value', '0.0%');
            s += this.drawHealthDataTableCell(regionData, 'alcohol_impaired_driving_deaths_value', '0.0%');
            s += this.drawHealthDataTableCell(regionData, 'sexually_transmitted_infections_value', '0,0');
            s += this.drawHealthDataTableCell(regionData, 'teen_births_value', '0,0');
            s += '</tr>';
        }

        $('#rwjf-county-health-factors-table').html(s);
    };

    drawHealthClinicalCareTable(data) {

        var s = '<tr>';
        s += '<th class=\'empty\'></th>';
        s += '<th colspan=\'7\'>Clinical Care</th>';
        s += '</tr>';

        s += '<tr>';
        s += '<td class=\'empty\'></td>';
        s += '<td class=\'category-header\'>Uninsured</td>';
        s += '<td class=\'category-header\'>Primary Care Physicians</td>';
        s += '<td class=\'category-header\'>Dentists</td>';
        s += '<td class=\'category-header\'>Mental Health Providers</td>';
        s += '<td class=\'category-header\'>Preventable Hospital Stays</td>';
        s += '<td class=\'category-header\'>Diabetic Monitoring</td>';
        s += '<td class=\'category-header\'>Mammography Screening</td>';
        s += '</tr>';

        for (var i = 0; i < this.params.regions.length; i++) {

            const regionData = data[i][0];

            s += '<tr class=\'color-' + i + '\'>';
            s += '<td>' + this.params.regions[i].name + '<div></div></td>';
            s += this.drawHealthDataTableCell(regionData, 'uninsured_value', '0.0%');
            s += this.drawHealthDataTableCell(regionData, 'primary_care_physicians_value', '0,0');
            s += this.drawHealthDataTableCell(regionData, 'dentists_value', '0,0');
            s += this.drawHealthDataTableCell(regionData, 'mental_health_providers_value', '0,0');
            s += this.drawHealthDataTableCell(regionData, 'preventable_hospital_stays_value', '0,0');
            s += this.drawHealthDataTableCell(regionData, 'diabetic_screening_value', '0.0%');
            s += this.drawHealthDataTableCell(regionData, 'mammography_screening_value', '0.0%');
            s += '</tr>';
        }

        $('#rwjf-county-health-clinical-care-table').html(s);
    };

    drawHealthSocialEconomicFactorsTable(data) {

        var s = '<tr>';
        s += '<th class=\'empty\'></th>';
        s += '<th colspan=\'9\'>Social &amp; Economic Factors</th>';
        s += '</tr>';

        s += '<tr>';
        s += '<td class=\'empty\'></td>';
        s += '<td class=\'category-header\'>High School Graduation</td>';
        s += '<td class=\'category-header\'>Some College</td>';
        s += '<td class=\'category-header\'>Unemployment</td>';
        s += '<td class=\'category-header\'>Children in Poverty</td>';
        s += '<td class=\'category-header\'>Income Inequality</td>';
        s += '<td class=\'category-header\'>Children in Single-Parent Households</td>';
        s += '<td class=\'category-header\'>Social Associations</td>';
        s += '<td class=\'category-header\'>Violent Crime</td>';
        s += '<td class=\'category-header\'>Injury Deaths</td>';
        s += '</tr>';

        for (var i = 0; i < this.params.regions.length; i++) {

            const regionData = data[i][0];

            s += '<tr class=\'color-' + i + '\'>';
            s += '<td>' + this.params.regions[i].name + '<div></div></td>';
            s += this.drawHealthDataTableCell(regionData, 'high_school_graduation_value', '0.0%');
            s += this.drawHealthDataTableCell(regionData, 'some_college_value', '0.0%');
            s += this.drawHealthDataTableCell(regionData, 'unemployment_value', '0.0%');
            s += this.drawHealthDataTableCell(regionData, 'children_in_poverty_value', '0.0%');
            s += this.drawHealthDataTableCell(regionData, 'income_inequality_value', '0.0');
            s += this.drawHealthDataTableCell(regionData, 'children_in_single_parent_households_value', '0.0%');
            s += this.drawHealthDataTableCell(regionData, 'social_associations_value', '0.0');
            s += this.drawHealthDataTableCell(regionData, 'violent_crime_value', '0.0');
            s += this.drawHealthDataTableCell(regionData, 'injury_deaths_value', '0.0');
            s += '</tr>';
        }

        $('#rwjf-county-health-social-economic-factors-table').html(s);
    };

    drawHealthPhysicalEnvironmentTable(data) {

        var s = '<tr>';
        s += '<th class=\'empty\'></th>';
        s += '<th colspan=\'5\'>Physical Environment</th>';
        s += '</tr>';

        s += '<tr>';
        s += '<td class=\'empty\'></td>';
        s += '<td class=\'category-header\'>Air Pollution - Particulate Matter</td>';
        s += '<td class=\'category-header\'>Drinking Water Violations</td>';
        s += '<td class=\'category-header\'>Severe Housing Problems</td>';
        s += '<td class=\'category-header\'>Driving Alone to Work</td>';
        s += '<td class=\'category-header\'>Long Commute - Driving Alone</td>';
        s += '</tr>';

        for (var i = 0; i < this.params.regions.length; i++) {

            const regionData = data[i][0];

            s += '<tr class=\'color-' + i + '\'>';
            s += '<td>' + this.params.regions[i].name + '<div></div></td>';
            s += this.drawHealthDataTableCell(regionData, 'air_pollution_particulate_matter_value', '0.0');
            s += this.drawHealthDataTableCell(regionData, 'drinking_water_violations_value', '0.0%');
            s += this.drawHealthDataTableCell(regionData, 'severe_housing_problems_value', '0.0%');
            s += this.drawHealthDataTableCell(regionData, 'driving_alone_to_work_value', '0.0%');
            s += this.drawHealthDataTableCell(regionData, 'long_commute_driving_alone_value', '0.0%');
            s += '</tr>';
        }

        $('#rwjf-county-health-physical-environment-table').html(s);
    };

    drawHealthDataTableCell(data, key, format) {

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
                .then(data => this.drawEducationTable(data))
                .catch(error => console.error(error));
        });
    }

    drawEducationTable(data) {

        var s = '<tr>';
        s += '<td class=\'empty\'></td>';
        s += '<td class=\'category-header\'>At Least Bachelor\'s Degree<br>(Percent)</td>';
        s += '<td class=\'category-header\'>At Least Bachelor\'s Degree<br>(Percentile)</td>';
        s += '<td class=\'category-header\'>At Least High School Diploma<br>(Percent)</td>';
        s += '<td class=\'category-header\'>At Least High School Diploma<br>(Percentile)</td>';
        s += '</tr>';

        for (var i = 0; i < data.length; i++) {

            const regionData = data[i][0];

            s += '<tr class=\'color-' + i + '\'>'
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

        $('#education-table').html(s);
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
                .then(data => this.drawOccupationsTable(data))
                .catch(error => console.error(error));
        });
    }

    drawOccupationsTable(data) {

        var s = '<tr>'
        s += '<th class=\'empty\'></th>';

        for (var i = 0; i < this.params.regions.length; i++) {
            s += '<th colspan=\'2\' class=\'color-' + i + '\'>' + this.params.regions[i].name + '<div></div></th>';
        }

        s += '</tr>'

        // Sub header
        //
        s += '<tr><td class=\'empty\'></td>';

        for (var i = 0; i < this.params.regions.length; i++) {
            s += '<td>Percent</td><td class=\'color-' + i + '\'>Percentile<div></div></td>';
        }

        for (var i = 0; i < data[0].length; i++) {

            s += '<tr><td class=\'category-header\'>' + data[0][i].occupation + '</td>';

            for (var j = 0; j < this.params.regions.length; j++) {

                const regionData = data[j];
                const totalRanks = parseInt(regionData[i].total_ranks);
                const rank = parseInt(regionData[i].percent_employed_rank);
                const percentile = parseInt(((totalRanks - rank) / totalRanks) * 100);

                s += '<td>' + numeral(regionData[i].percent_employed).format('0.0') + '%</td>';
                s += '<td class=\'color-' + j + '\'>' + numeral(percentile).format('0o') + '<div></div></td>';
            }

            s += '</tr>';
        }

        $('#occupations-table').html(s);
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

            const feature = {
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
