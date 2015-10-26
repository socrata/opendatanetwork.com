// ApiController
//
function ApiController() {

    this.autoCompleteNameSuggestUrl = 'https://federal.demo.socrata.com/views/7g2b-8brv/columns/autocomplete_name/suggest/{0}?size=10&fuzz=0';
    this.populationUrl = 'https://federal.demo.socrata.com/resource/e3rd-zzmr.json/?id=';
    this.educationUrl = 'https://federal.demo.socrata.com/resource/uf4m-5u8r.json/?id=';
    this.earningsUrl = 'https://federal.demo.socrata.com/resource/wmwh-4vak.json/?id=';
    this.occupationsUrl = 'https://federal.demo.socrata.com/resource/qfcm-fw3i.json/?id=';
    this.gdpUrl = 'https://federal.demo.socrata.com/resource/ks2j-vhr8.json/?type=state&$limit=50000&year=2013&$order=name';
    this.costOfLivingUrl = 'https://federal.demo.socrata.com/resource/hpnf-gnfu.json/?type=state&$limit=50000&year=2013&component=All&$order=name';
}

ApiController.prototype.getAutoCompleteNameSuggestions = function(searchTerm, completion) {

    var url = this.autoCompleteNameSuggestUrl.format(encodeURIComponent(searchTerm));

    $.getJSON(url, function(data) {
        
        console.log('getAutoCompleteNameSuggestions returned');
        if (completion) completion(data); 
    });
};

ApiController.prototype.getPopulationData = function(id, completion) {

    $.getJSON(this.populationUrl + id, function(data) {

        var items = data.map(function(item) {
            return '<li>' + item.year + ' : ' + item.population + '</li>'; 
        });

        $('.population').html(items.join(''));

        if (completion) completion(data);
    });
}

ApiController.prototype.getPopulationChangeData = function(id, completion) {

    $.getJSON(this.populationUrl + id, function(data) {

        var items = data.map(function(item) {
            return '<li>' + item.year + ' : ' + item.population_percent_change + '%</li>'; 
        });

        $('.population-change').html(items.join(''));

        if (completion) completion(data);
    });
}

ApiController.prototype.getEducationData = function(id) {

    $.getJSON(this.educationUrl + id, function(data) {

        var s = '<li>High school or higher : ' + data[0].percent_high_school_graduate_or_higher + '%</li>';
        s += '<li>Bachelor\'s or higher : ' + data[0].percent_bachelors_degree_or_higher + '%</li>';

        $('.education').html(s);
    });
}

ApiController.prototype.getEarningsData = function(id) {

    $.getJSON(this.earningsUrl + id, function(data) {

        var s = '<li>Median Earnings (All Workers) : $' + data[0].median_earnings + '</li>';
        s += '<li>Median Female Earnings (Full Time) : $' + data[0].female_full_time_median_earnings + '</li>';
        s += '<li>Median Male Earnings (Full Time) : $' + data[0].male_full_time_median_earnings + '</li>';

        $('.earnings').html(s);
    });
}

ApiController.prototype.getOccupationsData = function(id) {

    $.getJSON(this.occupationsUrl + id, function(data) {

        var items = data.map(function(item) {
            return '<li>' + item.occupation + ' : ' + item.employed + ' : ' + Math.floor((item.employed / item.total_employed) * 100) + '%</li>'; 
        });

        $('.occupations').html(items.join(''));
    });
}

ApiController.prototype.getGdpData = function() {

    $.getJSON(this.gdpUrl, function(data) {

        var items = data.map(function(item) {
            return '<li>' + item.name + ' : $' + item.per_capita_gdp + '</li>'; 
        });

        $('.gdp').html(items.join(''));
    });
}

ApiController.prototype.getCostOfLivingData = function() {

    $.getJSON(this.costOfLivingUrl, function(data) {

        var items = data.map(function(item) {
            return '<li>' + item.name + ' : ' + item.index + '</li>'; 
        });

        $('.costOfLiving').html(items.join(''));
    });
}
