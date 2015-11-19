'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ApiController = (function () {
    function ApiController() {
        _classCallCheck(this, ApiController);

        this.autoCompleteNameSuggestUrl = 'https://odn.data.socrata.com/views/7g2b-8brv/columns/autocomplete_name/suggest/{0}?size=10&fuzz=0';
        this.categoriesUrl = '/categories.json';
        this.childRegionsUrl = 'https://odn.data.socrata.com/resource/eyae-8jfy?parent_id={0}&$limit={1}';
        this.costOfLivingUrl = 'https://odn.data.socrata.com/resource/hpnf-gnfu.json?$order=name&$where=';
        this.domainsUrl = 'https://api.us.socrata.com/api/catalog/v1/domains';
        this.earningsByPlaceUrl = 'https://odn.data.socrata.com/resource/wmwh-4vak.json/?type=place&$limit=50000&$where=population%20%3E%205000';
        this.earningsUrl = 'https://odn.data.socrata.com/resource/wmwh-4vak.json?$where=';
        this.educationByPlaceUrl = 'https://odn.data.socrata.com/resource/uf4m-5u8r.json?type=place&$limit=50000&$where=population%20%3E%205000';
        this.educationUrl = 'https://odn.data.socrata.com/resource/uf4m-5u8r.json?$where=';
        this.gdpUrl = 'https://odn.data.socrata.com/resource/ks2j-vhr8.json?$where=';
        this.mostPopulousRegionTypeUrl = 'https://odn.data.socrata.com/resource/eyae-8jfy?parent_id={0}&child_type={1}&$limit={2}&$order=child_population desc';
        this.occupationsByPlaceUrl = 'https://odn.data.socrata.com/resource/qfcm-fw3i.json?occupation={0}&type=place&$limit=50000&$where=population%20%3E%205000';
        this.occupationsUrl = 'https://odn.data.socrata.com/resource/qfcm-fw3i.json?$order=occupation&$where=';
        this.parentStateUrl = 'https://odn.data.socrata.com/resource/eyae-8jfy?parent_type=state&child_id={0}';
        this.placesUrl = 'https://odn.data.socrata.com/resource/gm3u-gw57.json/?type=place&$limit=50000&$where=population%20%3E%205000';
        this.populationUrl = 'https://odn.data.socrata.com/resource/e3rd-zzmr.json?$order=year,name&$where=';
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
//# sourceMappingURL=data:application/json;base64,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LENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7U0FDekU7OzsyQ0FFa0IsU0FBUyxFQUFFOztBQUUxQixtQkFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsU0FBUyxDQUFDLENBQUM7U0FDdkQ7Ozt1Q0FFYyxNQUFNLEVBQUU7O0FBRW5CLG1CQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ2pFOzs7MENBRWlCLFNBQVMsRUFBRTs7QUFFekIsbUJBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1NBQ3REOzs7b0NBRVc7O0FBRVIsbUJBQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQzFDOzs7MENBRWlCLFFBQVEsRUFBRTs7QUFFeEIsbUJBQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1NBQ25FOzs7Ozs7NkNBR29CLFNBQVMsRUFBRTtBQUM1QixtQkFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsZ0NBQWdDLEVBQUUsU0FBUyxDQUFDLENBQUM7U0FDeEY7OztXQXhJQyxhQUFhIiwiZmlsZSI6InY0LWFwaS1jb250cm9sbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQXBpQ29udHJvbGxlciB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU5hbWVTdWdnZXN0VXJsID0gJ2h0dHBzOi8vb2RuLmRhdGEuc29jcmF0YS5jb20vdmlld3MvN2cyYi04YnJ2L2NvbHVtbnMvYXV0b2NvbXBsZXRlX25hbWUvc3VnZ2VzdC97MH0/c2l6ZT0xMCZmdXp6PTAnO1xuICAgICAgICB0aGlzLmNhdGVnb3JpZXNVcmwgPSAnL2NhdGVnb3JpZXMuanNvbic7XG4gICAgICAgIHRoaXMuY2hpbGRSZWdpb25zVXJsID0gJ2h0dHBzOi8vb2RuLmRhdGEuc29jcmF0YS5jb20vcmVzb3VyY2UvZXlhZS04amZ5P3BhcmVudF9pZD17MH0mJGxpbWl0PXsxfSc7XG4gICAgICAgIHRoaXMuY29zdE9mTGl2aW5nVXJsID0gJ2h0dHBzOi8vb2RuLmRhdGEuc29jcmF0YS5jb20vcmVzb3VyY2UvaHBuZi1nbmZ1Lmpzb24/JG9yZGVyPW5hbWUmJHdoZXJlPSc7XG4gICAgICAgIHRoaXMuZG9tYWluc1VybCA9ICdodHRwczovL2FwaS51cy5zb2NyYXRhLmNvbS9hcGkvY2F0YWxvZy92MS9kb21haW5zJztcbiAgICAgICAgdGhpcy5lYXJuaW5nc0J5UGxhY2VVcmwgPSAnaHR0cHM6Ly9vZG4uZGF0YS5zb2NyYXRhLmNvbS9yZXNvdXJjZS93bXdoLTR2YWsuanNvbi8/dHlwZT1wbGFjZSYkbGltaXQ9NTAwMDAmJHdoZXJlPXBvcHVsYXRpb24lMjAlM0UlMjA1MDAwJztcbiAgICAgICAgdGhpcy5lYXJuaW5nc1VybCA9ICdodHRwczovL29kbi5kYXRhLnNvY3JhdGEuY29tL3Jlc291cmNlL3dtd2gtNHZhay5qc29uPyR3aGVyZT0nO1xuICAgICAgICB0aGlzLmVkdWNhdGlvbkJ5UGxhY2VVcmwgPSAnaHR0cHM6Ly9vZG4uZGF0YS5zb2NyYXRhLmNvbS9yZXNvdXJjZS91ZjRtLTV1OHIuanNvbj90eXBlPXBsYWNlJiRsaW1pdD01MDAwMCYkd2hlcmU9cG9wdWxhdGlvbiUyMCUzRSUyMDUwMDAnO1xuICAgICAgICB0aGlzLmVkdWNhdGlvblVybCA9ICdodHRwczovL29kbi5kYXRhLnNvY3JhdGEuY29tL3Jlc291cmNlL3VmNG0tNXU4ci5qc29uPyR3aGVyZT0nO1xuICAgICAgICB0aGlzLmdkcFVybCA9ICdodHRwczovL29kbi5kYXRhLnNvY3JhdGEuY29tL3Jlc291cmNlL2tzMmotdmhyOC5qc29uPyR3aGVyZT0nO1xuICAgICAgICB0aGlzLm1vc3RQb3B1bG91c1JlZ2lvblR5cGVVcmwgPSAnaHR0cHM6Ly9vZG4uZGF0YS5zb2NyYXRhLmNvbS9yZXNvdXJjZS9leWFlLThqZnk/cGFyZW50X2lkPXswfSZjaGlsZF90eXBlPXsxfSYkbGltaXQ9ezJ9JiRvcmRlcj1jaGlsZF9wb3B1bGF0aW9uIGRlc2MnO1xuICAgICAgICB0aGlzLm9jY3VwYXRpb25zQnlQbGFjZVVybCA9ICdodHRwczovL29kbi5kYXRhLnNvY3JhdGEuY29tL3Jlc291cmNlL3FmY20tZnczaS5qc29uP29jY3VwYXRpb249ezB9JnR5cGU9cGxhY2UmJGxpbWl0PTUwMDAwJiR3aGVyZT1wb3B1bGF0aW9uJTIwJTNFJTIwNTAwMCc7XG4gICAgICAgIHRoaXMub2NjdXBhdGlvbnNVcmwgPSAnaHR0cHM6Ly9vZG4uZGF0YS5zb2NyYXRhLmNvbS9yZXNvdXJjZS9xZmNtLWZ3M2kuanNvbj8kb3JkZXI9b2NjdXBhdGlvbiYkd2hlcmU9JztcbiAgICAgICAgdGhpcy5wYXJlbnRTdGF0ZVVybCA9ICdodHRwczovL29kbi5kYXRhLnNvY3JhdGEuY29tL3Jlc291cmNlL2V5YWUtOGpmeT9wYXJlbnRfdHlwZT1zdGF0ZSZjaGlsZF9pZD17MH0nO1xuICAgICAgICB0aGlzLnBsYWNlc1VybCA9ICdodHRwczovL29kbi5kYXRhLnNvY3JhdGEuY29tL3Jlc291cmNlL2dtM3UtZ3c1Ny5qc29uLz90eXBlPXBsYWNlJiRsaW1pdD01MDAwMCYkd2hlcmU9cG9wdWxhdGlvbiUyMCUzRSUyMDUwMDAnO1xuICAgICAgICB0aGlzLnBvcHVsYXRpb25VcmwgPSAnaHR0cHM6Ly9vZG4uZGF0YS5zb2NyYXRhLmNvbS9yZXNvdXJjZS9lM3JkLXp6bXIuanNvbj8kb3JkZXI9eWVhcixuYW1lJiR3aGVyZT0nO1xuICAgICAgICB0aGlzLnNpbWlsYXJSZWdpb25zVXJsID0gJ2h0dHBzOi8vc29jcmF0YS1wZWVycy5oZXJva3VhcHAuY29tL3BlZXJzLmpzb24/dmVjdG9ycz1wb3B1bGF0aW9uX2NoYW5nZSxlYXJuaW5ncyxvY2N1cGF0aW9uLGVkdWNhdGlvbixwb3B1bGF0aW9uJm49MTAmaWQ9ezB9JztcbiAgICAgICAgdGhpcy5oZWFsdGhEYXRhVXJscyA9IHtcbiAgICAgICAgICAgIHJ3amZfY291bnR5X2hlYWx0aF9yYW5raW5nc18yMDE1OiBcImh0dHBzOi8vb2RuLmRhdGEuc29jcmF0YS5jb20vcmVzb3VyY2UvN2F5cC11dHAyLmpzb24/JHdoZXJlPVwiLFxuICAgICAgICAgICAgY2RjX2JyZnNzX3ByZXZhbGVuY2VfMjAxMV8yMDEzOiBcImh0dHBzOi8vb2RuLmRhdGEuc29jcmF0YS5jb20vcmVzb3VyY2UvbjRydC0zcm1kLmpzb24/JHdoZXJlPVwiXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBQcm9taXNlc1xuICAgIC8vXG4gICAgZ2V0QXV0b0NvbXBsZXRlTmFtZVN1Z2dlc3Rpb25zKHNlYXJjaFRlcm0pIHtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHRoaXMuYXV0b0NvbXBsZXRlTmFtZVN1Z2dlc3RVcmwuZm9ybWF0KGVuY29kZVVSSUNvbXBvbmVudChzZWFyY2hUZXJtKSkpO1xuICAgIH1cblxuICAgIGdldENhdGVnb3JpZXMoKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLmNhdGVnb3JpZXNVcmwpO1xuICAgIH1cblxuICAgIGdldENoaWxkUmVnaW9ucyhyZWdpb25JZCwgbGltaXQgPSAxMCkge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5jaGlsZFJlZ2lvbnNVcmwuZm9ybWF0KHJlZ2lvbklkLCBsaW1pdCkpO1xuICAgIH1cblxuICAgIGdldENpdGllc0luU3RhdGUoc3RhdGVJZCwgbGltaXQgPSAxMCkge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5tb3N0UG9wdWxvdXNSZWdpb25UeXBlVXJsLmZvcm1hdChzdGF0ZUlkLCAncGxhY2UnLCBsaW1pdCkpO1xuICAgIH1cblxuICAgIGdldENvc3RPZkxpdmluZ0RhdGEocmVnaW9uSWRzKSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGF0YSh0aGlzLmNvc3RPZkxpdmluZ1VybCwgcmVnaW9uSWRzKTtcbiAgICB9XG5cbiAgICBnZXRDb3VudGllc0luU3RhdGUoc3RhdGVJZCwgbGltaXQgPSAxMCkge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5tb3N0UG9wdWxvdXNSZWdpb25UeXBlVXJsLmZvcm1hdChzdGF0ZUlkLCAnY291bnR5JywgbGltaXQpKTtcbiAgICB9XG4gICAgXG4gICAgZ2V0RGF0YSh1cmwsIHJlZ2lvbklkcykge1xuXG4gICAgICAgIHZhciBzZWdtZW50cyA9IHJlZ2lvbklkcy5tYXAoZnVuY3Rpb24ocmVnaW9uSWQpIHtcbiAgICAgICAgICAgIHJldHVybiAnaWQ9XFwnJyArIHJlZ2lvbklkICsgJ1xcJyc7IFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHVybCArIGVuY29kZVVSSShzZWdtZW50cy5qb2luKCcgT1IgJykpKTtcbiAgICB9XG4gICAgXG4gICAgZ2V0RG9tYWlucygpIHtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHRoaXMuZG9tYWluc1VybCk7XG4gICAgfVxuXG4gICAgZ2V0RWFybmluZ3NCeVBsYWNlKCkge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5lYXJuaW5nc0J5UGxhY2VVcmwpO1xuICAgIH1cblxuICAgIGdldEVhcm5pbmdzRGF0YShyZWdpb25JZHMpIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZXREYXRhKHRoaXMuZWFybmluZ3NVcmwsIHJlZ2lvbklkcyk7XG4gICAgfVxuXG4gICAgZ2V0RWR1Y2F0aW9uQnlQbGFjZSgpIHtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHRoaXMuZWR1Y2F0aW9uQnlQbGFjZVVybCk7XG4gICAgfVxuXG4gICAgZ2V0RWR1Y2F0aW9uRGF0YShyZWdpb25JZHMpIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZXREYXRhKHRoaXMuZWR1Y2F0aW9uVXJsLCByZWdpb25JZHMpO1xuICAgIH1cblxuICAgIGdldEdkcERhdGEocmVnaW9uSWRzKSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGF0YSh0aGlzLmdkcFVybCwgcmVnaW9uSWRzKTtcbiAgICB9XG5cbiAgICBnZXRNZXRyb3NJblN0YXRlKHN0YXRlSWQsIGxpbWl0ID0gMTApIHtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHRoaXMubW9zdFBvcHVsb3VzUmVnaW9uVHlwZVVybC5mb3JtYXQoc3RhdGVJZCwgJ21zYScsIGxpbWl0KSk7XG4gICAgfVxuXG4gICAgZ2V0T2NjdXBhdGlvbnNCeVBsYWNlKG9jY3VwYXRpb24pIHtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHRoaXMub2NjdXBhdGlvbnNCeVBsYWNlVXJsLmZvcm1hdChvY2N1cGF0aW9uKSk7XG4gICAgfVxuXG4gICAgZ2V0T2NjdXBhdGlvbnNEYXRhKHJlZ2lvbklkcykge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmdldERhdGEodGhpcy5vY2N1cGF0aW9uc1VybCwgcmVnaW9uSWRzKTtcbiAgICB9XG5cbiAgICBnZXRQYXJlbnRTdGF0ZShyZWdpb24pIHtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHRoaXMucGFyZW50U3RhdGVVcmwuZm9ybWF0KHJlZ2lvbi5pZCkpO1xuICAgIH1cblxuICAgIGdldFBvcHVsYXRpb25EYXRhKHJlZ2lvbklkcykge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmdldERhdGEodGhpcy5wb3B1bGF0aW9uVXJsLCByZWdpb25JZHMpO1xuICAgIH1cblxuICAgIGdldFBsYWNlcygpIHtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHRoaXMucGxhY2VzVXJsKTtcbiAgICB9XG5cbiAgICBnZXRTaW1pbGFyUmVnaW9ucyhyZWdpb25JZCkge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5zaW1pbGFyUmVnaW9uc1VybC5mb3JtYXQocmVnaW9uSWQpKTtcbiAgICB9XG5cbiAgICAvLyBoZWFsdGggZGF0YSByZXRyaWV2ZXJzXG4gICAgZ2V0SGVhbHRoUndqZkNockRhdGEocmVnaW9uSWRzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldERhdGEodGhpcy5oZWFsdGhEYXRhVXJscy5yd2pmX2NvdW50eV9oZWFsdGhfcmFua2luZ3NfMjAxNSwgcmVnaW9uSWRzKTtcbiAgICB9XG59Il19
//# sourceMappingURL=v4-api-controller.js.map
