function AutoSuggestRegionController(inputTextSelector, resultListSelector, onClickRegion) {

    this.options = [];
    this.selectedIndex = -1;
    this.resultListSelector = resultListSelector;
    this.onClickRegion = onClickRegion;

    var self = this;

    // Key presses
    //
    $(inputTextSelector).keydown(function(e) {

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
            self.selectRegion(self.selectedIndex);
            return;
        }
        else if (e.keyCode == 27) { // esc 

            $(resultListSelector).slideUp(100);
            return;
        }

        // Get the search value
        //
        var searchTerm = $(inputTextSelector).val().trim();

        if (searchTerm.length == 0) {

            $(resultListSelector).slideUp(100);
            return;
        }

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

            // Click event
            //
            $(resultListSelector + ' li').click(function() {

                self.selectRegion($(this).index()); 
            });

            // Mouse event
            //   
            $(resultListSelector + ' li').mouseenter(function() {

                self.selectedIndex = $(this).index();
                self.updateListSelection();
            });

            regionList.slideDown(100);
        });
    });
};

AutoSuggestRegionController.prototype.selectRegion = function(index) {

    if (this.onClickRegion) 
        this.onClickRegion(this.options[index].text); // pass just the text
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