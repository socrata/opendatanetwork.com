'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ApiController = (function () {
    function ApiController() {
        _classCallCheck(this, ApiController);

        this.autoCompleteNameSuggestUrl = 'https://odn.data.socrata.com/views/7g2b-8brv/columns/autocomplete_name/suggest/{0}?size=10&fuzz=0';
        this.categoriesUrl = '/categories.json';
        this.costOfLivingUrl = 'https://odn.data.socrata.com/resource/hpnf-gnfu.json?$order=name&$where=';
        this.domainsUrl = 'https://api.us.socrata.com/api/catalog/v1/domains';
        this.earningsUrl = 'https://odn.data.socrata.com/resource/wmwh-4vak.json?$where=';
        this.educationUrl = 'https://odn.data.socrata.com/resource/uf4m-5u8r.json?$where=';
        this.gdpUrl = 'https://odn.data.socrata.com/resource/ks2j-vhr8.json?$where=';
        this.mostPopulousRegionTypeUrl = 'https://odn.data.socrata.com/resource/eyae-8jfy?parent_id={0}&child_type={1}&$limit={2}&$order=child_population desc';
        this.occupationsUrl = 'https://odn.data.socrata.com/resource/qfcm-fw3i.json?$order=occupation&$where=';
        this.parentStateUrl = 'https://odn.data.socrata.com/resource/eyae-8jfy?parent_type=state&child_id={0}';
        this.placesInRegionUrl = 'https://odn.data.socrata.com/resource/eyae-8jfy?parent_id=';
        this.populationUrl = 'https://odn.data.socrata.com/resource/e3rd-zzmr.json?$order=year,name&$where=';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Y0LWFwaS1jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztJQUFNLGFBQWE7QUFFZixhQUZFLGFBQWEsR0FFRDs4QkFGWixhQUFhOztBQUlYLFlBQUksQ0FBQywwQkFBMEIsR0FBRyxtR0FBbUcsQ0FBQztBQUN0SSxZQUFJLENBQUMsYUFBYSxHQUFHLGtCQUFrQixDQUFDO0FBQ3hDLFlBQUksQ0FBQyxlQUFlLEdBQUcsMEVBQTBFLENBQUM7QUFDbEcsWUFBSSxDQUFDLFVBQVUsR0FBRyxtREFBbUQsQ0FBQztBQUN0RSxZQUFJLENBQUMsV0FBVyxHQUFHLDhEQUE4RCxDQUFDO0FBQ2xGLFlBQUksQ0FBQyxZQUFZLEdBQUcsOERBQThELENBQUM7QUFDbkYsWUFBSSxDQUFDLE1BQU0sR0FBRyw4REFBOEQsQ0FBQztBQUM3RSxZQUFJLENBQUMseUJBQXlCLEdBQUcsc0hBQXNILENBQUM7QUFDeEosWUFBSSxDQUFDLGNBQWMsR0FBRyxnRkFBZ0YsQ0FBQztBQUN2RyxZQUFJLENBQUMsY0FBYyxHQUFHLGdGQUFnRixDQUFDO0FBQ3ZHLFlBQUksQ0FBQyxpQkFBaUIsR0FBRyw0REFBNEQsQ0FBQztBQUN0RixZQUFJLENBQUMsYUFBYSxHQUFHLCtFQUErRSxDQUFDO0FBQ3JHLFlBQUksQ0FBQyxpQkFBaUIsR0FBRywrSEFBK0gsQ0FBQztLQUM1Sjs7OztBQUFBO2lCQWpCQyxhQUFhOzt3Q0FxQkM7O0FBRVosbUJBQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUNyQyxLQUFLLENBQUMsVUFBQSxLQUFLO3VCQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO2FBQUEsQ0FBQyxDQUFDO1NBQzdDOzs7MkNBRWtCLE9BQU8sRUFBYztnQkFBWixLQUFLLHlEQUFHLEVBQUU7O0FBRWxDLG1CQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5QkFB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QyxPQUFPLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztTQUN4RTs7O1dBckhDLGFBQWEiLCJmaWxlIjoidjQtYXBpLWNvbnRyb2xsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBBcGlDb250cm9sbGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlTmFtZVN1Z2dlc3RVcmwgPSAnaHR0cHM6Ly9vZG4uZGF0YS5zb2NyYXRhLmNvbS92aWV3cy83ZzJiLThicnYvY29sdW1ucy9hdXRvY29tcGxldGVfbmFtZS9zdWdnZXN0L3swfT9zaXplPTEwJmZ1eno9MCc7XG4gICAgICAgIHRoaXMuY2F0ZWdvcmllc1VybCA9ICcvY2F0ZWdvcmllcy5qc29uJztcbiAgICAgICAgdGhpcy5jb3N0T2ZMaXZpbmdVcmwgPSAnaHR0cHM6Ly9vZG4uZGF0YS5zb2NyYXRhLmNvbS9yZXNvdXJjZS9ocG5mLWduZnUuanNvbj8kb3JkZXI9bmFtZSYkd2hlcmU9JztcbiAgICAgICAgdGhpcy5kb21haW5zVXJsID0gJ2h0dHBzOi8vYXBpLnVzLnNvY3JhdGEuY29tL2FwaS9jYXRhbG9nL3YxL2RvbWFpbnMnO1xuICAgICAgICB0aGlzLmVhcm5pbmdzVXJsID0gJ2h0dHBzOi8vb2RuLmRhdGEuc29jcmF0YS5jb20vcmVzb3VyY2Uvd213aC00dmFrLmpzb24/JHdoZXJlPSc7XG4gICAgICAgIHRoaXMuZWR1Y2F0aW9uVXJsID0gJ2h0dHBzOi8vb2RuLmRhdGEuc29jcmF0YS5jb20vcmVzb3VyY2UvdWY0bS01dThyLmpzb24/JHdoZXJlPSc7XG4gICAgICAgIHRoaXMuZ2RwVXJsID0gJ2h0dHBzOi8vb2RuLmRhdGEuc29jcmF0YS5jb20vcmVzb3VyY2Uva3Myai12aHI4Lmpzb24/JHdoZXJlPSc7XG4gICAgICAgIHRoaXMubW9zdFBvcHVsb3VzUmVnaW9uVHlwZVVybCA9ICdodHRwczovL29kbi5kYXRhLnNvY3JhdGEuY29tL3Jlc291cmNlL2V5YWUtOGpmeT9wYXJlbnRfaWQ9ezB9JmNoaWxkX3R5cGU9ezF9JiRsaW1pdD17Mn0mJG9yZGVyPWNoaWxkX3BvcHVsYXRpb24gZGVzYyc7XG4gICAgICAgIHRoaXMub2NjdXBhdGlvbnNVcmwgPSAnaHR0cHM6Ly9vZG4uZGF0YS5zb2NyYXRhLmNvbS9yZXNvdXJjZS9xZmNtLWZ3M2kuanNvbj8kb3JkZXI9b2NjdXBhdGlvbiYkd2hlcmU9JztcbiAgICAgICAgdGhpcy5wYXJlbnRTdGF0ZVVybCA9ICdodHRwczovL29kbi5kYXRhLnNvY3JhdGEuY29tL3Jlc291cmNlL2V5YWUtOGpmeT9wYXJlbnRfdHlwZT1zdGF0ZSZjaGlsZF9pZD17MH0nO1xuICAgICAgICB0aGlzLnBsYWNlc0luUmVnaW9uVXJsID0gJ2h0dHBzOi8vb2RuLmRhdGEuc29jcmF0YS5jb20vcmVzb3VyY2UvZXlhZS04amZ5P3BhcmVudF9pZD0nO1xuICAgICAgICB0aGlzLnBvcHVsYXRpb25VcmwgPSAnaHR0cHM6Ly9vZG4uZGF0YS5zb2NyYXRhLmNvbS9yZXNvdXJjZS9lM3JkLXp6bXIuanNvbj8kb3JkZXI9eWVhcixuYW1lJiR3aGVyZT0nO1xuICAgICAgICB0aGlzLnNpbWlsYXJSZWdpb25zVXJsID0gJ2h0dHBzOi8vc29jcmF0YS1wZWVycy5oZXJva3VhcHAuY29tL3BlZXJzLmpzb24/dmVjdG9ycz1wb3B1bGF0aW9uX2NoYW5nZSxlYXJuaW5ncyxvY2N1cGF0aW9uLGVkdWNhdGlvbixwb3B1bGF0aW9uJm49MTAmaWQ9ezB9JztcbiAgICB9XG5cbiAgICAvLyBQcm9taXNlc1xuICAgIC8vXG4gICAgZ2V0Q2F0ZWdvcmllcygpIHtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHRoaXMuY2F0ZWdvcmllc1VybClcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgfVxuXG4gICAgZ2V0Q291bnRpZXNJblN0YXRlKHN0YXRlSWQsIGxpbWl0ID0gMTApIHtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHRoaXMubW9zdFBvcHVsb3VzUmVnaW9uVHlwZVVybC5mb3JtYXQoc3RhdGVJZCwgJ2NvdW50eScsIGxpbWl0KSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgfVxuXG4gICAgZ2V0RG9tYWlucygpIHtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHRoaXMuZG9tYWluc1VybClcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgfVxuXG4gICAgZ2V0UGFyZW50U3RhdGUocmVnaW9uKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLnBhcmVudFN0YXRlVXJsLmZvcm1hdChyZWdpb24uaWQpKVxuICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICB9XG5cbiAgICBnZXRQbGFjZXNBbmRDb3VudGllc0luU3RhdGUoc3RhdGVJZCwgbGltaXQgPSAxMCkge1xuXG4gICAgICAgIHZhciBwbGFjZXNQcm9taXNlID0gZDMucHJvbWlzZS5qc29uKHRoaXMubW9zdFBvcHVsb3VzUmVnaW9uVHlwZVVybC5mb3JtYXQoc3RhdGVJZCwgJ3BsYWNlJywgbGltaXQpKTtcbiAgICAgICAgdmFyIGNvdW50aWVzUHJvbWlzZSA9IGQzLnByb21pc2UuanNvbih0aGlzLm1vc3RQb3B1bG91c1JlZ2lvblR5cGVVcmwuZm9ybWF0KHN0YXRlSWQsICdjb3VudHknLCBsaW1pdCkpO1xuXG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChbcGxhY2VzUHJvbWlzZSwgY291bnRpZXNQcm9taXNlXSlcbiAgICAgICAgICAgIC50aGVuKHZhbHVlcyA9PiBQcm9taXNlLnJlc29sdmUodmFsdWVzWzBdLmNvbmNhdCh2YWx1ZXNbMV0pKSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgfVxuXG4gICAgZ2V0TWV0cm9zSW5TdGF0ZShzdGF0ZUlkLCBsaW1pdCA9IDEwKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLm1vc3RQb3B1bG91c1JlZ2lvblR5cGVVcmwuZm9ybWF0KHN0YXRlSWQsICdtc2EnLCBsaW1pdCkpXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgIH1cblxuICAgIGdldFBsYWNlc0luU3RhdGUoc3RhdGVJZCwgbGltaXQgPSAxMCkge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5tb3N0UG9wdWxvdXNSZWdpb25UeXBlVXJsLmZvcm1hdChzdGF0ZUlkLCAncGxhY2UnLCBsaW1pdCkpXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgIH1cblxuICAgIGdldFNpbWlsYXJSZWdpb25zKHJlZ2lvbklkKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLnNpbWlsYXJSZWdpb25zVXJsLmZvcm1hdChyZWdpb25JZCkpXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgIH1cblxuICAgIC8vIENhbGxiYWNrc1xuICAgIC8vXG4gICAgZ2V0QXV0b0NvbXBsZXRlTmFtZVN1Z2dlc3Rpb25zKHNlYXJjaFRlcm0sIGNvbXBsZXRpb25IYW5kbGVyKSB7XG5cbiAgICAgICAgJC5nZXRKU09OKHRoaXMuYXV0b0NvbXBsZXRlTmFtZVN1Z2dlc3RVcmwuZm9ybWF0KGVuY29kZVVSSUNvbXBvbmVudChzZWFyY2hUZXJtKSksIGNvbXBsZXRpb25IYW5kbGVyKTtcbiAgICB9XG5cbiAgICBnZXRDb3N0T2ZMaXZpbmdEYXRhKHJlZ2lvbklkcywgY29tcGxldGlvbkhhbmRsZXIpIHtcblxuICAgICAgICB0aGlzLmdldERhdGEodGhpcy5jb3N0T2ZMaXZpbmdVcmwsIHJlZ2lvbklkcywgY29tcGxldGlvbkhhbmRsZXIpO1xuICAgIH1cblxuICAgIGdldEVhcm5pbmdzRGF0YShyZWdpb25JZHMsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG5cbiAgICAgICAgdGhpcy5nZXREYXRhKHRoaXMuZWFybmluZ3NVcmwsIHJlZ2lvbklkcywgY29tcGxldGlvbkhhbmRsZXIpO1xuICAgIH1cblxuICAgIGdldEVkdWNhdGlvbkRhdGEocmVnaW9uSWRzLCBjb21wbGV0aW9uSGFuZGxlcikge1xuXG4gICAgICAgIHRoaXMuZ2V0RGF0YSh0aGlzLmVkdWNhdGlvblVybCwgcmVnaW9uSWRzLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gICAgfVxuXG4gICAgZ2V0R2RwRGF0YShyZWdpb25JZHMsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG5cbiAgICAgICAgdGhpcy5nZXREYXRhKHRoaXMuZ2RwVXJsLCByZWdpb25JZHMsIGNvbXBsZXRpb25IYW5kbGVyKTtcbiAgICB9XG5cbiAgICBnZXRPY2N1cGF0aW9uc0RhdGEocmVnaW9uSWRzLCBjb21wbGV0aW9uSGFuZGxlcikge1xuXG4gICAgICAgIHRoaXMuZ2V0RGF0YSh0aGlzLm9jY3VwYXRpb25zVXJsLCByZWdpb25JZHMsIGNvbXBsZXRpb25IYW5kbGVyKTtcbiAgICB9XG5cbiAgICBnZXRQb3B1bGF0aW9uRGF0YShyZWdpb25JZHMsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG5cbiAgICAgICAgdGhpcy5nZXREYXRhKHRoaXMucG9wdWxhdGlvblVybCwgcmVnaW9uSWRzLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gICAgfVxuXG4gICAgZ2V0RGF0YSh1cmwsIHJlZ2lvbklkcywgY29tcGxldGlvbkhhbmRsZXIpIHtcblxuICAgICAgICB2YXIgc2VnbWVudHMgPSByZWdpb25JZHMubWFwKGZ1bmN0aW9uKHJlZ2lvbklkKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2lkPVxcJycgKyByZWdpb25JZCArICdcXCcnOyBcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJC5nZXRKU09OKHVybCArIGVuY29kZVVSSShzZWdtZW50cy5qb2luKCcgT1IgJykpLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gICAgfVxufSJdfQ==
//# sourceMappingURL=v4-api-controller.js.map
