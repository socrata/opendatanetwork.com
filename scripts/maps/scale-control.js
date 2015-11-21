
const ScaleControl = L.Control.extend({
    initialize: function(scale, variable) {
        this.scale = scale;
        this.variable = variable;
    },

    options: {
        position: 'bottomleft'
    },

    onAdd: function(map) {
        const container = L.DomUtil.create('div', 'legend-container');

        const legendContainer = d3.select(container)
            .append('div')
            .attr('class', 'legend-container');

        const dimension = 10;
        const range = this.scale.range.slice();
        range.reverse();
        const height = range.length * dimension;
        const width = 200;
        const xOffset = width / 2;

        const values = _.filter(this.scale.values, value => !(isNaN(value)))
        const [min, max] = d3.extent(values);
        const lowerQuartile = d3.quantile(values, 0.25);
        const median = d3.median(values);
        const upperQuartile = d3.quantile(values, 0.75);

        const tickValues = [max, upperQuartile, median, lowerQuartile, min];
        const tickNames = ['maximum', 'upper quartile', 'median', 'lower quartile', 'minimum'];
        const tickData = _.zip(tickValues, tickNames);
        const tickStep = height / (tickData.length - 1);

        const legend = legendContainer
            .append('svg')
            .attr('width', width)
            .attr('height', height + 30 + dimension * 3)
            .attr('class', 'legend');

        const legendName = legend
            .append('text')
            .attr('class', 'legend-name')
            .attr('text-anchor', 'middle')
            .attr('x', xOffset + dimension / 2).attr('y', dimension * 1.2)
            .text(this.variable.name);

        const tickGroup = legend
            .append('g')
            .attr('class', 'ticks');

        const ticks = tickGroup
            .selectAll('g.tick')
            .data(tickData)
            .enter()
            .append('g')
            .attr('class', 'tick')
            .attr('transform', (__, index) => {
                return `translate(${xOffset}, ${3 * dimension + index * tickStep})`;
            });

        ticks
            .append('line')
            .attr('class', 'tick-line')
            .attr('x1', dimension).attr('y1', 0)
            .attr('x2', dimension * 2).attr('y2', 0);

        ticks
            .append('line')
            .attr('class', 'tick-line')
            .attr('x1', -dimension).attr('y1', 0)
            .attr('x2', 0).attr('y2', 0);

        const baseline = 'middle';
        const padding = 2;

        ticks
            .append('text')
            .attr('class', 'tick-value')
            .text(tick => this.variable.format(tick[0]))
            .attr('alignment-baseline', baseline)
            .attr('transform', `translate(${dimension * 2 + padding}, 0)`);

        ticks
            .append('text')
            .attr('class', 'tick-label')
            .text(tick => tick[1])
            .attr('text-anchor', 'end')
            .attr('alignment-baseline', baseline)
            .attr('transform', `translate(${-(dimension + padding)}, 0)`);

        const colors = legend
            .selectAll('rect')
            .data(range)
            .enter()
            .append('rect')
            .attr('class', 'legend-element')
            .attr('x', xOffset)
            .attr('y', (__, index) => (index + 3) * dimension)
            .attr('width', dimension)
            .attr('height', dimension)
            .style('stroke', 'none')
            .style('fill', color => color);

        legend
            .append('rect')
            .attr('class', 'legend-box')
            .attr('x', xOffset).attr('y', dimension * 3)
            .attr('width', dimension).attr('height', height);

        return container;
    }
});

