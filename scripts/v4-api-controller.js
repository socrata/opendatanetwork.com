class ApiController {

    constructor() {

        this.autoCompleteNameSuggestUrl = 'https://federal.demo.socrata.com/views/7g2b-8brv/columns/autocomplete_name/suggest/{0}?size=10&fuzz=0';
        this.categoriesUrl = '/categories.json';
        this.costOfLivingUrl = 'https://federal.demo.socrata.com/resource/hpnf-gnfu.json?$order=name&$where=';
        this.domainsUrl = 'https://api.us.socrata.com/api/catalog/v1/domains';
        this.earningsUrl = 'https://federal.demo.socrata.com/resource/wmwh-4vak.json?$where=';
        this.educationUrl = 'https://federal.demo.socrata.com/resource/uf4m-5u8r.json?$where=';
        this.gdpUrl = 'https://federal.demo.socrata.com/resource/ks2j-vhr8.json?$where=';
        this.mostPopulousRegionTypeUrl = 'https://federal.demo.socrata.com/resource/eyae-8jfy?parent_id={0}&child_type={1}&$limit={2}&$order=child_population desc';
        this.occupationsUrl = 'https://federal.demo.socrata.com/resource/qfcm-fw3i.json?$order=occupation&$where=';
        this.parentStateUrl = 'https://federal.demo.socrata.com/resource/eyae-8jfy?parent_type=state&child_id={0}';
        this.placesInRegionUrl = 'https://federal.demo.socrata.com/resource/eyae-8jfy?parent_id=';
        this.populationUrl = 'https://federal.demo.socrata.com/resource/e3rd-zzmr.json?$order=year,name&$where=';
        this.similarRegionsUrl = 'https://socrata-peers.herokuapp.com/peers.json?vectors=population_change,earnings,occupation,education,population&n=10&id=';
    }

    getParentState(region) {

        return d3.promise.json(this.parentStateUrl.format(region.id))
            .catch(error => console.error(error));
    }
    
    getPlacesAndCountiesInState(stateId, limit = 10) {

        var placesPromise = d3.promise.json(this.mostPopulousRegionTypeUrl.format(stateId, 'place', limit));
        var countiesPromise = d3.promise.json(this.mostPopulousRegionTypeUrl.format(stateId, 'county', limit));

        return Promise.all([placesPromise, countiesPromise])
            .then(values => Promise.resolve(values[0].concat(values[1])))
            .catch(error => console.error(error));
    }
    
    getCountiesInState(stateId, limit = 10) {

        return d3.promise.json(this.mostPopulousRegionTypeUrl.format(stateId, 'county', limit))
            .catch(error => console.error(error));
    }
    
    getMetrosInState(stateId, limit = 10) {

        return d3.promise.json(this.mostPopulousRegionTypeUrl.format(stateId, 'msa', limit))
            .catch(error => console.error(error));
    }

    getPlacesInState(stateId, limit = 10) {

        return d3.promise.json(this.mostPopulousRegionTypeUrl.format(stateId, 'place', limit))
            .catch(error => console.error(error));
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

    getSimilarRegions(regionId, completionHandler) {

        $.getJSON(this.similarRegionsUrl + regionId, completionHandler);
    }
}