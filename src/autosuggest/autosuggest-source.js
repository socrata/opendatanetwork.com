'use strict';

class AutosuggestSource {
    constructor(config) {
        this.config = config;
    }

    /**
     * Searches for the given term using the autosuggest API.
     */
    get(term) {
        if (this.config.options)
            return Promise.resolve(this.config.options);

        const limit = GlobalConfig.autocomplete.shown_options;
        return odn.suggest(this.config.suggestType, term, limit, this.config.params);
    }

    display(container, options) {
        if (options.length === 0) return [];

        if (this.config.sort) options = _.sortBy(options, this.config.sort).slice(0, GlobalConfig.autocomplete.shown_options);
        if (this.config.filter) options = options.filter(this.config.filter);

        const category = container
            .append('li')
            .attr('class', 'autocomplete-category');

        if (this.config.onCategorySelection)
            this.config.onCategorySelection(category);

        if (this.config.image) {
            const name = category
                .append('label')
                .attr('class', 'autocomplete-title')
                .text(this.config.name);

            if (options.length > 1) {
                const image = category
                    .append('div')
                    .append('i')
                    .attr('class', `fa ${this.config.image}`);
            }
        }

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
                d3.select(this)
                    .append('a')
                    .attr('class', 'autocomplete-link')
                    .attr('href', self.config.select(option))
                    .text(option.name || option.text);
            })
            .on('click', option => {
                window.location.href = this.config.select(option);
            })
            .on('mouseover.source', function() {
                d3.select(this).classed('selected hovered', true);
            })
            .on('mouseout.source', function() {
                d3.select(this).classed('selected hovered', false);
            })._groups[0];
    }

    static url(path, params) {
        return `${path}?${$.param(params)}`;
    }

    static request(path, params) {
        return $.getJSON(AutosuggestSource.url(path, params));
    }
}

