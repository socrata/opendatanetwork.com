'use strict';

class Autosuggest {
    constructor(resultSelector, sources) {
        sources = sources || AUTOSUGGEST_SOURCES;
        this.sources = sources.map(config => new AutosuggestSource(config));
        this.results = new AutosuggestResults(resultSelector);
        this.currentTerm = '';
        this.time = Date.now();
    }

    listen(inputSelector) {
        const self = this;

        const input = d3.select(inputSelector)
            .on('keydown', function() {
                const keyCode = d3.event.keyCode;

                if (keyCode == 13) {
                    d3.event.preventDefault();
                    self.enter();
                } else {
                    self.results.keydown(keyCode);
                }
            })
            .on('input', function() {
                self.throttledSuggest(this.value);
            });
    }

    throttledSuggest(term) {
        this.delay(GlobalConfig.autocomplete.wait_ms).then(() => {
            if (term === this.currentTerm) {
                this.suggest(term);
            }
        });

        this.currentTerm = term;
    }

    delay(milliseconds) {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, milliseconds);
        });
    }

    suggest(term) {
        if (term === '') {
            this.results.hide();
        } else {
            const time = Date.now();
            const promises = this.sources.map(source => source.get(term));

            Promise.all(promises).then(allOptions => {
                if (time > this.time) {
                    this.time = time;
                    this.results.show(this.sources, allOptions);
                }
            });
        }
    }

    enter() {
        if (this.results.index < 0) {
            if (this.results.options.length === 1 &&
                !isSuggestAPI(this.results.options[0])) {

                this.results.index = 0;
                this.results.enter();
                return;
            }

            const path = `/search?${$.param({q: this.currentTerm})}`;
            window.location.href = path;
        } else {
            this.results.enter();
        }
    }
}

function isSuggestAPI(option) {
    let data = option.data();
    data = _.isArray(data) ? _.first(data) : data;
    return 'type' in data && data.type === 'api';
}

