

class Complete {
    constructor(queryBuilder, results) {
        this.queryBuilder = queryBuilder;
        this.results = results;
    }

    get(query) {
        if (query == '') {
            return [];
        } else {
            this.results.handle($.getJSON(this.queryBuilder(query)));
        }
    }
}


class Results {
    constructor(type, resultSelection, onSelect) {
        this.type = type;
        this.onSelect = onSelect;

        this.container = resultSelection
            .append('div')
            .attr('class', 'autocomplete-results-container')
            .style('display', 'none');

        this.title = this.container
            .append('p')
            .attr('class', 'autocomplete-results-title')
            .text(this.type);

        this.results = this.container
            .append('div')
            .attr('class', 'autocomplete-results');
    }

    hide() {
        this.container.style('display', 'none');
    }

    unhide() {
        this.container.style('display', 'block');
    }

    empty() {
        this.results.html('');
    }

    handle(resultsPromise) {
        const success = results => {
            this.empty();

            const options = results.options;
            if (options.length == 0) {
                this.hide();
            } else {
                this.unhide();
                this.show(options);
            }
        }

        const failure = error => {
            throw error;
        }

        resultsPromise.then(success, failure);
    }

    show(options) {
        this.results
            .selectAll('li')
            .data(options)
            .enter()
            .append('li')
            .html(option => option.text)
            .on('click', option => {
                this.onSelect(option.text);
            });
    }
}


class AutoSuggestRegionController {
    constructor(inputSelector, resultSelector) {
        const self = this;

        d3.select(inputSelector).on('input', function() {
            self.suggest(this.value);
        });

        function autocompleteURL(domain, fxf, column) {
            return query => `https://${domain}/views/${fxf}/columns/${column}/suggest/${query}?size=5`;
        }

        const domain = 'odn.data.socrata.com';
        this.resultSelection = d3.select(resultSelector);

        const datasetURL = autocompleteURL(domain, 'fpum-bjbr', 'name');
        const datasetResults = new Results('Datasets', this.resultSelection);
        const datasetComplete = new Complete(datasetURL, datasetResults);

        const regionURL = autocompleteURL(domain, '7g2b-8brv', 'autocomplete_name');
        const regionSelect = region => {
            this.navigate({'action': region.replace(/ /g, '_')});
        }
        const regionResults = new Results('Regions', this.resultSelection, regionSelect);
        const regionComplete = new Complete(regionURL, regionResults);

        const publisherURL = autocompleteURL(domain, '8ae5-ghum', 'domain');
        const publisherResults = new Results('Publishers', this.resultSelection);
        const publisherComplete = new Complete(publisherURL, publisherResults);

        const categoryURL = autocompleteURL(domain, '864v-r7tf', 'category');
        const categoryResults = new Results('Categories', this.resultSelection);
        const categoryComplete = new Complete(categoryURL, categoryResults);

        this.completers = [datasetComplete, regionComplete,
                           publisherComplete, categoryComplete];

        this.$form = $('form');
        this.$query = $('q');
    }

    navigate(params) {
        this.$form.attr(params);
        this.$query.val('');
        this.$form.submit();
    }

    suggest(term) {
        this.resultSelection.style('display', 'block');

        this.completers.forEach(completer => {
            completer.get(term)
        });
    }
}

