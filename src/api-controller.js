class ApiController {

    constructor() {

        this.categoriesUrl = '/categories.json';
        this.childRegionsUrl = 'https://odn.data.socrata.com/resource/eyae-8jfy?parent_id={0}&$limit={1}';
        this.costOfLivingUrl = 'https://odn.data.socrata.com/resource/hpnf-gnfu.json?$order=name&$where=';
        this.datasetSummaryUrl = 'https://{0}/api/views/{1}.json';
        this.domainsUrl = 'https://api.us.socrata.com/api/catalog/v1/domains';
        this.earningsByPlaceUrl = 'https://odn.data.socrata.com/resource/wmwh-4vak.json/?type=place&$limit=50000&$where=population%20%3E%205000';
        this.earningsUrl = 'https://odn.data.socrata.com/resource/wmwh-4vak.json?$where=';
        this.educationByPlaceUrl = 'https://odn.data.socrata.com/resource/uf4m-5u8r.json?type=place&$limit=50000&$where=population%20%3E%205000';
        this.educationUrl = 'https://odn.data.socrata.com/resource/uf4m-5u8r.json?$where=';
        this.gdpUrl = 'https://odn.data.socrata.com/resource/ks2j-vhr8.json?$where=';
        this.mostPopulousRegionTypeUrl = 'https://odn.data.socrata.com/resource/eyae-8jfy?parent_id={0}&child_type={1}&$limit={2}&$order=child_population desc';
        this.occupationsByPlaceUrl = 'https://odn.data.socrata.com/resource/qfcm-fw3i.json?occupation={0}&type=place&$limit=50000&$where=population%20%3E%205000';
        this.occupationsUrl = 'https://odn.data.socrata.com/resource/qfcm-fw3i.json?$order=occupation&$where=';
        this.parentStateUrl = 'https://odn.data.socrata.com/resource/eyae-8jfy?parent_type=state&child_id={0}';
        this.placeFromRosterUrl = 'https://odn.data.socrata.com/resource/kmnh-b5wu?id={0}';
        this.placesUrl = 'https://odn.data.socrata.com/resource/gm3u-gw57.json/?type=place&$limit=50000&$where=population%20%3E%205000';
        this.populationUrl = 'https://odn.data.socrata.com/resource/e3rd-zzmr.json?$order=year,name&$where=';
        this.similarRegionsUrl = 'https://socrata-peers.herokuapp.com/peers.json?id={0}&vectors={1}&n=10';
        this.supportedVectorsUrls = 'https://socrata-peers.herokuapp.com/supported.json?id={0}';
        this.healthDataUrls = {
            rwjf_county_health_rankings_2015: "https://odn.data.socrata.com/resource/7ayp-utp2.json?$where=",
            cdc_brfss_prevalence_2011_2013: "https://odn.data.socrata.com/resource/n4rt-3rmd.json?$where="
        };
    }

    // Promises
    //
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

    getDatasetSummary(domain, id) {

        return d3.promise.json(this.datasetSummaryUrl.format(domain, id));
    }

    getDomains() {

        return d3.promise.json(this.domainsUrl);
    }

    getEarningsByPlace() {

        return d3.promise.json(this.earningsByPlaceUrl);
    }

    getEarningsData(regionIds) {

        return this.getData(this.earningsUrl, regionIds);
    }

    getEducationByPlace() {

        return d3.promise.json(this.educationByPlaceUrl);
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

    getOccupationsByPlace(occupation) {

        return d3.promise.json(this.occupationsByPlaceUrl.format(occupation));
    }

    getOccupationsData(regionIds) {

        return this.getData(this.occupationsUrl, regionIds);
    }

    getParentState(region) {

        return d3.promise.json(this.parentStateUrl.format(region.id));
    }

    getPlaceFromRoster(regionId) {

        return d3.promise.json(this.placeFromRosterUrl.format(regionId));
    }

    getPopulationData(regionIds) {

        return this.getData(this.populationUrl, regionIds);
    }

    getPlaces() {

        return d3.promise.json(this.placesUrl);
    }

    getSimilarRegions(regionId, vectors) {

        return d3.promise.json(this.similarRegionsUrl.format(regionId, vectors.join(',')));
    }

    getSupportedVectors(regionId) {

        return d3.promise.json(this.supportedVectorsUrls.format(regionId));
    }

    // health data retrievers
    getHealthRwjfChrData(regionIds) {
        return this.getData(this.healthDataUrls.rwjf_county_health_rankings_2015, regionIds);
    }
}
