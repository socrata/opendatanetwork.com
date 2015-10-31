// ApiController
//
function ApiController() {

    this.autoCompleteNameSuggestUrl = 'https://federal.demo.socrata.com/views/7g2b-8brv/columns/autocomplete_name/suggest/{0}?size=10&fuzz=0';
    this.costOfLivingUrl = 'https://federal.demo.socrata.com/resource/hpnf-gnfu.json?$order=name&$where=';
    this.educationUrl = 'https://federal.demo.socrata.com/resource/uf4m-5u8r.json/?id=';
    this.gdpUrl = 'https://federal.demo.socrata.com/resource/ks2j-vhr8.json?$where=';
    this.occupationsUrl = 'https://federal.demo.socrata.com/resource/qfcm-fw3i.json?$order=occupation&$where=';
    this.populationUrl = 'https://federal.demo.socrata.com/resource/e3rd-zzmr.json?$order=year,name&$where=';
    this.earningsUrl = 'https://federal.demo.socrata.com/resource/wmwh-4vak.json?$where=';
    this.educationUrl = 'https://federal.demo.socrata.com/resource/uf4m-5u8r.json?$where=';
    this.similarRegionsUrl = 'http://socrata-peers.herokuapp.com/peers.json?vectors=population_change,earnings,occupation,education,geo,population&n=5&id=';
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

ApiController.prototype.getGdpData = function(regionIds, completion) {

    this.getData(this.gdpUrl, regionIds, completion);
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

ApiController.prototype.getSimilarRegions = function(regionId, completion) {

    $.getJSON(this.similarRegionsUrl + regionId, completion);
};
