
class MapTooltip {
    constructor(region, layer) {
        this.region = region;
        this.layer = layer;
        this.popup = L.popup()
            .setContent(this.content())
            .setLatLng(this.coordinates());

    }

    content() {
        return `${this.region.name}`;
    }

    coordinates() {
        return this.layer.getBounds().getNorthEast();
    }

    listen() {
        this.layer.bindPopup(this.popup);

        this.layer.on({
            mouseover: () =>  this.open(),
            mouseout: () => this.close
        });
    }

    open() {
        this.layer.openPopup();
    }

    close() {
        this.layer.closePopup();
    }
}

