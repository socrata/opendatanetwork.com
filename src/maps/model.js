

class TopoModel {
    static get(region) {
       const url = MapConstants.TOPOJSON_DIRECTORY +
                   region.topo +
                   MapConstants.TOPOJSON_SUFFIX;

        return $.getJSON(url);
    }
}


class MapModel {
    constructor(source, region, variable, year, regions) {
        this.source = source;
        this.region = region;
        this.variable = variable;
        this.year = year;
        this.regions = regions;
        this.regionById = MapModel.makeLookup(regions, region => region.id);
    }

    static makeLookup(list, key) {
        const lookup = new Map();
        _.each(list, element => lookup.set(key(element), element));
        return lookup;
    }

    static create(source, region, variable, year) {
        const idColumn = source.idColumn || 'id';
        const typeColumn = source.typeColumn || 'type';
        const nameColumn = source.nameColumn || 'name';
        const yearColumn = source.yearColumn || 'year';
        const hasPopulation = source.hasPopulation || false;
        const populationColumn = source.populationColumn || 'population';

        return new Promise((resolve, reject) => {
            const baseColumns = [idColumn, typeColumn, nameColumn, yearColumn];
            const columns = baseColumns.concat([variable.column]);
            const baseParams = {
                'type': region.id,
                '$select': columns.join(),
                '$limit': Constants.LIMIT,
                [yearColumn]: year
            };
            const sortParams = hasPopulation ? {'$order': `${populationColumn} DESC`} : {};

            const params = _.extend({}, baseParams, sortParams, variable.params);
            const url = `https://${source.domain}/resource/${source.fxf}.json?${$.param(params)}`;

            function success(results) {
                const regions = results.map(region => {
                    const value = variable.value(region[variable.column]);

                    return {
                        id: region.id,
                        type: region.type,
                        name: region.name,
                        value: value,
                        valueName: variable.name,
                        valueFormatted: variable.format(value),
                        year: year
                    };
                });

                resolve(new MapModel(source, region, variable, year, regions));
            }

            function failure(error) {
                throw error;
            }

            $.getJSON(url).then(success, failure);
        });
    }

    values() {
        return this.regions.map(region => region.value);
    }

    scale(scaleFunction, range) {
        if (this.variable.reverse || false)
            range.reverse();

        return scaleFunction(this.values(), range);
    }
}

