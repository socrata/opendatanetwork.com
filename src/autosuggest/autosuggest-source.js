
class AutosuggestSource {

    constructor(config) {

        this.config = config;
    }

    /**
     * Searches for the given term using the autosuggest API.
     */
    get(term) {
        return new Promise((resolve, reject) => {

            if (term === '') {

                resolve([]);
            } 
            else {

                term = Stopwords.strip(term);

                const path = Constants.AUTOCOMPLETE_URL(this.config.suggestType);

                AutosuggestSource.request(
                    path, 
                    { 
                        limit: 5, 
                        query: term,
                        app_token: Constants.APP_TOKEN
                    }).then(response => {

                    resolve(response.options);
                }, reject);
            }
        });
    }

    display(container, options) {
        if (options.length === 0) return [];

        if (this.sort) options = _.sortBy(options, this.sort).slice(0, Constants.AUTOCOMPLETE_SHOWN_OPTIONS);
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

    static url(path, params) {
        return `${path}?${$.param(params)}`;
    }

    static request(path, params) {
        return $.getJSON(AutosuggestSource.url(path, params));
    }
}

