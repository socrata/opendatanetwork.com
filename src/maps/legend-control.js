'use strict';

const LegendControl = L.Control.extend({
    options: {
        position: 'bottomright'
    },

    onAdd: function(map) {
        const container = L.DomUtil.create('div', 'legend-control');
        this.container = d3.select(container);
        return container;
    },

    update: function(summaryStats, scaleRange) {
        this.container.selectAll('*').remove();

        const dimension = 10;
        const range = scaleRange.slice();
        range.reverse();
        const height = range.length * dimension;

        const legendContainer = this.container
            .append('div')
            .attr('class', 'legend-container');

        const emptyIndexes = reverse(summaryStats.names)
            .map((value, index) => _.isEmpty(value) ? index : null)
            .filter(_.isNumber);
        const tickLabels = reverse(summaryStats.names);
        _.pullAt(tickLabels, emptyIndexes);
        const tickValues = reverse(summaryStats.values_formatted);
        _.pullAt(tickValues, emptyIndexes);
        const tickStep = height / (tickValues.length - 1);

        const padding = 2;
        const baseline = 'middle';

        const legend = legendContainer
            .append('svg')
            .attr('height', height + 15)
            .attr('class', 'legend');

        const labelGroup = legend
            .append('g')
            .attr('class', 'labels');

        const labels = labelGroup
            .selectAll('text')
            .data(tickLabels)
            .enter()
            .append('text')
            .attr('class', 'tick-label')
            .text(label => label)
            .attr('text-anchor', 'end')
            .attr('alignment-baseline', baseline);

        const labelPadding = labelGroup.node().getBBox().width + dimension + padding;

        labels
            .attr('transform', (__, index) => {
                return `translate(${labelPadding - padding}, ${dimension + index * tickStep})`;
            });

        const tickGroup = legend
            .append('g')
            .attr('class', 'ticks');

        const ticks = tickGroup
            .selectAll('g.tick')
            .data(tickValues)
            .enter()
            .append('g')
            .attr('class', 'tick')
            .attr('transform', (__, index) => {
                return `translate(${labelPadding + dimension}, ${dimension + index * tickStep})`;
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

        //const formatter = variable.legendFormat || variable.format || _.identity;
        const formatter = _.identity;

        ticks
            .append('text')
            .attr('class', 'tick-value')
            .text(formatter)
            .attr('alignment-baseline', baseline)
            .attr('transform', `translate(${dimension * 2 + padding}, 0)`);

        const colors = legend
            .selectAll('rect')
            .data(range)
            .enter()
            .append('rect')
            .attr('class', 'legend-element')
            .attr('x', labelPadding + dimension)
            .attr('y', (__, index) => (index + 1) * dimension)
            .attr('width', dimension)
            .attr('height', dimension)
            .style('fill', color => color)
            .style('fill-opacity', GlobalConfig.maps.legend_opacity);

        legend
            .append('rect')
            .attr('class', 'legend-box')
            .attr('x', labelPadding + dimension).attr('y', dimension)
            .attr('width', dimension).attr('height', height);

        legend.attr('width', legend.node().getBBox().width + dimension * 2);
    }
});

function reverse(array) {
    const temp = array.slice();
    temp.reverse();
    return temp;
}
