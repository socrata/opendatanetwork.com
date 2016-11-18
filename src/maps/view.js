'use strict';

class MapView {
    constructor(entities, variable, constraints, session) {
        this.entities = entities;
        this.entityIDs = entities.map(_.property('id'));
        this.variable = variable;
        this.constraints = constraints;
        this.constraintString = getConstraintString(constraints);
        this.sessionID = session.session_id;
        this.initialBounds = session.bounds;
        this.summaryStats = session.summary_statistics;

        // Mapping from entity ID to highest quality GeoJSON feature
        // that we currenty have. This is the feature that will be displayed.
        this.features = {};

        // Current entity popup.
        this.popup = null;

        this.scaleRange = getColorScale(variable);
        this.scale = getScale(this.summaryStats, this.scaleRange);
    }

    static create(entities, variable, constraints) {
        if (entities.length === 0) return Promise.reject('at least one entity required');
        const entityType = entities[0].type;
        entities = entities.filter(entity => entity.type === entityType);

        return newSession(entities, variable, constraints).then(session => {
            return Promise.resolve(new MapView(entities, variable, constraints, session));
        });
    }

    /**
     * Shows the map on the given div.
     */
    show(selector) {
        const isMobile = d3.select('body').node().getBoundingClientRect().width <= GlobalConfig.mobile_width;

        const container = d3.select(selector)
            .append('div')
            .attr('class', isMobile ? 'map-container map-container-collapsed' : 'map-container map-container-expanded')
            .attr('id', GlobalConfig.maps.css_id);

        const map = L.map(GlobalConfig.maps.css_id, GlobalConfig.maps.map_options);
        this.map = map;

        map.fitBounds(this.initialBounds, GlobalConfig.maps.initial_zoom_options);

        map.whenReady(() => {
            this.showZoom();
            this.showLegend();
            this.showExpand();
            this.showTileLayers();
        });

        openSocket(GlobalConfig.odn_api.base).then(socket => {
            socket.on('message', message => this.handleUpdate(JSON.parse(message)));

            let updater = () => this.requestUpdate(socket);
            updater = _.debounce(updater, GlobalConfig.maps.update_wait);

            updater();
            map.on('moveend', updater);
        }).catch(error => {
            console.error(error);
        });
    }

    showTileLayers() {
        const url = layerID => `https://api.mapbox.com/v4/${layerID}/{z}/{x}/{y}.png?access_token=${GlobalConfig.maps.mapbox.token}`;

        const base = L.tileLayer(url(GlobalConfig.maps.mapbox.base_layer_id)).addTo(this.map);
        const pane = this.map.createPane('labels');
        const labels = L.tileLayer(url(GlobalConfig.maps.mapbox.label_layer_id), {pane}).addTo(this.map);
    }

    showZoom() {
        if (GlobalConfig.maps.zoom_control) {
            this.zoomControl = new L.Control.Zoom(GlobalConfig.maps.zoom_control_options);
            this.map.addControl(this.zoomControl);
        }
    }

    showLegend() {
        this.legend = new LegendControl();
        this.map.addControl(this.legend);
        this.legend.update(this.summaryStats, this.scaleRange);
    }

    showExpand() {
        if (d3.select('body').node().getBoundingClientRect().width <= GlobalConfig.mobile_width) {
            this.expandCollapseControl = new ExpandCollapseControl();
            this.map.addControl(this.expandCollapseControl);
        }
    }

    showInitialPopup(feature) {
        this.getPopup(feature).addTo(this.map);
    }

    showPopup(feature) {
        this.hidePopup();
        this.popup = this.getPopup(feature);
        this.popup.addTo(this.map);
    }

    getPopup(feature) {
        return L.popup(GlobalConfig.maps.popup_options)
            .setLatLng(getCenter(feature))
            .setContent(this.getPopupContent(feature));
    }

    getPopupContent(feature) {
        const entity = feature.feature.properties;

        return `
            <div>
                <div class="name">${entity.name}</div>
                <div class="value">
                    ${this.variable.name}
                    ${this.constraintString}:
                    ${entity.value_formatted}
                </div>
                <div class="tooltip-controls">
                    ${this.getCompareHTML(entity)}
                    ${this.getNavigateHTML(entity)}
                </div>
            </div>
        `;
    }

    getCompareHTML(entity) {
        if (_.includes(this.entityIDs, entity.id)) return '';

        return `
            <a href="${window.entityNavigate.add(entity).url()}">
                <i class="fa fa-plus"></i>
                <span>Compare</span>
            </a>
        `;
    }

    getNavigateHTML(entity) {
        if (this.entityIDs.length === 1 && _.includes(this.entityIDs, entity.id)) return '';

        return `
            <a href="${window.entityNavigate.to(entity).url()}">
                <i class="fa fa-location-arrow"></i>
                <span>Go To</span>
            </a>
        `;
    }

    hidePopup() {
        if (this.popup) this.map.closePopup(this.popup);
    }

    handleUpdate(message) {
        if (message.type === 'error')
            return console.error(message);

        const geojson = message.geojson;
        const zoomLevel = message.message.zoom_level;

        L.geoJson(geojson, {
            style: feature => this.styleFeature(feature),
            onEachFeature: (properties, feature) => this.addFeature(feature, zoomLevel)
        });
    }

    styleFeature(feature) {
        const fill = {fillColor: this.scale(feature.properties.value)};
        const base = GlobalConfig.maps.base_style;
        const selected = this.isSelected(feature) ? GlobalConfig.maps.selected_style : {};

        return _.assign(fill, base, selected);
    }

    isSelected(feature) {
        return _.includes(this.entityIDs, feature.properties.id);
    }

    /**
     * Adds the feature if it is the highest quality feature available.
     */
    addFeature(feature, zoomLevel) {
        const id = feature.feature.properties.id;

        if (id in this.features && this.features[id]._zoomLevel > zoomLevel) return;
        if (id in this.features) this.map.removeLayer(this.features[id]);

        feature._id = id;
        feature._zoomLevel = zoomLevel;
        feature.on('click', () => this.showPopup(feature));
        if (!(id in this.features) && this.isSelected(feature.feature))
            this.showInitialPopup(feature);

        this.features[id] = feature;
        this.map.addLayer(feature);
    }

    requestUpdate(socket) {
        socket.send(JSON.stringify(this.getUpdateMessage()));
    }

    getUpdateMessage() {
        return {
            bounds: this.getBounds(),
            zoom_level: this.map.getZoom(),
            session_id: this.sessionID
        };
    }

    getBounds() {
        const mapBounds = this.map.getBounds();
        const nw = mapBounds.getNorthWest();
        const se = mapBounds.getSouthEast();
        const bounds = [boundLat(nw.lat), boundLng(nw.lng), boundLat(se.lat), boundLng(se.lng)];
        return bounds;
    }
}

function get(path, params) {
    const url = `${path}?${$.param(params)}`;
    return d3.promise.json(url);
}

function newSession(entities, variable, constraints) {
    const entityIDs = entities.map(_.property('id'));
    return odn.newMap(entityIDs, variable.id, constraints);
}

function bound(max) {
    return value => value > max ? max : (value < -max ? -max : value);
}

const boundLat = bound(90);
const boundLng = bound(180);

function getScale(stats, range) {
    return d3.scaleThreshold()
        .domain(_.initial(_.tail(stats.values)))
        .range(range);
}

function getCenter(feature) {
    if (feature.getLatLng) {
        return feature.getLatLng();
    } else {
        const latlngs = feature.getLatLngs();
        const bounds = L.latLngBounds(_.flatten(latlngs));
        return bounds.getCenter();
    }
}

function escapeName(string) {
    return string
        .replace(/,/g, '')
        .replace(/[ \/]/g, '_');
}

function supportsWebsockets() {
    return window.WebSocket;
}

function getColorScale(variable) {
    const scale = variable.stoplight ?
        colorbrewer.RdYlGn[8] :
        colorbrewer.Blues[9].slice(1);
    return variable.reverse ? reverse(scale) : scale;
}

function reverse(array) {
    const temp = array.slice();
    temp.reverse();
    return temp;
}

function getConstraintString(constraints) {
    if (_.isEmpty(constraints)) return '';
    return ` (${_.values(constraints).join(', ')})`;
}

function openSocket(url) {
    return new Promise((resolve, reject) => {
        const socket = io.connect(url, {transports: ['websocket']});
        socket.on('connect', () => resolve(socket));
        socket.on('error', error => reject(error));
    });
}

