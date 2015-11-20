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
        $(inputTextSelector).keydown(function (e) {

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
            var _this2 = this;

            var controller = new ApiController();

            controller.getAutoCompleteNameSuggestions(searchTerm).then(function (data) {

                _this2.options = data.options;
                _this2.selectedIndex = -1;

                var regionList = $(resultListSelector);

                if (_this2.options.length == 0) {

                    regionList.slideUp(100);
                    return;
                }

                // Build the list items
                //
                var items = _this2.options.map(function (item) {
                    return '<li>' + item.text + '</li>';
                });
                regionList.html(items.join(''));

                // Click event
                //
                var self = _this2;

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
            }).catch(function (error) {
                return console.error(error);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Y0LWF1dG8tc3VnZ2VzdC1yZWdpb24tY29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7SUFBTSwyQkFBMkI7QUFFN0IsYUFGRSwyQkFBMkIsQ0FFakIsaUJBQWlCLEVBQUUsa0JBQWtCLEVBQUUsYUFBYSxFQUFFOzs7OEJBRmhFLDJCQUEyQjs7QUFJekIsWUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDbEIsWUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN4QixZQUFJLENBQUMsa0JBQWtCLEdBQUcsa0JBQWtCLENBQUM7QUFDN0MsWUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDbEIsWUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7O0FBRW5DLFlBQUksZ0JBQWdCLEdBQUcsR0FBRzs7OztBQUFDLEFBSTNCLFNBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLENBQUMsRUFBSzs7QUFFaEMsZ0JBQUksQ0FBQyxDQUFDLE9BQU8sSUFBSSxFQUFFLEVBQUU7OztBQUVqQixpQkFBQyxDQUFDLGNBQWMsRUFBRSxDQUFDOztBQUVuQixzQkFBSyxhQUFhLEdBQUcsQUFBQyxNQUFLLGFBQWEsR0FBRyxDQUFDLENBQUMsR0FBSSxNQUFLLGFBQWEsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDN0Usc0JBQUssbUJBQW1CLEVBQUUsQ0FBQztBQUMzQix1QkFBTzthQUNWLE1BQ0ksSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLEVBQUUsRUFBRTs7O0FBRXRCLGlCQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7O0FBRW5CLHNCQUFLLGFBQWEsR0FBRyxBQUFDLE1BQUssYUFBYSxHQUFHLE1BQUssT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUksTUFBSyxhQUFhLEdBQUcsQ0FBQyxHQUFHLE1BQUssT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7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QUUsQ0FBQztBQUNyQyx3QkFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7aUJBQzlCLENBQUM7Ozs7QUFBQyxBQUlILDBCQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQzdCLENBQUMsQ0FDRCxLQUFLLENBQUMsVUFBQSxLQUFLO3VCQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO2FBQUEsQ0FBQyxDQUFDO1NBQzdDOzs7OENBRXFCOztBQUVsQixnQkFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDOztBQUVoQixhQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFTLEtBQUssRUFBRTs7QUFFcEQsb0JBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQzNCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsS0FFN0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUN2QyxDQUFDLENBQUM7U0FDTjs7O1dBbklDLDJCQUEyQiIsImZpbGUiOiJ2NC1hdXRvLXN1Z2dlc3QtcmVnaW9uLWNvbnRyb2xsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBBdXRvU3VnZ2VzdFJlZ2lvbkNvbnRyb2xsZXIge1xuXG4gICAgY29uc3RydWN0b3IoaW5wdXRUZXh0U2VsZWN0b3IsIHJlc3VsdExpc3RTZWxlY3Rvciwgb25DbGlja1JlZ2lvbikge1xuXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IFtdO1xuICAgICAgICB0aGlzLnNlbGVjdGVkSW5kZXggPSAtMTtcbiAgICAgICAgdGhpcy5yZXN1bHRMaXN0U2VsZWN0b3IgPSByZXN1bHRMaXN0U2VsZWN0b3I7XG4gICAgICAgIHRoaXMudGltZXIgPSBudWxsO1xuICAgICAgICB0aGlzLm9uQ2xpY2tSZWdpb24gPSBvbkNsaWNrUmVnaW9uO1xuXG4gICAgICAgIHZhciBhdXRvU3VnZ2VzdERlbGF5ID0gMTUwO1xuXG4gICAgICAgIC8vIEtleWJvYXJkIGV2ZW50XG4gICAgICAgIC8vXG4gICAgICAgICQoaW5wdXRUZXh0U2VsZWN0b3IpLmtleWRvd24oKGUpID0+IHtcblxuICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PSAzOCkgeyAvLyB1cFxuXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gKHRoaXMuc2VsZWN0ZWRJbmRleCA+IC0xKSA/IHRoaXMuc2VsZWN0ZWRJbmRleCAtIDEgOiAtMTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUxpc3RTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChlLmtleUNvZGUgPT0gNDApIHsgLy8gZG93blxuXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gKHRoaXMuc2VsZWN0ZWRJbmRleCA8IHRoaXMub3B0aW9ucy5sZW5ndGggLSAxKSA/IHRoaXMuc2VsZWN0ZWRJbmRleCArIDEgOiB0aGlzLm9wdGlvbnMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUxpc3RTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChlLmtleUNvZGUgPT0gMTMpIHsgLy8gZW50ZXJcblxuICAgICAgICAgICAgICAgIGlmICgodGhpcy5zZWxlY3RlZEluZGV4ID09IC0xKSB8fCAodGhpcy5zZWxlY3RlZEluZGV4ID49IHRoaXMub3B0aW9ucy5sZW5ndGgpKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vbkNsaWNrUmVnaW9uKSBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkNsaWNrUmVnaW9uKHRoaXMub3B0aW9uc1t0aGlzLnNlbGVjdGVkSW5kZXhdLnRleHQpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZS5rZXlDb2RlID09IDI3KSB7IC8vIGVzYyBcblxuICAgICAgICAgICAgICAgICQocmVzdWx0TGlzdFNlbGVjdG9yKS5zbGlkZVVwKDEwMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDbGVhciB0aGUgdGltZXJcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lcik7XG4gICAgXG4gICAgICAgICAgICAvLyBHZXQgdGhlIHNlYXJjaCB2YWx1ZVxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIHZhciBzZWFyY2hUZXJtID0gJChpbnB1dFRleHRTZWxlY3RvcikudmFsKCkudHJpbSgpO1xuXG4gICAgICAgICAgICBpZiAoc2VhcmNoVGVybS5sZW5ndGggPT0gMCkge1xuXG4gICAgICAgICAgICAgICAgJChyZXN1bHRMaXN0U2VsZWN0b3IpLnNsaWRlVXAoMTAwKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFNldCBuZXcgdGltZXIgdG8gYXV0byBzdWdnZXN0XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgdGhpcy50aW1lciA9IHNldFRpbWVvdXQoXG4gICAgICAgICAgICAgICAgKCkgPT4geyB0aGlzLmF1dG9TdWdnZXN0KHNlYXJjaFRlcm0sIHJlc3VsdExpc3RTZWxlY3Rvcik7IH0sXG4gICAgICAgICAgICAgICAgYXV0b1N1Z2dlc3REZWxheSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGF1dG9TdWdnZXN0KHNlYXJjaFRlcm0sIHJlc3VsdExpc3RTZWxlY3Rvcikge1xuXG4gICAgICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFwaUNvbnRyb2xsZXIoKTtcblxuICAgICAgICBjb250cm9sbGVyLmdldEF1dG9Db21wbGV0ZU5hbWVTdWdnZXN0aW9ucyhzZWFyY2hUZXJtKVxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XG4gICAgXG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zID0gZGF0YS5vcHRpb25zO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgIFxuICAgICAgICAgICAgICAgIHZhciByZWdpb25MaXN0ID0gJChyZXN1bHRMaXN0U2VsZWN0b3IpO1xuICAgIFxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMubGVuZ3RoID09IDApIHtcbiAgICBcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uTGlzdC5zbGlkZVVwKDEwMCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICAgICAgLy8gQnVpbGQgdGhlIGxpc3QgaXRlbXNcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIHZhciBpdGVtcyA9IHRoaXMub3B0aW9ucy5tYXAoZnVuY3Rpb24oaXRlbSkgeyByZXR1cm4gJzxsaT4nICsgaXRlbS50ZXh0ICsgJzwvbGk+JzsgfSk7XG4gICAgICAgICAgICAgICAgcmVnaW9uTGlzdC5odG1sKGl0ZW1zLmpvaW4oJycpKTtcbiAgICBcbiAgICAgICAgICAgICAgICAvLyBDbGljayBldmVudFxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICAgICAgJChyZXN1bHRMaXN0U2VsZWN0b3IgKyAnIGxpJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLm9uQ2xpY2tSZWdpb24pIFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5vbkNsaWNrUmVnaW9uKHNlbGYub3B0aW9uc1skKHRoaXMpLmluZGV4KCldLnRleHQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgIFxuICAgICAgICAgICAgICAgIC8vIE1vdXNlIGV2ZW50XG4gICAgICAgICAgICAgICAgLy8gICBcbiAgICAgICAgICAgICAgICAkKHJlc3VsdExpc3RTZWxlY3RvciArICcgbGknKS5tb3VzZWVudGVyKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgICAgICAgICAgICAgICAgICBzZWxmLnNlbGVjdGVkSW5kZXggPSAkKHRoaXMpLmluZGV4KCk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYudXBkYXRlTGlzdFNlbGVjdGlvbigpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgIFxuICAgICAgICAgICAgICAgIC8vIFNsaWRlIHRoZSBsaXN0IGRvd25cbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIHJlZ2lvbkxpc3Quc2xpZGVEb3duKDEwMCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICB9XG5cbiAgICB1cGRhdGVMaXN0U2VsZWN0aW9uKCkge1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAkKHRoaXMucmVzdWx0TGlzdFNlbGVjdG9yICsgJyBsaScpLmVhY2goZnVuY3Rpb24oaW5kZXgpIHtcblxuICAgICAgICAgICAgaWYgKGluZGV4ID09IHNlbGYuc2VsZWN0ZWRJbmRleClcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgIH0pO1xuICAgIH1cbn0iXX0=
//# sourceMappingURL=v4-auto-suggest-region-controller.js.map
