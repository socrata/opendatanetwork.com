

class TopoModel {
    static get(region) {
       const url = MapConstants.TOPOJSON_DIRECTORY +
                   region.topo +
                   MapConstants.TOPOJSON_SUFFIX;

        return $.getJSON(url);
    }
}


class MapModel {
    static regionData(source, region, variable) {
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

                resolve(regions);
            }

            function failure(error) {
                throw error;
            }

            $.getJSON(url).then(success, failure);
        });
    }
}

const testSource = {
    name: 'population',
    domain: 'odn.data.socrata.com',
    fxf: 'e3rd-zzmr'
};

const testVariable = {
    name: 'population 2013',
    column: 'population',
    params: {'year': 2013},
    value: parseFloat,
    format: a => a
};


MapModel.regionData(testSource, MapConstants.REGIONS.state, testVariable)
    .then(regions => console.log(regions));

