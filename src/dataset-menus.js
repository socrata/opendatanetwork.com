
class ConstraintSelector {
    constructor(dataset, variable, entities, params) {
        this.dataset = dataset;
        this.constraints = dataset.constraints;
        this.variable = variable;
        this.entities = entities;

        // mapping from constraint name to list of available values
        this.constraintValues = {};
        // mapping from constraint name to selected value
        this.selectedConstraints = this.selectFromParams(params);

        this.initialized = false;

        this.menus = {};
    }

    selectFromParams(params) {
        return _.pick(params || {}, this.constraints);
    }

    init(constraintIndex) {
        constraintIndex = constraintIndex || 0;
        if (constraintIndex < 0 || constraintIndex >= this.constraints.length)
            return Promise.reject('constraint index out of bounds');
        const constraint = this.constraints[constraintIndex];

        return this.getAvailableValues(constraint).then(values => {
            // TODO what if no values
            this.constraintValues[constraint] = values;
            const constraintValid =
                _.includes(values, this.selectedConstraints[constraint]);

            if (!constraintValid)
                this.selectedConstraints[constraint] = _.first(values);

            if (constraintIndex < this.constraints.length - 1)
                return this.init(constraintIndex + 1);

            this.initialized = true;
            return Promise.resolve();
        });
    }

    getAvailableValues(constraint) {
        return ODN.getDataConstraint(this.entities, this.variable,
                constraint, _.omit(this.selectedConstraints, constraint)).then(response => {
            return Promise.resolve(response.permutations.map(_.property('constraint_value')));
        });
    }

    select(constraint, value) {
        if (!(_.includes(this.constraints, constraint)))
            return Promise.reject('invalid constraint');
        if (!(_.includes(this.constraintValues[constraint], value)))
            return Promise.reject('invalid value');
        if (this.selectedConstraints[constraint] === value)
            return Promise.resolve([]);

        this.selectedConstraints[constraint] = value;

        return this.init(this.constraints.indexOf(constraint));
    }

    createMenus() {
        const selection = d3.select('ul.chart-sub-nav');

        this.constraints.forEach(constraint => {
            const menu = new ConstraintMenu(constraint,
                this.selectedConstraints[constraint],
                this.constraintValues[constraint],
                selection);

            menu.onSelect(option => {
                this.select(constraint, option)
                    .then(() => this.updateMenus());
            });

            menu.draw();

            this.menus[constraint] = menu;
        });
    }

    updateMenus() {
        this.constraints.forEach(constraint => {
            const menu = this.menus[constraint];
            menu.updateOptions(this.constraintValues[constraint]);
            menu.updateSelected(this.selectedConstraints[constraint]);
            menu.update();
        });
    }

    draw() {
        this.createMenus();
        this.updateMenus();
    }
}

class ConstraintMenu {
    constructor(constraint, selected, options, selection) {
        this.constraint = constraint;
        this.selected = selected;
        this.options = options;
        this.selection = selection;
        this.selectCallback = _.identity;
    }

    onSelect(selectCallback) {
        this.selectCallback = selectCallback;
    }

    updateSelected(option) {
        this.selected = option;
    }

    updateOptions(options) {
        this.options = options;
    }

    draw() {
        this.container = this.selection
            .append('li')
            .attr('class', 'map-variable-year-container');

        this.selectedLink = this.container
            .append('span')
            .attr('class', 'map-variable-year-link refine-menu-header-mobile');

        this.selectedCaret = this.selectedLink
            .append('i')
            .attr('class', 'fa fa-caret-down odn-caret');

        this.selectedText = this.selectedLink
            .append('span');

        this.optionContainer = this.container
            .append('ul')
            .attr('class', 'chart-sub-nav-menu');

        this.container
            .on('mouseenter', () => {
                if (this.options.length === 0) return;
                this.container.classed('selected', true);
                this.optionContainer.style('display', 'block');
                this.selectedCaret.classed('fa-caret-down', false).classed('fa-caret-up', true);
            })
            .on('mouseleave', () => {
                this.container.classed('selected', false);
                this.optionContainer.style('display', 'none');
                this.selectedCaret.classed('fa-caret-down', true).classed('fa-caret-up', false);
            });
    }

    update() {
        this.selectedText
            .text(this.selected);

        this.optionContainer
            .selectAll('li')
            .data(this.options)
            .enter()
            .append('li')
            .append('a')
            .text(_.identity)
            .on('click', option => {
                this.container.on('mouseleave')();
                this.selectCallback(option);
            });
    }
}

class DatasetMenus {

    constructor(variables, selectedVariable, constraints, selectedConstraint) {

        this.variables = variables;
        this.selectedVariable = selectedVariable;
        this.constraints = constraints;
        this.selectedConstraint = selectedConstraint;

        this.variablesArray = _.toArray(this.variables).sort((a, b) => {
            return a.name.localeCompare(b.name);
        });

        this.refineControlsMobile = new RefineControlsMobile();
    }

    drawMenus() {

        // Desktop menus
        //
        this.drawMenu('ul.chart-sub-nav');
        this.attachMenuEventHandlers('ul.chart-sub-nav');

        // Mobile menus
        //
        this.drawMenu('ul.refine-menu-list-mobile');
        this.refineControlsMobile.attachMenuEventHandlers();
    }

    drawMenu(containerSelector) {

        this.drawVariablesMenu(containerSelector);
        this.drawConstraintsMenu(containerSelector);
    }

    attachMenuEventHandlers(containerSelector) {

        const container = d3.select(containerSelector);

        const variableContainer = container.selectAll('li')
            .on('mouseenter', function() {

                if ($(this).children('ul').length) {
                    $(this).addClass('selected');
                    $(this).children('span').children('i').removeClass('fa-caret-down').addClass('fa-caret-up');
                    $(this).children('ul').show();
                }
            })
            .on('mouseleave', function() {

                if ($(this).children('ul').length) {
                    $(this).removeClass('selected');
                    $(this).children('span').children('i').removeClass('fa-caret-up').addClass('fa-caret-down');
                    $(this).children('ul').hide();
                }
            });
    }

    drawVariablesMenu(containerSelector) {

       const container = d3.select(containerSelector);

       const variableContainer = container
            .append('li')
            .attr('id', 'map-variable-text')
            .attr('class', 'map-variable-container');

        const variableLink = variableContainer
            .append('span')
            .attr('class', 'refine-menu-header-mobile');

        variableLink
            .append('i')
            .attr('class', 'fa fa-caret-down odn-caret');

        variableLink
            .append('span')
            .text(this.selectedVariable.name);

        const variableList = variableContainer
            .append('ul')
            .attr('class', 'chart-sub-nav-menu')
            .attr('id', 'map-variable-list')
            .selectAll('li')
            .data(this.variablesArray)
            .enter()
            .append('li')
            .append('a')
            .text(variable => variable.name)
            .attr('href', function(d, i){
                // TODO: Refactor to a better url generation logic, than blind replacement
                // Stop gap measure for michigan demo.
                var queryParamsStr = location.href.split('?')[1] || '',
                    path = location.pathname,
                    pathPieces = path.split('/'),
                    constraint_value = pathPieces.pop();

                    pathPieces.pop(); //Getting rid of current filter variable.
                    pathPieces.push(d.id);
                    pathPieces.push(constraint_value);

                return pathPieces.join('/') + '?' + queryParamsStr;
            })
            .on('click', variable => {
                $('.chart-sub-nav li').trigger('mouseleave');
                $('.refine-menu-list-mobile .map-variable-container .refine-menu-header-mobile').trigger('click');
            });
    }

    drawConstraintsMenu(containerSelector) {

        const container = d3.select(containerSelector);

        const constraintContainer = container
            .append('li')
            .attr('class', 'map-variable-year-container');

        const constraintLink = constraintContainer
            .append('span')
            .attr('class', 'map-variable-year-link refine-menu-header-mobile');

        constraintLink
            .append('i')
            .attr('class', 'fa fa-caret-down odn-caret');

        constraintLink
            .append('span')
            .text(this.selectedConstraint.constraint_value);

        constraintContainer
            .append('ul')
            .attr('class', 'chart-sub-nav-menu')
            .selectAll('li')
            .data(this.constraints.permutations)
            .enter()
            .append('li')
            .append('a')
            .attr('href', function(d, i){
                // TODO: Refactor to a better url generation logic, than blind replacement
                // Stop gap measure for michigan demo.
                var queryParamsStr = location.href.split('?')[1] || '',
                    path = location.pathname,
                    pathPieces = path.split('/');

                    pathPieces.pop(); //Getting rid of current constraint value
                    pathPieces.push(d.constraint_value);

                return pathPieces.join('/') + '?' + queryParamsStr;
            })
            .text(permutation => permutation.constraint_value)
            .on('click', year => {
                $('.chart-sub-nav li').trigger('mouseleave');
                $('.refine-menu-list-mobile .map-variable-year-container .refine-menu-header-mobile').trigger('click');
            });
    }
}
