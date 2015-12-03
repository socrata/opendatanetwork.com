
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
        const region = this.region;
        return `<span class='name'>${region.name}</span>\
                ${region.valueName} (${region.year}): ${region.valueFormatted}`;
    }

    coordinates() {
        return this.layer.getBounds().pad(2.0).getCenter();
    }

    listen() {
        this.layer.bindPopup(this.popup);

        this.layer.on({
            mouseover: (e) => this.open(e),
            mouseout: () => this.close()
        });
    }

    open(e) {
        if (!this.opened) {
            this.opened = true;
            this.layer.openPopup(e.latlng);
        }
    }

    close() {
        if (this.opened) {
            this.opened = false;
            if (this.layer.closePopup) this.layer.closePopup();
        }
    }
}

