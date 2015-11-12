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
        this.similarRegionsUrl = 'https://socrata-peers.herokuapp.com/peers.json?vectors=population_change,earnings,occupation,education,population&n=5&id=';
    }

    _createClass(ApiController, [{
        key: 'getParentState',
        value: function getParentState(region) {

            return d3.promise.json(this.parentStateUrl.format(region.id)).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'getPlacesAndCountiesInState',
        value: function getPlacesAndCountiesInState(stateId) {
            var limit = arguments.length <= 1 || arguments[1] === undefined ? 5 : arguments[1];

            var placesPromise = d3.promise.json(this.mostPopulousRegionTypeUrl.format(stateId, 'place', limit));
            var countiesPromise = d3.promise.json(this.mostPopulousRegionTypeUrl.format(stateId, 'county', limit));

            return Promise.all([placesPromise, countiesPromise]).then(function (values) {
                return Promise.resolve(values[0].concat(values[1]));
            }).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'getCountiesInState',
        value: function getCountiesInState(stateId) {
            var limit = arguments.length <= 1 || arguments[1] === undefined ? 5 : arguments[1];

            return d3.promise.json(this.mostPopulousRegionTypeUrl.format(stateId, 'county', limit)).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'getMetrosInState',
        value: function getMetrosInState(stateId) {
            var limit = arguments.length <= 1 || arguments[1] === undefined ? 5 : arguments[1];

            return d3.promise.json(this.mostPopulousRegionTypeUrl.format(stateId, 'msa', limit)).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'getPlacesInState',
        value: function getPlacesInState(stateId) {
            var limit = arguments.length <= 1 || arguments[1] === undefined ? 5 : arguments[1];

            return d3.promise.json(this.mostPopulousRegionTypeUrl.format(stateId, 'place', limit)).catch(function (error) {
                return console.error(error);
            });
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Y0LWFwaS1jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztJQUFNLGFBQWE7QUFFZixhQUZFLGFBQWEsR0FFRDs4QkFGWixhQUFhOztBQUlYLFlBQUksQ0FBQywwQkFBMEIsR0FBRyx1R0FBdUcsQ0FBQztBQUMxSSxZQUFJLENBQUMsYUFBYSxHQUFHLGtCQUFrQixDQUFDO0FBQ3hDLFlBQUksQ0FBQyxlQUFlLEdBQUcsOEVBQThFLENBQUM7QUFDdEcsWUFBSSxDQUFDLFVBQVUsR0FBRyxtREFBbUQsQ0FBQztBQUN0RSxZQUFJLENBQUMsV0FBVyxHQUFHLGtFQUFrRSxDQUFDO0FBQ3RGLFlBQUksQ0FBQyxZQUFZLEdBQUcsa0VBQWtFLENBQUM7QUFDdkYsWUFBSSxDQUFDLE1BQU0sR0FBRyxrRUFBa0UsQ0FBQztBQUNqRixZQUFJLENBQUMseUJBQXlCLEdBQUcsMEhBQTBILENBQUM7QUFDNUosWUFBSSxDQUFDLGNBQWMsR0FBRyxvRkFBb0YsQ0FBQztBQUMzRyxZQUFJLENBQUMsY0FBYyxHQUFHLG9GQUFvRixDQUFDO0FBQzNHLFlBQUksQ0FBQyxpQkFBaUIsR0FBRyxnRUFBZ0UsQ0FBQztBQUMxRixZQUFJLENBQUMsYUFBYSxHQUFHLG1GQUFtRixDQUFDO0FBQ3pHLFlBQUksQ0FBQyxpQkFBaUIsR0FBRywySEFBMkgsQ0FBQztLQUN4Sjs7aUJBakJDLGFBQWE7O3VDQW1CQSxNQUFNLEVBQUU7O0FBRW5CLG1CQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUN4RCxLQUFLLENBQUMsVUFBQSxLQUFLO3VCQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO2FBQUEsQ0FBQyxDQUFDO1NBQzdDOzs7b0RBRTJCLE9BQU8sRUFBYTtnQkFBWCxLQUFLLHlEQUFHLENBQUM7O0FBRTFDLGdCQUFJLGFBQWEsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNwRyxnQkFBSSxlQUFlLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7O0FBRXZHLG1CQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxhQUFhLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FDL0MsSUFBSSxDQUFDLFVBQUEsTUFBTTt1QkFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFBQSxDQUFDLENBQzVELEtBQUssQ0FBQyxVQUFBLEtBQUs7dUJBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7YUFBQSxDQUFDLENBQUM7U0FDN0M7OzsyQ0FFa0IsT0FBTyxFQUFhO2dCQUFYLEtBQUsseURBQUcsQ0FBQzs7QUFFakMsbUJBQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQ2xGLEtBQUssQ0FBQyxVQUFBLEtBQUs7dUJBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7YUFBQSxDQUFDLENBQUM7U0FDN0M7Ozt5Q0FFZ0IsT0FBTyxFQUFhO2dCQUFYLEtBQUsseURBQUcsQ0FBQzs7QUFFL0IsbUJBQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQy9FLEtBQUssQ0FBQyxVQUFBLEtBQUs7dUJBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7YUFBQSxDQUFDLENBQUM7U0FDN0M7Ozt5Q0FFZ0IsT0FBTyxFQUFhO2dCQUFYLEtBQUsseURBQUcsQ0FBQzs7QUFFL0IsbUJBQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQ2pGLEtBQUssQ0FBQyxVQUFBLEtBQUs7dUJBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7YUFBQSxDQUFDLENBQUM7U0FDN0M7Ozt1REFFOEIsVUFBVSxFQUFFLGlCQUFpQixFQUFFOztBQUUxRCxhQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1NBQ3hHOzs7NENBRW1CLFNBQVMsRUFBRSxpQkFBaUIsRUFBRTs7QUFFOUMsZ0JBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztTQUNwRTs7O3dDQUVlLFNBQVMsRUFBRSxpQkFBaUIsRUFBRTs7QUFFMUMsZ0JBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztTQUNoRTs7O3lDQUVnQixTQUFTLEVBQUUsaUJBQWlCLEVBQUU7O0FBRTNDLGdCQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsU0FBUyxFQUFFLGlCQUFpQixDQUFDLENBQUM7U0FDakU7OzttQ0FFVSxTQUFTLEVBQUUsaUJBQWlCLEVBQUU7O0FBRXJDLGdCQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLGlCQUFpQixDQUFDLENBQUM7U0FDM0Q7OzsyQ0FFa0IsU0FBUyxFQUFFLGlCQUFpQixFQUFFOztBQUU3QyxnQkFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1NBQ25FOzs7MENBRWlCLFNBQVMsRUFBRSxpQkFBaUIsRUFBRTs7QUFFNUMsZ0JBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztTQUNsRTs7O2dDQUVPLEdBQUcsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLEVBQUU7O0FBRXZDLGdCQUFJLFFBQVEsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVMsUUFBUSxFQUFFO0FBQzVDLHVCQUFPLE9BQU8sR0FBRyxRQUFRLEdBQUcsSUFBSSxDQUFDO2FBQ3BDLENBQUMsQ0FBQzs7QUFFSCxhQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLENBQUM7U0FDeEU7OzttQ0FFVSxpQkFBaUIsRUFBRTs7QUFFMUIsYUFBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLGlCQUFpQixDQUFDLENBQUM7U0FDakQ7OztzQ0FFYSxpQkFBaUIsRUFBRTs7QUFFN0IsYUFBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLGlCQUFpQixDQUFDLENBQUM7U0FDcEQ7OzswQ0FFaUIsUUFBUSxFQUFFLGlCQUFpQixFQUFFOztBQUUzQyxhQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxRQUFRLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztTQUNuRTs7OzBDQUVpQixRQUFRLEVBQUUsaUJBQWlCLEVBQUU7O0FBRTNDLGFBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1NBQ25FOzs7V0FuSEMsYUFBYSIsImZpbGUiOiJ2NC1hcGktY29udHJvbGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEFwaUNvbnRyb2xsZXIge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVOYW1lU3VnZ2VzdFVybCA9ICdodHRwczovL2ZlZGVyYWwuZGVtby5zb2NyYXRhLmNvbS92aWV3cy83ZzJiLThicnYvY29sdW1ucy9hdXRvY29tcGxldGVfbmFtZS9zdWdnZXN0L3swfT9zaXplPTEwJmZ1eno9MCc7XG4gICAgICAgIHRoaXMuY2F0ZWdvcmllc1VybCA9ICcvY2F0ZWdvcmllcy5qc29uJztcbiAgICAgICAgdGhpcy5jb3N0T2ZMaXZpbmdVcmwgPSAnaHR0cHM6Ly9mZWRlcmFsLmRlbW8uc29jcmF0YS5jb20vcmVzb3VyY2UvaHBuZi1nbmZ1Lmpzb24/JG9yZGVyPW5hbWUmJHdoZXJlPSc7XG4gICAgICAgIHRoaXMuZG9tYWluc1VybCA9ICdodHRwczovL2FwaS51cy5zb2NyYXRhLmNvbS9hcGkvY2F0YWxvZy92MS9kb21haW5zJztcbiAgICAgICAgdGhpcy5lYXJuaW5nc1VybCA9ICdodHRwczovL2ZlZGVyYWwuZGVtby5zb2NyYXRhLmNvbS9yZXNvdXJjZS93bXdoLTR2YWsuanNvbj8kd2hlcmU9JztcbiAgICAgICAgdGhpcy5lZHVjYXRpb25VcmwgPSAnaHR0cHM6Ly9mZWRlcmFsLmRlbW8uc29jcmF0YS5jb20vcmVzb3VyY2UvdWY0bS01dThyLmpzb24/JHdoZXJlPSc7XG4gICAgICAgIHRoaXMuZ2RwVXJsID0gJ2h0dHBzOi8vZmVkZXJhbC5kZW1vLnNvY3JhdGEuY29tL3Jlc291cmNlL2tzMmotdmhyOC5qc29uPyR3aGVyZT0nO1xuICAgICAgICB0aGlzLm1vc3RQb3B1bG91c1JlZ2lvblR5cGVVcmwgPSAnaHR0cHM6Ly9mZWRlcmFsLmRlbW8uc29jcmF0YS5jb20vcmVzb3VyY2UvZXlhZS04amZ5P3BhcmVudF9pZD17MH0mY2hpbGRfdHlwZT17MX0mJGxpbWl0PXsyfSYkb3JkZXI9Y2hpbGRfcG9wdWxhdGlvbiBkZXNjJztcbiAgICAgICAgdGhpcy5vY2N1cGF0aW9uc1VybCA9ICdodHRwczovL2ZlZGVyYWwuZGVtby5zb2NyYXRhLmNvbS9yZXNvdXJjZS9xZmNtLWZ3M2kuanNvbj8kb3JkZXI9b2NjdXBhdGlvbiYkd2hlcmU9JztcbiAgICAgICAgdGhpcy5wYXJlbnRTdGF0ZVVybCA9ICdodHRwczovL2ZlZGVyYWwuZGVtby5zb2NyYXRhLmNvbS9yZXNvdXJjZS9leWFlLThqZnk/cGFyZW50X3R5cGU9c3RhdGUmY2hpbGRfaWQ9ezB9JztcbiAgICAgICAgdGhpcy5wbGFjZXNJblJlZ2lvblVybCA9ICdodHRwczovL2ZlZGVyYWwuZGVtby5zb2NyYXRhLmNvbS9yZXNvdXJjZS9leWFlLThqZnk/cGFyZW50X2lkPSc7XG4gICAgICAgIHRoaXMucG9wdWxhdGlvblVybCA9ICdodHRwczovL2ZlZGVyYWwuZGVtby5zb2NyYXRhLmNvbS9yZXNvdXJjZS9lM3JkLXp6bXIuanNvbj8kb3JkZXI9eWVhcixuYW1lJiR3aGVyZT0nO1xuICAgICAgICB0aGlzLnNpbWlsYXJSZWdpb25zVXJsID0gJ2h0dHBzOi8vc29jcmF0YS1wZWVycy5oZXJva3VhcHAuY29tL3BlZXJzLmpzb24/dmVjdG9ycz1wb3B1bGF0aW9uX2NoYW5nZSxlYXJuaW5ncyxvY2N1cGF0aW9uLGVkdWNhdGlvbixwb3B1bGF0aW9uJm49NSZpZD0nO1xuICAgIH1cblxuICAgIGdldFBhcmVudFN0YXRlKHJlZ2lvbikge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5wYXJlbnRTdGF0ZVVybC5mb3JtYXQocmVnaW9uLmlkKSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgfVxuICAgIFxuICAgIGdldFBsYWNlc0FuZENvdW50aWVzSW5TdGF0ZShzdGF0ZUlkLCBsaW1pdCA9IDUpIHtcblxuICAgICAgICB2YXIgcGxhY2VzUHJvbWlzZSA9IGQzLnByb21pc2UuanNvbih0aGlzLm1vc3RQb3B1bG91c1JlZ2lvblR5cGVVcmwuZm9ybWF0KHN0YXRlSWQsICdwbGFjZScsIGxpbWl0KSk7XG4gICAgICAgIHZhciBjb3VudGllc1Byb21pc2UgPSBkMy5wcm9taXNlLmpzb24odGhpcy5tb3N0UG9wdWxvdXNSZWdpb25UeXBlVXJsLmZvcm1hdChzdGF0ZUlkLCAnY291bnR5JywgbGltaXQpKTtcblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoW3BsYWNlc1Byb21pc2UsIGNvdW50aWVzUHJvbWlzZV0pXG4gICAgICAgICAgICAudGhlbih2YWx1ZXMgPT4gUHJvbWlzZS5yZXNvbHZlKHZhbHVlc1swXS5jb25jYXQodmFsdWVzWzFdKSkpXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgIH1cbiAgICBcbiAgICBnZXRDb3VudGllc0luU3RhdGUoc3RhdGVJZCwgbGltaXQgPSA1KSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLm1vc3RQb3B1bG91c1JlZ2lvblR5cGVVcmwuZm9ybWF0KHN0YXRlSWQsICdjb3VudHknLCBsaW1pdCkpXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgIH1cbiAgICBcbiAgICBnZXRNZXRyb3NJblN0YXRlKHN0YXRlSWQsIGxpbWl0ID0gNSkge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5tb3N0UG9wdWxvdXNSZWdpb25UeXBlVXJsLmZvcm1hdChzdGF0ZUlkLCAnbXNhJywgbGltaXQpKVxuICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICB9XG5cbiAgICBnZXRQbGFjZXNJblN0YXRlKHN0YXRlSWQsIGxpbWl0ID0gNSkge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5tb3N0UG9wdWxvdXNSZWdpb25UeXBlVXJsLmZvcm1hdChzdGF0ZUlkLCAncGxhY2UnLCBsaW1pdCkpXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgIH1cblxuICAgIGdldEF1dG9Db21wbGV0ZU5hbWVTdWdnZXN0aW9ucyhzZWFyY2hUZXJtLCBjb21wbGV0aW9uSGFuZGxlcikge1xuXG4gICAgICAgICQuZ2V0SlNPTih0aGlzLmF1dG9Db21wbGV0ZU5hbWVTdWdnZXN0VXJsLmZvcm1hdChlbmNvZGVVUklDb21wb25lbnQoc2VhcmNoVGVybSkpLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gICAgfVxuXG4gICAgZ2V0Q29zdE9mTGl2aW5nRGF0YShyZWdpb25JZHMsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG5cbiAgICAgICAgdGhpcy5nZXREYXRhKHRoaXMuY29zdE9mTGl2aW5nVXJsLCByZWdpb25JZHMsIGNvbXBsZXRpb25IYW5kbGVyKTtcbiAgICB9XG5cbiAgICBnZXRFYXJuaW5nc0RhdGEocmVnaW9uSWRzLCBjb21wbGV0aW9uSGFuZGxlcikge1xuXG4gICAgICAgIHRoaXMuZ2V0RGF0YSh0aGlzLmVhcm5pbmdzVXJsLCByZWdpb25JZHMsIGNvbXBsZXRpb25IYW5kbGVyKTtcbiAgICB9XG5cbiAgICBnZXRFZHVjYXRpb25EYXRhKHJlZ2lvbklkcywgY29tcGxldGlvbkhhbmRsZXIpIHtcblxuICAgICAgICB0aGlzLmdldERhdGEodGhpcy5lZHVjYXRpb25VcmwsIHJlZ2lvbklkcywgY29tcGxldGlvbkhhbmRsZXIpO1xuICAgIH1cblxuICAgIGdldEdkcERhdGEocmVnaW9uSWRzLCBjb21wbGV0aW9uSGFuZGxlcikge1xuXG4gICAgICAgIHRoaXMuZ2V0RGF0YSh0aGlzLmdkcFVybCwgcmVnaW9uSWRzLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gICAgfVxuXG4gICAgZ2V0T2NjdXBhdGlvbnNEYXRhKHJlZ2lvbklkcywgY29tcGxldGlvbkhhbmRsZXIpIHtcblxuICAgICAgICB0aGlzLmdldERhdGEodGhpcy5vY2N1cGF0aW9uc1VybCwgcmVnaW9uSWRzLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gICAgfVxuXG4gICAgZ2V0UG9wdWxhdGlvbkRhdGEocmVnaW9uSWRzLCBjb21wbGV0aW9uSGFuZGxlcikge1xuXG4gICAgICAgIHRoaXMuZ2V0RGF0YSh0aGlzLnBvcHVsYXRpb25VcmwsIHJlZ2lvbklkcywgY29tcGxldGlvbkhhbmRsZXIpO1xuICAgIH1cblxuICAgIGdldERhdGEodXJsLCByZWdpb25JZHMsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG5cbiAgICAgICAgdmFyIHNlZ21lbnRzID0gcmVnaW9uSWRzLm1hcChmdW5jdGlvbihyZWdpb25JZCkge1xuICAgICAgICAgICAgcmV0dXJuICdpZD1cXCcnICsgcmVnaW9uSWQgKyAnXFwnJzsgXG4gICAgICAgIH0pO1xuXG4gICAgICAgICQuZ2V0SlNPTih1cmwgKyBlbmNvZGVVUkkoc2VnbWVudHMuam9pbignIE9SICcpKSwgY29tcGxldGlvbkhhbmRsZXIpO1xuICAgIH1cblxuICAgIGdldERvbWFpbnMoY29tcGxldGlvbkhhbmRsZXIpIHtcblxuICAgICAgICAkLmdldEpTT04odGhpcy5kb21haW5zVXJsLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gICAgfVxuXG4gICAgZ2V0Q2F0ZWdvcmllcyhjb21wbGV0aW9uSGFuZGxlcikge1xuXG4gICAgICAgICQuZ2V0SlNPTih0aGlzLmNhdGVnb3JpZXNVcmwsIGNvbXBsZXRpb25IYW5kbGVyKTtcbiAgICB9XG5cbiAgICBnZXRQbGFjZXNJblJlZ2lvbihyZWdpb25JZCwgY29tcGxldGlvbkhhbmRsZXIpIHtcblxuICAgICAgICAkLmdldEpTT04odGhpcy5wbGFjZXNJblJlZ2lvblVybCArIHJlZ2lvbklkLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gICAgfVxuXG4gICAgZ2V0U2ltaWxhclJlZ2lvbnMocmVnaW9uSWQsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG5cbiAgICAgICAgJC5nZXRKU09OKHRoaXMuc2ltaWxhclJlZ2lvbnNVcmwgKyByZWdpb25JZCwgY29tcGxldGlvbkhhbmRsZXIpO1xuICAgIH1cbn0iXX0=
//# sourceMappingURL=v4-api-controller.js.map
