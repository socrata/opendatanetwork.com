
class POIMapView {
    constructor(source, regions, params) {
        this.source = source;
        this.regions = regions;
        this.params = params;

        this.model = new POIMapModel(source, source.variables[0]);
    }

    show(selector) {
        const container = d3.select(selector)
            .append('div')
            .attr('class', 'map-container')
            .attr('id', MapConstants.CSS_ID);

        const map = L.map(MapConstants.CSS_ID, MapConstants.MAP_OPTIONS);
        this.map = map;
        map.setView(MapConstants.INITIAL_CENTER, MapConstants.INITIAL_ZOOM);

        this.zoomControl = new L.Control.Zoom(MapConstants.ZOOM_CONTROL_OPTIONS);
        if (MapConstants.ZOOM_CONTROL) map.addControl(this.zoomControl);

        map.whenReady(() => {
            const url = layerID => `https://api.mapbox.com/v4/${layerID}/{z}/{x}/{y}.png?access_token=${MapConstants.MAPBOX_TOKEN}`;
            const base = L.tileLayer(url(MapConstants.BASE_LAYER_ID)).addTo(map);
            const pane = map.createPane('labels');
            const labels = L.tileLayer(url(MapConstants.LABEL_LAYER_ID), {pane}).addTo(map);

            this.zoomToRegions();
            map.on('moveend', _.debounce(() => this.update(), MapConstants.POI_WAIT_MS));

            this.variableControl = new VariableControl(this.source, this.params, (variable, year) => {
                this.model = new POIMapModel(this.source, variable);
                this.update();
            });
            this.variableControl.onAdd(map);
        });
    }

    zoomToRegions() {
        if (this.regions.length > 0) {
            const coordinates = this.regions[0].coordinates.slice(0).reverse();
            this.map.setView(coordinates, MapConstants.POI_ZOOM);
        }
    }

    update() {
        this.model.inBounds(this.map.getBounds()).then(response => {
            if (this.markers) this.map.removeLayer(this.markers);
            this.markers = new L.MarkerClusterGroup();

            response.forEach(point => {
                const marker = L.marker(point.location.coordinates.reverse());

                const isLink = /^https?:\/\/[^ ]+/.test(point.description);
                marker.bindPopup(`
                    <div class="name">
                        ${point.name}
                        ${isLink ?
                            `<a href=${point.description} target="_blank">
                                <i class="fa fa-external-link"></i>
                            </a>` : ''}
                    </div>
                    <div class="value">
                        ${isLink ? '' : `${point.description || ''}<br />`}
                        ${point.classification || ''}

                        <p class="address">
                            ${point.address || ''}<br />
                            ${(point.city && point.state) ? `${point.city}, ${point.state}` : ''}<br />
                        </p>
                    </div>
                `, {closeButton: false});

                this.markers.addLayer(marker);
            });

            this.map.addLayer(this.markers);
        }, error => {
            console.error(error);
        });
    }
}

class MapView {
    constructor(source, regionType, regions, features, params) {

        this.source = source;
        this.regionType = regionType;
        this.regions = regions;
        this.regionIDs = new Set(regions.map(region => region.id));
        this.features = features;
        this.params = params;

        this.legend = new LegendControl();
        this.tooltip = new TooltipControl();
        this.variableControl = new VariableControl(source, params, (variable, year) => {
            this.display(variable, year);
        });

        this.zoomControl = new L.Control.Zoom(MapConstants.ZOOM_CONTROL_OPTIONS);
        this._popups = [];
        this._noDataPopups = [];
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

        map.on('click', (e) => {
            if (e.originalEvent.srcElement.id == 'leaflet-map')
                this.closeUserOpenedPopups();
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
            d3.select('p#map-summary')
                .text(summary)
                .style('display', summary === '' ? 'none' : 'block');
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
        this.closeUserOpenedPopups();

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
                        popup.originalRegion = true;
                        this._popups[region.id] = popup;
                    }

                    const showGoTo = (this.regions.length > 1);
                    const showDigIn = (this.params.vector == 'city_crime');
                    const node = this.getPopupNode(region, layer, this._popups[region.id], false, showGoTo, showDigIn);

                    this._popups[region.id].setContent(node).addTo(this.map);
                }

                layer.on({
                    click: (map) => {

                        this.closeUserOpenedPopups();

                        if (!(region.id in this._popups)) {
                            const showDigIn = (this.params.vector == 'city_crime');
                            const popup = L.popup(MapConstants.POPUP_OPTIONS).setLatLng(MapView.center(layer));
                            const node = this.getPopupNode(region, layer, popup, true, true, showDigIn);

                            popup.setContent(node);

                            this._popups[region.id] = popup;
                        }

                        this._popups[region.id].addTo(this.map);
                    }
                });
            } else {
                layer.setStyle(MapConstants.NO_DATA_STYLE);

                if (this.map &&
                    this.regionIDs.has(layer.feature.id)) {

                    this.map.setZoom(MapConstants.NO_DATA_ZOOM,
                        MapConstants.AUTO_ZOOM_OPTIONS);

                    const region = this.regions[0];
                    const popup = L.popup(MapConstants.NO_DATA_POPUP_OPTIONS)
                        .setLatLng(layer.getBounds().getCenter())
                        .setContent(`No data exists for ${region.name} in ${model.year}.
                            Try another year, or go to another region on the map
                            by clicking on it`)
                        .openOn(this.map);

                    this._noDataPopups.push(popup);
                }
            }
        });
    }

    getPopupNode(region, layer, popup, showAdd, showGoTo, showDigIn) {

        const container = d3.select(document.createElement('div'));

        container.append('a')
            .attr('class', 'fa fa-times')
            .on('click', () => this.map.closePopup(popup));

        container.append('div').attr('class', 'name').text(region.name);
        container.append('div').attr('class', 'value').text(`${region.valueName} (${region.year}): ${region.valueFormatted}`);

        if (showAdd || showGoTo || showDigIn) {

            const tooltipsControls = container.append('div').attr('class', 'tooltip-controls');

            if (showAdd) {
                const addLink = tooltipsControls.append('a').attr('href', this.getUrlWithAddedRegion(region));
                addLink.append('i').attr('class', 'fa fa-plus');
                addLink.append('span').text('Add');
            }

            if (showGoTo) {
                const goToLink = tooltipsControls.append('a').attr('href', this.getUrlToRegion(region));
                goToLink.append('i').attr('class', 'fa fa-location-arrow');
                goToLink.append('span').text('Go To');
            }

            if (showDigIn) {
                const endDateString = this.getDateString(new Date());
                const startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 1); // one month ago
                const startDateString = this.getDateString(startDate);

                const digInLink = tooltipsControls.append('a')
                    .attr('href', `https://preview.crimereports.com/#!/dashboard?lat=${layer._latlng.lat}&lng=${layer._latlng.lng}&incident_types=Assault%252CAssault%2520with%2520Deadly%2520Weapon%252CBreaking%2520%2526%2520Entering%252CDisorder%252CDrugs%252CHomicide%252CKidnapping%252CLiquor%252COther%2520Sexual%2520Offense%252CProperty%2520Crime%252CProperty%2520Crime%2520Commercial%252CProperty%2520Crime%2520Residential%252CQuality%2520of%2520Life%252CRobbery%252CSexual%2520Assault%252CSexual%2520Offense%252CTheft%252CTheft%2520from%2520Vehicle%252CTheft%2520of%2520Vehicle&start_date=${startDateString}&end_date=${endDateString}&days=sunday%252Cmonday%252Ctuesday%252Cwednesday%252Cthursday%252Cfriday%252Csaturday&start_time=0&end_time=23&include_sex_offenders=false&zoom=15&shapeNames=&show_list=true`)
                    .attr('target', '_blank');

                digInLink.append('i').attr('class', 'fa fa-external-link');
                digInLink.append('span').text('Dig In');
            }
        }

        return container.node();
    }

    getDateString(date) {
        return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    }

    getUrlWithAddedRegion(region) {

        const ids = this.params.regions.map(o => o.id);
        ids.push(region.id);

        const names = this.params.regions.map(o => this.segmentEscape(o.name));
        names.push(this.segmentEscape(region.name));

        return `/region/${ids.join('-')}/${names.join('-')}/${this.params.vector}/${this.params.metric}/${this.params.year}`;
    }

    getUrlToRegion(region) {

        const name = region.name.replace(/,/g, '').replace(/[ \/]/g, '_');
        return `/region/${region.id}/${name}/${this.params.vector}/${this.params.metric}/${this.params.year}`;
    }

    segmentEscape(s) {
        return s.replace(/,/g, '').replace(/[ \/]/g, '_');
    }

    closeUserOpenedPopups() {
        _.values(this._popups).forEach(popup => {
            if (_.isUndefined(popup.originalRegion))
                this.map.closePopup(popup);
        });
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

