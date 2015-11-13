class ApiController {

    constructor() {

        this.autoCompleteNameSuggestUrl = 'https://federal.demo.socrata.com/views/7g2b-8brv/columns/autocomplete_name/suggest/{0}?size=10&fuzz=0';
        this.categoriesUrl = '/categories.json';
        this.childRegionsUrl = 'https://federal.demo.socrata.com/resource/eyae-8jfy?parent_id={0}&$limit={1}';
        this.costOfLivingUrl = 'https://federal.demo.socrata.com/resource/hpnf-gnfu.json?$order=name&$where=';
        this.domainsUrl = 'https://api.us.socrata.com/api/catalog/v1/domains';
        this.earningsUrl = 'https://federal.demo.socrata.com/resource/wmwh-4vak.json?$where=';
        this.educationUrl = 'https://federal.demo.socrata.com/resource/uf4m-5u8r.json?$where=';
        this.gdpUrl = 'https://federal.demo.socrata.com/resource/ks2j-vhr8.json?$where=';
        this.mostPopulousRegionTypeUrl = 'https://federal.demo.socrata.com/resource/eyae-8jfy?parent_id={0}&child_type={1}&$limit={2}&$order=child_population desc';
        this.occupationsUrl = 'https://federal.demo.socrata.com/resource/qfcm-fw3i.json?$order=occupation&$where=';
        this.parentStateUrl = 'https://federal.demo.socrata.com/resource/eyae-8jfy?parent_type=state&child_id={0}';
        this.populationUrl = 'https://federal.demo.socrata.com/resource/e3rd-zzmr.json?$order=year,name&$where=';
        this.similarRegionsUrl = 'https://socrata-peers.herokuapp.com/peers.json?vectors=population_change,earnings,occupation,education,population&n=10&id={0}';
    }

    // Promises
    //
    getAutoCompleteNameSuggestions(searchTerm) {

        return d3.promise.json(this.autoCompleteNameSuggestUrl.format(encodeURIComponent(searchTerm)));
    }

    getCategories() {

        return d3.promise.json(this.categoriesUrl);
    }

    getChildRegions(regionId, limit = 10) {

        return d3.promise.json(this.childRegionsUrl.format(regionId, limit));
    }

    getCitiesInState(stateId, limit = 10) {

        return d3.promise.json(this.mostPopulousRegionTypeUrl.format(stateId, 'place', limit));
    }

    getCostOfLivingData(regionIds) {

        return this.getData(this.costOfLivingUrl, regionIds);
    }

    getCountiesInState(stateId, limit = 10) {

        return d3.promise.json(this.mostPopulousRegionTypeUrl.format(stateId, 'county', limit));
    }
    
    getData(url, regionIds) {

        var segments = regionIds.map(function(regionId) {
            return 'id=\'' + regionId + '\''; 
        });

        return d3.promise.json(url + encodeURI(segments.join(' OR ')));
    }

    getDomains() {

        return d3.promise.json(this.domainsUrl);
    }

    getEarningsData(regionIds) {

        return this.getData(this.earningsUrl, regionIds);
    }

    getEducationData(regionIds) {

        return this.getData(this.educationUrl, regionIds);
    }

    getGdpData(regionIds) {

        return this.getData(this.gdpUrl, regionIds);
    }

    getMetrosInState(stateId, limit = 10) {

        return d3.promise.json(this.mostPopulousRegionTypeUrl.format(stateId, 'msa', limit));
    }

    getOccupationsData(regionIds) {

        return this.getData(this.occupationsUrl, regionIds);
    }

    getParentState(region) {

        return d3.promise.json(this.parentStateUrl.format(region.id));
    }

    getPopulationData(regionIds) {

        return this.getData(this.populationUrl, regionIds);
    }

    getSimilarRegions(regionId) {

        return d3.promise.json(this.similarRegionsUrl.format(regionId));
    }
}