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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Y0LWF1dG8tc3VnZ2VzdC1yZWdpb24tY29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7SUFBTSwyQkFBMkI7QUFFN0IsYUFGRSwyQkFBMkIsQ0FFakIsaUJBQWlCLEVBQUUsa0JBQWtCLEVBQUUsYUFBYSxFQUFFOzs7OEJBRmhFLDJCQUEyQjs7QUFJekIsWUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDbEIsWUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN4QixZQUFJLENBQUMsa0JBQWtCLEdBQUcsa0JBQWtCLENBQUM7QUFDN0MsWUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDbEIsWUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7O0FBRW5DLFlBQUksZ0JBQWdCLEdBQUcsR0FBRzs7OztBQUFDLEFBSTNCLFNBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFDLENBQUMsRUFBSzs7QUFFOUIsZ0JBQUksQ0FBQyxDQUFDLE9BQU8sSUFBSSxFQUFFLEVBQUU7OztBQUVqQixpQkFBQyxDQUFDLGNBQWMsRUFBRSxDQUFDOztBQUVuQixzQkFBSyxhQUFhLEdBQUcsQUFBQyxNQUFLLGFBQWEsR0FBRyxDQUFDLENBQUMsR0FBSSxNQUFLLGFBQWEsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDN0Usc0JBQUssbUJBQW1CLEVBQUUsQ0FBQztBQUMzQix1QkFBTzthQUNWLE1BQ0ksSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLEVBQUUsRUFBRTs7O0FBRXRCLGlCQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7O0FBRW5CLHNCQUFLLGFBQWEsR0FBRyxBQUFDLE1BQUssYUFBYSxHQUFHLE1BQUssT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUksTUFBSyxhQUFhLEdBQUcsQ0FBQyxHQUFHLE1BQUssT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7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QUUsQ0FBQztBQUNyQyx3QkFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7aUJBQzlCLENBQUM7Ozs7QUFBQyxBQUlILDBCQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQzdCLENBQUMsQ0FDRCxLQUFLLENBQUMsVUFBQSxLQUFLO3VCQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO2FBQUEsQ0FBQyxDQUFDO1NBQzdDOzs7OENBRXFCOztBQUVsQixnQkFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDOztBQUVoQixhQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFTLEtBQUssRUFBRTs7QUFFcEQsb0JBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQzNCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsS0FFN0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUN2QyxDQUFDLENBQUM7U0FDTjs7O1dBbklDLDJCQUEyQiIsImZpbGUiOiJ2NC1hdXRvLXN1Z2dlc3QtcmVnaW9uLWNvbnRyb2xsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBBdXRvU3VnZ2VzdFJlZ2lvbkNvbnRyb2xsZXIge1xuXG4gICAgY29uc3RydWN0b3IoaW5wdXRUZXh0U2VsZWN0b3IsIHJlc3VsdExpc3RTZWxlY3Rvciwgb25DbGlja1JlZ2lvbikge1xuXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IFtdO1xuICAgICAgICB0aGlzLnNlbGVjdGVkSW5kZXggPSAtMTtcbiAgICAgICAgdGhpcy5yZXN1bHRMaXN0U2VsZWN0b3IgPSByZXN1bHRMaXN0U2VsZWN0b3I7XG4gICAgICAgIHRoaXMudGltZXIgPSBudWxsO1xuICAgICAgICB0aGlzLm9uQ2xpY2tSZWdpb24gPSBvbkNsaWNrUmVnaW9uO1xuXG4gICAgICAgIHZhciBhdXRvU3VnZ2VzdERlbGF5ID0gMTUwO1xuXG4gICAgICAgIC8vIEtleWJvYXJkIGV2ZW50XG4gICAgICAgIC8vXG4gICAgICAgICQoaW5wdXRUZXh0U2VsZWN0b3IpLmtleXVwKChlKSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT0gMzgpIHsgLy8gdXBcblxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9ICh0aGlzLnNlbGVjdGVkSW5kZXggPiAtMSkgPyB0aGlzLnNlbGVjdGVkSW5kZXggLSAxIDogLTE7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVMaXN0U2VsZWN0aW9uKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZS5rZXlDb2RlID09IDQwKSB7IC8vIGRvd25cblxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9ICh0aGlzLnNlbGVjdGVkSW5kZXggPCB0aGlzLm9wdGlvbnMubGVuZ3RoIC0gMSkgPyB0aGlzLnNlbGVjdGVkSW5kZXggKyAxIDogdGhpcy5vcHRpb25zLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVMaXN0U2VsZWN0aW9uKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZS5rZXlDb2RlID09IDEzKSB7IC8vIGVudGVyXG4gICAgXG4gICAgICAgICAgICAgICAgaWYgKCh0aGlzLnNlbGVjdGVkSW5kZXggPT0gLTEpIHx8ICh0aGlzLnNlbGVjdGVkSW5kZXggPj0gdGhpcy5vcHRpb25zLmxlbmd0aCkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uQ2xpY2tSZWdpb24pIFxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uQ2xpY2tSZWdpb24odGhpcy5vcHRpb25zW3RoaXMuc2VsZWN0ZWRJbmRleF0udGV4dCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChlLmtleUNvZGUgPT0gMjcpIHsgLy8gZXNjIFxuXG4gICAgICAgICAgICAgICAgJChyZXN1bHRMaXN0U2VsZWN0b3IpLnNsaWRlVXAoMTAwKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENsZWFyIHRoZSB0aW1lclxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVyKTtcbiAgICBcbiAgICAgICAgICAgIC8vIEdldCB0aGUgc2VhcmNoIHZhbHVlXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgdmFyIHNlYXJjaFRlcm0gPSAkKGlucHV0VGV4dFNlbGVjdG9yKS52YWwoKS50cmltKCk7XG5cbiAgICAgICAgICAgIGlmIChzZWFyY2hUZXJtLmxlbmd0aCA9PSAwKSB7XG5cbiAgICAgICAgICAgICAgICAkKHJlc3VsdExpc3RTZWxlY3Rvcikuc2xpZGVVcCgxMDApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gU2V0IG5ldyB0aW1lciB0byBhdXRvIHN1Z2dlc3RcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICB0aGlzLnRpbWVyID0gc2V0VGltZW91dChcbiAgICAgICAgICAgICAgICAoKSA9PiB7IHRoaXMuYXV0b1N1Z2dlc3Qoc2VhcmNoVGVybSwgcmVzdWx0TGlzdFNlbGVjdG9yKTsgfSxcbiAgICAgICAgICAgICAgICBhdXRvU3VnZ2VzdERlbGF5KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXV0b1N1Z2dlc3Qoc2VhcmNoVGVybSwgcmVzdWx0TGlzdFNlbGVjdG9yKSB7XG5cbiAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQXBpQ29udHJvbGxlcigpO1xuXG4gICAgICAgIGNvbnRyb2xsZXIuZ2V0QXV0b0NvbXBsZXRlTmFtZVN1Z2dlc3Rpb25zKHNlYXJjaFRlcm0pXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHtcbiAgICBcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMgPSBkYXRhLm9wdGlvbnM7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gLTE7XG4gICAgXG4gICAgICAgICAgICAgICAgdmFyIHJlZ2lvbkxpc3QgPSAkKHJlc3VsdExpc3RTZWxlY3Rvcik7XG4gICAgXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5sZW5ndGggPT0gMCkge1xuICAgIFxuICAgICAgICAgICAgICAgICAgICByZWdpb25MaXN0LnNsaWRlVXAoMTAwKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgICAgICAvLyBCdWlsZCB0aGUgbGlzdCBpdGVtc1xuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgdmFyIGl0ZW1zID0gdGhpcy5vcHRpb25zLm1hcChmdW5jdGlvbihpdGVtKSB7IHJldHVybiAnPGxpPicgKyBpdGVtLnRleHQgKyAnPC9saT4nOyB9KTtcbiAgICAgICAgICAgICAgICByZWdpb25MaXN0Lmh0bWwoaXRlbXMuam9pbignJykpO1xuICAgIFxuICAgICAgICAgICAgICAgIC8vIENsaWNrIGV2ZW50XG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgICAgICAkKHJlc3VsdExpc3RTZWxlY3RvciArICcgbGknKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYub25DbGlja1JlZ2lvbikgXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLm9uQ2xpY2tSZWdpb24oc2VsZi5vcHRpb25zWyQodGhpcykuaW5kZXgoKV0udGV4dCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICAgICAgICAgLy8gTW91c2UgZXZlbnRcbiAgICAgICAgICAgICAgICAvLyAgIFxuICAgICAgICAgICAgICAgICQocmVzdWx0TGlzdFNlbGVjdG9yICsgJyBsaScpLm1vdXNlZW50ZXIoZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc2VsZWN0ZWRJbmRleCA9ICQodGhpcykuaW5kZXgoKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi51cGRhdGVMaXN0U2VsZWN0aW9uKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICAgICAgICAgLy8gU2xpZGUgdGhlIGxpc3QgZG93blxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgcmVnaW9uTGlzdC5zbGlkZURvd24oMTAwKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgIH1cblxuICAgIHVwZGF0ZUxpc3RTZWxlY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICQodGhpcy5yZXN1bHRMaXN0U2VsZWN0b3IgKyAnIGxpJykuZWFjaChmdW5jdGlvbihpbmRleCkge1xuXG4gICAgICAgICAgICBpZiAoaW5kZXggPT0gc2VsZi5zZWxlY3RlZEluZGV4KVxuICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgICAgfSk7XG4gICAgfVxufSJdfQ==
//# sourceMappingURL=v4-auto-suggest-region-controller.js.map
