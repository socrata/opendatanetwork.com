
class Autosuggest {

    constructor(resultSelector) {

        const configs = [
            { 
                suggestType: 'entity', 
                image: 'fa-globe', 
                name: 'Regions',
                select: option => this.navigate(this.path(['region', option.id, option.name])),
            }, 
            { 
                suggestType: 'category', 
                image: 'fa-tags', 
                name: 'Categories',
                select: option => this.navigate('/search', { categories: option.name }),
            },
            { 
                suggestType: 'publisher', 
                image: 'fa-newspaper-o', 
                name: 'Publishers',
                select: option => this.navigate('/search', { domains: option.name })
            },
            { 
                suggestType: 'dataset', 
                image: 'fa-bar-chart', 
                name: 'Datasets',
                select: option => this.navigate(this.path(['dataset', option.domain, option.fxf]))
            },
            { 
                suggestType: 'question', 
                image: 'fa-question-circle', 
                name: 'Questions',
                select: option => {

                    // Get the vector segment from the middle component of the variable_id
                    //
                    const rg = option.variable_id.split('.');
                    rg.pop();
                    const vector = rg.pop();

                    this.navigate(
                        this.path(['region', option.entity.id, option.entity.name, vector, option.variable_id]),
                        { question: 1 });
                },
            },
        ];

        this.sources = configs.map(config => new AutosuggestSource(config));
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

        this.delay(Constants.AUTOCOMPLETE_WAIT_MS).then(() => {
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
        } 
        else {
        
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
        } 
        else {

            this.results.enter();
        }
    }

    urlEscape(string) {

        return string
            .replace(/,/g, '')
            .replace(/[ \/]/g, '_');
    }

    navigate(path, params) {

        params = params || {};
        const url = `${path}?${$.param(params)}`;

        window.location.href = url;
    }

    path(elements) {

        return `/${elements.map(this.urlEscape).join('/')}`;
    }
}

