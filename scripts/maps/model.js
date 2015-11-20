

class TopoModel {
    static get(region) {
       const url = MapConstants.TOPOJSON_DIRECTORY +
                   region.topo +
                   MapConstants.TOPOJSON_SUFFIX;

        return $.getJSON(url);
    }
}


class MapModel {


}

maps.model = function() {
    const topoData = (() => {

        function getURL(region) {
            return Constants.TOPOJSON_DIRECTORY + names[region.id] + Constants.TOPOJSON_SUFFIX;
        }

        function get(region) {
            return d3.promise.json(getURL(region));
        }

        return {get};
    })();

    function listToDict(list, keyFunction, valueFunction) {
        function tuple(element) {
            return [keyFunction(element), valueFunction(element)];
        }

        return _.object(_.map(list, tuple));
    }

    function regionParams(region) {
        if (region.id === 'place') {
            return {'$where': 'population > ' + Constants.PLACE_POPULATION_THRESHOLD};
        }

        return {};
    }

    const regionData = (function() {
        function get(source, region, variable) {
            const baseParams = {type: region.id, '$limit': Constants.MAX_DATASETS};
            const params = _.extend(baseParams, variable.params, regionParams(region));
            const url = buildURL(source.url, params);

            return d3.promise.json(url);
        }

        function makeLookup(regions, variable) {
            const keyFunction = _.property('id');

            const values = _.sortBy(_.map(regions, variable.value));
            const scale = maps.scales.quantile(values, Constants.MAP_COLOR_SCALE);
            function valueFunction(region) {
                const value = variable.value(region);

                return {
                    id: region.id,
                    name: region.name,
                    value: value,
                    valueName: variable.name,
                    valueFormatted: variable.format(value),
                    fill: scale(value)
                };
            }

            return [listToDict(regions, keyFunction, valueFunction), [scale, values, variable]];
        }

        return {get, makeLookup};
    })();

    const gazetteerData = (function() {
        function get(regionType) {
            const baseParams = {type: regionType.id, '$limit': Constants.MAX_DATASETS};
            const params = $.extend(baseParams, regionParams(regionType));
            const url = buildURL(Constants.GAZETTEER_URL, params);

            return d3.promise.json(url);
        }

        function makeLookup(regions) {
            const keyFunction = _.property('id');
            const valueFunction = function(region) {
                return {
                    id: region.id,
                    name: region.name,
                    location: _.extend(region.location, {id: region.id, population: region.population})
                };
            };

            return listToDict(regions, keyFunction, valueFunction);
        }

        return {get, makeLookup};
    })();


    function getPointData(source, region, variable, callback) {
        function onLoad(results) {
            const [regionResult, locationResult] = results;
            const [regionLookup, scale] = regionData.makeLookup(regionResult, variable);
            const locationLookup = gazetteerData.makeLookup(locationResult);

            callback(regionLookup, locationLookup, scale);
        }

        const regionPromise = regionData.get(source, region, variable);
        const gazetteerPromise = gazetteerData.get(region);

        Promise.all([regionPromise, gazetteerPromise])
            .then(onLoad)
            .catch(error => console.error(error));
    }

    function getChoroplethData(source, region, variable, callback) {
        function onLoad(results) {
            const [topology, regionResult] = results;
            const [regionLookup, scale] = regionData.makeLookup(regionResult, variable);

            callback(topology, regionLookup, scale);
        }

        const topoPromise = topoData.get(region);
        const regionPromise = regionData.get(source, region, variable);

        Promise.all([topoPromise, regionPromise])
            .then(onLoad)
            .catch(error => console.error(error));
    }

    return {getPointData, getChoroplethData};
};
