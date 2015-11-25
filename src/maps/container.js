
class MapContainer {
    constructor(selection, source, topology, regionType, regions) {
        this.selection = selection;
        this.source = source;
        this.regionType = regionType;
        this.regions = regions;
        this.regionIDs = new Set(regions.map(region => region.id));

        this.topology = topology;
        this.topoLayer = this.parseTopology(regionType, topology);

        this.legend = new LegendControl();
        this.tooltip = new TooltipControl();

        const callback = (variable, year) => {
            this.display(variable, year);
        };

        this.variableControl = new VariableControl(source.variables, callback);

        this.map = this.createMap();

        this.zoomToSelectedRegions();
    }

    parseTopology(region, topology) {
        const baseStyle = {
            color: MapConstants.REGION_BORDER_COLOR,
            weight: MapConstants.REGION_BORDER_WEIGHT,
            fillOpacity: MapConstants.REGION_FILL_OPACITY
        };

        const pointStyle = {
            stroke: false
        };

        const choropleth = this.regionType.type == 'choropleth';

        const style = choropleth ?
            baseStyle :
            _.extend({}, baseStyle, pointStyle);

        const baseOptions = {
            style: () => style
        };

        const pointOptions = () => {
            const objects = topology.objects;
            const features = topology.objects[Object.keys(objects)[0]].geometries;
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
        }

        const options = choropleth ?
            baseOptions :
            _.extend({}, baseOptions, pointOptions());

        const layer = L.geoJson(null, options);
        return omnivore.topojson.parse(topology, null, layer);
    }

    static create(selector, source, regions) {
        if (regions.length < 1) throw 'regions cannot be empty';

        const regionType = MapConstants.REGIONS[regions[0].type];
        const regionsOfType = _.filter(regions, region => {
            return region.type == regionType.id;
        });

        return new Promise((resolve, reject) => {
            TopoModel.get(regionType)
                .then(topology => {
                    const selection = d3.select(selector);

                    resolve(new MapContainer(selection, source, topology, regionType, regionsOfType));
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

    zoomToSelectedRegions() {
        const selectedLayers = [];

        this.topoLayer.eachLayer(layer => {
            if (this.regionIDs.has(layer.feature.id))
                selectedLayers.push(layer);
        });

        const group = new L.featureGroup(selectedLayers);
        this.map.fitBounds(group.getBounds(), MapConstants.AUTO_ZOOM_OPTIONS);
    }

    display(variable, year) {
        MapModel.create(this.source, this.regionType, variable, year)
            .then(model => {
                const view = new MapView(model, this.topoLayer, this.legend, this.tooltip);
                view.display();
            }, error => {
                throw error;
            });
    }
}

