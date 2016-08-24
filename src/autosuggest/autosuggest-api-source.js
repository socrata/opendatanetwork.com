
class AutosuggestApiSource extends AutosuggestSource {

    get(term) {

        return new Promise((resolve, reject) => {

            const options = [{ 
                text: 'Suggestions API Documentation',
                url: 'http://docs.odn.apiary.io/#reference/0/suggestions/get-suggestions',
            }];

            resolve(options);
        });
    }

    display(container, options, allOptionsCount) {

        if (options.length === 0) 
            return [];

        if (allOptionsCount == 1)
            return [];

        const category = container
            .append('li')
            .attr('class', 'autocomplete-category');

        category.append('a')
            .attr('class', 'small-api-link')
            .text('API');

        const results = category
            .append('ul')
            .attr('class', 'autocomplete-options sub-list');

        const self = this;

        return results
            .selectAll('li')
            .data(options)
            .enter()
            .append('li')
            .attr('class', 'autocomplete-option')
            .each(function(option) {
                d3.select(this).append('span').text(option.name || option.text);
            })
            .on('click', option => this.config.select(option))
            .on('mouseover.source', function() {
                d3.select(this).classed('selected hovered', true);
            })
            .on('mouseout.source', function() {
                d3.select(this).classed('selected hovered', false);
            })._groups[0];
    }
}

