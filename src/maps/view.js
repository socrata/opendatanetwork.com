
class POIMapView {
    constructor(source, regions, params) {
        this.model = new POIMapModel(source);
        this.regions = regions;

        this.zoomControl = new L.Control.Zoom(MapConstants.ZOOM_CONTROL_OPTIONS);
        this.variableControl = new VariableControl(source, params, (variable, year) => {
            this.model = new POIMapModel(source, variable);
            this.update();
        });
    }

    show(selector) {
        const container = d3.select(selector)
            .append('div')
            .attr('class', 'map-container')
            .attr('id', MapConstants.CSS_ID);

        const map = L.map(MapConstants.CSS_ID, MapConstants.MAP_OPTIONS);
        this.map = map;
        map.setView(MapConstants.INITIAL_CENTER, MapConstants.INITIAL_ZOOM);

        if (MapConstants.ZOOM_CONTROL) map.addControl(this.zoomControl);
        this.variableControl.onAdd(map);

        map.whenReady(() => {
            const url = layerID => `https://api.mapbox.com/v4/${layerID}/{z}/{x}/{y}.png?access_token=${MapConstants.MAPBOX_TOKEN}`;
            const base = L.tileLayer(url(MapConstants.BASE_LAYER_ID)).addTo(map);
            const pane = map.createPane('labels');
            const labels = L.tileLayer(url(MapConstants.LABEL_LAYER_ID), {pane}).addTo(map);

            this.zoomToRegions(map);
        });
    }

    zoomToRegions(map) {
        if (this.regions.length > 0) {
            const coordinates = this.regions[0].coordinates.slice(0).reverse();
            map.setView(coordinates, MapConstants.POI_ZOOM);
        }
    }

    update() {
        this.model.inBounds(this.map.getBounds()).then(response => {
            if (this.markers) this.map.removeLayer(this.markers);
            this.markers = new L.MarkerClusterGroup();

            response.forEach(point => {
                const marker = L.marker(point.location.coordinates.reverse());

                const properties = ['address']
                    .map(property => point[property])
                    .filter(_.negate(_.isUndefined));
                marker.bindPopup(`
                    <div class="name">${point.name}</div>
                    <div class="value">
                        ${properties.map(property => `<p>${property}</p>`).join('\n')}
                    </div>
                `, {closeButton: false});

                this.markers.addLayer(marker);
            });

            this.map.addLayer(this.markers);
        }, error => {
            console.error(error);
        });
    }

    _geocodeRegion(region) {


    }
}

class MapView {
    constructor(source, regionType, regions, features, params) {
        this.source = source;

        this.regionType = regionType;
        this.regions = regions;
        this.regionIDs = new Set(regions.map(region => region.id));

        this.features = features;

        this.legend = new LegendControl();
        this.tooltip = new TooltipControl();
        this.variableControl = new VariableControl(source, params, (variable, year) => {
            this.display(variable, year);
        });
        this.zoomControl = new L.Control.Zoom(MapConstants.ZOOM_CONTROL_OPTIONS);

        this._popups = [];
    }

    show(selector) {
        const container = d3.select(selector)
            .append('div')
            .attr('class', 'map-container')
            .attr('id', MapConstants.CSS_ID);

        const map = L.map(MapConstants.CSS_ID, MapConstants.MAP_OPTIONS);
        this.map = map;
        map.setView(MapConstants.INITIAL_CENTER, MapConstants.INITIAL_ZOOM);

        map.addControl(this.legend);
        map.addControl(this.tooltip);
        if (MapConstants.ZOOM_CONTROL) map.addControl(this.zoomControl);
        this.variableControl.onAdd(map);

        map.whenReady(() => {
            const url = layerID => `https://api.mapbox.com/v4/${layerID}/{z}/{x}/{y}.png?access_token=${MapConstants.MAPBOX_TOKEN}`;

            const base = L.tileLayer(url(MapConstants.BASE_LAYER_ID)).addTo(map);
            const features = this.features.addTo(map);
            const pane = map.createPane('labels');
            const labels = L.tileLayer(url(MapConstants.LABEL_LAYER_ID), {pane}).addTo(map);

            this.zoomToSelected(this.map);

            if (this.source.callback) this.source.callback(this.regions);
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
            .catch(error => { throw error; });

        new MapSource(this.source).summarize(variable, year, this.regions).then(([summary, meta]) => {
            d3.select('p#map-summary').text(summary);
        });
    }

    update(model) {
        const colorScale = model.variable.stoplight ?
            MapConstants.STOPLIGHT_COLOR_SCALE :
            MapConstants.COLOR_SCALE;
        const scale = model.scale(MapConstants.SCALE, colorScale);

        this.updateLegend(model, scale);
        this.updateFeatures(model, scale);
    }

    updateLegend(model, scale) {
        this.legend.update(scale, model.variable, model.year);
    }

    updateFeatures(model, scale) {
        this.features.eachLayer(layer => {
            const region = model.regionById.get(layer.feature.id);

            if (region && !isNaN(region.value)) {
                const selected = this.regionIDs.has(region.id);
                const fillColor = scale.scale(region.value);
                const baseStyle = _.extend({}, MapConstants.REFERENCE_STYLE, {fillColor});
                const style = selected ?
                    _.extend(baseStyle, MapConstants.SELECTED_STYLE) :
                    baseStyle;
                layer.setStyle(style);

                if (selected && this.map) {
                    if (!(region.id in this._popups)) {
                        const popup = L.popup(MapConstants.POPUP_OPTIONS)
                            .setLatLng(MapView.center(layer));
                        this._popups[region.id] = popup;
                    }

                    const content = `<div class="name">${region.name}</div>\
                        <div class="value">${region.valueName} (${region.year}):\
                        ${region.valueFormatted}</div>`;
                    this._popups[region.id].setContent(content).addTo(this.map);
                }

                layer.on({
                    mouseover: () => {
                        this.closePopups();
                        this.tooltip.showRegion(region);
                    },
                    mouseout: () => this.tooltip.hide()
                });
            } else {
                layer.setStyle(MapConstants.NO_DATA_STYLE);
            }
        });
    }

    closePopups() {
        _.values(this._popups).forEach(popup => this.map.closePopup(popup));
    }

    static center(layer) {
        if (layer.getLatLng) {
            return layer.getLatLng();
        } else {
            const latlngs = layer.getLatLngs();
            const bounds = L.latLngBounds(_.flatten(latlngs));
            return bounds.getCenter();
        }
    }

    static create(source, regions, params) {
        if (regions.length < 1) throw 'regions cannot be empty';

        return new Promise((resolve, reject) => {
            const regionTypes = regions
                .map(region => MapConstants.REGIONS[region.type])
                .filter(_.identity);

            if (regionTypes.length < 1) {
                reject(`invalid region type for map: ${regions[0].type}`);
            } else {
                const regionType = regionTypes[0];
                const regionsOfType = _.filter(regions, region => {
                    return region.type == regionType.id;
                });

                TopoModel.get(regionType).then(topojson => {
                    const features = MapView._features(topojson, regionType.type == 'choropleth');
                    resolve(new MapView(source, regionType, regionsOfType, features, params));
                }, reject);
            }
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

