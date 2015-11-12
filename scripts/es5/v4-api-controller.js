'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ApiController = (function () {
    function ApiController() {
        _classCallCheck(this, ApiController);

        this.autoCompleteNameSuggestUrl = 'https://federal.demo.socrata.com/views/7g2b-8brv/columns/autocomplete_name/suggest/{0}?size=10&fuzz=0';
        this.categoriesUrl = '/categories.json';
        this.costOfLivingUrl = 'https://federal.demo.socrata.com/resource/hpnf-gnfu.json?$order=name&$where=';
        this.domainsUrl = 'https://api.us.socrata.com/api/catalog/v1/domains';
        this.earningsUrl = 'https://federal.demo.socrata.com/resource/wmwh-4vak.json?$where=';
        this.educationUrl = 'https://federal.demo.socrata.com/resource/uf4m-5u8r.json?$where=';
        this.gdpUrl = 'https://federal.demo.socrata.com/resource/ks2j-vhr8.json?$where=';
        this.occupationsUrl = 'https://federal.demo.socrata.com/resource/qfcm-fw3i.json?$order=occupation&$where=';
        this.placesInRegionUrl = 'https://federal.demo.socrata.com/resource/eyae-8jfy?parent_id=';
        this.populationUrl = 'https://federal.demo.socrata.com/resource/e3rd-zzmr.json?$order=year,name&$where=';
        this.similarRegionsUrl = 'https://socrata-peers.herokuapp.com/peers.json?vectors=population_change,earnings,occupation,education,population&n=5&id=';
    }

    _createClass(ApiController, [{
        key: 'getAutoCompleteNameSuggestions',
        value: function getAutoCompleteNameSuggestions(searchTerm, completionHandler) {

            $.getJSON(this.autoCompleteNameSuggestUrl.format(encodeURIComponent(searchTerm)), completionHandler);
        }
    }, {
        key: 'getCostOfLivingData',
        value: function getCostOfLivingData(regionIds, completionHandler) {

            this.getData(this.costOfLivingUrl, regionIds, completionHandler);
        }
    }, {
        key: 'getEarningsData',
        value: function getEarningsData(regionIds, completionHandler) {

            this.getData(this.earningsUrl, regionIds, completionHandler);
        }
    }, {
        key: 'getEducationData',
        value: function getEducationData(regionIds, completionHandler) {

            this.getData(this.educationUrl, regionIds, completionHandler);
        }
    }, {
        key: 'getGdpData',
        value: function getGdpData(regionIds, completionHandler) {

            this.getData(this.gdpUrl, regionIds, completionHandler);
        }
    }, {
        key: 'getOccupationsData',
        value: function getOccupationsData(regionIds, completionHandler) {

            this.getData(this.occupationsUrl, regionIds, completionHandler);
        }
    }, {
        key: 'getPopulationData',
        value: function getPopulationData(regionIds, completionHandler) {

            this.getData(this.populationUrl, regionIds, completionHandler);
        }
    }, {
        key: 'getData',
        value: function getData(url, regionIds, completionHandler) {

            var segments = regionIds.map(function (regionId) {
                return 'id=\'' + regionId + '\'';
            });

            $.getJSON(url + encodeURI(segments.join(' OR ')), completionHandler);
        }
    }, {
        key: 'getDomains',
        value: function getDomains(completionHandler) {

            $.getJSON(this.domainsUrl, completionHandler);
        }
    }, {
        key: 'getCategories',
        value: function getCategories(completionHandler) {

            $.getJSON(this.categoriesUrl, completionHandler);
        }
    }, {
        key: 'getPlacesInRegion',
        value: function getPlacesInRegion(regionId, completionHandler) {

            $.getJSON(this.placesInRegionUrl + regionId, completionHandler);
        }
    }, {
        key: 'getSimilarRegions',
        value: function getSimilarRegions(regionId, completionHandler) {

            $.getJSON(this.similarRegionsUrl + regionId, completionHandler);
        }
    }]);

    return ApiController;
})();
//# sourceMappingURL=data:application/json;base64,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aUJBQWlCLENBQUMsQ0FBQztTQUNwRDs7OzBDQUVpQixRQUFRLEVBQUUsaUJBQWlCLEVBQUU7O0FBRTNDLGFBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1NBQ25FOzs7MENBRWlCLFFBQVEsRUFBRSxpQkFBaUIsRUFBRTs7QUFFM0MsYUFBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsUUFBUSxFQUFFLGlCQUFpQixDQUFDLENBQUM7U0FDbkU7OztXQS9FQyxhQUFhIiwiZmlsZSI6InY0LWFwaS1jb250cm9sbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQXBpQ29udHJvbGxlciB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU5hbWVTdWdnZXN0VXJsID0gJ2h0dHBzOi8vZmVkZXJhbC5kZW1vLnNvY3JhdGEuY29tL3ZpZXdzLzdnMmItOGJydi9jb2x1bW5zL2F1dG9jb21wbGV0ZV9uYW1lL3N1Z2dlc3QvezB9P3NpemU9MTAmZnV6ej0wJztcbiAgICAgICAgdGhpcy5jYXRlZ29yaWVzVXJsID0gJy9jYXRlZ29yaWVzLmpzb24nO1xuICAgICAgICB0aGlzLmNvc3RPZkxpdmluZ1VybCA9ICdodHRwczovL2ZlZGVyYWwuZGVtby5zb2NyYXRhLmNvbS9yZXNvdXJjZS9ocG5mLWduZnUuanNvbj8kb3JkZXI9bmFtZSYkd2hlcmU9JztcbiAgICAgICAgdGhpcy5kb21haW5zVXJsID0gJ2h0dHBzOi8vYXBpLnVzLnNvY3JhdGEuY29tL2FwaS9jYXRhbG9nL3YxL2RvbWFpbnMnO1xuICAgICAgICB0aGlzLmVhcm5pbmdzVXJsID0gJ2h0dHBzOi8vZmVkZXJhbC5kZW1vLnNvY3JhdGEuY29tL3Jlc291cmNlL3dtd2gtNHZhay5qc29uPyR3aGVyZT0nO1xuICAgICAgICB0aGlzLmVkdWNhdGlvblVybCA9ICdodHRwczovL2ZlZGVyYWwuZGVtby5zb2NyYXRhLmNvbS9yZXNvdXJjZS91ZjRtLTV1OHIuanNvbj8kd2hlcmU9JztcbiAgICAgICAgdGhpcy5nZHBVcmwgPSAnaHR0cHM6Ly9mZWRlcmFsLmRlbW8uc29jcmF0YS5jb20vcmVzb3VyY2Uva3Myai12aHI4Lmpzb24/JHdoZXJlPSc7XG4gICAgICAgIHRoaXMub2NjdXBhdGlvbnNVcmwgPSAnaHR0cHM6Ly9mZWRlcmFsLmRlbW8uc29jcmF0YS5jb20vcmVzb3VyY2UvcWZjbS1mdzNpLmpzb24/JG9yZGVyPW9jY3VwYXRpb24mJHdoZXJlPSc7XG4gICAgICAgIHRoaXMucGxhY2VzSW5SZWdpb25VcmwgPSAnaHR0cHM6Ly9mZWRlcmFsLmRlbW8uc29jcmF0YS5jb20vcmVzb3VyY2UvZXlhZS04amZ5P3BhcmVudF9pZD0nO1xuICAgICAgICB0aGlzLnBvcHVsYXRpb25VcmwgPSAnaHR0cHM6Ly9mZWRlcmFsLmRlbW8uc29jcmF0YS5jb20vcmVzb3VyY2UvZTNyZC16em1yLmpzb24/JG9yZGVyPXllYXIsbmFtZSYkd2hlcmU9JztcbiAgICAgICAgdGhpcy5zaW1pbGFyUmVnaW9uc1VybCA9ICdodHRwczovL3NvY3JhdGEtcGVlcnMuaGVyb2t1YXBwLmNvbS9wZWVycy5qc29uP3ZlY3RvcnM9cG9wdWxhdGlvbl9jaGFuZ2UsZWFybmluZ3Msb2NjdXBhdGlvbixlZHVjYXRpb24scG9wdWxhdGlvbiZuPTUmaWQ9JztcbiAgICB9XG5cbiAgICBnZXRBdXRvQ29tcGxldGVOYW1lU3VnZ2VzdGlvbnMoc2VhcmNoVGVybSwgY29tcGxldGlvbkhhbmRsZXIpIHtcblxuICAgICAgICAkLmdldEpTT04odGhpcy5hdXRvQ29tcGxldGVOYW1lU3VnZ2VzdFVybC5mb3JtYXQoZW5jb2RlVVJJQ29tcG9uZW50KHNlYXJjaFRlcm0pKSwgY29tcGxldGlvbkhhbmRsZXIpO1xuICAgIH1cblxuICAgIGdldENvc3RPZkxpdmluZ0RhdGEocmVnaW9uSWRzLCBjb21wbGV0aW9uSGFuZGxlcikge1xuXG4gICAgICAgIHRoaXMuZ2V0RGF0YSh0aGlzLmNvc3RPZkxpdmluZ1VybCwgcmVnaW9uSWRzLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gICAgfVxuXG4gICAgZ2V0RWFybmluZ3NEYXRhKHJlZ2lvbklkcywgY29tcGxldGlvbkhhbmRsZXIpIHtcblxuICAgICAgICB0aGlzLmdldERhdGEodGhpcy5lYXJuaW5nc1VybCwgcmVnaW9uSWRzLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gICAgfVxuXG4gICAgZ2V0RWR1Y2F0aW9uRGF0YShyZWdpb25JZHMsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG5cbiAgICAgICAgdGhpcy5nZXREYXRhKHRoaXMuZWR1Y2F0aW9uVXJsLCByZWdpb25JZHMsIGNvbXBsZXRpb25IYW5kbGVyKTtcbiAgICB9XG5cbiAgICBnZXRHZHBEYXRhKHJlZ2lvbklkcywgY29tcGxldGlvbkhhbmRsZXIpIHtcblxuICAgICAgICB0aGlzLmdldERhdGEodGhpcy5nZHBVcmwsIHJlZ2lvbklkcywgY29tcGxldGlvbkhhbmRsZXIpO1xuICAgIH1cblxuICAgIGdldE9jY3VwYXRpb25zRGF0YShyZWdpb25JZHMsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG5cbiAgICAgICAgdGhpcy5nZXREYXRhKHRoaXMub2NjdXBhdGlvbnNVcmwsIHJlZ2lvbklkcywgY29tcGxldGlvbkhhbmRsZXIpO1xuICAgIH1cblxuICAgIGdldFBvcHVsYXRpb25EYXRhKHJlZ2lvbklkcywgY29tcGxldGlvbkhhbmRsZXIpIHtcblxuICAgICAgICB0aGlzLmdldERhdGEodGhpcy5wb3B1bGF0aW9uVXJsLCByZWdpb25JZHMsIGNvbXBsZXRpb25IYW5kbGVyKTtcbiAgICB9XG5cbiAgICBnZXREYXRhKHVybCwgcmVnaW9uSWRzLCBjb21wbGV0aW9uSGFuZGxlcikge1xuXG4gICAgICAgIHZhciBzZWdtZW50cyA9IHJlZ2lvbklkcy5tYXAoZnVuY3Rpb24ocmVnaW9uSWQpIHtcbiAgICAgICAgICAgIHJldHVybiAnaWQ9XFwnJyArIHJlZ2lvbklkICsgJ1xcJyc7IFxuICAgICAgICB9KTtcblxuICAgICAgICAkLmdldEpTT04odXJsICsgZW5jb2RlVVJJKHNlZ21lbnRzLmpvaW4oJyBPUiAnKSksIGNvbXBsZXRpb25IYW5kbGVyKTtcbiAgICB9XG5cbiAgICBnZXREb21haW5zKGNvbXBsZXRpb25IYW5kbGVyKSB7XG5cbiAgICAgICAgJC5nZXRKU09OKHRoaXMuZG9tYWluc1VybCwgY29tcGxldGlvbkhhbmRsZXIpO1xuICAgIH1cblxuICAgIGdldENhdGVnb3JpZXMoY29tcGxldGlvbkhhbmRsZXIpIHtcblxuICAgICAgICAkLmdldEpTT04odGhpcy5jYXRlZ29yaWVzVXJsLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gICAgfVxuXG4gICAgZ2V0UGxhY2VzSW5SZWdpb24ocmVnaW9uSWQsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG5cbiAgICAgICAgJC5nZXRKU09OKHRoaXMucGxhY2VzSW5SZWdpb25VcmwgKyByZWdpb25JZCwgY29tcGxldGlvbkhhbmRsZXIpO1xuICAgIH1cblxuICAgIGdldFNpbWlsYXJSZWdpb25zKHJlZ2lvbklkLCBjb21wbGV0aW9uSGFuZGxlcikge1xuXG4gICAgICAgICQuZ2V0SlNPTih0aGlzLnNpbWlsYXJSZWdpb25zVXJsICsgcmVnaW9uSWQsIGNvbXBsZXRpb25IYW5kbGVyKTtcbiAgICB9XG59Il19
//# sourceMappingURL=v4-api-controller.js.map
