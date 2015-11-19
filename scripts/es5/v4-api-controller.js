'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ApiController = (function () {
    function ApiController() {
        _classCallCheck(this, ApiController);

        this.autoCompleteNameSuggestUrl = 'https://odn.data.socrata.com/views/7g2b-8brv/columns/autocomplete_name/suggest/{0}?size=10&fuzz=0';
        this.categoriesUrl = '/categories.json';
        this.childRegionsUrl = 'https://federal.demo.socrata.com/resource/eyae-8jfy?parent_id={0}&$limit={1}';
        this.costOfLivingUrl = 'https://federal.demo.socrata.com/resource/hpnf-gnfu.json?$order=name&$where=';
        this.domainsUrl = 'https://api.us.socrata.com/api/catalog/v1/domains';
        this.earningsByPlaceUrl = 'https://federal.demo.socrata.com/resource/wmwh-4vak.json/?type=place&$limit=50000&$where=population%20%3E%205000';
        this.earningsUrl = 'https://federal.demo.socrata.com/resource/wmwh-4vak.json?$where=';
        this.educationByPlaceUrl = 'https://federal.demo.socrata.com/resource/uf4m-5u8r.json?type=place&$limit=50000&$where=population%20%3E%205000';
        this.educationUrl = 'https://federal.demo.socrata.com/resource/uf4m-5u8r.json?$where=';
        this.gdpUrl = 'https://federal.demo.socrata.com/resource/ks2j-vhr8.json?$where=';
        this.mostPopulousRegionTypeUrl = 'https://federal.demo.socrata.com/resource/eyae-8jfy?parent_id={0}&child_type={1}&$limit={2}&$order=child_population desc';
        this.occupationsUrl = 'https://federal.demo.socrata.com/resource/qfcm-fw3i.json?$order=occupation&$where=';
        this.parentStateUrl = 'https://federal.demo.socrata.com/resource/eyae-8jfy?parent_type=state&child_id={0}';
        this.placesUrl = 'https://federal.demo.socrata.com/resource/gm3u-gw57.json/?type=place&$limit=50000&$where=population%20%3E%205000';
        this.populationUrl = 'https://federal.demo.socrata.com/resource/e3rd-zzmr.json?$order=year,name&$where=';
        this.similarRegionsUrl = 'https://socrata-peers.herokuapp.com/peers.json?vectors=population_change,earnings,occupation,education,population&n=10&id={0}';
        this.healthDataUrls = {
            rwjf_county_health_rankings_2015: "https://odn.data.socrata.com/resource/7ayp-utp2.json?$where=",
            cdc_brfss_prevalence_2011_2013: "https://odn.data.socrata.com/resource/n4rt-3rmd.json?$where="
        };
    }

    // Promises
    //

    _createClass(ApiController, [{
        key: 'getAutoCompleteNameSuggestions',
        value: function getAutoCompleteNameSuggestions(searchTerm) {

            return d3.promise.json(this.autoCompleteNameSuggestUrl.format(encodeURIComponent(searchTerm)));
        }
    }, {
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
        key: 'getCitiesInState',
        value: function getCitiesInState(stateId) {
            var limit = arguments.length <= 1 || arguments[1] === undefined ? 10 : arguments[1];

            return d3.promise.json(this.mostPopulousRegionTypeUrl.format(stateId, 'place', limit));
        }
    }, {
        key: 'getCostOfLivingData',
        value: function getCostOfLivingData(regionIds) {

            return this.getData(this.costOfLivingUrl, regionIds);
        }
    }, {
        key: 'getCountiesInState',
        value: function getCountiesInState(stateId) {
            var limit = arguments.length <= 1 || arguments[1] === undefined ? 10 : arguments[1];

            return d3.promise.json(this.mostPopulousRegionTypeUrl.format(stateId, 'county', limit));
        }
    }, {
        key: 'getData',
        value: function getData(url, regionIds) {

            var segments = regionIds.map(function (regionId) {
                return 'id=\'' + regionId + '\'';
            });

            return d3.promise.json(url + encodeURI(segments.join(' OR ')));
        }
    }, {
        key: 'getDomains',
        value: function getDomains() {

            return d3.promise.json(this.domainsUrl);
        }
    }, {
        key: 'getEarningsByPlace',
        value: function getEarningsByPlace() {

            return d3.promise.json(this.earningsByPlaceUrl);
        }
    }, {
        key: 'getEarningsData',
        value: function getEarningsData(regionIds) {

            return this.getData(this.earningsUrl, regionIds);
        }
    }, {
        key: 'getEducationByPlace',
        value: function getEducationByPlace() {

            return d3.promise.json(this.educationByPlaceUrl);
        }
    }, {
        key: 'getEducationData',
        value: function getEducationData(regionIds) {

            return this.getData(this.educationUrl, regionIds);
        }
    }, {
        key: 'getGdpData',
        value: function getGdpData(regionIds) {

            return this.getData(this.gdpUrl, regionIds);
        }
    }, {
        key: 'getMetrosInState',
        value: function getMetrosInState(stateId) {
            var limit = arguments.length <= 1 || arguments[1] === undefined ? 10 : arguments[1];

            return d3.promise.json(this.mostPopulousRegionTypeUrl.format(stateId, 'msa', limit));
        }
    }, {
        key: 'getOccupationsData',
        value: function getOccupationsData(regionIds) {

            return this.getData(this.occupationsUrl, regionIds);
        }
    }, {
        key: 'getParentState',
        value: function getParentState(region) {

            return d3.promise.json(this.parentStateUrl.format(region.id));
        }
    }, {
        key: 'getPopulationData',
        value: function getPopulationData(regionIds) {

            return this.getData(this.populationUrl, regionIds);
        }
    }, {
        key: 'getPlaces',
        value: function getPlaces() {

            return d3.promise.json(this.placesUrl);
        }
    }, {
        key: 'getSimilarRegions',
        value: function getSimilarRegions(regionId) {

            return d3.promise.json(this.similarRegionsUrl.format(regionId));
        }

        // health data retrievers

    }, {
        key: 'getHealthRwjfChrData',
        value: function getHealthRwjfChrData(regionIds) {
            return this.getData(this.healthDataUrls.rwjf_county_health_rankings_2015, regionIds);
        }
    }]);

    return ApiController;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Y0LWFwaS1jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztJQUFNLGFBQWE7QUFFZixhQUZFLGFBQWEsR0FFRDs4QkFGWixhQUFhOztBQUlYLFlBQUksQ0FBQywwQkFBMEIsR0FBRyxtR0FBbUcsQ0FBQztBQUN0SSxZQUFJLENBQUMsYUFBYSxHQUFHLGtCQUFrQixDQUFDO0FBQ3hDLFlBQUksQ0FBQyxlQUFlLEdBQUcsOEVBQThFLENBQUM7QUFDdEcsWUFBSSxDQUFDLGVBQWUsR0FBRyw4RUFBOEUsQ0FBQztBQUN0RyxZQUFJLENBQUMsVUFBVSxHQUFHLG1EQUFtRCxDQUFDO0FBQ3RFLFlBQUksQ0FBQyxrQkFBa0IsR0FBRyxrSEFBa0gsQ0FBQztBQUM3SSxZQUFJLENBQUMsV0FBVyxHQUFHLGtFQUFrRSxDQUFDO0FBQ3RGLFlBQUksQ0FBQyxtQkFBbUIsR0FBRyxpSEFBaUgsQ0FBQztBQUM3SSxZQUFJLENBQUMsWUFBWSxHQUFHLGtFQUFrRSxDQUFDO0FBQ3ZGLFlBQUksQ0FBQyxNQUFNLEdBQUcsa0VBQWtFLENBQUM7QUFDakYsWUFBSSxDQUFDLHlCQUF5QixHQUFHLDBIQUEwSCxDQUFDO0FBQzVKLFlBQUksQ0FBQyxjQUFjLEdBQUcsb0ZBQW9GLENBQUM7QUFDM0csWUFBSSxDQUFDLGNBQWMsR0FBRyxvRkFBb0YsQ0FBQztBQUMzRyxZQUFJLENBQUMsU0FBUyxHQUFHLGtIQUFrSCxDQUFDO0FBQ3BJLFlBQUksQ0FBQyxhQUFhLEdBQUcsbUZBQW1GLENBQUM7QUFDekcsWUFBSSxDQUFDLGlCQUFpQixHQUFHLCtIQUErSCxDQUFDO0FBQ3pKLFlBQUksQ0FBQyxjQUFjLEdBQUc7QUFDbEIsNENBQWdDLEVBQUUsOERBQThEO0FBQ2hHLDBDQUE4QixFQUFFLDhEQUE4RDtTQUNqRyxDQUFBO0tBQ0o7Ozs7QUFBQTtpQkF4QkMsYUFBYTs7dURBNEJnQixVQUFVLEVBQUU7O0FBRXZDLG1CQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2xHOzs7d0NBRWU7O0FBRVosbUJBQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1NBQzlDOzs7d0NBRWUsUUFBUSxFQUFjO2dCQUFaLEtBQUsseURBQUcsRUFBRTs7QUFFaEMsbUJBQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDeEU7Ozt5Q0FFZ0IsT0FBTyxFQUFjO2dCQUFaLEtBQUsseURBQUcsRUFBRTs7QUFFaEMsbUJBQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDMUY7Ozs0Q0FFbUIsU0FBUyxFQUFFOztBQUUzQixtQkFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsU0FBUyxDQUFDLENBQUM7U0FDeEQ7OzsyQ0FFa0IsT0FBTyxFQUFjO2dCQUFaLEtBQUsseURBQUcsRUFBRTs7QUFFbEMsbUJBQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDM0Y7OztnQ0FFTyxHQUFHLEVBQUUsU0FBUyxFQUFFOztBQUVwQixnQkFBSSxRQUFRLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFTLFFBQVEsRUFBRTtBQUM1Qyx1QkFBTyxPQUFPLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQzthQUNwQyxDQUFDLENBQUM7O0FBRUgsbUJBQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNsRTs7O3FDQUVZOztBQUVULG1CQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUMzQzs7OzZDQUVvQjs7QUFFakIsbUJBQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7U0FDbkQ7Ozt3Q0FFZSxTQUFTLEVBQUU7O0FBRXZCLG1CQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQztTQUNwRDs7OzhDQUVxQjs7QUFFbEIsbUJBQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7U0FDcEQ7Ozt5Q0FFZ0IsU0FBUyxFQUFFOztBQUV4QixtQkFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLENBQUM7U0FDckQ7OzttQ0FFVSxTQUFTLEVBQUU7O0FBRWxCLG1CQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztTQUMvQzs7O3lDQUVnQixPQUFPLEVBQWM7Z0JBQVosS0FBSyx5REFBRyxFQUFFOztBQUVoQyxtQkFBTyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUN4Rjs7OzJDQUVrQixTQUFTLEVBQUU7O0FBRTFCLG1CQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxTQUFTLENBQUMsQ0FBQztTQUN2RDs7O3VDQUVjLE1BQU0sRUFBRTs7QUFFbkIsbUJBQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDakU7OzswQ0FFaUIsU0FBUyxFQUFFOztBQUV6QixtQkFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsU0FBUyxDQUFDLENBQUM7U0FDdEQ7OztvQ0FFVzs7QUFFUixtQkFBTyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDMUM7OzswQ0FFaUIsUUFBUSxFQUFFOztBQUV4QixtQkFBTyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7U0FDbkU7Ozs7Ozs2Q0FHb0IsU0FBUyxFQUFFO0FBQzVCLG1CQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxnQ0FBZ0MsRUFBRSxTQUFTLENBQUMsQ0FBQztTQUN4Rjs7O1dBbElDLGFBQWEiLCJmaWxlIjoidjQtYXBpLWNvbnRyb2xsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBBcGlDb250cm9sbGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlTmFtZVN1Z2dlc3RVcmwgPSAnaHR0cHM6Ly9vZG4uZGF0YS5zb2NyYXRhLmNvbS92aWV3cy83ZzJiLThicnYvY29sdW1ucy9hdXRvY29tcGxldGVfbmFtZS9zdWdnZXN0L3swfT9zaXplPTEwJmZ1eno9MCc7XG4gICAgICAgIHRoaXMuY2F0ZWdvcmllc1VybCA9ICcvY2F0ZWdvcmllcy5qc29uJztcbiAgICAgICAgdGhpcy5jaGlsZFJlZ2lvbnNVcmwgPSAnaHR0cHM6Ly9mZWRlcmFsLmRlbW8uc29jcmF0YS5jb20vcmVzb3VyY2UvZXlhZS04amZ5P3BhcmVudF9pZD17MH0mJGxpbWl0PXsxfSc7XG4gICAgICAgIHRoaXMuY29zdE9mTGl2aW5nVXJsID0gJ2h0dHBzOi8vZmVkZXJhbC5kZW1vLnNvY3JhdGEuY29tL3Jlc291cmNlL2hwbmYtZ25mdS5qc29uPyRvcmRlcj1uYW1lJiR3aGVyZT0nO1xuICAgICAgICB0aGlzLmRvbWFpbnNVcmwgPSAnaHR0cHM6Ly9hcGkudXMuc29jcmF0YS5jb20vYXBpL2NhdGFsb2cvdjEvZG9tYWlucyc7XG4gICAgICAgIHRoaXMuZWFybmluZ3NCeVBsYWNlVXJsID0gJ2h0dHBzOi8vZmVkZXJhbC5kZW1vLnNvY3JhdGEuY29tL3Jlc291cmNlL3dtd2gtNHZhay5qc29uLz90eXBlPXBsYWNlJiRsaW1pdD01MDAwMCYkd2hlcmU9cG9wdWxhdGlvbiUyMCUzRSUyMDUwMDAnO1xuICAgICAgICB0aGlzLmVhcm5pbmdzVXJsID0gJ2h0dHBzOi8vZmVkZXJhbC5kZW1vLnNvY3JhdGEuY29tL3Jlc291cmNlL3dtd2gtNHZhay5qc29uPyR3aGVyZT0nO1xuICAgICAgICB0aGlzLmVkdWNhdGlvbkJ5UGxhY2VVcmwgPSAnaHR0cHM6Ly9mZWRlcmFsLmRlbW8uc29jcmF0YS5jb20vcmVzb3VyY2UvdWY0bS01dThyLmpzb24/dHlwZT1wbGFjZSYkbGltaXQ9NTAwMDAmJHdoZXJlPXBvcHVsYXRpb24lMjAlM0UlMjA1MDAwJztcbiAgICAgICAgdGhpcy5lZHVjYXRpb25VcmwgPSAnaHR0cHM6Ly9mZWRlcmFsLmRlbW8uc29jcmF0YS5jb20vcmVzb3VyY2UvdWY0bS01dThyLmpzb24/JHdoZXJlPSc7XG4gICAgICAgIHRoaXMuZ2RwVXJsID0gJ2h0dHBzOi8vZmVkZXJhbC5kZW1vLnNvY3JhdGEuY29tL3Jlc291cmNlL2tzMmotdmhyOC5qc29uPyR3aGVyZT0nO1xuICAgICAgICB0aGlzLm1vc3RQb3B1bG91c1JlZ2lvblR5cGVVcmwgPSAnaHR0cHM6Ly9mZWRlcmFsLmRlbW8uc29jcmF0YS5jb20vcmVzb3VyY2UvZXlhZS04amZ5P3BhcmVudF9pZD17MH0mY2hpbGRfdHlwZT17MX0mJGxpbWl0PXsyfSYkb3JkZXI9Y2hpbGRfcG9wdWxhdGlvbiBkZXNjJztcbiAgICAgICAgdGhpcy5vY2N1cGF0aW9uc1VybCA9ICdodHRwczovL2ZlZGVyYWwuZGVtby5zb2NyYXRhLmNvbS9yZXNvdXJjZS9xZmNtLWZ3M2kuanNvbj8kb3JkZXI9b2NjdXBhdGlvbiYkd2hlcmU9JztcbiAgICAgICAgdGhpcy5wYXJlbnRTdGF0ZVVybCA9ICdodHRwczovL2ZlZGVyYWwuZGVtby5zb2NyYXRhLmNvbS9yZXNvdXJjZS9leWFlLThqZnk/cGFyZW50X3R5cGU9c3RhdGUmY2hpbGRfaWQ9ezB9JztcbiAgICAgICAgdGhpcy5wbGFjZXNVcmwgPSAnaHR0cHM6Ly9mZWRlcmFsLmRlbW8uc29jcmF0YS5jb20vcmVzb3VyY2UvZ20zdS1ndzU3Lmpzb24vP3R5cGU9cGxhY2UmJGxpbWl0PTUwMDAwJiR3aGVyZT1wb3B1bGF0aW9uJTIwJTNFJTIwNTAwMCc7XG4gICAgICAgIHRoaXMucG9wdWxhdGlvblVybCA9ICdodHRwczovL2ZlZGVyYWwuZGVtby5zb2NyYXRhLmNvbS9yZXNvdXJjZS9lM3JkLXp6bXIuanNvbj8kb3JkZXI9eWVhcixuYW1lJiR3aGVyZT0nO1xuICAgICAgICB0aGlzLnNpbWlsYXJSZWdpb25zVXJsID0gJ2h0dHBzOi8vc29jcmF0YS1wZWVycy5oZXJva3VhcHAuY29tL3BlZXJzLmpzb24/dmVjdG9ycz1wb3B1bGF0aW9uX2NoYW5nZSxlYXJuaW5ncyxvY2N1cGF0aW9uLGVkdWNhdGlvbixwb3B1bGF0aW9uJm49MTAmaWQ9ezB9JztcbiAgICAgICAgdGhpcy5oZWFsdGhEYXRhVXJscyA9IHtcbiAgICAgICAgICAgIHJ3amZfY291bnR5X2hlYWx0aF9yYW5raW5nc18yMDE1OiBcImh0dHBzOi8vb2RuLmRhdGEuc29jcmF0YS5jb20vcmVzb3VyY2UvN2F5cC11dHAyLmpzb24/JHdoZXJlPVwiLFxuICAgICAgICAgICAgY2RjX2JyZnNzX3ByZXZhbGVuY2VfMjAxMV8yMDEzOiBcImh0dHBzOi8vb2RuLmRhdGEuc29jcmF0YS5jb20vcmVzb3VyY2UvbjRydC0zcm1kLmpzb24/JHdoZXJlPVwiXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBQcm9taXNlc1xuICAgIC8vXG4gICAgZ2V0QXV0b0NvbXBsZXRlTmFtZVN1Z2dlc3Rpb25zKHNlYXJjaFRlcm0pIHtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHRoaXMuYXV0b0NvbXBsZXRlTmFtZVN1Z2dlc3RVcmwuZm9ybWF0KGVuY29kZVVSSUNvbXBvbmVudChzZWFyY2hUZXJtKSkpO1xuICAgIH1cblxuICAgIGdldENhdGVnb3JpZXMoKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLmNhdGVnb3JpZXNVcmwpO1xuICAgIH1cblxuICAgIGdldENoaWxkUmVnaW9ucyhyZWdpb25JZCwgbGltaXQgPSAxMCkge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5jaGlsZFJlZ2lvbnNVcmwuZm9ybWF0KHJlZ2lvbklkLCBsaW1pdCkpO1xuICAgIH1cblxuICAgIGdldENpdGllc0luU3RhdGUoc3RhdGVJZCwgbGltaXQgPSAxMCkge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5tb3N0UG9wdWxvdXNSZWdpb25UeXBlVXJsLmZvcm1hdChzdGF0ZUlkLCAncGxhY2UnLCBsaW1pdCkpO1xuICAgIH1cblxuICAgIGdldENvc3RPZkxpdmluZ0RhdGEocmVnaW9uSWRzKSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGF0YSh0aGlzLmNvc3RPZkxpdmluZ1VybCwgcmVnaW9uSWRzKTtcbiAgICB9XG5cbiAgICBnZXRDb3VudGllc0luU3RhdGUoc3RhdGVJZCwgbGltaXQgPSAxMCkge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5tb3N0UG9wdWxvdXNSZWdpb25UeXBlVXJsLmZvcm1hdChzdGF0ZUlkLCAnY291bnR5JywgbGltaXQpKTtcbiAgICB9XG4gICAgXG4gICAgZ2V0RGF0YSh1cmwsIHJlZ2lvbklkcykge1xuXG4gICAgICAgIHZhciBzZWdtZW50cyA9IHJlZ2lvbklkcy5tYXAoZnVuY3Rpb24ocmVnaW9uSWQpIHtcbiAgICAgICAgICAgIHJldHVybiAnaWQ9XFwnJyArIHJlZ2lvbklkICsgJ1xcJyc7IFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHVybCArIGVuY29kZVVSSShzZWdtZW50cy5qb2luKCcgT1IgJykpKTtcbiAgICB9XG4gICAgXG4gICAgZ2V0RG9tYWlucygpIHtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHRoaXMuZG9tYWluc1VybCk7XG4gICAgfVxuXG4gICAgZ2V0RWFybmluZ3NCeVBsYWNlKCkge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5lYXJuaW5nc0J5UGxhY2VVcmwpO1xuICAgIH1cblxuICAgIGdldEVhcm5pbmdzRGF0YShyZWdpb25JZHMpIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZXREYXRhKHRoaXMuZWFybmluZ3NVcmwsIHJlZ2lvbklkcyk7XG4gICAgfVxuXG4gICAgZ2V0RWR1Y2F0aW9uQnlQbGFjZSgpIHtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHRoaXMuZWR1Y2F0aW9uQnlQbGFjZVVybCk7XG4gICAgfVxuXG4gICAgZ2V0RWR1Y2F0aW9uRGF0YShyZWdpb25JZHMpIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZXREYXRhKHRoaXMuZWR1Y2F0aW9uVXJsLCByZWdpb25JZHMpO1xuICAgIH1cblxuICAgIGdldEdkcERhdGEocmVnaW9uSWRzKSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGF0YSh0aGlzLmdkcFVybCwgcmVnaW9uSWRzKTtcbiAgICB9XG5cbiAgICBnZXRNZXRyb3NJblN0YXRlKHN0YXRlSWQsIGxpbWl0ID0gMTApIHtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHRoaXMubW9zdFBvcHVsb3VzUmVnaW9uVHlwZVVybC5mb3JtYXQoc3RhdGVJZCwgJ21zYScsIGxpbWl0KSk7XG4gICAgfVxuXG4gICAgZ2V0T2NjdXBhdGlvbnNEYXRhKHJlZ2lvbklkcykge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmdldERhdGEodGhpcy5vY2N1cGF0aW9uc1VybCwgcmVnaW9uSWRzKTtcbiAgICB9XG5cbiAgICBnZXRQYXJlbnRTdGF0ZShyZWdpb24pIHtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHRoaXMucGFyZW50U3RhdGVVcmwuZm9ybWF0KHJlZ2lvbi5pZCkpO1xuICAgIH1cblxuICAgIGdldFBvcHVsYXRpb25EYXRhKHJlZ2lvbklkcykge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmdldERhdGEodGhpcy5wb3B1bGF0aW9uVXJsLCByZWdpb25JZHMpO1xuICAgIH1cblxuICAgIGdldFBsYWNlcygpIHtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHRoaXMucGxhY2VzVXJsKTtcbiAgICB9XG5cbiAgICBnZXRTaW1pbGFyUmVnaW9ucyhyZWdpb25JZCkge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5zaW1pbGFyUmVnaW9uc1VybC5mb3JtYXQocmVnaW9uSWQpKTtcbiAgICB9XG5cbiAgICAvLyBoZWFsdGggZGF0YSByZXRyaWV2ZXJzXG4gICAgZ2V0SGVhbHRoUndqZkNockRhdGEocmVnaW9uSWRzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldERhdGEodGhpcy5oZWFsdGhEYXRhVXJscy5yd2pmX2NvdW50eV9oZWFsdGhfcmFua2luZ3NfMjAxNSwgcmVnaW9uSWRzKTtcbiAgICB9XG59Il19
//# sourceMappingURL=v4-api-controller.js.map
