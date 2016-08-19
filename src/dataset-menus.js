
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
