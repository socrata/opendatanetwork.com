
class MapTooltip {
    constructor(region, layer) {
        this.region = region;
        this.layer = layer;
        this.popup = L.popup(MapConstants.TOOLTIP_OPTIONS)
            .setContent(this.content())
            .setLatLng(this.coordinates());

        this.opened = false;
    }

    content() {
        return `<span class='name'>${this.region.name}</span>\
                ${this.region.valueName}: ${this.region.valueFormatted}`;
    }

    coordinates() {
        return this.layer.getBounds().pad(2.0).getCenter();
    }

    listen() {
        this.layer.bindPopup(this.popup);

        this.layer.on({
            mouseover: () => this.open(),
            mouseout: () => this.close()
        });
    }

    open() {
        if (!this.opened) {
            this.layer.openPopup();
            this.opened = true;
        }
    }

    close() {
        if (this.opened) {
            this.opened = false;
        }
    }
}

