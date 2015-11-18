
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
            return $.getJSON(this.queryBuilder(query))
                .then(response => {
                    return response.options.map(option => {
                        return new AutocompleteResult(this.type, option.text);
                    });
                });
        }
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
        this.datasetComplete = new Complete('Dataset', datasetURL);

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
        console.log(searchTerm);

        this.datasetComplete.get(searchTerm).then(results => console.log(results));


        var controller = new ApiController();

        controller.getAutoCompleteNameSuggestions(searchTerm)
            .then(data => {


                this.options = data.options;
                this.selectedIndex = -1;

                var regionList = $(resultListSelector);

                if (this.options.length == 0) {

                    regionList.slideUp(100);
                    return;
                }

                // Build the list items
                //
                var items = this.options.map(function(item) { return '<li>' + item.text + '</li>'; });
                regionList.html(items.join(''));

                // Click event
                //
                var self = this;

                $(resultListSelector + ' li').click(function() {

                    if (self.onClickRegion)
                        self.onClickRegion(self.options[$(this).index()].text);
                });

                // Mouse event
                //
                $(resultListSelector + ' li').mouseenter(function() {

                    self.selectedIndex = $(this).index();
                    self.updateListSelection();
                });

                // Slide the list down
                //
                regionList.slideDown(100);
            })
            .catch(error => console.error(error));
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
