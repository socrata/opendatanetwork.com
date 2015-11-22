
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
        console.log(year);

        const update = () => {
            this.callback(variable, year);
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
                variable = optionDatum(variableSelect);
                setYearOptions(variable);
                update();
            });

        const variableOptions = variableSelect
            .selectAll('option')
            .data(this.variables)
            .enter()
            .append('option')
            .attr('value', variable => variable.name)
            .text(variable => variable.name);

        const yearSelect = this.container
            .append('select')
            .attr('class', 'year-select')
            .on('change', () => {
                year = optionDatum(yearSelect);
                update();
            });

        function setYearOptions(variable) {
            yearSelect.selectAll('option').remove();

            if (! _.contains(variable.years, year))
                year = variable.years[variable.years.length - 1];

            yearSelect
                .selectAll('option')
                .data(variable.years)
                .enter()
                .append('option')
                .attr('value', year => year)
                .text(year => year);
        }

        setYearOptions(variable);

        return container;
    }
});

