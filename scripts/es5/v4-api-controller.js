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
        this.mostPopulousRegionTypeUrl = 'https://federal.demo.socrata.com/resource/eyae-8jfy?parent_id={0}&child_type={1}&$limit={2}&$order=child_population desc';
        this.occupationsUrl = 'https://federal.demo.socrata.com/resource/qfcm-fw3i.json?$order=occupation&$where=';
        this.parentStateUrl = 'https://federal.demo.socrata.com/resource/eyae-8jfy?parent_type=state&child_id={0}';
        this.placesInRegionUrl = 'https://federal.demo.socrata.com/resource/eyae-8jfy?parent_id=';
        this.populationUrl = 'https://federal.demo.socrata.com/resource/e3rd-zzmr.json?$order=year,name&$where=';
        this.similarRegionsUrl = 'https://socrata-peers.herokuapp.com/peers.json?vectors=population_change,earnings,occupation,education,population&n=10&id={0}';
    }

    // Promises
    //

    _createClass(ApiController, [{
        key: 'getCategories',
        value: function getCategories() {

            return d3.promise.json(this.categoriesUrl).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'getCountiesInState',
        value: function getCountiesInState(stateId) {
            var limit = arguments.length <= 1 || arguments[1] === undefined ? 10 : arguments[1];

            return d3.promise.json(this.mostPopulousRegionTypeUrl.format(stateId, 'county', limit)).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'getDomains',
        value: function getDomains() {

            return d3.promise.json(this.domainsUrl).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'getParentState',
        value: function getParentState(region) {

            return d3.promise.json(this.parentStateUrl.format(region.id)).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'getPlacesAndCountiesInState',
        value: function getPlacesAndCountiesInState(stateId) {
            var limit = arguments.length <= 1 || arguments[1] === undefined ? 10 : arguments[1];

            var placesPromise = d3.promise.json(this.mostPopulousRegionTypeUrl.format(stateId, 'place', limit));
            var countiesPromise = d3.promise.json(this.mostPopulousRegionTypeUrl.format(stateId, 'county', limit));

            return Promise.all([placesPromise, countiesPromise]).then(function (values) {
                return Promise.resolve(values[0].concat(values[1]));
            }).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'getMetrosInState',
        value: function getMetrosInState(stateId) {
            var limit = arguments.length <= 1 || arguments[1] === undefined ? 10 : arguments[1];

            return d3.promise.json(this.mostPopulousRegionTypeUrl.format(stateId, 'msa', limit)).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'getPlacesInState',
        value: function getPlacesInState(stateId) {
            var limit = arguments.length <= 1 || arguments[1] === undefined ? 10 : arguments[1];

            return d3.promise.json(this.mostPopulousRegionTypeUrl.format(stateId, 'place', limit)).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'getSimilarRegions',
        value: function getSimilarRegions(regionId) {

            return d3.promise.json(this.similarRegionsUrl.format(regionId)).catch(function (error) {
                return console.error(error);
            });
        }

        // Callbacks
        //

    }, {
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
    }]);

    return ApiController;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Y0LWFwaS1jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztJQUFNLGFBQWE7QUFFZixhQUZFLGFBQWEsR0FFRDs4QkFGWixhQUFhOztBQUlYLFlBQUksQ0FBQywwQkFBMEIsR0FBRyx1R0FBdUcsQ0FBQztBQUMxSSxZQUFJLENBQUMsYUFBYSxHQUFHLGtCQUFrQixDQUFDO0FBQ3hDLFlBQUksQ0FBQyxlQUFlLEdBQUcsOEVBQThFLENBQUM7QUFDdEcsWUFBSSxDQUFDLFVBQVUsR0FBRyxtREFBbUQsQ0FBQztBQUN0RSxZQUFJLENBQUMsV0FBVyxHQUFHLGtFQUFrRSxDQUFDO0FBQ3RGLFlBQUksQ0FBQyxZQUFZLEdBQUcsa0VBQWtFLENBQUM7QUFDdkYsWUFBSSxDQUFDLE1BQU0sR0FBRyxrRUFBa0UsQ0FBQztBQUNqRixZQUFJLENBQUMseUJBQXlCLEdBQUcsMEhBQTBILENBQUM7QUFDNUosWUFBSSxDQUFDLGNBQWMsR0FBRyxvRkFBb0YsQ0FBQztBQUMzRyxZQUFJLENBQUMsY0FBYyxHQUFHLG9GQUFvRixDQUFDO0FBQzNHLFlBQUksQ0FBQyxpQkFBaUIsR0FBRyxnRUFBZ0UsQ0FBQztBQUMxRixZQUFJLENBQUMsYUFBYSxHQUFHLG1GQUFtRixDQUFDO0FBQ3pHLFlBQUksQ0FBQyxpQkFBaUIsR0FBRywrSEFBK0gsQ0FBQztLQUM1Sjs7OztBQUFBO2lCQWpCQyxhQUFhOzt3Q0FxQkM7O0FBRVosbUJBQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUNyQyxLQUFLLENBQUMsVUFBQSxLQUFLO3VCQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO2FBQUEsQ0FBQyxDQUFDO1NBQzdDOzs7MkNBRWtCLE9BQU8sRUFBYztnQkFBWixLQUFLLHlEQUFHLEVBQUU7O0FBRWxDLG1CQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5QkFB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QyxPQUFPLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztTQUN4RTs7O1dBckhDLGFBQWEiLCJmaWxlIjoidjQtYXBpLWNvbnRyb2xsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBBcGlDb250cm9sbGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlTmFtZVN1Z2dlc3RVcmwgPSAnaHR0cHM6Ly9mZWRlcmFsLmRlbW8uc29jcmF0YS5jb20vdmlld3MvN2cyYi04YnJ2L2NvbHVtbnMvYXV0b2NvbXBsZXRlX25hbWUvc3VnZ2VzdC97MH0/c2l6ZT0xMCZmdXp6PTAnO1xuICAgICAgICB0aGlzLmNhdGVnb3JpZXNVcmwgPSAnL2NhdGVnb3JpZXMuanNvbic7XG4gICAgICAgIHRoaXMuY29zdE9mTGl2aW5nVXJsID0gJ2h0dHBzOi8vZmVkZXJhbC5kZW1vLnNvY3JhdGEuY29tL3Jlc291cmNlL2hwbmYtZ25mdS5qc29uPyRvcmRlcj1uYW1lJiR3aGVyZT0nO1xuICAgICAgICB0aGlzLmRvbWFpbnNVcmwgPSAnaHR0cHM6Ly9hcGkudXMuc29jcmF0YS5jb20vYXBpL2NhdGFsb2cvdjEvZG9tYWlucyc7XG4gICAgICAgIHRoaXMuZWFybmluZ3NVcmwgPSAnaHR0cHM6Ly9mZWRlcmFsLmRlbW8uc29jcmF0YS5jb20vcmVzb3VyY2Uvd213aC00dmFrLmpzb24/JHdoZXJlPSc7XG4gICAgICAgIHRoaXMuZWR1Y2F0aW9uVXJsID0gJ2h0dHBzOi8vZmVkZXJhbC5kZW1vLnNvY3JhdGEuY29tL3Jlc291cmNlL3VmNG0tNXU4ci5qc29uPyR3aGVyZT0nO1xuICAgICAgICB0aGlzLmdkcFVybCA9ICdodHRwczovL2ZlZGVyYWwuZGVtby5zb2NyYXRhLmNvbS9yZXNvdXJjZS9rczJqLXZocjguanNvbj8kd2hlcmU9JztcbiAgICAgICAgdGhpcy5tb3N0UG9wdWxvdXNSZWdpb25UeXBlVXJsID0gJ2h0dHBzOi8vZmVkZXJhbC5kZW1vLnNvY3JhdGEuY29tL3Jlc291cmNlL2V5YWUtOGpmeT9wYXJlbnRfaWQ9ezB9JmNoaWxkX3R5cGU9ezF9JiRsaW1pdD17Mn0mJG9yZGVyPWNoaWxkX3BvcHVsYXRpb24gZGVzYyc7XG4gICAgICAgIHRoaXMub2NjdXBhdGlvbnNVcmwgPSAnaHR0cHM6Ly9mZWRlcmFsLmRlbW8uc29jcmF0YS5jb20vcmVzb3VyY2UvcWZjbS1mdzNpLmpzb24/JG9yZGVyPW9jY3VwYXRpb24mJHdoZXJlPSc7XG4gICAgICAgIHRoaXMucGFyZW50U3RhdGVVcmwgPSAnaHR0cHM6Ly9mZWRlcmFsLmRlbW8uc29jcmF0YS5jb20vcmVzb3VyY2UvZXlhZS04amZ5P3BhcmVudF90eXBlPXN0YXRlJmNoaWxkX2lkPXswfSc7XG4gICAgICAgIHRoaXMucGxhY2VzSW5SZWdpb25VcmwgPSAnaHR0cHM6Ly9mZWRlcmFsLmRlbW8uc29jcmF0YS5jb20vcmVzb3VyY2UvZXlhZS04amZ5P3BhcmVudF9pZD0nO1xuICAgICAgICB0aGlzLnBvcHVsYXRpb25VcmwgPSAnaHR0cHM6Ly9mZWRlcmFsLmRlbW8uc29jcmF0YS5jb20vcmVzb3VyY2UvZTNyZC16em1yLmpzb24/JG9yZGVyPXllYXIsbmFtZSYkd2hlcmU9JztcbiAgICAgICAgdGhpcy5zaW1pbGFyUmVnaW9uc1VybCA9ICdodHRwczovL3NvY3JhdGEtcGVlcnMuaGVyb2t1YXBwLmNvbS9wZWVycy5qc29uP3ZlY3RvcnM9cG9wdWxhdGlvbl9jaGFuZ2UsZWFybmluZ3Msb2NjdXBhdGlvbixlZHVjYXRpb24scG9wdWxhdGlvbiZuPTEwJmlkPXswfSc7XG4gICAgfVxuXG4gICAgLy8gUHJvbWlzZXNcbiAgICAvL1xuICAgIGdldENhdGVnb3JpZXMoKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLmNhdGVnb3JpZXNVcmwpXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgIH1cblxuICAgIGdldENvdW50aWVzSW5TdGF0ZShzdGF0ZUlkLCBsaW1pdCA9IDEwKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLm1vc3RQb3B1bG91c1JlZ2lvblR5cGVVcmwuZm9ybWF0KHN0YXRlSWQsICdjb3VudHknLCBsaW1pdCkpXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgIH1cblxuICAgIGdldERvbWFpbnMoKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLmRvbWFpbnNVcmwpXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgIH1cblxuICAgIGdldFBhcmVudFN0YXRlKHJlZ2lvbikge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5wYXJlbnRTdGF0ZVVybC5mb3JtYXQocmVnaW9uLmlkKSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgfVxuXG4gICAgZ2V0UGxhY2VzQW5kQ291bnRpZXNJblN0YXRlKHN0YXRlSWQsIGxpbWl0ID0gMTApIHtcblxuICAgICAgICB2YXIgcGxhY2VzUHJvbWlzZSA9IGQzLnByb21pc2UuanNvbih0aGlzLm1vc3RQb3B1bG91c1JlZ2lvblR5cGVVcmwuZm9ybWF0KHN0YXRlSWQsICdwbGFjZScsIGxpbWl0KSk7XG4gICAgICAgIHZhciBjb3VudGllc1Byb21pc2UgPSBkMy5wcm9taXNlLmpzb24odGhpcy5tb3N0UG9wdWxvdXNSZWdpb25UeXBlVXJsLmZvcm1hdChzdGF0ZUlkLCAnY291bnR5JywgbGltaXQpKTtcblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoW3BsYWNlc1Byb21pc2UsIGNvdW50aWVzUHJvbWlzZV0pXG4gICAgICAgICAgICAudGhlbih2YWx1ZXMgPT4gUHJvbWlzZS5yZXNvbHZlKHZhbHVlc1swXS5jb25jYXQodmFsdWVzWzFdKSkpXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgIH1cblxuICAgIGdldE1ldHJvc0luU3RhdGUoc3RhdGVJZCwgbGltaXQgPSAxMCkge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5tb3N0UG9wdWxvdXNSZWdpb25UeXBlVXJsLmZvcm1hdChzdGF0ZUlkLCAnbXNhJywgbGltaXQpKVxuICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICB9XG5cbiAgICBnZXRQbGFjZXNJblN0YXRlKHN0YXRlSWQsIGxpbWl0ID0gMTApIHtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHRoaXMubW9zdFBvcHVsb3VzUmVnaW9uVHlwZVVybC5mb3JtYXQoc3RhdGVJZCwgJ3BsYWNlJywgbGltaXQpKVxuICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICB9XG5cbiAgICBnZXRTaW1pbGFyUmVnaW9ucyhyZWdpb25JZCkge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5zaW1pbGFyUmVnaW9uc1VybC5mb3JtYXQocmVnaW9uSWQpKVxuICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICB9XG5cbiAgICAvLyBDYWxsYmFja3NcbiAgICAvL1xuICAgIGdldEF1dG9Db21wbGV0ZU5hbWVTdWdnZXN0aW9ucyhzZWFyY2hUZXJtLCBjb21wbGV0aW9uSGFuZGxlcikge1xuXG4gICAgICAgICQuZ2V0SlNPTih0aGlzLmF1dG9Db21wbGV0ZU5hbWVTdWdnZXN0VXJsLmZvcm1hdChlbmNvZGVVUklDb21wb25lbnQoc2VhcmNoVGVybSkpLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gICAgfVxuXG4gICAgZ2V0Q29zdE9mTGl2aW5nRGF0YShyZWdpb25JZHMsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG5cbiAgICAgICAgdGhpcy5nZXREYXRhKHRoaXMuY29zdE9mTGl2aW5nVXJsLCByZWdpb25JZHMsIGNvbXBsZXRpb25IYW5kbGVyKTtcbiAgICB9XG5cbiAgICBnZXRFYXJuaW5nc0RhdGEocmVnaW9uSWRzLCBjb21wbGV0aW9uSGFuZGxlcikge1xuXG4gICAgICAgIHRoaXMuZ2V0RGF0YSh0aGlzLmVhcm5pbmdzVXJsLCByZWdpb25JZHMsIGNvbXBsZXRpb25IYW5kbGVyKTtcbiAgICB9XG5cbiAgICBnZXRFZHVjYXRpb25EYXRhKHJlZ2lvbklkcywgY29tcGxldGlvbkhhbmRsZXIpIHtcblxuICAgICAgICB0aGlzLmdldERhdGEodGhpcy5lZHVjYXRpb25VcmwsIHJlZ2lvbklkcywgY29tcGxldGlvbkhhbmRsZXIpO1xuICAgIH1cblxuICAgIGdldEdkcERhdGEocmVnaW9uSWRzLCBjb21wbGV0aW9uSGFuZGxlcikge1xuXG4gICAgICAgIHRoaXMuZ2V0RGF0YSh0aGlzLmdkcFVybCwgcmVnaW9uSWRzLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gICAgfVxuXG4gICAgZ2V0T2NjdXBhdGlvbnNEYXRhKHJlZ2lvbklkcywgY29tcGxldGlvbkhhbmRsZXIpIHtcblxuICAgICAgICB0aGlzLmdldERhdGEodGhpcy5vY2N1cGF0aW9uc1VybCwgcmVnaW9uSWRzLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gICAgfVxuXG4gICAgZ2V0UG9wdWxhdGlvbkRhdGEocmVnaW9uSWRzLCBjb21wbGV0aW9uSGFuZGxlcikge1xuXG4gICAgICAgIHRoaXMuZ2V0RGF0YSh0aGlzLnBvcHVsYXRpb25VcmwsIHJlZ2lvbklkcywgY29tcGxldGlvbkhhbmRsZXIpO1xuICAgIH1cblxuICAgIGdldERhdGEodXJsLCByZWdpb25JZHMsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG5cbiAgICAgICAgdmFyIHNlZ21lbnRzID0gcmVnaW9uSWRzLm1hcChmdW5jdGlvbihyZWdpb25JZCkge1xuICAgICAgICAgICAgcmV0dXJuICdpZD1cXCcnICsgcmVnaW9uSWQgKyAnXFwnJzsgXG4gICAgICAgIH0pO1xuXG4gICAgICAgICQuZ2V0SlNPTih1cmwgKyBlbmNvZGVVUkkoc2VnbWVudHMuam9pbignIE9SICcpKSwgY29tcGxldGlvbkhhbmRsZXIpO1xuICAgIH1cbn0iXX0=
//# sourceMappingURL=v4-api-controller.js.map
