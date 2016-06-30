

class TopoModel {
    static get(region) {
        const url = MapConstants.TOPOJSON_DIRECTORY +
                    region.topo +
                    MapConstants.TOPOJSON_SUFFIX;

        return $.getJSON(url);
    }
}


class POIMapModel {
    constructor(source, variable) {
        this.source = source;
        this.locationColumn = source.locationColumn || 'location';

        this.variable = variable;
    }

    /**
     * Retrieve maximum `limit` data points in the given Leaflet LatLngBounds.
     */
    inBounds(bounds, limit) {
        limit = limit || MapConstants.LIMIT;

        return new Promise((resolve, reject) => {
            const params = _.extend({
                '$where': POIMapModel._withinBox(this.locationColumn, bounds),
                '$limit': limit
            }, this.variable.params);
            const url = `https://${this.source.domain}/resource/${this.source.fxf}.json?${$.param(params)}`;

            d3.promise.json(url).then(resolve, reject);
        });
    }

    static _withinBox(column, bounds) {
        const northwest = bounds.getNorthWest();
        const southeast = bounds.getSouthEast();
        return `within_box(${column}, ${northwest.lat}, ${northwest.lng}, ${southeast.lat}, ${southeast.lng})`;
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
        const valueFunction = source.value || parseFloat;

        return new Promise((resolve, reject) => {
            const baseColumns = [idColumn, typeColumn, nameColumn, yearColumn];
            const columns = baseColumns.concat([variable.column]);
            const baseParams = {
                [typeColumn]: region.id,
                '$select': columns.join(),
                '$limit': MapConstants.LIMIT,
                [yearColumn]: year
            };
            const sortParams = hasPopulation ? {'$order': `${populationColumn} DESC`} : {};

            const params = _.extend({}, baseParams, sortParams, variable.params);
            const url = `https://${source.domain}/resource/${source.fxf}.json?${$.param(params)}`;
            console.log(url);

            $.getJSON(url).then(results => {
                console.log(results);
                const regions = results.map(region => {
                    const value = valueFunction(region[variable.column]);

                    return {
                        id: region[idColumn],
                        type: region[typeColumn].toLowerCase(),
                        name: region[nameColumn],
                        value: value,
                        valueName: variable.name,
                        valueFormatted: variable.format(value),
                        year: year
                    };
                });

                resolve(new MapModel(source, region, variable, year, regions));
            }, reject);
        });
    }

    values() {
        return this.regions.map(region => region.value);
    }

    scale(scaleFunction, range) {
        const newRange = range.slice(0);

        if (this.variable.reverse || false)
            newRange.reverse();

        return scaleFunction(this.values(), newRange);
    }
}

