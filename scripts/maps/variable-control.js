
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

        let currentVariable = this.variables[0];
        let currentYear = currentVariable.years[currentVariable.years.length - 1];

        const update = () => {
            this.callback(currentVariable, currentYear);
        }

        update();

        function optionDatum(select) {
            const value = select.property('value');
            const option = select.select(`option[value='${value}']`);
            return option.datum();
        }

        const variableSelect = this.container
            .append('select')
            .attr('class', 'variable-select')
            .on('change', () => {
                currentVariable = optionDatum(variableSelect);
                updateYearOptions();
                update();
            });

        const variableOptions = variableSelect
            .selectAll('option')
            .data(this.variables)
            .enter()
            .append('option')
            .property('selected', variable => variable === currentVariable)
            .attr('value', variable => variable.name)
            .text(variable => variable.name);

        const yearSelect = this.container
            .append('select')
            .attr('class', 'year-select')
            .on('change', () => {
                currentYear = optionDatum(yearSelect);
                update();
            });

        function updateYearOptions() {
            yearSelect.selectAll('option').remove();

            if (! _.contains(currentVariable.years, currentYear))
                currentYear = currentVariable.years[currentVariable.years.length - 1];

            yearSelect
                .selectAll('option')
                .data(currentVariable.years)
                .enter()
                .append('option')
                .property('selected', year => year === currentYear)
                .attr('value', year => year)
                .text(year => year);
        }

        updateYearOptions();

        return container;
    }
});

