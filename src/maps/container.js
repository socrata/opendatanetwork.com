
class MapContainer {
    constructor(selection, source, region, topology) {
        this.selection = selection;
        this.source = source;
        this.region = region;

        this.topology = topology;
        this.topoLayer = MapContainer.parseTopology(region, topology);

        this.legend = new LegendControl();
        this.tooltip = new TooltipControl();

        const callback = (variable, year) => {
            this.display(variable, year);
        };

        this.variableControl = new VariableControl(source.variables, callback);

        this.map = this.createMap();
    }

    static parseTopology(region, topology) {
        if (region.type == 'choropleth') {
            return omnivore.topojson.parse(topology);
        } else if (region.type == 'point') {
            const layer = L.geoJson(null, {
                pointToLayer: (feature, coordinate) => {
                    return L.circle(coordinate, 5000);
                }
            });

            return omnivore.topojson.parse(topology, null, layer);
        } else {
            console.error('${region.type} is not a valid region type');
        }
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

        const map = L.map(id, MapConstants.MAP_OPTIONS);
        map.setView(MapConstants.INITIAL_CENTER, MapConstants.INITIAL_ZOOM);

        const baseLayer = L.tileLayer(MapConstants.BASE_LAYER_URL, MapConstants.BASE_LAYER);
        map.addLayer(baseLayer);

        map.addControl(this.legend);
        map.addControl(this.tooltip);
        map.addControl(this.variableControl);

        map.addLayer(this.topoLayer);

        return map;
    }

    display(variable, year) {
        MapModel.create(this.source, this.region, variable, year)
            .then(model => {
                const view = new MapView(model, this.topoLayer, this.legend, this.tooltip);
                view.display();
            }, error => {
                throw error;
            });
    }
}

