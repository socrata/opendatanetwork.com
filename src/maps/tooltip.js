
class MapTooltip {
    constructor(container) {
        this.container = container
            .append('div')
            .attr('class', 'tooltip');

        this.name = this.container
            .append('div')
            .attr('class', 'name');

        this.value = this.container
            .append('div')
            .attr('class', 'value');
    }

    show(name, value) {
        this.name.text(name);
        this.value.text(value);

        this.unhide();
    }

    showRegion(region) {
        this.show(region.name, `${region.valueName}: ${region.valueFormatted}`);
    }

    hide() {
        console.log(this);
        this.container.style('display', 'none');
    }

    unhide() {
        this.container.style('display', 'inline');
    }
}
