
const TooltipControl = L.Control.extend({
    options: {
        position: 'topright'
    },

    onAdd: function(map) {
        const containerDiv = L.DomUtil.create('div', 'tooltip');
        this.container = d3.select(containerDiv);

        this.name = this.container
            .append('div')
            .attr('class', 'name');

        this.value = this.container
            .append('div')
            .attr('class', 'value');

        return containerDiv;
    },

    show: function(name, value) {
        this.name.text(name);
        this.value.text(value);

        this.unhide();
    },

    showRegion: function(region) {
        this.show(region.name, `${region.valueName}: ${region.valueFormatted}`);
    },

    hide: function() {
        this.container.style('display', 'none');
    },

    unhide: function() {
        this.container.style('display', 'inline');
    }
});

