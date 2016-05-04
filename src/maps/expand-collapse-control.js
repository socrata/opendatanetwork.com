
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

                    $('.map-container').animate({ height: 200 });

                    if (!this.buttonIcon.classed('fa-expand'))
                        this.buttonIcon.classed('fa-expand', true).classed('fa-compress', false);

                    map.dragging.disable();
                    map.touchZoom.disable();

                    this.bounds.update();
               }
                else {

                    $('.map-container').animate({ height: 500 });

                    if (this.buttonIcon.classed('fa-expand'))
                        this.buttonIcon.classed('fa-expand', false).classed('fa-compress', true);

                    map.dragging.enable();
                    map.touchZoom.enable();

                    this.bounds.update();
                }

                this.expanded = !this.expanded;
            });

        this.buttonIcon = this.button.append('i').attr('class', 'fa fa-compress');

        return containerDiv;
    }
});

