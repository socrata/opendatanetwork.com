
const VariableControl = L.Control.extend({
    initialize: function(variables) {
        this.variables = variables;
    },

    options: {
        position: 'topleft'
    },

    onAdd: function(map) {
        const container = L.DomUtil.create('div', 'variable-container');
        this.container = d3.select(container);

        const variableSelect = this.container
            .append('select')
            .attr('class', 'variable-select')

        const variableOptions = variableSelect
            .selectAll('option')
            .data(this.variables)
            .enter()
            .append('option')
            .attr('value', variable => variable.name)
            .text(variable => variable.name);

        return container;
    }
});

