
function buildURL(path, params) {
    return `${path}?${$.param(params)}`;
}

class Geocode {
    /**
     * Adds a `coordinate` field to each of the given regions.
     * If no coordinates are found for a region, that region will not
     * be included in the repsonse.
     */
    static regions(regions) {
        return new Promise((resolve, reject) => {
            d3.promise.json(buildURL(MapConstants.GEOCODE_URL, {
                '$select': 'id,location',
                '$where': `id in (${regions.map(region => `'${region.id}'`)})`
            })).then(response => {
                const locations = _.indexBy(response, _.property('id'));
                const geocoded = regions
                    .filter(region => region.id in locations)
                    .map(region => _.extend(region, {
                        coordinates: locations[region.id].location.coordinates
                    }));

                resolve(geocoded);
            }, reject);
        });
    }
}

