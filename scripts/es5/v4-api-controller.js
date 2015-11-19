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
    }]);

    return ApiController;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Y0LWFwaS1jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztJQUFNLGFBQWE7QUFFZixhQUZFLGFBQWEsR0FFRDs4QkFGWixhQUFhOztBQUlYLFlBQUksQ0FBQywwQkFBMEIsR0FBRyx1R0FBdUcsQ0FBQztBQUMxSSxZQUFJLENBQUMsYUFBYSxHQUFHLGtCQUFrQixDQUFDO0FBQ3hDLFlBQUksQ0FBQyxlQUFlLEdBQUcsOEVBQThFLENBQUM7QUFDdEcsWUFBSSxDQUFDLGVBQWUsR0FBRyw4RUFBOEUsQ0FBQztBQUN0RyxZQUFJLENBQUMsVUFBVSxHQUFHLG1EQUFtRCxDQUFDO0FBQ3RFLFlBQUksQ0FBQyxrQkFBa0IsR0FBRyxrSEFBa0gsQ0FBQTtBQUM1SSxZQUFJLENBQUMsV0FBVyxHQUFHLGtFQUFrRSxDQUFDO0FBQ3RGLFlBQUksQ0FBQyxZQUFZLEdBQUcsa0VBQWtFLENBQUM7QUFDdkYsWUFBSSxDQUFDLE1BQU0sR0FBRyxrRUFBa0UsQ0FBQztBQUNqRixZQUFJLENBQUMseUJBQXlCLEdBQUcsMEhBQTBILENBQUM7QUFDNUosWUFBSSxDQUFDLGNBQWMsR0FBRyxvRkFBb0YsQ0FBQztBQUMzRyxZQUFJLENBQUMsY0FBYyxHQUFHLG9GQUFvRixDQUFDO0FBQzNHLFlBQUksQ0FBQyxTQUFTLEdBQUcsa0hBQWtILENBQUM7QUFDcEksWUFBSSxDQUFDLGFBQWEsR0FBRyxtRkFBbUYsQ0FBQztBQUN6RyxZQUFJLENBQUMsaUJBQWlCLEdBQUcsK0hBQStILENBQUM7S0FDNUo7Ozs7QUFBQTtpQkFuQkMsYUFBYTs7dURBdUJnQixVQUFVLEVBQUU7O0FBRXZDLG1CQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2xHOzs7d0NBRWU7O0FBRVosbUJBQU8sRUFBRSxDQUFDLE9BQU8sQ0FB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QUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUMxQzs7OzBDQUVpQixRQUFRLEVBQUU7O0FBRXhCLG1CQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztTQUNuRTs7O1dBbkhDLGFBQWEiLCJmaWxlIjoidjQtYXBpLWNvbnRyb2xsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBBcGlDb250cm9sbGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlTmFtZVN1Z2dlc3RVcmwgPSAnaHR0cHM6Ly9mZWRlcmFsLmRlbW8uc29jcmF0YS5jb20vdmlld3MvN2cyYi04YnJ2L2NvbHVtbnMvYXV0b2NvbXBsZXRlX25hbWUvc3VnZ2VzdC97MH0/c2l6ZT0xMCZmdXp6PTAnO1xuICAgICAgICB0aGlzLmNhdGVnb3JpZXNVcmwgPSAnL2NhdGVnb3JpZXMuanNvbic7XG4gICAgICAgIHRoaXMuY2hpbGRSZWdpb25zVXJsID0gJ2h0dHBzOi8vZmVkZXJhbC5kZW1vLnNvY3JhdGEuY29tL3Jlc291cmNlL2V5YWUtOGpmeT9wYXJlbnRfaWQ9ezB9JiRsaW1pdD17MX0nO1xuICAgICAgICB0aGlzLmNvc3RPZkxpdmluZ1VybCA9ICdodHRwczovL2ZlZGVyYWwuZGVtby5zb2NyYXRhLmNvbS9yZXNvdXJjZS9ocG5mLWduZnUuanNvbj8kb3JkZXI9bmFtZSYkd2hlcmU9JztcbiAgICAgICAgdGhpcy5kb21haW5zVXJsID0gJ2h0dHBzOi8vYXBpLnVzLnNvY3JhdGEuY29tL2FwaS9jYXRhbG9nL3YxL2RvbWFpbnMnO1xuICAgICAgICB0aGlzLmVhcm5pbmdzQnlQbGFjZVVybCA9ICdodHRwczovL2ZlZGVyYWwuZGVtby5zb2NyYXRhLmNvbS9yZXNvdXJjZS93bXdoLTR2YWsuanNvbi8/dHlwZT1wbGFjZSYkbGltaXQ9NTAwMDAmJHdoZXJlPXBvcHVsYXRpb24lMjAlM0UlMjA1MDAwJ1xuICAgICAgICB0aGlzLmVhcm5pbmdzVXJsID0gJ2h0dHBzOi8vZmVkZXJhbC5kZW1vLnNvY3JhdGEuY29tL3Jlc291cmNlL3dtd2gtNHZhay5qc29uPyR3aGVyZT0nO1xuICAgICAgICB0aGlzLmVkdWNhdGlvblVybCA9ICdodHRwczovL2ZlZGVyYWwuZGVtby5zb2NyYXRhLmNvbS9yZXNvdXJjZS91ZjRtLTV1OHIuanNvbj8kd2hlcmU9JztcbiAgICAgICAgdGhpcy5nZHBVcmwgPSAnaHR0cHM6Ly9mZWRlcmFsLmRlbW8uc29jcmF0YS5jb20vcmVzb3VyY2Uva3Myai12aHI4Lmpzb24/JHdoZXJlPSc7XG4gICAgICAgIHRoaXMubW9zdFBvcHVsb3VzUmVnaW9uVHlwZVVybCA9ICdodHRwczovL2ZlZGVyYWwuZGVtby5zb2NyYXRhLmNvbS9yZXNvdXJjZS9leWFlLThqZnk/cGFyZW50X2lkPXswfSZjaGlsZF90eXBlPXsxfSYkbGltaXQ9ezJ9JiRvcmRlcj1jaGlsZF9wb3B1bGF0aW9uIGRlc2MnO1xuICAgICAgICB0aGlzLm9jY3VwYXRpb25zVXJsID0gJ2h0dHBzOi8vZmVkZXJhbC5kZW1vLnNvY3JhdGEuY29tL3Jlc291cmNlL3FmY20tZnczaS5qc29uPyRvcmRlcj1vY2N1cGF0aW9uJiR3aGVyZT0nO1xuICAgICAgICB0aGlzLnBhcmVudFN0YXRlVXJsID0gJ2h0dHBzOi8vZmVkZXJhbC5kZW1vLnNvY3JhdGEuY29tL3Jlc291cmNlL2V5YWUtOGpmeT9wYXJlbnRfdHlwZT1zdGF0ZSZjaGlsZF9pZD17MH0nO1xuICAgICAgICB0aGlzLnBsYWNlc1VybCA9ICdodHRwczovL2ZlZGVyYWwuZGVtby5zb2NyYXRhLmNvbS9yZXNvdXJjZS9nbTN1LWd3NTcuanNvbi8/dHlwZT1wbGFjZSYkbGltaXQ9NTAwMDAmJHdoZXJlPXBvcHVsYXRpb24lMjAlM0UlMjA1MDAwJztcbiAgICAgICAgdGhpcy5wb3B1bGF0aW9uVXJsID0gJ2h0dHBzOi8vZmVkZXJhbC5kZW1vLnNvY3JhdGEuY29tL3Jlc291cmNlL2UzcmQtenptci5qc29uPyRvcmRlcj15ZWFyLG5hbWUmJHdoZXJlPSc7XG4gICAgICAgIHRoaXMuc2ltaWxhclJlZ2lvbnNVcmwgPSAnaHR0cHM6Ly9zb2NyYXRhLXBlZXJzLmhlcm9rdWFwcC5jb20vcGVlcnMuanNvbj92ZWN0b3JzPXBvcHVsYXRpb25fY2hhbmdlLGVhcm5pbmdzLG9jY3VwYXRpb24sZWR1Y2F0aW9uLHBvcHVsYXRpb24mbj0xMCZpZD17MH0nO1xuICAgIH1cblxuICAgIC8vIFByb21pc2VzXG4gICAgLy9cbiAgICBnZXRBdXRvQ29tcGxldGVOYW1lU3VnZ2VzdGlvbnMoc2VhcmNoVGVybSkge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5hdXRvQ29tcGxldGVOYW1lU3VnZ2VzdFVybC5mb3JtYXQoZW5jb2RlVVJJQ29tcG9uZW50KHNlYXJjaFRlcm0pKSk7XG4gICAgfVxuXG4gICAgZ2V0Q2F0ZWdvcmllcygpIHtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHRoaXMuY2F0ZWdvcmllc1VybCk7XG4gICAgfVxuXG4gICAgZ2V0Q2hpbGRSZWdpb25zKHJlZ2lvbklkLCBsaW1pdCA9IDEwKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLmNoaWxkUmVnaW9uc1VybC5mb3JtYXQocmVnaW9uSWQsIGxpbWl0KSk7XG4gICAgfVxuXG4gICAgZ2V0Q2l0aWVzSW5TdGF0ZShzdGF0ZUlkLCBsaW1pdCA9IDEwKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLm1vc3RQb3B1bG91c1JlZ2lvblR5cGVVcmwuZm9ybWF0KHN0YXRlSWQsICdwbGFjZScsIGxpbWl0KSk7XG4gICAgfVxuXG4gICAgZ2V0Q29zdE9mTGl2aW5nRGF0YShyZWdpb25JZHMpIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZXREYXRhKHRoaXMuY29zdE9mTGl2aW5nVXJsLCByZWdpb25JZHMpO1xuICAgIH1cblxuICAgIGdldENvdW50aWVzSW5TdGF0ZShzdGF0ZUlkLCBsaW1pdCA9IDEwKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLm1vc3RQb3B1bG91c1JlZ2lvblR5cGVVcmwuZm9ybWF0KHN0YXRlSWQsICdjb3VudHknLCBsaW1pdCkpO1xuICAgIH1cbiAgICBcbiAgICBnZXREYXRhKHVybCwgcmVnaW9uSWRzKSB7XG5cbiAgICAgICAgdmFyIHNlZ21lbnRzID0gcmVnaW9uSWRzLm1hcChmdW5jdGlvbihyZWdpb25JZCkge1xuICAgICAgICAgICAgcmV0dXJuICdpZD1cXCcnICsgcmVnaW9uSWQgKyAnXFwnJzsgXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odXJsICsgZW5jb2RlVVJJKHNlZ21lbnRzLmpvaW4oJyBPUiAnKSkpO1xuICAgIH1cblxuICAgIGdldERvbWFpbnMoKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLmRvbWFpbnNVcmwpO1xuICAgIH1cblxuICAgIGdldEVhcm5pbmdzQnlQbGFjZSgpIHtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHRoaXMuZWFybmluZ3NCeVBsYWNlVXJsKTtcbiAgICB9XG5cbiAgICBnZXRFYXJuaW5nc0RhdGEocmVnaW9uSWRzKSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGF0YSh0aGlzLmVhcm5pbmdzVXJsLCByZWdpb25JZHMpO1xuICAgIH1cblxuICAgIGdldEVkdWNhdGlvbkRhdGEocmVnaW9uSWRzKSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGF0YSh0aGlzLmVkdWNhdGlvblVybCwgcmVnaW9uSWRzKTtcbiAgICB9XG5cbiAgICBnZXRHZHBEYXRhKHJlZ2lvbklkcykge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmdldERhdGEodGhpcy5nZHBVcmwsIHJlZ2lvbklkcyk7XG4gICAgfVxuXG4gICAgZ2V0TWV0cm9zSW5TdGF0ZShzdGF0ZUlkLCBsaW1pdCA9IDEwKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLm1vc3RQb3B1bG91c1JlZ2lvblR5cGVVcmwuZm9ybWF0KHN0YXRlSWQsICdtc2EnLCBsaW1pdCkpO1xuICAgIH1cblxuICAgIGdldE9jY3VwYXRpb25zRGF0YShyZWdpb25JZHMpIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZXREYXRhKHRoaXMub2NjdXBhdGlvbnNVcmwsIHJlZ2lvbklkcyk7XG4gICAgfVxuXG4gICAgZ2V0UGFyZW50U3RhdGUocmVnaW9uKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLnBhcmVudFN0YXRlVXJsLmZvcm1hdChyZWdpb24uaWQpKTtcbiAgICB9XG5cbiAgICBnZXRQb3B1bGF0aW9uRGF0YShyZWdpb25JZHMpIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZXREYXRhKHRoaXMucG9wdWxhdGlvblVybCwgcmVnaW9uSWRzKTtcbiAgICB9XG5cbiAgICBnZXRQbGFjZXMoKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLnBsYWNlc1VybCk7XG4gICAgfVxuXG4gICAgZ2V0U2ltaWxhclJlZ2lvbnMocmVnaW9uSWQpIHtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHRoaXMuc2ltaWxhclJlZ2lvbnNVcmwuZm9ybWF0KHJlZ2lvbklkKSk7XG4gICAgfVxufSJdfQ==
//# sourceMappingURL=v4-api-controller.js.map
