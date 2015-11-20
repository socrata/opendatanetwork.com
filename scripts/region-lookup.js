
class RegionLookup {
    static get(params) {
        return $.getJSON(`${Constants.ROSTER_URL}?${$.param(params)}`);
    }

    static getOne(params) {
        function selectRegion(regions) {
            if (regions.length === 0) {
                console.warn('no regions found for params: ');
                console.warn(params);
                return null;
            } else if (regions.length === 1) {
                return regions[0];
            } else {
                const places = _.filter(regions, region => region.type === 'place');

                if (places.length > 0) {
                    return places[0];
                } else {
                    return regions[0];
                }
            }
        }

        return new Promise((resolve, reject) => {
            RegionLookup.get(params)
                .then(regions => {
                          resolve(selectRegion(regions));
                      },
                      error => {
                          throw error;
                      });
        });
    }

    static byName(name) {
        return RegionLookup.getOne({name: name});
    }

    static byID(id) {
        return RegionLookup.getOne({id: id});
    }

    static byAutocompleteName(name) {
        return RegionLookup.getOne({autocomplete_name: name});
    }
}

