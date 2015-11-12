class ApiController {

    constructor() {

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
        this.similarRegionsUrl = 'https://socrata-peers.herokuapp.com/peers.json?vectors=population_change,earnings,occupation,education,population&n=5&id=';
    }

    getAutoCompleteNameSuggestions(searchTerm, completionHandler) {

        $.getJSON(this.autoCompleteNameSuggestUrl.format(encodeURIComponent(searchTerm)), completionHandler);
    }

    getCostOfLivingData(regionIds, completionHandler) {

        this.getData(this.costOfLivingUrl, regionIds, completionHandler);
    }

    getEarningsData(regionIds, completionHandler) {

        this.getData(this.earningsUrl, regionIds, completionHandler);
    }

    getEducationData(regionIds, completionHandler) {

        this.getData(this.educationUrl, regionIds, completionHandler);
    }

    getGdpData(regionIds, completionHandler) {

        this.getData(this.gdpUrl, regionIds, completionHandler);
    }

    getOccupationsData(regionIds, completionHandler) {

        this.getData(this.occupationsUrl, regionIds, completionHandler);
    }

    getPopulationData(regionIds, completionHandler) {

        this.getData(this.populationUrl, regionIds, completionHandler);
    }

    getData(url, regionIds, completionHandler) {

        var segments = regionIds.map(function(regionId) {
            return 'id=\'' + regionId + '\''; 
        });

        $.getJSON(url + encodeURI(segments.join(' OR ')), completionHandler);
    }

    getDomains(completionHandler) {

        $.getJSON(this.domainsUrl, completionHandler);
    }

    getCategories(completionHandler) {

        $.getJSON(this.categoriesUrl, completionHandler);
    }

    getPlacesInRegion(regionId, completionHandler) {

        $.getJSON(this.placesInRegionUrl + regionId, completionHandler);
    }

    getSimilarRegions(regionId, completionHandler) {

        $.getJSON(this.similarRegionsUrl + regionId, completionHandler);
    }
}