// ApiController
//
function ApiController() {

    this.autoCompleteNameSuggestUrl = 'https://federal.demo.socrata.com/views/7g2b-8brv/columns/autocomplete_name/suggest/{0}?size=10&fuzz=0';
    this.categoriesUrl = '/categories.json';
    this.costOfLivingUrl = 'https://federal.demo.socrata.com/resource/hpnf-gnfu.json?$order=name&$where=';
    this.domainsUrl = 'https://api.us.socrata.com/api/catalog/v1/domains';
    this.earningsUrl = 'https://federal.demo.socrata.com/resource/wmwh-4vak.json?$where=';
    this.educationUrl = 'https://federal.demo.socrata.com/resource/uf4m-5u8r.json?$where=';
    this.gdpUrl = 'https://federal.demo.socrata.com/resource/ks2j-vhr8.json?$where=';
    this.occupationsUrl = 'https://federal.demo.socrata.com/resource/qfcm-fw3i.json?$order=occupation&$where=';
    this.placesInRegionUrl = 'https://federal.demo.socrata.com/resource/eyae-8jfy?parent_id=';
    this.populationUrl = 'https://federal.demo.socrata.com/resource/e3rd-zzmr.json?$order=year,name&$where=';
    this.similarRegionsUrl = 'https://socrata-peers.herokuapp.com/peers.json?vectors=population_change,earnings,occupation,education,geo,population&n=5&id=';
}

ApiController.prototype.getAutoCompleteNameSuggestions = function(searchTerm, completionHandler) {

    $.getJSON(this.autoCompleteNameSuggestUrl.format(encodeURIComponent(searchTerm)), completionHandler);
};

ApiController.prototype.getCostOfLivingData = function(regionIds, completionHandler) {

    this.getData(this.costOfLivingUrl, regionIds, completionHandler);
};

ApiController.prototype.getEarningsData = function(regionIds, completionHandler) {

    this.getData(this.earningsUrl, regionIds, completionHandler);
};

ApiController.prototype.getEducationData = function(regionIds, completionHandler) {

    this.getData(this.educationUrl, regionIds, completionHandler);
};

ApiController.prototype.getGdpData = function(regionIds, completionHandler) {

    this.getData(this.gdpUrl, regionIds, completionHandler);
};

ApiController.prototype.getOccupationsData = function(regionIds, completionHandler) {

    this.getData(this.occupationsUrl, regionIds, completionHandler);
};

ApiController.prototype.getPopulationData = function(regionIds, completionHandler) {

    this.getData(this.populationUrl, regionIds, completionHandler);
};

ApiController.prototype.getData = function(url, regionIds, completionHandler) {

    var segments = regionIds.map(function(regionId) {
       return 'id=\'' + regionId + '\''; 
    });

    console.log(url + encodeURI(segments.join(' OR ')));

    $.getJSON(url + encodeURI(segments.join(' OR ')), completionHandler);
};

ApiController.prototype.getDomains = function(completionHandler) {

    $.getJSON(this.domainsUrl, completionHandler);
};

ApiController.prototype.getCategories = function(completionHandler) {

    $.getJSON(this.categoriesUrl, completionHandler);
};

ApiController.prototype.getPlacesInRegion = function(regionId, completionHandler) {

    $.getJSON(this.placesInRegionUrl + regionId, completionHandler);
};

ApiController.prototype.getSimilarRegions = function(regionId, completionHandler) {

    $.getJSON(this.similarRegionsUrl + regionId, completionHandler);
};
