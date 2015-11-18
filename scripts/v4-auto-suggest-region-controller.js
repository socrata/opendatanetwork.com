

class Complete {
    constructor(type, queryBuilder, resultSelection) {
        this.type = type;
        this.queryBuilder = queryBuilder;
        this.results = new Results(type, resultSelection);
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
    constructor(type, resultSelection) {
        this.type = type;

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
            .html(option => option.text);
    }
}


class AutoSuggestRegionController {
    constructor(inputSelector, resultSelector, onClickRegion) {
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
        const datasetComplete = new Complete('Datasets', datasetURL, this.resultSelection);

        const regionURL = autocompleteURL(domain, '7g2b-8brv', 'autocomplete_name');
        const regionComplete = new Complete('Regions', regionURL, this.resultSelection);

        const publisherURL = autocompleteURL(domain, '8ae5-ghum', 'domain');
        const publisherComplete = new Complete('Publishers', publisherURL, this.resultSelection);

        const categoryURL = autocompleteURL(domain, '864v-r7tf', 'category');
        const categoryComplete = new Complete('Categories', categoryURL, this.resultSelection);

        this.completers = [datasetComplete, regionComplete,
                           publisherComplete, categoryComplete];
    }

    suggest(term) {
        this.resultSelection.style('display', 'block');

        this.completers.forEach(completer => {
            completer.get(term)
        });
    }
}

