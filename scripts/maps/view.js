
class MapView {
    constructor(model, topoLayers, legend, tooltip) {
        this.model = model;
        this.scale = model.scale(MapConstants.SCALE, MapConstants.COLOR_SCALE);
        this.topoLayers = topoLayers;
        this.legend = legend;
        this.tooltip = tooltip;
    }

    display() {
        this.updateLayers();
        this.updateLegend();
    }

    updateLegend() {
        this.legend.update(this.scale, this.model.variable);
    }

    updateLayers() {
        const styleLayer = layer => {
            const id = layer.feature.id;

            if (this.model.regionById.has(id)) {
                const region = this.model.regionById.get(id);

                const style = {
                    stroke: true,
                    color: MapConstants.REGION_BORDER_COLOR,
                    weight: MapConstants.REGION_BORDER_WEIGHT,
                    fillColor: this.scale.scale(region.value),
                    fillOpacity: MapConstants.REGION_FILL_OPACITY
                };

                const events = {
                    mouseover: () => this.tooltip.showRegion(region),
                    mouseout: () => this.tooltip.hide()
                };

                layer.setStyle(style);
                layer.on(events);

            } else { // if we don't have data for it it's reference layer
                const style = {
                    stroke: true,
                    color: MapConstants.REFERENCE_BORDER_COLOR,
                    weight: MapConstants.REFERENCE_BORDER_WEIGHT,
                    fill: false,
                    clickable: false
                };

                layer.setStyle(style);
            }
        }

        this.topoLayers.eachLayer(styleLayer);
    }
}

