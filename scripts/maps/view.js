
class MapView {
    constructor(map, model, topoLayers, container) {
        this.map = map;
        this.model = model;
        this.scale = model.scale(MapConstants.SCALE, MapConstants.COLOR_SCALE);
        this.topoLayers = topoLayers;
        this.container = container;
    }

    display() {
        this.drawLayers();
        this.drawScale();
    }

    drawLayers() {
        const getStyle = layer => {
            const id = layer.feature.id;

            if (this.model.regionById.has(id)) {
                const region = this.model.regionById.get(id);

                return {
                    stroke: true,
                    color: MapConstants.REGION_BORDER_COLOR,
                    weight: MapConstants.REGION_BORDER_WEIGHT,
                    fillColor: this.scale.scale(region.value),
                    fillOpacity: MapConstants.REGION_FILL_OPACITY
                };
            } else { // if we don't have data for it it's reference layer
                return {
                    stroke: true,
                    color: MapConstants.REFERENCE_BORDER_COLOR,
                    weight: MapConstants.REFERENCE_BORDER_WEIGHT,
                    fill: false,
                    clickable: false
                };
            }
        }

        this.topoLayers.eachLayer(layer => {
            layer.setStyle(getStyle(layer))
        });
    }

    drawScale() {
        const legendContainer = this.container
            .append('div')
            .attr('class', 'legend-container');

        const dimension = 10;
        const range = this.scale.range.slice();
        range.reverse();
        const height = range.length * dimension;
        const width = 240;
        const xOffset = width / 2;

        const values = _.filter(this.scale.values, value => !(isNaN(value)))
        const [min, max] = d3.extent(values);
        const lowerQuartile = d3.quantile(values, 0.25);
        const median = d3.median(values);
        const upperQuartile = d3.quantile(values, 0.75);

        const tickValues = [max, upperQuartile, median, lowerQuartile, min];
        const tickNames = ['maximum', 'upper quartile', 'median', 'lower quartile', 'minimum'];
        const tickData = _.zip(tickValues, tickNames);
        const tickStep = height / (tickData.length - 1);

        const legend = legendContainer
            .append('svg')
            .attr('width', width)
            .attr('height', height + 30 + dimension * 3)
            .attr('class', 'legend');

        const legendName = legend
            .append('text')
            .attr('class', 'legend-name')
            .attr('text-anchor', 'middle')
            .attr('x', xOffset + dimension / 2).attr('y', dimension * 1.2)
            .text(this.model.variable.name);

        const tickGroup = legend
            .append('g')
            .attr('class', 'ticks');

        const ticks = tickGroup
            .selectAll('g.tick')
            .data(tickData)
            .enter()
            .append('g')
            .attr('class', 'tick')
            .attr('transform', (__, index) => {
                return `translate(${xOffset}, ${3 * dimension + index * tickStep})`;
            });

        ticks
            .append('line')
            .attr('class', 'tick-line')
            .attr('x1', dimension).attr('y1', 0)
            .attr('x2', dimension * 2).attr('y2', 0);

        ticks
            .append('line')
            .attr('class', 'tick-line')
            .attr('x1', -dimension).attr('y1', 0)
            .attr('x2', 0).attr('y2', 0);

        const baseline = 'middle';
        const padding = 2;

        ticks
            .append('text')
            .attr('class', 'tick-value')
            .text(tick => this.model.variable.format(tick[0]))
            .attr('alignment-baseline', baseline)
            .attr('transform', `translate(${dimension * 2 + padding}, 0)`);

        ticks
            .append('text')
            .attr('class', 'tick-label')
            .text(tick => tick[1])
            .attr('text-anchor', 'end')
            .attr('alignment-baseline', baseline)
            .attr('transform', `translate(${-(dimension + padding)}, 0)`);

        const colors = legend
            .selectAll('rect')
            .data(range)
            .enter()
            .append('rect')
            .attr('class', 'legend-element')
            .attr('x', xOffset)
            .attr('y', (__, index) => (index + 3) * dimension)
            .attr('width', dimension)
            .attr('height', dimension)
            .style('stroke', 'none')
            .style('fill', color => color);

        legend
            .append('rect')
            .attr('class', 'legend-box')
            .attr('x', xOffset).attr('y', dimension * 3)
            .attr('width', dimension).attr('height', height);
    }

    remove() {

    }
}


class MapContainer {
    constructor(selector, topology) {
        this.selection = d3.select(selector);
        this.map = MapContainer.createMap(this.selection);
        this.topology = topology;
        this.topoLayers = MapContainer.parseTopology(topology, this.map);
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
        const view = new MapView(this.map, model, this.topoLayers, this.selection);

        view.display()
    }
}

