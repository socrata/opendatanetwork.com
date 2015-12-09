class ApiController {

    constructor() {

        this.categoriesUrl = '/categories.json';
        this.childRegionsUrl = 'https://odn.data.socrata.com/resource/eyae-8jfy?parent_id={0}&$limit={1}';
        this.costOfLivingUrl = 'https://odn.data.socrata.com/resource/hpnf-gnfu.json?id={0}';
        this.datasetSummaryUrl = 'https://{0}/api/views/{1}.json';
        this.domainsUrl = 'https://api.us.socrata.com/api/catalog/v1/domains';
        this.earningsUrl = 'https://odn.data.socrata.com/resource/wmwh-4vak.json?id={0}';
        this.educationUrl = 'https://odn.data.socrata.com/resource/uf4m-5u8r.json?id={0}';
        this.gdpUrl = 'https://odn.data.socrata.com/resource/ks2j-vhr8.json?id={0}';
        this.mostPopulousRegionTypeUrl = 'https://odn.data.socrata.com/resource/eyae-8jfy?parent_id={0}&child_type={1}&$limit={2}&$order=child_population desc';
        this.mostPopulousStatesUrl = 'https://odn.data.socrata.com/resource/eyae-8jfy?$where=child_type=\'state\'&$order=child_population desc&$limit={0}';
        this.occupationsUrl = 'https://odn.data.socrata.com/resource/qfcm-fw3i.json?$order=occupation&id={0}';
        this.parentStateUrl = 'https://odn.data.socrata.com/resource/eyae-8jfy?parent_type=state&child_id={0}';
        this.populationUrl = 'https://odn.data.socrata.com/resource/e3rd-zzmr.json?id={0}';
        this.similarRegionsUrl = 'https://socrata-peers.herokuapp.com/peers.json?id={0}&vectors={1}&n=5';
        this.supportedVectorsUrls = 'https://socrata-peers.herokuapp.com/supported.json?id={0}';
        this.healthDataUrls = {
            rwjf_county_health_rankings_2015: "https://odn.data.socrata.com/resource/7ayp-utp2.json?id={0}",
            cdc_brfss_prevalence_2011_2013: "https://odn.data.socrata.com/resource/n4rt-3rmd.json?id={0}"
        };
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

    getCostOfLivingData(regionId) {

        return d3.promise.json(this.costOfLivingUrl.format(regionId));
    }

    getCountiesInState(stateId, limit = 10) {

        return d3.promise.json(this.mostPopulousRegionTypeUrl.format(stateId, 'county', limit));
    }

    getDatasetSummary(domain, id) {

        return d3.promise.json(this.datasetSummaryUrl.format(domain, id));
    }

    getDomains() {

        return d3.promise.json(this.domainsUrl);
    }

    getEarningsData(regionId) {

        return d3.promise.json(this.earningsUrl.format(regionId));
    }

    getEducationData(regionId) {

        return d3.promise.json(this.educationUrl.format(regionId));
    }

    getGdpData(regionId) {

        return d3.promise.json(this.gdpUrl.format(regionId));
    }

    getMetrosInState(stateId, limit = 10) {

        return d3.promise.json(this.mostPopulousRegionTypeUrl.format(stateId, 'msa', limit));
    }

    getMostPopulousStates(limit = 8) {

        return d3.promise.json(this.mostPopulousStatesUrl.format(limit));
    }

    getOccupationsData(regionId) {

        return d3.promise.json(this.occupationsUrl.format(regionId));
    }

    getParentState(region) {

        return d3.promise.json(this.parentStateUrl.format(region.id));
    }

    getPopulationData(regionId) {

        return d3.promise.json(this.populationUrl.format(regionId));
    }

    getSimilarRegions(regionId, vectors) {

        return d3.promise.json(this.similarRegionsUrl.format(regionId, vectors.join(',')));
    }

    getSupportedVectors(regionId) {

        return d3.promise.json(this.supportedVectorsUrls.format(regionId));
    }

    getHealthRwjfChrData(regionId) {

        return d3.promise.json(this.healthDataUrls.rwjf_county_health_rankings_2015.format(regionId));
    }
}
