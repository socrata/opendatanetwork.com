function RegionController(onClickRegion) {

    $('#q').keyup(function() {

        var searchTerm = $('#q').val().trim();

        if (searchTerm.length == 0) {

            $('.region-list').slideUp(100);
            return;
        }

        var apiController = new ApiController();

        apiController.getAutoCompleteNameSuggestions(searchTerm, function(data) {

            var regionList = $('.region-list');

            if (data.options.length == 0) {

                regionList.slideUp(100);
                return;
            }

            var items = data.options.map(function(item) { return '<li>' + item.text + '</li>'; });

            regionList.html(items.join(''));

            $('.region-list li').click(function(e) {

                var region = data.options[$(this).index()].text; // pass just the text

                if (onClickRegion) 
                    onClickRegion(region);
            });

            regionList.slideDown(100);
        });
    });
}
