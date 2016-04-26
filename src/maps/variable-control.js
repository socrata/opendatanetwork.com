
class Navigate {
    static regions(params) {
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

    static search(params) {
        return `/search/${params.vector || 'population'}`;
    }

    static url(params) {
        const path = (params.regions && params.regions.length > 0) ?
            Navigate.regions(params) : Navigate.search(params);
        const search = Navigate.params(params);

        return `${path}?${search}`;
    }

    static params(params) {
        const urlParams = ['categories', 'domains', 'tags', 'debug']
            .concat(params.regions && params.regions.length > 0 ? [] : ['q', 'page']);
        const availableParams = urlParams
            .map(name => [name, params[name]])
            .filter(([name, value]) => (value && (value.constructor != Array || value.length > 0)));

        return $.param(_.object(availableParams), true);
    }

    static escapeName(name) {
        return name.replace(/,/g, '').replace(/[ \/]/g, '_');
    }
}

class VariableControl {
    constructor(source, params, onUpdate) {
        this.source = source;
        this.variables = source.variables;
        this.variableFilter = source.variableFilter || ((regions, source) => {
            return new Promise((resolve, reject) => {
                resolve(source.variables);
            });
        });
        this.params = params;
        this.onUpdate = onUpdate;

        this.variable = _.find(this.variables, variable => variable.metric === params.metric);
        this.variable = this.variable || this.variables[0];

        if (this.variable.years) {
            params.year = parseInt(params.year);
            this.year = _.contains(this.variable.years, params.year) ?
                params.year : _.max(this.variable.years);
            this.hasYear = true;
        } else {
            this.hasYear = false;
        }
    }

    update() {
        const url = Navigate.url(_.extend(this.params, {
            vector: Navigate.escapeName(this.source.name),
            year: this.year,
            metric: this.variable.metric
        }));

        d3.selectAll('a.region-link').each(function() {
            const link = d3.select(this);
            const currentHref = link.attr('href');
            const variables = url.split('/').slice(4);
            const href = currentHref.split('/').slice(0, 4).concat(variables).join('/');
            link.attr('href', href);
        });

        history.replaceState(null, null, url);

        this.onUpdate(this.variable, this.year);
    }

    updateVariable(variable, update) {
        if (this.variable.name !== variable.name) {
            this.variable = variable;
            if (this.hasYear && !_.contains(this.variables.years, this.year)) this.year = _.max(this.variable.years);
            if (update === undefined || update) this.update();
            this.updateSelectors();
        }
    }

    onAdd(map, regions, containerSelector) {
        this.container = d3.select(containerSelector);
        this.regions = regions;

        function optionDatum(select) {
            const value = select.property('value');
            const option = select.select(`option[value='${value}']`);
            return option.datum();
        }

        const variableContainer = this.container
            .append('li')
            .attr('id', 'map-variable-text')
            .attr('class', 'map-variable-container');

        const variableLink = variableContainer
            .append('span')
            .attr('class', 'data-source-menu-header-mobile');

        variableLink.append('i').attr('class', 'fa fa-caret-down odn-caret');
        this.variableSelector = variableLink.append('span');

        const drawVariableList = variables => {
            if (variables.length > 0 &&
                !_.contains(variables, this.variable)) {
                this.updateVariable(variables[0], false);
            }

            if (variables.length === 0) variables = this.source.variables;

            const variableList = variableContainer
                .append('ul')
                .attr('class', 'chart-sub-nav-menu')
                .attr('id', 'map-variable-list')
                .selectAll('li')
                .data(variables)
                .enter()
                .append('li')
                .append('a')
                .text(variable => variable.name)
                .on('click', variable => { 
                    this.updateVariable(variable);
                    $('.chart-sub-nav li').trigger('mouseleave');
                });

            this.update();
        };

        this.variableFilter(regions, this.source).then(drawVariableList, error => {
            console.log(error);
            drawVariableList(this.source.variables);
        });

        if (this.hasYear) {

            this.container
                .append('li')
                .attr('class', 'map-variable-year-container')
                .append('span')
                .attr('class', 'map-variable-year-link data-source-menu-header-mobile');
        }

        this.updateSelectors();
    }

    updateYearSelectors(variableChanged) {

        if (this.hasYear) {

            d3.selectAll('.map-variable-year-link')
                .text(this.year)
                .append('i')
                .attr('class', `fa fa-caret-${variableChanged ? 'down' : 'up'} odn-caret`);
        }
    }

    updateSelectors() {
        this.variableSelector.text(this.variable.name);

        const updateYears = () => {
            this.updateYearSelectors(true);

            var yearContainer = d3.selectAll('.map-variable-year-container');
            yearContainer.selectAll('ul').remove();
            yearContainer
                .append('ul')
                .attr('class', 'chart-sub-nav-menu')
                .selectAll('li')
                .data(this.variable.years)
                .enter()
                .append('li')
                .append('a')
                .text(year => year)
                .on('click', year => {
                    if (this.year !== year) {
                        this.year = year;
                        this.update();
                        this.updateYearSelectors(false);
                    }
                    $('.chart-sub-nav li').trigger('mouseleave');
                });
        };

        if (this.hasYear && this.regions) {
            const url = `https://${this.source.domain}/resource/${this.source.fxf}?
                $where=id+in+(${this.regions.map(region => `'${region.id}'`).join(',')})+AND+${this.variable.column}+IS+NOT+NULL&
                $select=year&
                $group=year&
                $order=year+DESC`.replace(/[ \n]/g, '');

            d3.promise.json(url).then(response => {
                const years = response.map(_.property('year'));
                if (years.length > 0) {
                    this.variable.years = years;
                    if (!_.contains(years, this.year)) {
                        this.year = years[0];
                        this.update();
                    }
                }

                updateYears();
            }, error => {
                updateYears();
            });
        }
    }
}

