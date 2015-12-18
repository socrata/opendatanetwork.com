
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
        this.zoomControl = new L.Control.Zoom(MapConstants.ZOOM_CONTROL_OPTIONS);
    }

    show(selector) {
        const container = d3.select(selector)
            .append('div')
            .attr('class', 'map-container')
            .attr('id', MapConstants.CSS_ID);

        const map = L.map(MapConstants.CSS_ID, MapConstants.MAP_OPTIONS);
        this.map = map;
        map.setView(MapConstants.INITIAL_CENTER, MapConstants.INITIAL_ZOOM);

        const baseLayer = L.tileLayer(MapConstants.BASE_LAYER_URL, MapConstants.BASE_LAYER);
        map.addLayer(baseLayer);

        map.addControl(this.legend);
        map.addControl(this.variableControl);
        map.addControl(this.tooltip);
        if (MapConstants.ZOOM_CONTROL)
            map.addControl(this.zoomControl);

        map.whenReady(() => {
            map.addLayer(this.features);
            this.zoomToSelected(map);
        });
    }

    zoomToSelected(map) {
        const selectedLayers = [];
        this.features.eachLayer(layer => {
            if (this.regionIDs.has(layer.feature.id))
                selectedLayers.push(layer);
        });

        const group = new L.featureGroup(selectedLayers);
        map.fitBounds(group.getBounds(), MapConstants.AUTO_ZOOM_OPTIONS);

        if (this.regionType.type === 'choropleth' && selectedLayers.length === 1) {
            map.zoomOut(MapConstants.AUTO_ZOOM_OUT, MapConstants.AUTO_ZOOM_OPTIONS);
        }
    }

    display(variable, year) {
        MapModel.create(this.source, this.regionType, variable, year)
            .then(model => this.update(model))
            .catch(error => {
                throw error;
            });
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
                const selected = this.regionIDs.has(region.id);
                const baseStyle = {
                    fill: true,
                    fillColor: scale.scale(region.value)
                };
                const style = selected ?
                    _.extend(baseStyle, MapConstants.SELECTED_STYLE) :
                    baseStyle;

                if (selected && this.map) {
                    const icon = L.divIcon({
                        className: 'tooltip',
                        iconSize: null,
                        html: `<div class="name">${region.name}</div>
                            <div class="value">${region.valueName} (${region.year}): ${region.valueFormatted}</div>`
                    });
                    const latlng = layer.getLatLng();
                    L.marker(latlng, {icon}).addTo(this.map);

                }

                layer.setStyle(style);

                layer.on({
                    mouseover: () => this.tooltip.showRegion(region),
                    mouseout: () => this.tooltip.hide()
                });
            }
        });
    }

    static create(source, regions) {
        if (regions.length < 1) throw 'regions cannot be empty';

        const regionType = MapConstants.REGIONS[regions[0].type];
        const regionsOfType = _.filter(regions, region => {
            return region.type == regionType.id;
        });

        return new Promise((resolve, reject) => {
            function success(topojson) {
                const features = MapView._features(topojson, regionType.type == 'choropleth');
                resolve(new MapView(source, regionType, regionsOfType, features));
            }

            TopoModel.get(regionType).then(success, reject);
        });
    }

    static _features(topojson, choropleth) {
        const baseOptions = () => {
            const pointStyle = {
                stroke: false
            };

            const style = choropleth ?
                MapConstants.BASE_STYLE :
                _.extend({}, MapConstants.BASE_STYLE, pointStyle);

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
}

