// ApiController
//
function ApiController() {

    this.autoCompleteNameSuggestUrl = 'https://federal.demo.socrata.com/views/7g2b-8brv/columns/autocomplete_name/suggest/{0}?size=10&fuzz=0';
    this.costOfLivingUrl = 'https://federal.demo.socrata.com/resource/hpnf-gnfu.json/?type=state&$limit=50000&year=2013&component=All&$order=name';
    this.educationUrl = 'https://federal.demo.socrata.com/resource/uf4m-5u8r.json/?id=';
    this.gdpUrl = 'https://federal.demo.socrata.com/resource/ks2j-vhr8.json/?type=state&$limit=50000&year=2013&$order=name';
    this.occupationsUrl = 'https://federal.demo.socrata.com/resource/qfcm-fw3i.json/?id=';
    this.populationUrl = 'https://federal.demo.socrata.com/resource/e3rd-zzmr.json?$order=year,name&$where='; //id='1600000US5363000' OR id='1600000US4159000'
    this.earningsUrl = 'https://federal.demo.socrata.com/resource/wmwh-4vak.json/?$where=';
    this.educationUrl = 'https://federal.demo.socrata.com/resource/uf4m-5u8r.json/?$where=';
}

ApiController.prototype.getAutoCompleteNameSuggestions = function(searchTerm, completion) {

    $.getJSON(this.autoCompleteNameSuggestUrl.format(encodeURIComponent(searchTerm)), completion);
};

ApiController.prototype.getCostOfLivingData = function() {

    $.getJSON(this.costOfLivingUrl, function(data) {

        var items = data.map(function(item) {
            return '<li>' + item.name + ' : ' + item.index + '</li>'; 
        });

        $('.costOfLiving').html(items.join(''));
    });
};

ApiController.prototype.getEarningsData = function(regionIds, completion) {

    var segments = regionIds.map(function(regionId) {
       return 'id=\'' + regionId + '\''; 
    });

    $.getJSON(this.earningsUrl + encodeURI(segments.join(' OR ')), completion);
};

ApiController.prototype.getEducationData = function(regionIds, completion) {

    var segments = regionIds.map(function(regionId) {
       return 'id=\'' + regionId + '\''; 
    });

    console.log(this.educationUrl + encodeURI(segments.join(' OR ')));

    $.getJSON(this.educationUrl + encodeURI(segments.join(' OR ')), completion);
};

ApiController.prototype.getGdpData = function() {

    $.getJSON(this.gdpUrl, function(data) {

        var items = data.map(function(item) {
            return '<li>' + item.name + ' : $' + item.per_capita_gdp + '</li>'; 
        });

        $('.gdp').html(items.join(''));
    });
};

ApiController.prototype.getOccupationsData = function(id) {

    $.getJSON(this.occupationsUrl + id, function(data) {

        var items = data.map(function(item) {
            return '<li>' + item.occupation + ' : ' + item.employed + ' : ' + Math.floor((item.employed / item.total_employed) * 100) + '%</li>'; 
        });

        $('.occupations').html(items.join(''));
    });
};

ApiController.prototype.getPopulationData = function(regionIds, completion) {

    var segments = regionIds.map(function(regionId) {
       return 'id=\'' + regionId + '\''; 
    });

    $.getJSON(this.populationUrl + encodeURI(segments.join(' OR ')), completion);
};
