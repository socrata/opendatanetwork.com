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
//# sourceMappingURL=data:application/json;base64,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ekIsbUJBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1NBQ3REOzs7b0NBRVc7O0FBRVIsbUJBQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQzFDOzs7MENBRWlCLFFBQVEsRUFBRTs7QUFFeEIsbUJBQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1NBQ25FOzs7Ozs7NkNBR29CLFNBQVMsRUFBRTtBQUM1QixtQkFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsZ0NBQWdDLEVBQUUsU0FBUyxDQUFDLENBQUM7U0FDeEY7OztXQTVIQyxhQUFhIiwiZmlsZSI6InY0LWFwaS1jb250cm9sbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQXBpQ29udHJvbGxlciB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU5hbWVTdWdnZXN0VXJsID0gJ2h0dHBzOi8vb2RuLmRhdGEuc29jcmF0YS5jb20vdmlld3MvN2cyYi04YnJ2L2NvbHVtbnMvYXV0b2NvbXBsZXRlX25hbWUvc3VnZ2VzdC97MH0/c2l6ZT0xMCZmdXp6PTAnO1xuICAgICAgICB0aGlzLmNhdGVnb3JpZXNVcmwgPSAnL2NhdGVnb3JpZXMuanNvbic7XG4gICAgICAgIHRoaXMuY2hpbGRSZWdpb25zVXJsID0gJ2h0dHBzOi8vZmVkZXJhbC5kZW1vLnNvY3JhdGEuY29tL3Jlc291cmNlL2V5YWUtOGpmeT9wYXJlbnRfaWQ9ezB9JiRsaW1pdD17MX0nO1xuICAgICAgICB0aGlzLmNvc3RPZkxpdmluZ1VybCA9ICdodHRwczovL2ZlZGVyYWwuZGVtby5zb2NyYXRhLmNvbS9yZXNvdXJjZS9ocG5mLWduZnUuanNvbj8kb3JkZXI9bmFtZSYkd2hlcmU9JztcbiAgICAgICAgdGhpcy5kb21haW5zVXJsID0gJ2h0dHBzOi8vYXBpLnVzLnNvY3JhdGEuY29tL2FwaS9jYXRhbG9nL3YxL2RvbWFpbnMnO1xuICAgICAgICB0aGlzLmVhcm5pbmdzQnlQbGFjZVVybCA9ICdodHRwczovL2ZlZGVyYWwuZGVtby5zb2NyYXRhLmNvbS9yZXNvdXJjZS93bXdoLTR2YWsuanNvbi8/dHlwZT1wbGFjZSYkbGltaXQ9NTAwMDAmJHdoZXJlPXBvcHVsYXRpb24lMjAlM0UlMjA1MDAwJ1xuICAgICAgICB0aGlzLmVhcm5pbmdzVXJsID0gJ2h0dHBzOi8vZmVkZXJhbC5kZW1vLnNvY3JhdGEuY29tL3Jlc291cmNlL3dtd2gtNHZhay5qc29uPyR3aGVyZT0nO1xuICAgICAgICB0aGlzLmVkdWNhdGlvblVybCA9ICdodHRwczovL2ZlZGVyYWwuZGVtby5zb2NyYXRhLmNvbS9yZXNvdXJjZS91ZjRtLTV1OHIuanNvbj8kd2hlcmU9JztcbiAgICAgICAgdGhpcy5nZHBVcmwgPSAnaHR0cHM6Ly9mZWRlcmFsLmRlbW8uc29jcmF0YS5jb20vcmVzb3VyY2Uva3Myai12aHI4Lmpzb24/JHdoZXJlPSc7XG4gICAgICAgIHRoaXMubW9zdFBvcHVsb3VzUmVnaW9uVHlwZVVybCA9ICdodHRwczovL2ZlZGVyYWwuZGVtby5zb2NyYXRhLmNvbS9yZXNvdXJjZS9leWFlLThqZnk/cGFyZW50X2lkPXswfSZjaGlsZF90eXBlPXsxfSYkbGltaXQ9ezJ9JiRvcmRlcj1jaGlsZF9wb3B1bGF0aW9uIGRlc2MnO1xuICAgICAgICB0aGlzLm9jY3VwYXRpb25zVXJsID0gJ2h0dHBzOi8vZmVkZXJhbC5kZW1vLnNvY3JhdGEuY29tL3Jlc291cmNlL3FmY20tZnczaS5qc29uPyRvcmRlcj1vY2N1cGF0aW9uJiR3aGVyZT0nO1xuICAgICAgICB0aGlzLnBhcmVudFN0YXRlVXJsID0gJ2h0dHBzOi8vZmVkZXJhbC5kZW1vLnNvY3JhdGEuY29tL3Jlc291cmNlL2V5YWUtOGpmeT9wYXJlbnRfdHlwZT1zdGF0ZSZjaGlsZF9pZD17MH0nO1xuICAgICAgICB0aGlzLnBsYWNlc1VybCA9ICdodHRwczovL2ZlZGVyYWwuZGVtby5zb2NyYXRhLmNvbS9yZXNvdXJjZS9nbTN1LWd3NTcuanNvbi8/dHlwZT1wbGFjZSYkbGltaXQ9NTAwMDAmJHdoZXJlPXBvcHVsYXRpb24lMjAlM0UlMjA1MDAwJztcbiAgICAgICAgdGhpcy5wb3B1bGF0aW9uVXJsID0gJ2h0dHBzOi8vZmVkZXJhbC5kZW1vLnNvY3JhdGEuY29tL3Jlc291cmNlL2UzcmQtenptci5qc29uPyRvcmRlcj15ZWFyLG5hbWUmJHdoZXJlPSc7XG4gICAgICAgIHRoaXMuc2ltaWxhclJlZ2lvbnNVcmwgPSAnaHR0cHM6Ly9zb2NyYXRhLXBlZXJzLmhlcm9rdWFwcC5jb20vcGVlcnMuanNvbj92ZWN0b3JzPXBvcHVsYXRpb25fY2hhbmdlLGVhcm5pbmdzLG9jY3VwYXRpb24sZWR1Y2F0aW9uLHBvcHVsYXRpb24mbj0xMCZpZD17MH0nO1xuICAgICAgICB0aGlzLmhlYWx0aERhdGFVcmxzID0ge1xuICAgICAgICAgICAgcndqZl9jb3VudHlfaGVhbHRoX3JhbmtpbmdzXzIwMTU6IFwiaHR0cHM6Ly9vZG4uZGF0YS5zb2NyYXRhLmNvbS9yZXNvdXJjZS83YXlwLXV0cDIuanNvbj8kd2hlcmU9XCIsXG4gICAgICAgICAgICBjZGNfYnJmc3NfcHJldmFsZW5jZV8yMDExXzIwMTM6IFwiaHR0cHM6Ly9vZG4uZGF0YS5zb2NyYXRhLmNvbS9yZXNvdXJjZS9uNHJ0LTNybWQuanNvbj8kd2hlcmU9XCJcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFByb21pc2VzXG4gICAgLy9cbiAgICBnZXRBdXRvQ29tcGxldGVOYW1lU3VnZ2VzdGlvbnMoc2VhcmNoVGVybSkge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5hdXRvQ29tcGxldGVOYW1lU3VnZ2VzdFVybC5mb3JtYXQoZW5jb2RlVVJJQ29tcG9uZW50KHNlYXJjaFRlcm0pKSk7XG4gICAgfVxuXG4gICAgZ2V0Q2F0ZWdvcmllcygpIHtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHRoaXMuY2F0ZWdvcmllc1VybCk7XG4gICAgfVxuXG4gICAgZ2V0Q2hpbGRSZWdpb25zKHJlZ2lvbklkLCBsaW1pdCA9IDEwKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLmNoaWxkUmVnaW9uc1VybC5mb3JtYXQocmVnaW9uSWQsIGxpbWl0KSk7XG4gICAgfVxuXG4gICAgZ2V0Q2l0aWVzSW5TdGF0ZShzdGF0ZUlkLCBsaW1pdCA9IDEwKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLm1vc3RQb3B1bG91c1JlZ2lvblR5cGVVcmwuZm9ybWF0KHN0YXRlSWQsICdwbGFjZScsIGxpbWl0KSk7XG4gICAgfVxuXG4gICAgZ2V0Q29zdE9mTGl2aW5nRGF0YShyZWdpb25JZHMpIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZXREYXRhKHRoaXMuY29zdE9mTGl2aW5nVXJsLCByZWdpb25JZHMpO1xuICAgIH1cblxuICAgIGdldENvdW50aWVzSW5TdGF0ZShzdGF0ZUlkLCBsaW1pdCA9IDEwKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLm1vc3RQb3B1bG91c1JlZ2lvblR5cGVVcmwuZm9ybWF0KHN0YXRlSWQsICdjb3VudHknLCBsaW1pdCkpO1xuICAgIH1cbiAgICBcbiAgICBnZXREYXRhKHVybCwgcmVnaW9uSWRzKSB7XG5cbiAgICAgICAgdmFyIHNlZ21lbnRzID0gcmVnaW9uSWRzLm1hcChmdW5jdGlvbihyZWdpb25JZCkge1xuICAgICAgICAgICAgcmV0dXJuICdpZD1cXCcnICsgcmVnaW9uSWQgKyAnXFwnJzsgXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odXJsICsgZW5jb2RlVVJJKHNlZ21lbnRzLmpvaW4oJyBPUiAnKSkpO1xuICAgIH1cbiAgICBcbiAgICBnZXREb21haW5zKCkge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5kb21haW5zVXJsKTtcbiAgICB9XG5cbiAgICBnZXRFYXJuaW5nc0J5UGxhY2UoKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLmVhcm5pbmdzQnlQbGFjZVVybCk7XG4gICAgfVxuXG4gICAgZ2V0RWFybmluZ3NEYXRhKHJlZ2lvbklkcykge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmdldERhdGEodGhpcy5lYXJuaW5nc1VybCwgcmVnaW9uSWRzKTtcbiAgICB9XG5cbiAgICBnZXRFZHVjYXRpb25EYXRhKHJlZ2lvbklkcykge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmdldERhdGEodGhpcy5lZHVjYXRpb25VcmwsIHJlZ2lvbklkcyk7XG4gICAgfVxuXG4gICAgZ2V0R2RwRGF0YShyZWdpb25JZHMpIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZXREYXRhKHRoaXMuZ2RwVXJsLCByZWdpb25JZHMpO1xuICAgIH1cblxuICAgIGdldE1ldHJvc0luU3RhdGUoc3RhdGVJZCwgbGltaXQgPSAxMCkge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5tb3N0UG9wdWxvdXNSZWdpb25UeXBlVXJsLmZvcm1hdChzdGF0ZUlkLCAnbXNhJywgbGltaXQpKTtcbiAgICB9XG5cbiAgICBnZXRPY2N1cGF0aW9uc0RhdGEocmVnaW9uSWRzKSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGF0YSh0aGlzLm9jY3VwYXRpb25zVXJsLCByZWdpb25JZHMpO1xuICAgIH1cblxuICAgIGdldFBhcmVudFN0YXRlKHJlZ2lvbikge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5wYXJlbnRTdGF0ZVVybC5mb3JtYXQocmVnaW9uLmlkKSk7XG4gICAgfVxuXG4gICAgZ2V0UG9wdWxhdGlvbkRhdGEocmVnaW9uSWRzKSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGF0YSh0aGlzLnBvcHVsYXRpb25VcmwsIHJlZ2lvbklkcyk7XG4gICAgfVxuXG4gICAgZ2V0UGxhY2VzKCkge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5wbGFjZXNVcmwpO1xuICAgIH1cblxuICAgIGdldFNpbWlsYXJSZWdpb25zKHJlZ2lvbklkKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLnNpbWlsYXJSZWdpb25zVXJsLmZvcm1hdChyZWdpb25JZCkpO1xuICAgIH1cblxuICAgIC8vIGhlYWx0aCBkYXRhIHJldHJpZXZlcnNcbiAgICBnZXRIZWFsdGhSd2pmQ2hyRGF0YShyZWdpb25JZHMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGF0YSh0aGlzLmhlYWx0aERhdGFVcmxzLnJ3amZfY291bnR5X2hlYWx0aF9yYW5raW5nc18yMDE1LCByZWdpb25JZHMpO1xuICAgIH1cbn0iXX0=
//# sourceMappingURL=v4-api-controller.js.map
