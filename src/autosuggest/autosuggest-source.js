'use strict';

class AutosuggestSource {
    constructor(config) {
        this.config = config;
    }

    /**
     * Searches for the given term using the autosuggest API.
     */
    get(term) {
        if (term === '') {
            return Promise.resolve([]);
        } else {
            const path = GlobalConstants.AUTOCOMPLETE_URL(this.config.suggestType);

            return AutosuggestSource.request(path, {
                limit: GlobalConstants.AUTOCOMPLETE_SHOWN_OPTIONS,
                query: term,
                app_token: GlobalConstants.APP_TOKEN
            }).then(response => Promise.resolve(response.options));
        }
    }

    display(container, options) {
        if (options.length === 0) return [];

        if (this.sort) options = _.sortBy(options, this.sort).slice(0, GlobalConstants.AUTOCOMPLETE_SHOWN_OPTIONS);
        if (this.filter) options = options.filter(this.filter);

        const category = container
            .append('li')
            .attr('class', 'autocomplete-category');

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

