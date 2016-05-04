
const ExpandCollapseControl = L.Control.extend({
    options: { position: 'topleft' },
    onAdd: function(map) {

        const containerDiv = L.DomUtil.create('div', 'leaflet-bar map-expand-collapse');

        this.bounds = new MapBounds($('#leaflet-map'));
        this.expanded = true;
        this.button = d3.select(containerDiv)
            .append('a')
            .attr('class', 'map-expand')
            .on('click', option => {

                if (this.expanded) {

                    $('#leaflet-map').animate({ height: 200 }, null, null, () => {

                        map.invalidateSize();
                        console.log(this.bounds);
                    });

                    if (!this.buttonIcon.classed('fa-expand'))
                        this.buttonIcon.classed('fa-expand', true).classed('fa-compress', false);

                    map.dragging.disable();
                    map.touchZoom.disable();
                    if (map.tap) map.tap.disable();
               }
                else {

                    $('#leaflet-map').animate({ height: 500 }, null, null, () => {

                        map.invalidateSize();
                        console.log(this.bounds);
                    });

                    if (this.buttonIcon.classed('fa-expand'))
                        this.buttonIcon.classed('fa-expand', false).classed('fa-compress', true);

                    map.dragging.enable();
                    map.touchZoom.enable();
                    if (map.tap) map.tap.enable();
                }

                this.expanded = !this.expanded;
            });

        this.buttonIcon = this.button.append('i').attr('class', 'fa fa-compress');

        return containerDiv;
    }
});

