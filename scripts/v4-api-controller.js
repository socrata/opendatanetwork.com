class ApiController {

    constructor() {

        this.autoCompleteNameSuggestUrl = 'https://odn.data.socrata.com/views/7g2b-8brv/columns/autocomplete_name/suggest/{0}?size=10&fuzz=0';
        this.categoriesUrl = '/categories.json';
        this.costOfLivingUrl = 'https://odn.data.socrata.com/resource/hpnf-gnfu.json?$order=name&$where=';
        this.domainsUrl = 'https://api.us.socrata.com/api/catalog/v1/domains';
        this.earningsUrl = 'https://odn.data.socrata.com/resource/wmwh-4vak.json?$where=';
        this.healthUrl = 'https://odn.data.socrata.com/resource/wmwh-4vak.json?$where=';
        this.educationUrl = 'https://odn.data.socrata.com/resource/uf4m-5u8r.json?$where=';
        this.gdpUrl = 'https://odn.data.socrata.com/resource/ks2j-vhr8.json?$where=';
        this.mostPopulousRegionTypeUrl = 'https://odn.data.socrata.com/resource/eyae-8jfy?parent_id={0}&child_type={1}&$limit={2}&$order=child_population desc';
        this.occupationsUrl = 'https://odn.data.socrata.com/resource/qfcm-fw3i.json?$order=occupation&$where=';
        this.parentStateUrl = 'https://odn.data.socrata.com/resource/eyae-8jfy?parent_type=state&child_id={0}';
        this.placesInRegionUrl = 'https://odn.data.socrata.com/resource/eyae-8jfy?parent_id=';
        this.populationUrl = 'https://odn.data.socrata.com/resource/e3rd-zzmr.json?$order=year,name&$where=';
        this.similarRegionsUrl = 'https://socrata-peers.herokuapp.com/peers.json?vectors=population_change,earnings,occupation,education,population&n=10&id={0}';
        this.healthDataUrls = {
            rwjf_county_health_rankings_2015: "https://odn.data.socrata.com/resource/7ayp-utp2.json?$where=",
            cdc_brfss_prevalence_2011_2013: "https://odn.data.socrata.com/resource/n4rt-3rmd.json?$where="
        }
    }

    // Promises
    //
    getCategories() {

        return d3.promise.json(this.categoriesUrl)
            .catch(error => console.error(error));
    }

    getCountiesInState(stateId, limit = 10) {

        return d3.promise.json(this.mostPopulousRegionTypeUrl.format(stateId, 'county', limit))
            .catch(error => console.error(error));
    }

    getDomains() {

        return d3.promise.json(this.domainsUrl)
            .catch(error => console.error(error));
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

    getMetrosInState(stateId, limit = 10) {

        return d3.promise.json(this.mostPopulousRegionTypeUrl.format(stateId, 'msa', limit))
            .catch(error => console.error(error));
    }

    getPlacesInState(stateId, limit = 10) {

        return d3.promise.json(this.mostPopulousRegionTypeUrl.format(stateId, 'place', limit))
            .catch(error => console.error(error));
    }

    getSimilarRegions(regionId) {

        return d3.promise.json(this.similarRegionsUrl.format(regionId))
            .catch(error => console.error(error));
    }

    // Callbacks
    //
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

    // health data retrievers
    getHealthRwjfChrData(regionIds, completionHandler) {
        this.getData(this.healthDataUrls.rwjf_county_health_rankings_2015, regionIds, completionHandler);
    }
    getHealthCdcBrfssPrevalenceData(regionIds, completionHandler) {
        this.getData(this.healthDataUrls.cdc, regionIds, completionHandler, '_geoid');
    }

    getData(url, regionIds, completionHandler, region_id_column = 'id') {

        var segments = regionIds.map(function(regionId) {
            return region_id_column+'=\'' + regionId + '\''; 
        });

        $.getJSON(url + encodeURI(segments.join(' OR ')), completionHandler);
    }
}