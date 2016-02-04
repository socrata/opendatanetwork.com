
class Navigate {
    static url(params) {
        const ids = params.regions
            .map(region => region.id)
            .join('-');
        const names = params.regions
            .map(region => region.name)
            .map(Navigate.escapeName)
            .join('-');

        let navigate = [];
        if (params.vector && params.vector !== '') {
            navigate.push(params.vector);
            if (params.metric) navigate.push(params.metric);
            if (params.year) navigate.push(params.year);
        }

        return `/region/${ids}/${names}/${navigate.join('/')}`;
    }

    static escapeName(name) {
        return name.replace(/,/g, '').replace(/[ \/]/g, '_');
    }
}

const VariableControl = L.Control.extend({
    initialize: function(source, params, onUpdate) {
        this.source = source;
        this.variables = source.variables;
        this.params = params;
        this.onUpdate = onUpdate;

        this.variable = _.find(this.variables, variable => variable.column === params.metric);
        this.variable = this.variable || this.variables[0];

        params.year = parseInt(params.year);
        this.year = _.contains(this.variable.years, params.year) ?
            params.year : _.max(this.variable.years);
    },

    options: {
        position: 'topleft'
    },

    update: function() {
        const url = Navigate.url(_.extend(this.params, {
            vector: this.source.name,
            year: this.year,
            metric: this.variable.column
        }));
        history.replaceState(null, null, url);

        this.onUpdate(this.variable, this.year);
    },

    onAdd: function(map) {
        const container = L.DomUtil.create('div', 'variable-container');
        this.container = d3.select(container);

        this.update();

        function optionDatum(select) {
            const value = select.property('value');
            const option = select.select(`option[value='${value}']`);
            return option.datum();
        }

        const variableSelect = this.container
            .append('select')
            .attr('class', 'variable-select')
            .on('change', () => {
                this.variable = optionDatum(variableSelect);
                if (!_.contains(this.variable.years, this.year)) this.year = _.max(this.variable.years);
                updateYearOptions();
                this.update();
            });

        const variableOptions = variableSelect
            .selectAll('option')
            .data(this.variables)
            .enter()
            .append('option')
            .property('selected', variable => variable === this.variable)
            .attr('value', variable => variable.name)
            .text(variable => variable.name);

        const yearSelect = this.container
            .append('select')
            .attr('class', 'year-select')
            .on('change', () => {
                this.year = optionDatum(yearSelect);
                this.update();
            });

        const updateYearOptions = () => {
            yearSelect.selectAll('option').remove();

            yearSelect
                .selectAll('option')
                .data(this.variable.years)
                .enter()
                .append('option')
                .property('selected', year => year === this.year)
                .attr('value', year => year)
                .text(year => year);
        }

        updateYearOptions();

        return container;
    }
});

