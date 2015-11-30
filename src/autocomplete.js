
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
        if (options.length === 0)
            return [];

        const category = container
            .append('div')
            .attr('class', 'autocomplete-category');

        const name = category
            .append('p')
            .attr('class', 'autocomplete-title')
            .text(this.name);

        const results = category
            .append('div')
            .attr('class', 'autocomplete-options');

        return results
            .selectAll('li')
            .data(options)
            .enter()
            .append('li')
            .html(option => this.show(option))
            .on('click', option => this.select(option))
            .on('mouseover.source', function() {
                d3.select(this).classed('selected hovered', true);
            })
            .on('mouseout.source', function() {
                d3.select(this).classed('selected hovered', false);
            })[0];
    }
}


class AutosuggestResults {
    constructor(resultSelector) {
        this.results = d3.select(resultSelector);

        this.options = [];
        this.index = -1;
    }

    hide() {
        this.results.style('display', 'none');
    }

    unhide() {
        this.results.style('display', 'block');
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

    show(sources, allOptions) {
        this.empty();

        const nestedSelections = sources.map((source, index) => {
            const options = allOptions[index];
            return source.display(this.results, options);
        });

        this.updateOptions(_.flatten(nestedSelections));
    }

    updateSelected() {
        this.options.forEach((option, index) => {
            option.classed('selected', index === this.index);
        });
    }

    updateOptions(options) {
        this.options = options.map(option => d3.select(option));

        this.options.forEach((option, index) => {
            option.on('mouseover.results', () => {
                this.index = index;
                this.updateSelected();
            }).on('mouseout.results', () => {
                this.index = -1;
                this.updateSelected();
            });
        });
    }

    keydown(keyCode) {
        if (keyCode == 38) {
            this.up();
        } else if (keyCode == 40) {
            this.down();
        }

        this.updateSelected();
    }

    down() {
        if (this.index < this.options.length - 1) {
            this.index += 1;
        }
    }

    up() {
        if (this.index >= 0) {
            this.index -= 1;
        }
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
        this.results = new AutosuggestResults(resultSelector);

        this.ready = false;
        this.options = [];
        this.index = -1;

        this._currentTerm = '';
    }

    listen(inputSelector) {
        const self = this;

        const input = d3.select(inputSelector)
            .on('keydown', function() {
                self.results.keydown(d3.event.keyCode);
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
            const promises = this.sources.map(source => source.get(term));

            Promise.all(promises).then(allOptions => {
                this.results.show(this.sources, allOptions);
            });
        }
    }
}

