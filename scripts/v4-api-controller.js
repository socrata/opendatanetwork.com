// ApiController
//
function ApiController() {

    this.autoCompleteNameSuggestUrl = 'https://federal.demo.socrata.com/views/7g2b-8brv/columns/autocomplete_name/suggest/{0}?size=10&fuzz=0';
    this.costOfLivingUrl = 'https://federal.demo.socrata.com/resource/hpnf-gnfu.json?$where=';
    this.educationUrl = 'https://federal.demo.socrata.com/resource/uf4m-5u8r.json/?id=';
    this.gdpUrl = 'https://federal.demo.socrata.com/resource/ks2j-vhr8.json/?type=state&$limit=50000&year=2013&$order=name';
    this.occupationsUrl = 'https://federal.demo.socrata.com/resource/qfcm-fw3i.json?$order=occupation&$where=';
    this.populationUrl = 'https://federal.demo.socrata.com/resource/e3rd-zzmr.json?$order=year,name&$where=';
    this.earningsUrl = 'https://federal.demo.socrata.com/resource/wmwh-4vak.json?$where=';
    this.educationUrl = 'https://federal.demo.socrata.com/resource/uf4m-5u8r.json?$where=';
}

ApiController.prototype.getAutoCompleteNameSuggestions = function(searchTerm, completion) {

    $.getJSON(this.autoCompleteNameSuggestUrl.format(encodeURIComponent(searchTerm)), completion);
};

ApiController.prototype.getCostOfLivingData = function(regionIds, completion) {

    this.getData(this.costOfLivingUrl, regionIds, completion);
};

ApiController.prototype.getEarningsData = function(regionIds, completion) {

    this.getData(this.earningsUrl, regionIds, completion);
};

ApiController.prototype.getEducationData = function(regionIds, completion) {

    this.getData(this.educationUrl, regionIds, completion);
};

ApiController.prototype.getGdpData = function() {

    $.getJSON(this.gdpUrl, function(data) {

        var items = data.map(function(item) {
            return '<li>' + item.name + ' : $' + item.per_capita_gdp + '</li>'; 
        });

        $('.gdp').html(items.join(''));
    });
};

ApiController.prototype.getOccupationsData = function(regionIds, completion) {

    this.getData(this.occupationsUrl, regionIds, completion);
};

ApiController.prototype.getPopulationData = function(regionIds, completion) {

    this.getData(this.populationUrl, regionIds, completion);
};

ApiController.prototype.getData = function(url, regionIds, completion) {

    var segments = regionIds.map(function(regionId) {
       return 'id=\'' + regionId + '\''; 
    });

    console.log(url + encodeURI(segments.join(' OR ')));

    $.getJSON(url + encodeURI(segments.join(' OR ')), completion);
};
