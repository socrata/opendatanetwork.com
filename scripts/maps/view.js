
class MapView {
    constructor(map, model, topoLayers, container) {
        this.map = map;
        this.model = model;
        this.scale = model.scale(MapConstants.SCALE, MapConstants.COLOR_SCALE);
        this.topoLayers = topoLayers;
        this.container = container;
    }

    display() {
        this.map.addControl(new ScaleControl(this.scale, this.model.variable));
        this.drawLayers();
    }

    drawLayers() {
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

                let currentPopupID = '';
                const events = {
                    mouseover: () => {
                        if (currentPopupID !== id) {
                            currentPopupID = id;
                            layer.openPopup();
                        }
                    }
                };

                layer.setStyle(style);
                layer.bindPopup(region.name);
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

    remove() {

    }
}

