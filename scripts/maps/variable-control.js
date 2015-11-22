
const VariableControl = L.Control.extend({
    initialize: function(variables, callback) {
        this.variables = variables;
        this.callback = callback;
    },

    options: {
        position: 'topleft'
    },

    onAdd: function(map) {
        const container = L.DomUtil.create('div', 'variable-container');
        this.container = d3.select(container);

        let variable = this.variables[0];
        let year = variable.years[variable.years.length - 1];

        const update = () => {
            this.callback(variable, year);
        }

        const variableSelect = this.container
            .append('select')
            .attr('class', 'variable-select')
            .on('change', () => {
                const value = variableSelect.property('value');
                const option = variableSelect.select(`option[value='${value}']`);
                variable = option.datum();

                update();
            });

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

