

class TopoModel {
    static get(region) {
       const url = MapConstants.TOPOJSON_DIRECTORY +
                   region.topo +
                   MapConstants.TOPOJSON_SUFFIX;

        return $.getJSON(url);
    }
}


class MapModel {
    constructor(source, region, variable, regions) {
        this.source = source;
        this.region = region;
        this.variable = variable;
        this.regions = regions;
        this.regionById = MapModel.makeLookup(regions, region => region.id);
    }

    static makeLookup(list, key) {
        const lookup = new Map();
        _.each(list, element => lookup.set(key(element), element));
        return lookup;
    }

    static create(source, region, variable) {
        return new Promise((resolve, reject) => {
            const baseParams = {
                'type': region.id,
                '$select': ['id', 'type', 'name'].concat([variable.column]).join(),
                '$limit': Constants.LIMIT
            };

            const params = _.extend({}, baseParams, variable.params);
            const url = `https://${source.domain}/resource/${source.fxf}.json?${$.param(params)}`;

            function success(results) {
                const regions = results.map(region => {
                    const value = variable.value(region[variable.column]);

                    return {
                        id: region.id,
                        type: region.type,
                        name: region.name,
                        value: value,
                        valueFormatted: variable.format(value)
                    };
                });

                resolve(new MapModel(source, region, variable, regions));
            }

            function failure(error) {
                throw error;
            }

            $.getJSON(url).then(success, failure);
        });
    }
}

