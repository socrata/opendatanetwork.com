
class MapContainer {
    constructor(selector, topology) {
        this.selection = d3.select(selector);
        this.map = MapContainer.createMap(this.selection);
        this.topology = topology;
        this.topoLayers = MapContainer.parseTopology(topology, this.map);
        this.tooltip = new MapTooltip(this.selection);
    }

    static parseTopology(topology, map) {
        return omnivore.topojson.parse(topology).addTo(map);
    }

    static createMap(selection) {
        const id = 'leaflet-map';
        const container = selection
            .append('div')
            .attr('class', 'map-container')
            .attr('id', id);

        const map = L.map(id, {
            minZoom: MapConstants.MIN_ZOOM,
            maxZoom: MapConstants.MAX_ZOOM
        });

        map.setView(MapConstants.INITIAL_CENTER, MapConstants.INITIAL_ZOOM);

        L.tileLayer(MapConstants.BASE_LAYER_URL, {
            opacity: MapConstants.BASE_LAYER_OPACITY,
            attribution: MapConstants.ATTRIBUTION
        }).addTo(map);

        return map;
    }

    display(model) {
        const view = new MapView(this.map, model, this.topoLayers, this.selection, this.tooltip);

        view.display()
    }
}

