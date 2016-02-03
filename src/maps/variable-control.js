
const VariableControl = L.Control.extend({
    initialize: function(source, onUpdate) {
        this.source = source;
        this.variables = source.variables;
        this.selectedIndices = source.selectedIndices;
        this.onUpdate = onUpdate;
    },

    options: {
        position: 'topleft'
    },

    onAdd: function(map) {
        const container = L.DomUtil.create('div', 'variable-container');
        this.container = d3.select(container);

        let currentVariable = this.variables[this.selectedIndices.variableSelectedIndex];
        let currentYear = currentVariable.years[this.selectedIndices.yearSelectedIndex];

        const update = () => {

            this.onUpdate(currentVariable, currentYear);
        };

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

