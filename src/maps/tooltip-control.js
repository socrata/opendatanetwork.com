'use strict';

class MapBounds {
    constructor($div) {
        this.$div = $div;
        this.update();
    }

    update() {
        const { left: x1, top: y1 } = this.$div.offset();
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = this.x1 + this.$div.width();
        this.y2 = this.y1 + this.$div.height();
        this.centerX = this.x1 + (this.x2 - this.x1) / 2;
        this.centerY = this.y1 + (this.y2 - this.y1) / 2;
    }

    normalize([x, y]) {
        return [x - this.x2, y - this.y2];
    }

    quadrant([x, y]) {
        return [x - this.centerX < 0, y - this.centerY < 0];
    }
}

const TooltipControl = L.Control.extend({
    options: {
        position: 'bottomright'
    },

    onAdd: function(map) {
        const containerDiv = L.DomUtil.create('div', 'tooltip');
        this.container = d3.select(containerDiv)
            .style('display', 'none')
            .attr('id', 'tooltip');
        this.$container = $(this.container[0]);

        this.name = this.container
            .append('div')
            .attr('class', 'name');

        this.value = this.container
            .append('div')
            .attr('class', 'value');

        this.shown = false;

        const bounds = new MapBounds($('#leaflet-map'));

        window.onresize = () => {
            bounds.update();
        };

        document.addEventListener('mousemove', (e) => {
            if (this.shown) {
                const point = [e.pageX, e.pageY];
                const [x, y] = bounds.normalize(point);
                const [left, top] = bounds.quadrant(point);

                const p = GlobalConfig.maps.tooltip_padding;
                const dispX = left ? x + this.width + p : x - p;
                const dispY = top ? y + this.height + p : y - p;

                this.container
                    .style('left', `${dispX}px`)
                    .style('top', `${dispY}px`);
            }
        });

        return containerDiv;
    },

    show: function(name, value) {
        this.name.text(name);
        this.value.text(value);

        this.width = this.$container.width();
        this.height = 48;

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

