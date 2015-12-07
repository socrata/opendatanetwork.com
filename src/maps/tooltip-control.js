
const TooltipControl = L.Control.extend({
    options: {
        position: 'bottomright'
    },

    onAdd: function(map) {
        const containerDiv = L.DomUtil.create('div', 'tooltip');
        this.container = d3.select(containerDiv)
            .style('display', 'none');

        this.name = this.container
            .append('div')
            .attr('class', 'name');

        this.value = this.container
            .append('div')
            .attr('class', 'value');

        this.shown = false;

        const $map = $('#map');
        const offset = $map.offset();
        let mapX = offset.left;
        let mapY = offset.top;
        const mapWidth = $map.width();
        const mapHeight = $map.height();

        window.onresize = () => {
            const offset = $map.offset();
            mapX = offset.left;
            mapY = offset.top;
        };

        document.addEventListener('mousemove', (e) => {
            if (this.shown) {
                const x = e.pageX - mapX - mapWidth;
                const y = e.pageY - mapY - mapHeight;
                this.container
                    .style('left', `${x - 20}px`)
                    .style('top', `${y - 10}px`);
            }
        });

        return containerDiv;
    },

    show: function(name, value) {
        this.name.text(name);
        this.value.text(value);

        this.unhide();
    },

    showRegion: function(region) {
        this.show(region.name,
                  `${region.valueName} (${region.year}): ${region.valueFormatted}`);
    },

    hide: function() {
        this.shown = false;
        this.container.style('display', 'none');
    },

    unhide: function() {
        this.shown = true;
        this.container.style('display', 'inline');
    }
});

