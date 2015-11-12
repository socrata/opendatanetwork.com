'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AutoSuggestRegionController = (function () {
    function AutoSuggestRegionController(inputTextSelector, resultListSelector, onClickRegion) {
        var _this = this;

        _classCallCheck(this, AutoSuggestRegionController);

        this.options = [];
        this.selectedIndex = -1;
        this.resultListSelector = resultListSelector;
        this.timer = null;
        this.onClickRegion = onClickRegion;

        var autoSuggestDelay = 150;

        // Keyboard event
        //
        $(inputTextSelector).keyup(function (e) {

            if (e.keyCode == 38) {
                // up

                e.preventDefault();

                _this.selectedIndex = _this.selectedIndex > -1 ? _this.selectedIndex - 1 : -1;
                _this.updateListSelection();
                return;
            } else if (e.keyCode == 40) {
                // down

                e.preventDefault();

                _this.selectedIndex = _this.selectedIndex < _this.options.length - 1 ? _this.selectedIndex + 1 : _this.options.length - 1;
                _this.updateListSelection();
                return;
            } else if (e.keyCode == 13) {
                // enter

                if (_this.selectedIndex == -1 || _this.selectedIndex >= _this.options.length) return;

                e.preventDefault();

                if (_this.onClickRegion) _this.onClickRegion(_this.options[_this.selectedIndex].text);

                return;
            } else if (e.keyCode == 27) {
                // esc

                $(resultListSelector).slideUp(100);
                return;
            }

            // Clear the timer
            //
            clearTimeout(_this.timer);

            // Get the search value
            //
            var searchTerm = $(inputTextSelector).val().trim();

            if (searchTerm.length == 0) {

                $(resultListSelector).slideUp(100);
                return;
            }

            // Set new timer to auto suggest
            //
            _this.timer = setTimeout(function () {
                _this.autoSuggest(searchTerm, resultListSelector);
            }, autoSuggestDelay);
        });
    }

    _createClass(AutoSuggestRegionController, [{
        key: 'autoSuggest',
        value: function autoSuggest(searchTerm, resultListSelector) {

            var self = this;
            var apiController = new ApiController();

            apiController.getAutoCompleteNameSuggestions(searchTerm, function (data) {

                self.options = data.options;
                self.selectedIndex = -1;

                var regionList = $(resultListSelector);

                if (self.options.length == 0) {

                    regionList.slideUp(100);
                    return;
                }

                // Build the list items
                //
                var items = self.options.map(function (item) {
                    return '<li>' + item.text + '</li>';
                });
                regionList.html(items.join(''));

                // Click event
                //
                $(resultListSelector + ' li').click(function () {

                    if (self.onClickRegion) self.onClickRegion(self.options[$(this).index()].text);
                });

                // Mouse event
                //  
                $(resultListSelector + ' li').mouseenter(function () {

                    self.selectedIndex = $(this).index();
                    self.updateListSelection();
                });

                // Slide the list down
                //
                regionList.slideDown(100);
            });
        }
    }, {
        key: 'updateListSelection',
        value: function updateListSelection() {

            var self = this;

            $(this.resultListSelector + ' li').each(function (index) {

                if (index == self.selectedIndex) $(this).addClass('selected');else $(this).removeClass('selected');
            });
        }
    }]);

    return AutoSuggestRegionController;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Y0LWF1dG8tc3VnZ2VzdC1yZWdpb24tY29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7SUFBTSwyQkFBMkI7QUFFN0IsYUFGRSwyQkFBMkIsQ0FFakIsaUJBQWlCLEVBQUUsa0JBQWtCLEVBQUUsYUFBYSxFQUFFOzs7OEJBRmhFLDJCQUEyQjs7QUFJekIsWUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDbEIsWUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN4QixZQUFJLENBQUMsa0JBQWtCLEdBQUcsa0JBQWtCLENBQUM7QUFDN0MsWUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDbEIsWUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7O0FBRW5DLFlBQUksZ0JBQWdCLEdBQUcsR0FBRzs7OztBQUFDLEFBSTNCLFNBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFDLENBQUMsRUFBSzs7QUFFOUIsZ0JBQUksQ0FBQyxDQUFDLE9BQU8sSUFBSSxFQUFFLEVBQUU7OztBQUVqQixpQkFBQyxDQUFDLGNBQWMsRUFBRSxDQUFDOztBQUVuQixzQkFBSyxhQUFhLEdBQUcsQUFBQyxNQUFLLGFBQWEsR0FBRyxDQUFDLENBQUMsR0FBSSxNQUFLLGFBQWEsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDN0Usc0JBQUssbUJBQW1CLEVBQUUsQ0FBQztBQUMzQix1QkFBTzthQUNWLE1BQ0ksSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLEVBQUUsRUFBRTs7O0FBRXRCLGlCQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7O0FBRW5CLHNCQUFLLGFBQWEsR0FBRyxBQUFDLE1BQUssYUFBYSxHQUFHLE1BQUssT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUksTUFBSyxhQUFhLEdBQUcsQ0FBQyxHQUFHLE1BQUssT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7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LEtBQUssRUFBRSxDQUFDO0FBQ3JDLHdCQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztpQkFDOUIsQ0FBQzs7OztBQUFDLEFBSUgsMEJBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDN0IsQ0FBQyxDQUFDO1NBQ047Ozs4Q0FFcUI7O0FBRWxCLGdCQUFJLElBQUksR0FBRyxJQUFJLENBQUM7O0FBRWhCLGFBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVMsS0FBSyxFQUFFOztBQUVwRCxvQkFBSSxLQUFLLElBQUksSUFBSSxDQUFDLGFBQWEsRUFDM0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUU3QixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ3ZDLENBQUMsQ0FBQztTQUNOOzs7V0FoSUMsMkJBQTJCIiwiZmlsZSI6InY0LWF1dG8tc3VnZ2VzdC1yZWdpb24tY29udHJvbGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEF1dG9TdWdnZXN0UmVnaW9uQ29udHJvbGxlciB7XG5cbiAgICBjb25zdHJ1Y3RvcihpbnB1dFRleHRTZWxlY3RvciwgcmVzdWx0TGlzdFNlbGVjdG9yLCBvbkNsaWNrUmVnaW9uKSB7XG5cbiAgICAgICAgdGhpcy5vcHRpb25zID0gW107XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgICAgICB0aGlzLnJlc3VsdExpc3RTZWxlY3RvciA9IHJlc3VsdExpc3RTZWxlY3RvcjtcbiAgICAgICAgdGhpcy50aW1lciA9IG51bGw7XG4gICAgICAgIHRoaXMub25DbGlja1JlZ2lvbiA9IG9uQ2xpY2tSZWdpb247XG5cbiAgICAgICAgdmFyIGF1dG9TdWdnZXN0RGVsYXkgPSAxNTA7XG5cbiAgICAgICAgLy8gS2V5Ym9hcmQgZXZlbnRcbiAgICAgICAgLy9cbiAgICAgICAgJChpbnB1dFRleHRTZWxlY3Rvcikua2V5dXAoKGUpID0+IHtcblxuICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PSAzOCkgeyAvLyB1cFxuXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gKHRoaXMuc2VsZWN0ZWRJbmRleCA+IC0xKSA/IHRoaXMuc2VsZWN0ZWRJbmRleCAtIDEgOiAtMTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUxpc3RTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChlLmtleUNvZGUgPT0gNDApIHsgLy8gZG93blxuXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gKHRoaXMuc2VsZWN0ZWRJbmRleCA8IHRoaXMub3B0aW9ucy5sZW5ndGggLSAxKSA/IHRoaXMuc2VsZWN0ZWRJbmRleCArIDEgOiB0aGlzLm9wdGlvbnMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUxpc3RTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChlLmtleUNvZGUgPT0gMTMpIHsgLy8gZW50ZXJcbiAgICBcbiAgICAgICAgICAgICAgICBpZiAoKHRoaXMuc2VsZWN0ZWRJbmRleCA9PSAtMSkgfHwgKHRoaXMuc2VsZWN0ZWRJbmRleCA+PSB0aGlzLm9wdGlvbnMubGVuZ3RoKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub25DbGlja1JlZ2lvbikgXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25DbGlja1JlZ2lvbih0aGlzLm9wdGlvbnNbdGhpcy5zZWxlY3RlZEluZGV4XS50ZXh0KTtcblxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGUua2V5Q29kZSA9PSAyNykgeyAvLyBlc2MgXG5cbiAgICAgICAgICAgICAgICAkKHJlc3VsdExpc3RTZWxlY3Rvcikuc2xpZGVVcCgxMDApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ2xlYXIgdGhlIHRpbWVyXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZXIpO1xuICAgIFxuICAgICAgICAgICAgLy8gR2V0IHRoZSBzZWFyY2ggdmFsdWVcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICB2YXIgc2VhcmNoVGVybSA9ICQoaW5wdXRUZXh0U2VsZWN0b3IpLnZhbCgpLnRyaW0oKTtcblxuICAgICAgICAgICAgaWYgKHNlYXJjaFRlcm0ubGVuZ3RoID09IDApIHtcblxuICAgICAgICAgICAgICAgICQocmVzdWx0TGlzdFNlbGVjdG9yKS5zbGlkZVVwKDEwMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTZXQgbmV3IHRpbWVyIHRvIGF1dG8gc3VnZ2VzdFxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIHRoaXMudGltZXIgPSBzZXRUaW1lb3V0KFxuICAgICAgICAgICAgICAgICgpID0+IHsgdGhpcy5hdXRvU3VnZ2VzdChzZWFyY2hUZXJtLCByZXN1bHRMaXN0U2VsZWN0b3IpOyB9LFxuICAgICAgICAgICAgICAgIGF1dG9TdWdnZXN0RGVsYXkpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhdXRvU3VnZ2VzdChzZWFyY2hUZXJtLCByZXN1bHRMaXN0U2VsZWN0b3IpIHtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBhcGlDb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcblxuICAgICAgICBhcGlDb250cm9sbGVyLmdldEF1dG9Db21wbGV0ZU5hbWVTdWdnZXN0aW9ucyhzZWFyY2hUZXJtLCBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgICAgICAgIHNlbGYub3B0aW9ucyA9IGRhdGEub3B0aW9ucztcbiAgICAgICAgICAgIHNlbGYuc2VsZWN0ZWRJbmRleCA9IC0xO1xuXG4gICAgICAgICAgICB2YXIgcmVnaW9uTGlzdCA9ICQocmVzdWx0TGlzdFNlbGVjdG9yKTtcblxuICAgICAgICAgICAgaWYgKHNlbGYub3B0aW9ucy5sZW5ndGggPT0gMCkge1xuXG4gICAgICAgICAgICAgICAgcmVnaW9uTGlzdC5zbGlkZVVwKDEwMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBCdWlsZCB0aGUgbGlzdCBpdGVtc1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIHZhciBpdGVtcyA9IHNlbGYub3B0aW9ucy5tYXAoZnVuY3Rpb24oaXRlbSkgeyByZXR1cm4gJzxsaT4nICsgaXRlbS50ZXh0ICsgJzwvbGk+JzsgfSk7XG4gICAgICAgICAgICByZWdpb25MaXN0Lmh0bWwoaXRlbXMuam9pbignJykpO1xuXG4gICAgICAgICAgICAvLyBDbGljayBldmVudFxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICQocmVzdWx0TGlzdFNlbGVjdG9yICsgJyBsaScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYub25DbGlja1JlZ2lvbikgXG4gICAgICAgICAgICAgICAgICAgIHNlbGYub25DbGlja1JlZ2lvbihzZWxmLm9wdGlvbnNbJCh0aGlzKS5pbmRleCgpXS50ZXh0KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBNb3VzZSBldmVudFxuICAgICAgICAgICAgLy8gICBcbiAgICAgICAgICAgICQocmVzdWx0TGlzdFNlbGVjdG9yICsgJyBsaScpLm1vdXNlZW50ZXIoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICBzZWxmLnNlbGVjdGVkSW5kZXggPSAkKHRoaXMpLmluZGV4KCk7XG4gICAgICAgICAgICAgICAgc2VsZi51cGRhdGVMaXN0U2VsZWN0aW9uKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gU2xpZGUgdGhlIGxpc3QgZG93blxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIHJlZ2lvbkxpc3Quc2xpZGVEb3duKDEwMCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHVwZGF0ZUxpc3RTZWxlY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICQodGhpcy5yZXN1bHRMaXN0U2VsZWN0b3IgKyAnIGxpJykuZWFjaChmdW5jdGlvbihpbmRleCkge1xuXG4gICAgICAgICAgICBpZiAoaW5kZXggPT0gc2VsZi5zZWxlY3RlZEluZGV4KVxuICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgICAgfSk7XG4gICAgfVxufSJdfQ==
//# sourceMappingURL=v4-auto-suggest-region-controller.js.map
