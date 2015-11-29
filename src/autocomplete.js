
class Results {
    constructor(type, resultSelection, onSelect,
                encoded = false, showOption = result => result.text) {

        this.type = type;
        this.onSelect = onSelect;
        this.encoded = encoded;
        this.showOption = showOption;

        this.container = resultselection
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


class AutosuggestSource {
    constructor(name, domain, fxf, column, encoded, select, show) {
        this.name = name;
        this.domain = domain;
        this.fxf = fxf;
        this.column = column;
        this.encoded = encoded;
        this.select = select;
        this.show = show;
    }

    static fromJSON(json) {
        const encoded = json.encoded || [];
        const show = json.show || (option => option.text);

        return new AutosuggestSource(json.name, json.domain, json.fxf, json.column,
                                     encoded, json.select, show);
    }

    get(term) {
        return new Promise((resolve, reject) => {
            if (term === '') {
                resolve([]);
            } else {
                const url = Constants.AUTOCOMPLETE_URL(this.domain, this.fxf, this.column, term);
                $.getJSON(url).then(response => {
                    resolve(response.options.map(option => this.decode(option)));
                }, reject);
            }
        });
    }

    decode(option) {
        if (this.encoded.length > 0) {
            const allText = option.text;
            const index = allText.lastIndexOf(' ');
            const text = allText.substring(0, index);
            const base64 = allText.substring(index);
            const ascii = atob(base64);
            const attributes = ascii.split(Constants.AUTOCOMPLETE_SEPARATOR);

            return _.extend({text}, _.zip(this.encoded, attributes));
        } else {
            return {text: option.text};
        }
    }

    display(container, options) {
        return container
            .selectAll('li')
            .data(options)
            .enter()
            .append('li')
            .html(option => this.show(option))
            .on('click', option => this.select(option))
            .on('mouseover', function() {
                d3.select(this).classed('selected', true);
            })
            .on('mouseout', function() {
                d3.select(this).classed('selected', false);
            })[0];
    }
}


class AutosuggestResults {
    constructor(source, resultSelection) {
        this.source = source;

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

    display(term) {
        return new Promise((resolve, reject) => {
            this.source.get(term).then(options => {
                this.empty();

                if (options.length === 0) {
                    this.hide();
                    resolve([]);
                } else {
                    this.unhide();
                    resolve(this.source.display(this.results, options));
                }
            }, error => { throw error; });

        });
    }
}

class Autosuggest {
    constructor(inputSelector, resultSelector, sources) {
        this.inputSelection = d3.select(inputSelector);
        this.resultSelection = d3.select(resultSelector);

        this.sources = sources.map(AutosuggestSource.fromJSON);
        this.results = this.sources.map(source =>
                new AutosuggestResults(source, this.resultSelection));
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
            this.results.forEach(result => {
                result.display(term).then(div => {
                    console.log(div);
                });
            });
        }
    }
}

