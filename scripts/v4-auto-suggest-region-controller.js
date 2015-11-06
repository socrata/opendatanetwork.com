function AutoSuggestRegionController(inputTextSelector, resultListSelector, onClickRegion) {

    this.options = [];
    this.selectedIndex = -1;
    this.resultListSelector = resultListSelector;
    this.timer = null;

    var self = this;

    // Click event
    //
    $(resultListSelector + ' li').click(function() {

        if (onClickRegion) 
            onClickRegion(self.options[$(this).index()].text);
    });

    // Mouse event
    //   
    $(resultListSelector + ' li').mouseenter(function() {

        self.selectedIndex = $(this).index();
        self.updateListSelection();
    });

    // Keyboard event
    //
    $(inputTextSelector).keyup(function(e) {

        if (e.keyCode == 38) { // up

            e.preventDefault();

            self.selectedIndex = (self.selectedIndex > -1) ? self.selectedIndex - 1 : -1;
            self.updateListSelection();
            return;
        }
        else if (e.keyCode == 40) { // down

            e.preventDefault();

            self.selectedIndex = (self.selectedIndex < self.options.length - 1) ? self.selectedIndex + 1 : self.options.length - 1;
            self.updateListSelection();
            return;
        }
        else if (e.keyCode == 13) { // enter

            if ((self.selectedIndex == -1) || (self.selectedIndex >= self.options.length))
                return;

            e.preventDefault();
            
            if (onClickRegion) 
                onClickRegion(self.options[self.selectedIndex].text);

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
            function() {
                self.autoSuggest(searchTerm, resultListSelector);
            },
            250);
    });
}

AutoSuggestRegionController.prototype.autoSuggest = function(searchTerm, resultListSelector) {

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

        var items = self.options.map(function(item) { return '<li>' + item.text + '</li>'; });

        regionList.html(items.join(''));
        regionList.slideDown(100);
    });
};

AutoSuggestRegionController.prototype.updateListSelection = function() {

    var self = this;

    $(this.resultListSelector + ' li').each(function(index) {

        if (index == self.selectedIndex)
            $(this).addClass('selected');
        else
            $(this).removeClass('selected');
    });
};