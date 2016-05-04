
const ExpandCollapseControl = L.Control.extend({

    options: { position: 'topleft' },

    disableControls: function(map) {
        map.dragging.disable();
        map.touchZoom.disable();
        if (map.tap) map.tap.disable();
    },

    enableControls: function(map) {
        map.dragging.enable();
        map.touchZoom.enable();
        if (map.tap) map.tap.enable();
    },
    
    onAdd: function(map) {

        const containerDiv = L.DomUtil.create('div', 'leaflet-bar map-expand-collapse');

        this.expanded = (d3.select("body").node().getBoundingClientRect().width >= 800);

        if (this.expanded)
            this.enableControls(map);
        else
            this.disableControls(map);

        this.button = d3.select(containerDiv)
            .append('a')
            .attr('class', 'map-expand')
            .on('click', option => {

                if (this.expanded) {

                    $('#leaflet-map').animate({ height: 200 }, null, null, () => {
                        map.invalidateSize();
                    });

                    if (!this.buttonIcon.classed('fa-expand'))
                        this.buttonIcon.classed('fa-expand', true).classed('fa-compress', false);

                    this.disableControls(map);
               }
                else {

                    $('#leaflet-map').animate({ height: 500 }, null, null, () => {
                        map.invalidateSize();
                    });

                    if (this.buttonIcon.classed('fa-expand'))
                        this.buttonIcon.classed('fa-expand', false).classed('fa-compress', true);

                    this.enableControls(map);
                }

                this.expanded = !this.expanded;
            });

        this.buttonIcon = this.button.append('i').attr('class', this.expanded ? 'fa fa-compress' : 'fa fa-expand');

        return containerDiv;
    }
});

