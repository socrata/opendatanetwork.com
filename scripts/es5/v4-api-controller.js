'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ApiController = (function () {
    function ApiController() {
        _classCallCheck(this, ApiController);

        this.autoCompleteNameSuggestUrl = 'https://federal.demo.socrata.com/views/7g2b-8brv/columns/autocomplete_name/suggest/{0}?size=10&fuzz=0';
        this.categoriesUrl = '/categories.json';
        this.childRegionsUrl = 'https://federal.demo.socrata.com/resource/eyae-8jfy?parent_id={0}&$limit={1}';
        this.costOfLivingUrl = 'https://federal.demo.socrata.com/resource/hpnf-gnfu.json?$order=name&$where=';
        this.domainsUrl = 'https://api.us.socrata.com/api/catalog/v1/domains';
        this.earningsUrl = 'https://federal.demo.socrata.com/resource/wmwh-4vak.json?$where=';
        this.educationUrl = 'https://federal.demo.socrata.com/resource/uf4m-5u8r.json?$where=';
        this.gdpUrl = 'https://federal.demo.socrata.com/resource/ks2j-vhr8.json?$where=';
        this.mostPopulousRegionTypeUrl = 'https://federal.demo.socrata.com/resource/eyae-8jfy?parent_id={0}&child_type={1}&$limit={2}&$order=child_population desc';
        this.occupationsUrl = 'https://federal.demo.socrata.com/resource/qfcm-fw3i.json?$order=occupation&$where=';
        this.parentStateUrl = 'https://federal.demo.socrata.com/resource/eyae-8jfy?parent_type=state&child_id={0}';
        this.populationUrl = 'https://federal.demo.socrata.com/resource/e3rd-zzmr.json?$order=year,name&$where=';
        this.similarRegionsUrl = 'https://socrata-peers.herokuapp.com/peers.json?vectors=population_change,earnings,occupation,education,population&n=10&id={0}';
    }

    // Promises
    //

    _createClass(ApiController, [{
        key: 'getCategories',
        value: function getCategories() {

            return d3.promise.json(this.categoriesUrl);
        }
    }, {
        key: 'getChildRegions',
        value: function getChildRegions(regionId) {
            var limit = arguments.length <= 1 || arguments[1] === undefined ? 10 : arguments[1];

            return d3.promise.json(this.childRegionsUrl.format(regionId, limit));
        }
    }, {
        key: 'getCountiesInState',
        value: function getCountiesInState(stateId) {
            var limit = arguments.length <= 1 || arguments[1] === undefined ? 10 : arguments[1];

            return d3.promise.json(this.mostPopulousRegionTypeUrl.format(stateId, 'county', limit));
        }
    }, {
        key: 'getDomains',
        value: function getDomains() {

            return d3.promise.json(this.domainsUrl);
        }
    }, {
        key: 'getMetrosInState',
        value: function getMetrosInState(stateId) {
            var limit = arguments.length <= 1 || arguments[1] === undefined ? 10 : arguments[1];

            return d3.promise.json(this.mostPopulousRegionTypeUrl.format(stateId, 'msa', limit));
        }
    }, {
        key: 'getCitiesInState',
        value: function getCitiesInState(stateId) {
            var limit = arguments.length <= 1 || arguments[1] === undefined ? 10 : arguments[1];

            return d3.promise.json(this.mostPopulousRegionTypeUrl.format(stateId, 'place', limit));
        }
    }, {
        key: 'getParentState',
        value: function getParentState(region) {

            return d3.promise.json(this.parentStateUrl.format(region.id));
        }
    }, {
        key: 'getSimilarRegions',
        value: function getSimilarRegions(regionId) {

            return d3.promise.json(this.similarRegionsUrl.format(regionId));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Y0LWFwaS1jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztJQUFNLGFBQWE7QUFFZixhQUZFLGFBQWEsR0FFRDs4QkFGWixhQUFhOztBQUlYLFlBQUksQ0FBQywwQkFBMEIsR0FBRyx1R0FBdUcsQ0FBQztBQUMxSSxZQUFJLENBQUMsYUFBYSxHQUFHLGtCQUFrQixDQUFDO0FBQ3hDLFlBQUksQ0FBQyxlQUFlLEdBQUcsOEVBQThFLENBQUM7QUFDdEcsWUFBSSxDQUFDLGVBQWUsR0FBRyw4RUFBOEUsQ0FBQztBQUN0RyxZQUFJLENBQUMsVUFBVSxHQUFHLG1EQUFtRCxDQUFDO0FBQ3RFLFlBQUksQ0FBQyxXQUFXLEdBQUcsa0VBQWtFLENBQUM7QUFDdEYsWUFBSSxDQUFDLFlBQVksR0FBRyxrRUFBa0UsQ0FBQztBQUN2RixZQUFJLENBQUMsTUFBTSxHQUFHLGtFQUFrRSxDQUFDO0FBQ2pGLFlBQUksQ0FBQyx5QkFBeUIsR0FBRywwSEFBMEgsQ0FBQztBQUM1SixZQUFJLENBQUMsY0FBYyxHQUFHLG9GQUFvRixDQUFDO0FBQzNHLFlBQUksQ0FBQyxjQUFjLEdBQUcsb0ZBQW9GLENBQUM7QUFDM0csWUFBSSxDQUFDLGFBQWEsR0FBRyxtRkFBbUYsQ0FBQztBQUN6RyxZQUFJLENBQUMsaUJBQWlCLEdBQUcsK0hBQStILENBQUM7S0FDNUo7Ozs7QUFBQTtpQkFqQkMsYUFBYTs7d0NBcUJDOztBQUVaLG1CQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQTtTQUM3Qzs7O3dDQUVlLFFBQVEsRUFBYztnQkFBWixLQUFLLHlEQUFHLEVBQUU7O0FBRWhDLG1CQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFBO1NBQ3ZFOzs7MkNBRWtCLE9BQU8sRUFBYztnQkFBWixLQUFLLHlEQUFHLEVBQUU7O0FBRWxDLG1CQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFBO1NBQzFGOzs7cUNBRVk7O0FBRVQsbUJBQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO1NBQzFDOzs7eUNBRWdCLE9BQU8sRUFBYztnQkFBWixLQUFLLHlEQUFHLEVBQUU7O0FBRWhDLG1CQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFBO1NBQ3ZGOzs7eUNBRWdCLE9BQU8sRUFBYztnQkFBWixLQUFLLHlEQUFHLEVBQUU7O0FBRWhDLG1CQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFBO1NBQ3pGOzs7dUNBRWMsTUFBTSxFQUFFOztBQUVuQixtQkFBTyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtTQUNoRTs7OzBDQUVpQixRQUFRLEVBQUU7O0FBRXhCLG1CQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQTtTQUNsRTs7Ozs7Ozt1REFJOEIsVUFBVSxFQUFFLGlCQUFpQixFQUFFOztBQUUxRCxhQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1NBQ3hHOzs7NENBRW1CLFNBQVMsRUFBRSxpQkFBaUIsRUFBRTs7QUFFOUMsZ0JBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztTQUNwRTs7O3dDQUVlLFNBQVMsRUFBRSxpQkFBaUIsRUFBRTs7QUFFMUMsZ0JBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztTQUNoRTs7O3lDQUVnQixTQUFTLEVBQUUsaUJBQWlCLEVBQUU7O0FBRTNDLGdCQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsU0FBUyxFQUFFLGlCQUFpQixDQUFDLENBQUM7U0FDakU7OzttQ0FFVSxTQUFTLEVBQUUsaUJBQWlCLEVBQUU7O0FBRXJDLGdCQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLGlCQUFpQixDQUFDLENBQUM7U0FDM0Q7OzsyQ0FFa0IsU0FBUyxFQUFFLGlCQUFpQixFQUFFOztBQUU3QyxnQkFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1NBQ25FOzs7MENBRWlCLFNBQVMsRUFBRSxpQkFBaUIsRUFBRTs7QUFFNUMsZ0JBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztTQUNsRTs7O2dDQUVPLEdBQUcsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLEVBQUU7O0FBRXZDLGdCQUFJLFFBQVEsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVMsUUFBUSxFQUFFO0FBQzVDLHVCQUFPLE9BQU8sR0FBRyxRQUFRLEdBQUcsSUFBSSxDQUFDO2FBQ3BDLENBQUMsQ0FBQzs7QUFFSCxhQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLENBQUM7U0FDeEU7OztXQXpHQyxhQUFhIiwiZmlsZSI6InY0LWFwaS1jb250cm9sbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQXBpQ29udHJvbGxlciB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU5hbWVTdWdnZXN0VXJsID0gJ2h0dHBzOi8vZmVkZXJhbC5kZW1vLnNvY3JhdGEuY29tL3ZpZXdzLzdnMmItOGJydi9jb2x1bW5zL2F1dG9jb21wbGV0ZV9uYW1lL3N1Z2dlc3QvezB9P3NpemU9MTAmZnV6ej0wJztcbiAgICAgICAgdGhpcy5jYXRlZ29yaWVzVXJsID0gJy9jYXRlZ29yaWVzLmpzb24nO1xuICAgICAgICB0aGlzLmNoaWxkUmVnaW9uc1VybCA9ICdodHRwczovL2ZlZGVyYWwuZGVtby5zb2NyYXRhLmNvbS9yZXNvdXJjZS9leWFlLThqZnk/cGFyZW50X2lkPXswfSYkbGltaXQ9ezF9JztcbiAgICAgICAgdGhpcy5jb3N0T2ZMaXZpbmdVcmwgPSAnaHR0cHM6Ly9mZWRlcmFsLmRlbW8uc29jcmF0YS5jb20vcmVzb3VyY2UvaHBuZi1nbmZ1Lmpzb24/JG9yZGVyPW5hbWUmJHdoZXJlPSc7XG4gICAgICAgIHRoaXMuZG9tYWluc1VybCA9ICdodHRwczovL2FwaS51cy5zb2NyYXRhLmNvbS9hcGkvY2F0YWxvZy92MS9kb21haW5zJztcbiAgICAgICAgdGhpcy5lYXJuaW5nc1VybCA9ICdodHRwczovL2ZlZGVyYWwuZGVtby5zb2NyYXRhLmNvbS9yZXNvdXJjZS93bXdoLTR2YWsuanNvbj8kd2hlcmU9JztcbiAgICAgICAgdGhpcy5lZHVjYXRpb25VcmwgPSAnaHR0cHM6Ly9mZWRlcmFsLmRlbW8uc29jcmF0YS5jb20vcmVzb3VyY2UvdWY0bS01dThyLmpzb24/JHdoZXJlPSc7XG4gICAgICAgIHRoaXMuZ2RwVXJsID0gJ2h0dHBzOi8vZmVkZXJhbC5kZW1vLnNvY3JhdGEuY29tL3Jlc291cmNlL2tzMmotdmhyOC5qc29uPyR3aGVyZT0nO1xuICAgICAgICB0aGlzLm1vc3RQb3B1bG91c1JlZ2lvblR5cGVVcmwgPSAnaHR0cHM6Ly9mZWRlcmFsLmRlbW8uc29jcmF0YS5jb20vcmVzb3VyY2UvZXlhZS04amZ5P3BhcmVudF9pZD17MH0mY2hpbGRfdHlwZT17MX0mJGxpbWl0PXsyfSYkb3JkZXI9Y2hpbGRfcG9wdWxhdGlvbiBkZXNjJztcbiAgICAgICAgdGhpcy5vY2N1cGF0aW9uc1VybCA9ICdodHRwczovL2ZlZGVyYWwuZGVtby5zb2NyYXRhLmNvbS9yZXNvdXJjZS9xZmNtLWZ3M2kuanNvbj8kb3JkZXI9b2NjdXBhdGlvbiYkd2hlcmU9JztcbiAgICAgICAgdGhpcy5wYXJlbnRTdGF0ZVVybCA9ICdodHRwczovL2ZlZGVyYWwuZGVtby5zb2NyYXRhLmNvbS9yZXNvdXJjZS9leWFlLThqZnk/cGFyZW50X3R5cGU9c3RhdGUmY2hpbGRfaWQ9ezB9JztcbiAgICAgICAgdGhpcy5wb3B1bGF0aW9uVXJsID0gJ2h0dHBzOi8vZmVkZXJhbC5kZW1vLnNvY3JhdGEuY29tL3Jlc291cmNlL2UzcmQtenptci5qc29uPyRvcmRlcj15ZWFyLG5hbWUmJHdoZXJlPSc7XG4gICAgICAgIHRoaXMuc2ltaWxhclJlZ2lvbnNVcmwgPSAnaHR0cHM6Ly9zb2NyYXRhLXBlZXJzLmhlcm9rdWFwcC5jb20vcGVlcnMuanNvbj92ZWN0b3JzPXBvcHVsYXRpb25fY2hhbmdlLGVhcm5pbmdzLG9jY3VwYXRpb24sZWR1Y2F0aW9uLHBvcHVsYXRpb24mbj0xMCZpZD17MH0nO1xuICAgIH1cblxuICAgIC8vIFByb21pc2VzXG4gICAgLy9cbiAgICBnZXRDYXRlZ29yaWVzKCkge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5jYXRlZ29yaWVzVXJsKVxuICAgIH1cblxuICAgIGdldENoaWxkUmVnaW9ucyhyZWdpb25JZCwgbGltaXQgPSAxMCkge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5jaGlsZFJlZ2lvbnNVcmwuZm9ybWF0KHJlZ2lvbklkLCBsaW1pdCkpXG4gICAgfVxuXG4gICAgZ2V0Q291bnRpZXNJblN0YXRlKHN0YXRlSWQsIGxpbWl0ID0gMTApIHtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHRoaXMubW9zdFBvcHVsb3VzUmVnaW9uVHlwZVVybC5mb3JtYXQoc3RhdGVJZCwgJ2NvdW50eScsIGxpbWl0KSlcbiAgICB9XG5cbiAgICBnZXREb21haW5zKCkge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5kb21haW5zVXJsKVxuICAgIH1cblxuICAgIGdldE1ldHJvc0luU3RhdGUoc3RhdGVJZCwgbGltaXQgPSAxMCkge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5tb3N0UG9wdWxvdXNSZWdpb25UeXBlVXJsLmZvcm1hdChzdGF0ZUlkLCAnbXNhJywgbGltaXQpKVxuICAgIH1cblxuICAgIGdldENpdGllc0luU3RhdGUoc3RhdGVJZCwgbGltaXQgPSAxMCkge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5tb3N0UG9wdWxvdXNSZWdpb25UeXBlVXJsLmZvcm1hdChzdGF0ZUlkLCAncGxhY2UnLCBsaW1pdCkpXG4gICAgfVxuXG4gICAgZ2V0UGFyZW50U3RhdGUocmVnaW9uKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLnBhcmVudFN0YXRlVXJsLmZvcm1hdChyZWdpb24uaWQpKVxuICAgIH1cblxuICAgIGdldFNpbWlsYXJSZWdpb25zKHJlZ2lvbklkKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLnNpbWlsYXJSZWdpb25zVXJsLmZvcm1hdChyZWdpb25JZCkpXG4gICAgfVxuXG4gICAgLy8gQ2FsbGJhY2tzXG4gICAgLy9cbiAgICBnZXRBdXRvQ29tcGxldGVOYW1lU3VnZ2VzdGlvbnMoc2VhcmNoVGVybSwgY29tcGxldGlvbkhhbmRsZXIpIHtcblxuICAgICAgICAkLmdldEpTT04odGhpcy5hdXRvQ29tcGxldGVOYW1lU3VnZ2VzdFVybC5mb3JtYXQoZW5jb2RlVVJJQ29tcG9uZW50KHNlYXJjaFRlcm0pKSwgY29tcGxldGlvbkhhbmRsZXIpO1xuICAgIH1cblxuICAgIGdldENvc3RPZkxpdmluZ0RhdGEocmVnaW9uSWRzLCBjb21wbGV0aW9uSGFuZGxlcikge1xuXG4gICAgICAgIHRoaXMuZ2V0RGF0YSh0aGlzLmNvc3RPZkxpdmluZ1VybCwgcmVnaW9uSWRzLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gICAgfVxuXG4gICAgZ2V0RWFybmluZ3NEYXRhKHJlZ2lvbklkcywgY29tcGxldGlvbkhhbmRsZXIpIHtcblxuICAgICAgICB0aGlzLmdldERhdGEodGhpcy5lYXJuaW5nc1VybCwgcmVnaW9uSWRzLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gICAgfVxuXG4gICAgZ2V0RWR1Y2F0aW9uRGF0YShyZWdpb25JZHMsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG5cbiAgICAgICAgdGhpcy5nZXREYXRhKHRoaXMuZWR1Y2F0aW9uVXJsLCByZWdpb25JZHMsIGNvbXBsZXRpb25IYW5kbGVyKTtcbiAgICB9XG5cbiAgICBnZXRHZHBEYXRhKHJlZ2lvbklkcywgY29tcGxldGlvbkhhbmRsZXIpIHtcblxuICAgICAgICB0aGlzLmdldERhdGEodGhpcy5nZHBVcmwsIHJlZ2lvbklkcywgY29tcGxldGlvbkhhbmRsZXIpO1xuICAgIH1cblxuICAgIGdldE9jY3VwYXRpb25zRGF0YShyZWdpb25JZHMsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG5cbiAgICAgICAgdGhpcy5nZXREYXRhKHRoaXMub2NjdXBhdGlvbnNVcmwsIHJlZ2lvbklkcywgY29tcGxldGlvbkhhbmRsZXIpO1xuICAgIH1cblxuICAgIGdldFBvcHVsYXRpb25EYXRhKHJlZ2lvbklkcywgY29tcGxldGlvbkhhbmRsZXIpIHtcblxuICAgICAgICB0aGlzLmdldERhdGEodGhpcy5wb3B1bGF0aW9uVXJsLCByZWdpb25JZHMsIGNvbXBsZXRpb25IYW5kbGVyKTtcbiAgICB9XG5cbiAgICBnZXREYXRhKHVybCwgcmVnaW9uSWRzLCBjb21wbGV0aW9uSGFuZGxlcikge1xuXG4gICAgICAgIHZhciBzZWdtZW50cyA9IHJlZ2lvbklkcy5tYXAoZnVuY3Rpb24ocmVnaW9uSWQpIHtcbiAgICAgICAgICAgIHJldHVybiAnaWQ9XFwnJyArIHJlZ2lvbklkICsgJ1xcJyc7IFxuICAgICAgICB9KTtcblxuICAgICAgICAkLmdldEpTT04odXJsICsgZW5jb2RlVVJJKHNlZ21lbnRzLmpvaW4oJyBPUiAnKSksIGNvbXBsZXRpb25IYW5kbGVyKTtcbiAgICB9XG59Il19
//# sourceMappingURL=v4-api-controller.js.map
