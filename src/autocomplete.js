
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

            return _.extend({text}, _.object(this.encoded, attributes));
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
                d3.select(this)
                    .classed('selected', true)
                    .classed('hovered', true);
            })
            .on('mouseout', function() {
                d3.select(this)
                    .classed('selected', false)
                    .classed('hovered', true);
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
            .text(this.source.name);

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

function delay(milliseconds) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, milliseconds);
    });
}

class Autosuggest {
    constructor(resultSelector, sources) {
        this.resultSelection = d3.select(resultSelector)
            .style('display', 'block');

        this.sources = sources.map(AutosuggestSource.fromJSON);
        this.results = this.sources.map(source =>
                new AutosuggestResults(source, this.resultSelection));

        this.ready = false;
        this.options = [];
        this.index = -1;

        this._typing = false;
        this._ready = true;
        this._currentTerm = '';
    }

    listen(inputSelector) {
        const self = this;

        const input = d3.select(inputSelector)
            .on('keydown', function() {
                self.keydown(d3.event.keyCode);
                d3.event.stopPropagation();
            })
            .on('input', function() {
                self.throttledSuggest(this.value);
            });
    }

    throttledSuggest(term) {
        delay(Constants.AUTOCOMPLETE_WAIT_MS).then(() => {
            if (term === this._currentTerm) {
                this.suggest(term);
            }
        });

        this._currentTerm = term;
    }

    suggest(term) {
        if (term === '') {
            this.hide();
        } else {
            let completed = 0;

            this.results.forEach(result => {
                result.display(term).then(options => {
                    completed += 1;

                    if (completed === this.sources.length) {
                        this.ready = true;
                        this.options = this.resultSelection.selectAll('li')[0];
                        console.log(this.options);
                    }
                });
            });
        }
    }

    keydown(keyCode) {
        if (this.ready) {
            this.updateIndex();
            console.log(this.index);

            if (keyCode == 38) {
                this.up();
            } else if (keyCode == 40) {
                this.down();
            }

            console.log(this.index);

            this.updateSelected();
        } else {
            console.log('not ready');
        }
    }

    down() {
        if (this.index < this.options.length - 1) {
            this.index += 1;
        }
    }

    up() {
        if (this.index > 0) {
            this.index -= 1;
        }
    }

    updateIndex() {
        this.options.forEach((element, index) => {
            if (d3.select(element).classed('hovered'))
                this.index = index;
        });
    }

    updateSelected() {
        this.options.forEach((element, index) => {
            d3.select(element)
                .classed('selected', index == this.index);
        });
    }
}

