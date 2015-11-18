
class AutocompleteResult {
    constructor(type, title) {
        this.type = type;
        this.title = title;
    }

    show(selection) {
        selection
            .append('p')
            .text(this.title)
    }
}


class Complete {
    constructor(type, queryBuilder) {
        this.type = type;
        this.queryBuilder = queryBuilder;
    }

    get(query) {
        if (query == '') {
            return [];
        } else {
            return $.getJSON(this.queryBuilder(query));
        }
    }
}


class Results {
    constructor(type, selection) {
        this.type = type;

        this.container = selection
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
        console.log(options);

        this.results
            .selectAll('li')
            .data(options)
            .enter()
            .append('li')
            .html(option => option.text);
    }
}


class AutoSuggestRegionController {

    constructor(inputTextSelector, resultListSelector, onClickRegion) {

        this.options = [];
        this.selectedIndex = -1;
        this.resultListSelector = resultListSelector;
        this.timer = null;
        this.onClickRegion = onClickRegion;

        var autoSuggestDelay = 150;

        function autocompleteURL(domain, fxf, column) {
            return query => `https://${domain}/views/${fxf}/columns/${column}/suggest/${query}?size=5`;
        }

        const domain = 'odn.data.socrata.com';

        const datasetURL = autocompleteURL(domain, 'fpum-bjbr', 'name');
        const datasetComplete = new Complete('Dataset', datasetURL);

        const regionURL = autocompleteURL(domain, '7g2b-8brv', 'autocomplete_name');
        const regionComplete = new Complete('Region', regionURL);

        const publisherURL = autocompleteURL(domain, '8ae5-ghum', 'domain');
        const publisherComplete = new Complete('Publisher', publisherURL);

        const categoryURL = autocompleteURL(domain, '864v-r7tf', 'category');
        const categoryComplete = new Complete('Category', categoryURL);

        this.completers = [datasetComplete, regionComplete,
                           publisherComplete, categoryComplete];


        // Keyboard event
        //
        $(inputTextSelector).keyup((e) => {

            if (e.keyCode == 38) { // up

                e.preventDefault();

                this.selectedIndex = (this.selectedIndex > -1) ? this.selectedIndex - 1 : -1;
                this.updateListSelection();
                return;
            }
            else if (e.keyCode == 40) { // down

                e.preventDefault();

                this.selectedIndex = (this.selectedIndex < this.options.length - 1) ? this.selectedIndex + 1 : this.options.length - 1;
                this.updateListSelection();
                return;
            }
            else if (e.keyCode == 13) { // enter

                if ((this.selectedIndex == -1) || (this.selectedIndex >= this.options.length))
                    return;

                e.preventDefault();

                if (this.onClickRegion)
                    this.onClickRegion(this.options[this.selectedIndex].text);

                return;
            }
            else if (e.keyCode == 27) { // esc

                $(resultListSelector).slideUp(100);
                return;
            }

            // Clear the timer
            //
            clearTimeout(this.timer);

            // Get the search value
            //
            var searchTerm = $(inputTextSelector).val().trim();

            if (searchTerm.length == 0) {

                $(resultListSelector).slideUp(100);
                return;
            }

            // Set new timer to auto suggest
            //
            this.timer = setTimeout(
                () => { this.autoSuggest(searchTerm, resultListSelector); },
                autoSuggestDelay);
        });
    }

    autoSuggest(searchTerm, resultListSelector) {
        const selection = d3.select(resultListSelector);
        selection.style('display', 'block');
        selection.html('');


        this.completers.forEach(completer => {
            const results = new Results(completer.type, selection);
            results.handle(completer.get(searchTerm));
        });
    }

    updateListSelection() {

        var self = this;

        $(this.resultListSelector + ' li').each(function(index) {

            if (index == self.selectedIndex)
                $(this).addClass('selected');
            else
                $(this).removeClass('selected');
        });
    }
}

