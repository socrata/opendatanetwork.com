'use strict';

class Autosuggest {
    constructor(resultSelector) {
        this.sources = AUTOSUGGEST_SOURCES.map(config => new AutosuggestSource(config));
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

                Cookies.remove('refinePopupCollapsed');
            })
            .on('input', function() {
                self.throttledSuggest(this.value);
            });
    }

    throttledSuggest(term) {
        this.delay(GlobalConstants.AUTOCOMPLETE_WAIT_MS).then(() => {
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
            if (this.results.options.length == 1) {
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

