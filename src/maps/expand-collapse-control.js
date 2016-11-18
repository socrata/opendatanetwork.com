'use strict';

const ExpandCollapseControl = L.Control.extend({

    options: { position: 'topleft' },

    onAdd: function(map) {

        const containerDiv = L.DomUtil.create('div', 'leaflet-bar map-expand-collapse');

        this.expanded = (d3.select("body").node().getBoundingClientRect().width > GlobalConfig.mobile_width);

        if (this.expanded)
            this.enableControls(map);
        else
            this.disableControls(map);

        this.button = d3.select(containerDiv)
            .append('a')
            .attr('class', 'map-expand')
            .on('click', option => {

                if (this.expanded)
                    this.collapseMap(map);
                else
                    this.expandMap(map);

                d3.event.stopPropagation();
            });

        this.buttonIcon = this.button.append('i').attr('class', this.expanded ? 'fa fa-compress' : 'fa fa-expand');

        return containerDiv;
    },

    disableControls: function(map) {

        map.dragging.disable();
        map.touchZoom.disable();
        if (map.tap) map.tap.disable();

        map.once('click', () => {
            this.expandMap(map);
        });
    },

    enableControls: function(map) {

        map.dragging.enable();
        map.touchZoom.enable();
        if (map.tap) map.tap.enable();
    },

    expandMap: function(map) {

        $('#leaflet-map').animate({ height: 500 }, null, null, () => {
            map.invalidateSize();
        });

        this.buttonIcon.classed('fa-expand', false).classed('fa-compress', true);
        this.enableControls(map);
        this.expanded = true;
    },

    collapseMap: function(map) {

        $('#leaflet-map').animate({ height: 300 }, null, null, () => {
            map.invalidateSize();
        });

        this.buttonIcon.classed('fa-compress', false).classed('fa-expand', true);
        this.disableControls(map);
        this.expanded = false;
    }
});

