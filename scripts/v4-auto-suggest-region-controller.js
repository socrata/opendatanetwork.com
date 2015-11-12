class AutoSuggestRegionController {

    constructor(inputTextSelector, resultListSelector, onClickRegion) {

        this.options = [];
        this.selectedIndex = -1;
        this.resultListSelector = resultListSelector;
        this.timer = null;
        this.onClickRegion = onClickRegion;

        var autoSuggestDelay = 150;

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

        var self = this;
        var apiController = new ApiController();

        apiController.getAutoCompleteNameSuggestions(searchTerm, function(data) {

            self.options = data.options;
            self.selectedIndex = -1;

            var regionList = $(resultListSelector);

            if (self.options.length == 0) {

                regionList.slideUp(100);
                return;
            }

            // Build the list items
            //
            var items = self.options.map(function(item) { return '<li>' + item.text + '</li>'; });
            regionList.html(items.join(''));

            // Click event
            //
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