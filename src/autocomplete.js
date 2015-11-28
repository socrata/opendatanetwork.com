

class Complete {
    constructor(queryBuilder, results) {
        this.queryBuilder = queryBuilder;
        this.results = results;
    }

    get(query) {
        if (query === '') {
            return [];
        } else {
            this.results.handle($.getJSON(this.queryBuilder(query)));
        }
    }
}


class Results {
    constructor(type, resultSelection, onSelect,
                encoded = false, showResult = result => result.text) {

        this.type = type;
        this.onSelect = onSelect;
        this.encoded = encoded;
        this.showResult = showResult;

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
            .html(this.showResult)
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
        if (term === '') {
            this.resultSelection.style('display', 'none');
        } else {
            this.resultSelection.style('display', 'block');

            this.completers.forEach(completer => {
                completer.get(term);
            });
        }
    }
}

