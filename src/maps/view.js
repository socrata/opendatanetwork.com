
class MapView {
    constructor(source, regionType, regions, features) {
        this.source = source;

        this.regionType = regionType;
        this.regions = regions;
        this.regionIDs = new Set(regions.map(region => region.id));

        this.features = features;

        this.legend = new LegendControl();
        this.tooltip = new TooltipControl();
        this.variableControl = new VariableControl(source.variables, (variable, year) => {
            this.display(variable, year);
        });
    }

    /**
     * Extracts Leaflet GeoJSON features from the given TopoJSON.
     *
     * @param topojson - TopoJSON object.
     * @param choropleth {boolean} - Whether the map is a choropleth or point map.
     * @return Leaflet GeoJSON layer.
     */
    static _features(topojson, choropleth) {
        const baseOptions = () => {
            const baseStyle = {
                fill: false,
                color: MapConstants.REGION_BORDER_COLOR,
                weight: MapConstants.REGION_BORDER_WEIGHT,
                fillOpacity: MapConstants.REGION_FILL_OPACITY
            };

            const pointStyle = {
                stroke: false
            };

            const style = choropleth ?
                baseStyle :
                _.extend({}, baseStyle, pointStyle);

            return {
                style: () => style
            };
        };

        const pointOptions = () => {
            const objects = topojson.objects;
            const features = topojson.objects[Object.keys(objects)[0]].geometries;
            const population = feature => feature.properties.population;
            const populations = features.map(population);
            const radiusScale = MapConstants.POINT_RADIUS_SCALE()
                .domain(d3.extent(populations))
                .range(MapConstants.POINT_RADIUS_RANGE_METERS);

            return {
                pointToLayer: (feature, coordinate) => {
                    return L.circle(coordinate, radiusScale(population(feature)));
                }
            };
        };

        const options = choropleth ?
            baseOptions() :
            _.extend({}, baseOptions(), pointOptions());

        const layer = L.geoJson(null, options);
        return omnivore.topojson.parse(topojson, null, layer);
    }

    static create(source, regions) {
        if (regions.length < 1) throw 'regions cannot be empty';

        const regionType = MapConstants.REGIONS[regions[0].type];
        const regionsOfType = _.filter(regions, region => {
            return region.type == regionType.id;
        });

        return new Promise((resolve, reject) => {
            TopoModel.get(regionType)
                .then(topojson => {
                    const features = MapView._features(topojson);

                    resolve(new MapView(source, regionType, regionsOfType, features));
                }, reject);
        });
    }

    show(selector) {
        const id = 'leaflet-map';
        const container = d3.select(selector)
            .append('div')
            .attr('class', 'map-container')
            .attr('id', id);

        const map = L.map(id, MapConstants.MAP_OPTIONS);
        map.setView(MapConstants.INITIAL_CENTER, MapConstants.INITIAL_ZOOM);

        const baseLayer = L.tileLayer(MapConstants.BASE_LAYER_URL, MapConstants.BASE_LAYER);
        map.addLayer(baseLayer);

        map.addControl(this.legend);
        map.addControl(this.tooltip);
        map.addControl(this.variableControl);

        map.addLayer(this.features);

        // Zoom to selected regions.
        const selectedLayers = [];

        this.features.eachLayer(layer => {
            if (this.regionIDs.has(layer.feature.id))
                selectedLayers.push(layer);
        });

        const group = new L.featureGroup(selectedLayers);
        map.fitBounds(group.getBounds(), MapConstants.AUTO_ZOOM_OPTIONS);
    }

    update(model) {
        const scale = model.scale(MapConstants.SCALE, MapConstants.COLOR_SCALE);

        this.updateLegend(model, scale);
        this.updateFeatures(model, scale);
    }

    updateLegend(model, scale) {
        this.legend.update(scale, model.variable, model.year);
    }

    updateFeatures(model, scale) {
        this.features.eachLayer(layer => {
            const id = layer.feature.id;

            if (model.regionById.has(id)) {
                const region = model.regionById.get(id);

                layer.setStyle({
                    fill: true,
                    fillColor: scale.scale(region.value)
                });

                layer.on({
                    mouseover: () => this.tooltip.showRegion(region),
                    mouseout: () => this.tooltip.hide()
                });
            }
        });
    }

    display(variable, year) {
        MapModel.create(this.source, this.regionType, variable, year)
            .then(model => this.update(model))
            .catch(error => {
                throw error;
            });
    }
}

