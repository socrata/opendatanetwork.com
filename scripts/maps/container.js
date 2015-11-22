
class MapContainer {
    constructor(selection, source, region, topology) {
        this.selection = selection;
        this.source = source;
        this.region = region;

        this.topology = topology;
        this.topoLayer = omnivore.topojson.parse(topology);

        this.legend = new LegendControl();
        this.tooltip = new TooltipControl();
        this.variableControl = new VariableControl(source.variables);

        this.map = this.createMap();
    }

    static create(selector, source, region) {
        return new Promise((resolve, reject) => {
            TopoModel.get(region)
                .then(topology => {
                    const selection = d3.select(selector);

                    resolve(new MapContainer(selection, source, region, topology));
                }, reject);
        });
    }

    createMap() {
        const id = 'leaflet-map';
        const container = this.selection
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

        map.addControl(this.legend);
        map.addControl(this.tooltip);
        map.addControl(this.variableControl);

        map.addLayer(this.topoLayer);

        return map;
    }

    display(variable) {
        MapModel.create(this.source, this.region, variable)
            .then(model => {
                const view = new MapView(model, this.topoLayer, this.legend, this.tooltip);
                view.display();
            }, error => {
                throw error;
            });
    }
}

