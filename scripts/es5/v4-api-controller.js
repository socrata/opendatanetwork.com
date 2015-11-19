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
        this.occupationsByPlaceUrl = 'https://federal.demo.socrata.com/resource/qfcm-fw3i.json?occupation={0}&type=place&$limit=50000&$where=population%20%3E%205000';
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
        key: 'getOccupationsByPlace',
        value: function getOccupationsByPlace(occupation) {

            return d3.promise.json(this.occupationsByPlaceUrl.format(occupation));
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
//# sourceMappingURL=data:application/json;base64,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LENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7U0FDekU7OzsyQ0FFa0IsU0FBUyxFQUFFOztBQUUxQixtQkFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsU0FBUyxDQUFDLENBQUM7U0FDdkQ7Ozt1Q0FFYyxNQUFNLEVBQUU7O0FBRW5CLG1CQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ2pFOzs7MENBRWlCLFNBQVMsRUFBRTs7QUFFekIsbUJBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1NBQ3REOzs7b0NBRVc7O0FBRVIsbUJBQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQzFDOzs7MENBRWlCLFFBQVEsRUFBRTs7QUFFeEIsbUJBQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1NBQ25FOzs7Ozs7NkNBR29CLFNBQVMsRUFBRTtBQUM1QixtQkFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsZ0NBQWdDLEVBQUUsU0FBUyxDQUFDLENBQUM7U0FDeEY7OztXQXhJQyxhQUFhIiwiZmlsZSI6InY0LWFwaS1jb250cm9sbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQXBpQ29udHJvbGxlciB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU5hbWVTdWdnZXN0VXJsID0gJ2h0dHBzOi8vb2RuLmRhdGEuc29jcmF0YS5jb20vdmlld3MvN2cyYi04YnJ2L2NvbHVtbnMvYXV0b2NvbXBsZXRlX25hbWUvc3VnZ2VzdC97MH0/c2l6ZT0xMCZmdXp6PTAnO1xuICAgICAgICB0aGlzLmNhdGVnb3JpZXNVcmwgPSAnL2NhdGVnb3JpZXMuanNvbic7XG4gICAgICAgIHRoaXMuY2hpbGRSZWdpb25zVXJsID0gJ2h0dHBzOi8vZmVkZXJhbC5kZW1vLnNvY3JhdGEuY29tL3Jlc291cmNlL2V5YWUtOGpmeT9wYXJlbnRfaWQ9ezB9JiRsaW1pdD17MX0nO1xuICAgICAgICB0aGlzLmNvc3RPZkxpdmluZ1VybCA9ICdodHRwczovL2ZlZGVyYWwuZGVtby5zb2NyYXRhLmNvbS9yZXNvdXJjZS9ocG5mLWduZnUuanNvbj8kb3JkZXI9bmFtZSYkd2hlcmU9JztcbiAgICAgICAgdGhpcy5kb21haW5zVXJsID0gJ2h0dHBzOi8vYXBpLnVzLnNvY3JhdGEuY29tL2FwaS9jYXRhbG9nL3YxL2RvbWFpbnMnO1xuICAgICAgICB0aGlzLmVhcm5pbmdzQnlQbGFjZVVybCA9ICdodHRwczovL2ZlZGVyYWwuZGVtby5zb2NyYXRhLmNvbS9yZXNvdXJjZS93bXdoLTR2YWsuanNvbi8/dHlwZT1wbGFjZSYkbGltaXQ9NTAwMDAmJHdoZXJlPXBvcHVsYXRpb24lMjAlM0UlMjA1MDAwJztcbiAgICAgICAgdGhpcy5lYXJuaW5nc1VybCA9ICdodHRwczovL2ZlZGVyYWwuZGVtby5zb2NyYXRhLmNvbS9yZXNvdXJjZS93bXdoLTR2YWsuanNvbj8kd2hlcmU9JztcbiAgICAgICAgdGhpcy5lZHVjYXRpb25CeVBsYWNlVXJsID0gJ2h0dHBzOi8vZmVkZXJhbC5kZW1vLnNvY3JhdGEuY29tL3Jlc291cmNlL3VmNG0tNXU4ci5qc29uP3R5cGU9cGxhY2UmJGxpbWl0PTUwMDAwJiR3aGVyZT1wb3B1bGF0aW9uJTIwJTNFJTIwNTAwMCc7XG4gICAgICAgIHRoaXMuZWR1Y2F0aW9uVXJsID0gJ2h0dHBzOi8vZmVkZXJhbC5kZW1vLnNvY3JhdGEuY29tL3Jlc291cmNlL3VmNG0tNXU4ci5qc29uPyR3aGVyZT0nO1xuICAgICAgICB0aGlzLmdkcFVybCA9ICdodHRwczovL2ZlZGVyYWwuZGVtby5zb2NyYXRhLmNvbS9yZXNvdXJjZS9rczJqLXZocjguanNvbj8kd2hlcmU9JztcbiAgICAgICAgdGhpcy5tb3N0UG9wdWxvdXNSZWdpb25UeXBlVXJsID0gJ2h0dHBzOi8vZmVkZXJhbC5kZW1vLnNvY3JhdGEuY29tL3Jlc291cmNlL2V5YWUtOGpmeT9wYXJlbnRfaWQ9ezB9JmNoaWxkX3R5cGU9ezF9JiRsaW1pdD17Mn0mJG9yZGVyPWNoaWxkX3BvcHVsYXRpb24gZGVzYyc7XG4gICAgICAgIHRoaXMub2NjdXBhdGlvbnNCeVBsYWNlVXJsID0gJ2h0dHBzOi8vZmVkZXJhbC5kZW1vLnNvY3JhdGEuY29tL3Jlc291cmNlL3FmY20tZnczaS5qc29uP29jY3VwYXRpb249ezB9JnR5cGU9cGxhY2UmJGxpbWl0PTUwMDAwJiR3aGVyZT1wb3B1bGF0aW9uJTIwJTNFJTIwNTAwMCc7XG4gICAgICAgIHRoaXMub2NjdXBhdGlvbnNVcmwgPSAnaHR0cHM6Ly9mZWRlcmFsLmRlbW8uc29jcmF0YS5jb20vcmVzb3VyY2UvcWZjbS1mdzNpLmpzb24/JG9yZGVyPW9jY3VwYXRpb24mJHdoZXJlPSc7XG4gICAgICAgIHRoaXMucGFyZW50U3RhdGVVcmwgPSAnaHR0cHM6Ly9mZWRlcmFsLmRlbW8uc29jcmF0YS5jb20vcmVzb3VyY2UvZXlhZS04amZ5P3BhcmVudF90eXBlPXN0YXRlJmNoaWxkX2lkPXswfSc7XG4gICAgICAgIHRoaXMucGxhY2VzVXJsID0gJ2h0dHBzOi8vZmVkZXJhbC5kZW1vLnNvY3JhdGEuY29tL3Jlc291cmNlL2dtM3UtZ3c1Ny5qc29uLz90eXBlPXBsYWNlJiRsaW1pdD01MDAwMCYkd2hlcmU9cG9wdWxhdGlvbiUyMCUzRSUyMDUwMDAnO1xuICAgICAgICB0aGlzLnBvcHVsYXRpb25VcmwgPSAnaHR0cHM6Ly9mZWRlcmFsLmRlbW8uc29jcmF0YS5jb20vcmVzb3VyY2UvZTNyZC16em1yLmpzb24/JG9yZGVyPXllYXIsbmFtZSYkd2hlcmU9JztcbiAgICAgICAgdGhpcy5zaW1pbGFyUmVnaW9uc1VybCA9ICdodHRwczovL3NvY3JhdGEtcGVlcnMuaGVyb2t1YXBwLmNvbS9wZWVycy5qc29uP3ZlY3RvcnM9cG9wdWxhdGlvbl9jaGFuZ2UsZWFybmluZ3Msb2NjdXBhdGlvbixlZHVjYXRpb24scG9wdWxhdGlvbiZuPTEwJmlkPXswfSc7XG4gICAgICAgIHRoaXMuaGVhbHRoRGF0YVVybHMgPSB7XG4gICAgICAgICAgICByd2pmX2NvdW50eV9oZWFsdGhfcmFua2luZ3NfMjAxNTogXCJodHRwczovL29kbi5kYXRhLnNvY3JhdGEuY29tL3Jlc291cmNlLzdheXAtdXRwMi5qc29uPyR3aGVyZT1cIixcbiAgICAgICAgICAgIGNkY19icmZzc19wcmV2YWxlbmNlXzIwMTFfMjAxMzogXCJodHRwczovL29kbi5kYXRhLnNvY3JhdGEuY29tL3Jlc291cmNlL240cnQtM3JtZC5qc29uPyR3aGVyZT1cIlxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gUHJvbWlzZXNcbiAgICAvL1xuICAgIGdldEF1dG9Db21wbGV0ZU5hbWVTdWdnZXN0aW9ucyhzZWFyY2hUZXJtKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLmF1dG9Db21wbGV0ZU5hbWVTdWdnZXN0VXJsLmZvcm1hdChlbmNvZGVVUklDb21wb25lbnQoc2VhcmNoVGVybSkpKTtcbiAgICB9XG5cbiAgICBnZXRDYXRlZ29yaWVzKCkge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5jYXRlZ29yaWVzVXJsKTtcbiAgICB9XG5cbiAgICBnZXRDaGlsZFJlZ2lvbnMocmVnaW9uSWQsIGxpbWl0ID0gMTApIHtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHRoaXMuY2hpbGRSZWdpb25zVXJsLmZvcm1hdChyZWdpb25JZCwgbGltaXQpKTtcbiAgICB9XG5cbiAgICBnZXRDaXRpZXNJblN0YXRlKHN0YXRlSWQsIGxpbWl0ID0gMTApIHtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHRoaXMubW9zdFBvcHVsb3VzUmVnaW9uVHlwZVVybC5mb3JtYXQoc3RhdGVJZCwgJ3BsYWNlJywgbGltaXQpKTtcbiAgICB9XG5cbiAgICBnZXRDb3N0T2ZMaXZpbmdEYXRhKHJlZ2lvbklkcykge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmdldERhdGEodGhpcy5jb3N0T2ZMaXZpbmdVcmwsIHJlZ2lvbklkcyk7XG4gICAgfVxuXG4gICAgZ2V0Q291bnRpZXNJblN0YXRlKHN0YXRlSWQsIGxpbWl0ID0gMTApIHtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHRoaXMubW9zdFBvcHVsb3VzUmVnaW9uVHlwZVVybC5mb3JtYXQoc3RhdGVJZCwgJ2NvdW50eScsIGxpbWl0KSk7XG4gICAgfVxuICAgIFxuICAgIGdldERhdGEodXJsLCByZWdpb25JZHMpIHtcblxuICAgICAgICB2YXIgc2VnbWVudHMgPSByZWdpb25JZHMubWFwKGZ1bmN0aW9uKHJlZ2lvbklkKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2lkPVxcJycgKyByZWdpb25JZCArICdcXCcnOyBcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih1cmwgKyBlbmNvZGVVUkkoc2VnbWVudHMuam9pbignIE9SICcpKSk7XG4gICAgfVxuICAgIFxuICAgIGdldERvbWFpbnMoKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLmRvbWFpbnNVcmwpO1xuICAgIH1cblxuICAgIGdldEVhcm5pbmdzQnlQbGFjZSgpIHtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHRoaXMuZWFybmluZ3NCeVBsYWNlVXJsKTtcbiAgICB9XG5cbiAgICBnZXRFYXJuaW5nc0RhdGEocmVnaW9uSWRzKSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGF0YSh0aGlzLmVhcm5pbmdzVXJsLCByZWdpb25JZHMpO1xuICAgIH1cblxuICAgIGdldEVkdWNhdGlvbkJ5UGxhY2UoKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLmVkdWNhdGlvbkJ5UGxhY2VVcmwpO1xuICAgIH1cblxuICAgIGdldEVkdWNhdGlvbkRhdGEocmVnaW9uSWRzKSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGF0YSh0aGlzLmVkdWNhdGlvblVybCwgcmVnaW9uSWRzKTtcbiAgICB9XG5cbiAgICBnZXRHZHBEYXRhKHJlZ2lvbklkcykge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmdldERhdGEodGhpcy5nZHBVcmwsIHJlZ2lvbklkcyk7XG4gICAgfVxuXG4gICAgZ2V0TWV0cm9zSW5TdGF0ZShzdGF0ZUlkLCBsaW1pdCA9IDEwKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLm1vc3RQb3B1bG91c1JlZ2lvblR5cGVVcmwuZm9ybWF0KHN0YXRlSWQsICdtc2EnLCBsaW1pdCkpO1xuICAgIH1cblxuICAgIGdldE9jY3VwYXRpb25zQnlQbGFjZShvY2N1cGF0aW9uKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLm9jY3VwYXRpb25zQnlQbGFjZVVybC5mb3JtYXQob2NjdXBhdGlvbikpO1xuICAgIH1cblxuICAgIGdldE9jY3VwYXRpb25zRGF0YShyZWdpb25JZHMpIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZXREYXRhKHRoaXMub2NjdXBhdGlvbnNVcmwsIHJlZ2lvbklkcyk7XG4gICAgfVxuXG4gICAgZ2V0UGFyZW50U3RhdGUocmVnaW9uKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLnBhcmVudFN0YXRlVXJsLmZvcm1hdChyZWdpb24uaWQpKTtcbiAgICB9XG5cbiAgICBnZXRQb3B1bGF0aW9uRGF0YShyZWdpb25JZHMpIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZXREYXRhKHRoaXMucG9wdWxhdGlvblVybCwgcmVnaW9uSWRzKTtcbiAgICB9XG5cbiAgICBnZXRQbGFjZXMoKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLnBsYWNlc1VybCk7XG4gICAgfVxuXG4gICAgZ2V0U2ltaWxhclJlZ2lvbnMocmVnaW9uSWQpIHtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHRoaXMuc2ltaWxhclJlZ2lvbnNVcmwuZm9ybWF0KHJlZ2lvbklkKSk7XG4gICAgfVxuXG4gICAgLy8gaGVhbHRoIGRhdGEgcmV0cmlldmVyc1xuICAgIGdldEhlYWx0aFJ3amZDaHJEYXRhKHJlZ2lvbklkcykge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXREYXRhKHRoaXMuaGVhbHRoRGF0YVVybHMucndqZl9jb3VudHlfaGVhbHRoX3JhbmtpbmdzXzIwMTUsIHJlZ2lvbklkcyk7XG4gICAgfVxufSJdfQ==
//# sourceMappingURL=v4-api-controller.js.map
