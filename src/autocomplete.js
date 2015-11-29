

class Complete {
    constructor(queryBuilder, results) {
        this.queryBuilder = queryBuilder;
        this.results = results;
    }

    get(query) {
        return $.getJSON(this.queryBuilder(query));
    }
}


class Results {
    constructor(type, resultSelection, onSelect,
                encoded = false, showOption = result => result.text) {

        this.type = type;
        this.onSelect = onSelect;
        this.encoded = encoded;
        this.showOption = showOption;

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
            if (options.length === 0) {
                this.hide();
            } else {
                this.unhide();
                this.show(options);
            }
        };

        const failure = error => {
            throw error;
        };

        resultsPromise.then(success, failure);
    }

    decode(option) {
        if (this.encoded) {
            const allText = option.text;
            const index = allText.lastIndexOf(' ');
            const text = allText.substring(0, index);
            const base64 = allText.substring(index);
            const ascii = atob(base64);
            const attributes = ascii.split(Constants.AUTOCOMPLETE_SEPARATOR);

            return {text, attributes};
        } else {
            return {text: option.text};
        }
    }

    show(options) {
        const decoded = options.map(option => this.decode(option));

        this.results
            .selectAll('li')
            .data(decoded)
            .enter()
            .append('li')
            .html(this.showOption)
            .on('mouseover', function() {
                d3.select(this).classed('selected', true);
            })
            .on('mouseout', function() {
                d3.select(this).classed('selected', false);
            })
            .on('click', option => {
                this.onSelect(option);
            });
    }
}


class Autosuggest{
    constructor(inputSelector, resultSelector, sources) {
        this.input = d3.select(inputSelector);
        this.results = d3.select(resultSelector);

        this.sources = sources.map(Autosuggest.parseSource);
    }

    static parseSource(source) {
        const encoded = source.encoded || [];
        const show = source.show || (option => option.text);
        const url = term =>
            Constants.AUTOCOMPLETE_URL(source.domain, source.fxf, source.column, term);
        const get = term => $.getJSON(url(term));

        return _.extend(source, {encoded, show, url, get});
    }

    hide() {
        this.results.style('display', 'none');
    }

    unhide() {
        this.results.style('diplay', 'block');
    }

    listen() {

    }

    suggest(term) {
        if (term === '') {
            this.hide();
        } else {
            this.sources.forEach(source => {
                console.log(source);
                console.log(source.get(term));
                source.get(term).then(results => {
                    console.log(results);
                }, error => { throw error; });
            });
        }
    }
}


class AutoSuggestRegionController {
    listen() {
        const self = this;
        self.inputSelection.on('input', function() {
            self.suggest(this.value);
        });
    }

    suggest(term) {
        if (term === '') {
            this.resultSelection.style('display', 'none');
        } else {
            this.resultSelection.style('display', 'block');

            this.working = true;
            const promises = this.completers.map(completer => completer.get(term));

            Promise.all(promises).then(values => {

            });


        }
    }
}

