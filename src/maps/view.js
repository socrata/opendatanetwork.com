
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
        this.legend.update(this.scale, this.model.variable, this.model.year);
    }

    getStyle(region) {
        const type = this.model.region.type;
        const baseStyle = {
            stroke: true,
            color: MapConstants.REGION_BORDER_COLOR,
            weight: MapConstants.REGION_BORDER_WEIGHT,
            fillColor: this.scale.scale(region.value),
            fillOpacity: MapConstants.REGION_FILL_OPACITY
        };

        function additionalStyle() {
            if (type == 'point') {
                return {
                    stroke: false
                };
            } else if (type == 'choropleth') {
                return {
                    stroke: true
                };
            } else {
                return {};
            }
        }

        return _.extend(baseStyle, additionalStyle());
    }

    updateLayers() {
        const styleLayer = layer => {
            const id = layer.feature.id;

            if (this.model.regionById.has(id)) {
                const region = this.model.regionById.get(id);
                const style = this.getStyle(region);

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
        };

        this.topoLayers.eachLayer(styleLayer);
    }
}

