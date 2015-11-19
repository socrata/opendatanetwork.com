

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
            .on('mouseover', function() {
                d3.select(this).classed('selected', true);
            })
            .on('mouseout', function() {
                d3.select(this).classed('selected', false);
            })
            .on('click', option => {
                this.onSelect(option.text);
            });
    }
}


class AutoSuggestRegionController {
    constructor(inputSelection, resultSelection, completers) {
        this.inputSelection = inputSelection;
        this.resultSelection = resultSelection;
        this.completers = completers;
    }

    listen() {
        const self = this;
        self.inputSelection.on('input', function() {
            self.suggest(this.value);
        });
    }

    navigate(path) {
        window.location.href = path;
    }

    suggest(term) {
        if (term == '') {
            this.resultSelection.style('display', 'none');
        } else {
            this.resultSelection.style('display', 'block');

            this.completers.forEach(completer => {
                completer.get(term)
            });
        }
    }
}


// Autocomplete on datasets, regions, publishers, and categories.
function multiComplete(inputSelector, resultSelector) {
    function autocompleteURL(domain, fxf, column) {
        return query => `https://${domain}/views/${fxf}/columns/${column}/suggest/${query}?size=5`;
    }

    function navigate(path) {
        window.location.href = path;
    }

    const domain = 'odn.data.socrata.com';
    const inputSelection = d3.select(inputSelector);
    const resultSelection = d3.select(resultSelector);

    const datasetURL = autocompleteURL(domain, 'fpum-bjbr', 'name');
    const datasetSelect = dataset => navigate(`/search?q=${dataset}`);
    const datasetResults = new Results('Datasets', resultSelection, datasetSelect);
    const datasetComplete = new Complete(datasetURL, datasetResults);

    const regionURL = autocompleteURL(domain, '7g2b-8brv', 'autocomplete_name');
    const regionSelect = region => navigate(`/${region.replace(/ /g, '_')}`);
    const regionResults = new Results('Regions', resultSelection, regionSelect);
    const regionComplete = new Complete(regionURL, regionResults);

    const publisherURL = autocompleteURL(domain, '8ae5-ghum', 'domain');
    const publisherSelect = publisher => navigate(`/search?domains=${publisher}`);
    const publisherResults = new Results('Publishers', resultSelection, publisherSelect);
    const publisherComplete = new Complete(publisherURL, publisherResults);

    const categoryURL = autocompleteURL(domain, '864v-r7tf', 'category');
    const categorySelect = category => navigate(`/search?categories=${category}`);
    const categoryResults = new Results('Categories', resultSelection, categorySelect);
    const categoryComplete = new Complete(categoryURL, categoryResults);

    const completers = [datasetComplete, regionComplete,
                        publisherComplete, categoryComplete];

    return new AutoSuggestRegionController(inputSelection, resultSelection, completers);
}


const sourceComplete = (() => {
    const domain = 'odn.data.socrata.com';
    const fxf = 'pfgp-ifph';

    const nameToColumn = new Map();
    nameToColumn.set('population', 'population');
    nameToColumn.set('earnings', 'earnings');
    nameToColumn.set('education', 'education');
    nameToColumn.set('occupations', 'occupations');
    nameToColumn.set('cost_of_living', 'rpp');
    nameToColumn.set('gdp', 'gdp');

    const defaultColumn = 'population';

    function urlFor(column) {
        return query => `https://${domain}/views/${fxf}/columns/${column}/suggest/${query}?size=5`;
    }

    function navigate(path) {
        window.location.href = path;
    }

    return (inputSelector, resultSelector, name) => {
        const inputSelection = d3.select(inputSelector);
        const resultSelection = d3.select(resultSelector);

        const column = nameToColumn.has(name) ? nameToColumn.get(name) : defaultColumn;
        const url = urlFor(column);
        const select = region => navigate(`/${region.replace(/ /g, '_')}`);
        const results = new Results('Regions with Data', resultSelection, select);
        const complete = new Complete(url, results);

        return new AutoSuggestRegionController(inputSelection, resultSelection, [complete]);
    }
})();

