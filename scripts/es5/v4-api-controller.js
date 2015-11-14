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
        this.healthUrl = 'https://odn.data.socrata.com/resource/wmwh-4vak.json?$where=';
        this.educationUrl = 'https://odn.data.socrata.com/resource/uf4m-5u8r.json?$where=';
        this.gdpUrl = 'https://odn.data.socrata.com/resource/ks2j-vhr8.json?$where=';
        this.mostPopulousRegionTypeUrl = 'https://odn.data.socrata.com/resource/eyae-8jfy?parent_id={0}&child_type={1}&$limit={2}&$order=child_population desc';
        this.occupationsUrl = 'https://odn.data.socrata.com/resource/qfcm-fw3i.json?$order=occupation&$where=';
        this.parentStateUrl = 'https://odn.data.socrata.com/resource/eyae-8jfy?parent_type=state&child_id={0}';
        this.placesInRegionUrl = 'https://odn.data.socrata.com/resource/eyae-8jfy?parent_id=';
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

        // health data retrievers

    }, {
        key: 'getHealthRwjfChrData',
        value: function getHealthRwjfChrData(regionIds, completionHandler) {
            this.getData(this.healthDataUrls.rwjf_county_health_rankings_2015, regionIds, completionHandler);
        }
    }, {
        key: 'getHealthCdcBrfssPrevalenceData',
        value: function getHealthCdcBrfssPrevalenceData(regionIds, completionHandler) {
            this.getData(this.healthDataUrls.cdc, regionIds, completionHandler, '_geoid');
        }
    }, {
        key: 'getData',
        value: function getData(url, regionIds, completionHandler) {
            var region_id_column = arguments.length <= 3 || arguments[3] === undefined ? 'id' : arguments[3];

            var segments = regionIds.map(function (regionId) {
                return region_id_column + '=\'' + regionId + '\'';
            });

            $.getJSON(url + encodeURI(segments.join(' OR ')), completionHandler);
        }
    }]);

    return ApiController;
})();
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxnQ0FBZ0MsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztTQUNwRzs7O3dEQUMrQixTQUFTLEVBQUUsaUJBQWlCLEVBQUU7QUFDMUQsZ0JBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLGlCQUFpQixFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ2pGOzs7Z0NBRU8sR0FBRyxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsRUFBMkI7Z0JBQXpCLGdCQUFnQix5REFBRyxJQUFJOztBQUU5RCxnQkFBSSxRQUFRLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFTLFFBQVEsRUFBRTtBQUM1Qyx1QkFBTyxnQkFBZ0IsR0FBQyxLQUFLLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQzthQUNuRCxDQUFDLENBQUM7O0FBRUgsYUFBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1NBQ3hFOzs7V0FsSUMsYUFBYSIsImZpbGUiOiJ2NC1hcGktY29udHJvbGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEFwaUNvbnRyb2xsZXIge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVOYW1lU3VnZ2VzdFVybCA9ICdodHRwczovL29kbi5kYXRhLnNvY3JhdGEuY29tL3ZpZXdzLzdnMmItOGJydi9jb2x1bW5zL2F1dG9jb21wbGV0ZV9uYW1lL3N1Z2dlc3QvezB9P3NpemU9MTAmZnV6ej0wJztcbiAgICAgICAgdGhpcy5jYXRlZ29yaWVzVXJsID0gJy9jYXRlZ29yaWVzLmpzb24nO1xuICAgICAgICB0aGlzLmNvc3RPZkxpdmluZ1VybCA9ICdodHRwczovL29kbi5kYXRhLnNvY3JhdGEuY29tL3Jlc291cmNlL2hwbmYtZ25mdS5qc29uPyRvcmRlcj1uYW1lJiR3aGVyZT0nO1xuICAgICAgICB0aGlzLmRvbWFpbnNVcmwgPSAnaHR0cHM6Ly9hcGkudXMuc29jcmF0YS5jb20vYXBpL2NhdGFsb2cvdjEvZG9tYWlucyc7XG4gICAgICAgIHRoaXMuZWFybmluZ3NVcmwgPSAnaHR0cHM6Ly9vZG4uZGF0YS5zb2NyYXRhLmNvbS9yZXNvdXJjZS93bXdoLTR2YWsuanNvbj8kd2hlcmU9JztcbiAgICAgICAgdGhpcy5oZWFsdGhVcmwgPSAnaHR0cHM6Ly9vZG4uZGF0YS5zb2NyYXRhLmNvbS9yZXNvdXJjZS93bXdoLTR2YWsuanNvbj8kd2hlcmU9JztcbiAgICAgICAgdGhpcy5lZHVjYXRpb25VcmwgPSAnaHR0cHM6Ly9vZG4uZGF0YS5zb2NyYXRhLmNvbS9yZXNvdXJjZS91ZjRtLTV1OHIuanNvbj8kd2hlcmU9JztcbiAgICAgICAgdGhpcy5nZHBVcmwgPSAnaHR0cHM6Ly9vZG4uZGF0YS5zb2NyYXRhLmNvbS9yZXNvdXJjZS9rczJqLXZocjguanNvbj8kd2hlcmU9JztcbiAgICAgICAgdGhpcy5tb3N0UG9wdWxvdXNSZWdpb25UeXBlVXJsID0gJ2h0dHBzOi8vb2RuLmRhdGEuc29jcmF0YS5jb20vcmVzb3VyY2UvZXlhZS04amZ5P3BhcmVudF9pZD17MH0mY2hpbGRfdHlwZT17MX0mJGxpbWl0PXsyfSYkb3JkZXI9Y2hpbGRfcG9wdWxhdGlvbiBkZXNjJztcbiAgICAgICAgdGhpcy5vY2N1cGF0aW9uc1VybCA9ICdodHRwczovL29kbi5kYXRhLnNvY3JhdGEuY29tL3Jlc291cmNlL3FmY20tZnczaS5qc29uPyRvcmRlcj1vY2N1cGF0aW9uJiR3aGVyZT0nO1xuICAgICAgICB0aGlzLnBhcmVudFN0YXRlVXJsID0gJ2h0dHBzOi8vb2RuLmRhdGEuc29jcmF0YS5jb20vcmVzb3VyY2UvZXlhZS04amZ5P3BhcmVudF90eXBlPXN0YXRlJmNoaWxkX2lkPXswfSc7XG4gICAgICAgIHRoaXMucGxhY2VzSW5SZWdpb25VcmwgPSAnaHR0cHM6Ly9vZG4uZGF0YS5zb2NyYXRhLmNvbS9yZXNvdXJjZS9leWFlLThqZnk/cGFyZW50X2lkPSc7XG4gICAgICAgIHRoaXMucG9wdWxhdGlvblVybCA9ICdodHRwczovL29kbi5kYXRhLnNvY3JhdGEuY29tL3Jlc291cmNlL2UzcmQtenptci5qc29uPyRvcmRlcj15ZWFyLG5hbWUmJHdoZXJlPSc7XG4gICAgICAgIHRoaXMuc2ltaWxhclJlZ2lvbnNVcmwgPSAnaHR0cHM6Ly9zb2NyYXRhLXBlZXJzLmhlcm9rdWFwcC5jb20vcGVlcnMuanNvbj92ZWN0b3JzPXBvcHVsYXRpb25fY2hhbmdlLGVhcm5pbmdzLG9jY3VwYXRpb24sZWR1Y2F0aW9uLHBvcHVsYXRpb24mbj0xMCZpZD17MH0nO1xuICAgICAgICB0aGlzLmhlYWx0aERhdGFVcmxzID0ge1xuICAgICAgICAgICAgcndqZl9jb3VudHlfaGVhbHRoX3JhbmtpbmdzXzIwMTU6IFwiaHR0cHM6Ly9vZG4uZGF0YS5zb2NyYXRhLmNvbS9yZXNvdXJjZS83YXlwLXV0cDIuanNvbj8kd2hlcmU9XCIsXG4gICAgICAgICAgICBjZGNfYnJmc3NfcHJldmFsZW5jZV8yMDExXzIwMTM6IFwiaHR0cHM6Ly9vZG4uZGF0YS5zb2NyYXRhLmNvbS9yZXNvdXJjZS9uNHJ0LTNybWQuanNvbj8kd2hlcmU9XCJcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFByb21pc2VzXG4gICAgLy9cbiAgICBnZXRDYXRlZ29yaWVzKCkge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5jYXRlZ29yaWVzVXJsKVxuICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICB9XG5cbiAgICBnZXRDb3VudGllc0luU3RhdGUoc3RhdGVJZCwgbGltaXQgPSAxMCkge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5tb3N0UG9wdWxvdXNSZWdpb25UeXBlVXJsLmZvcm1hdChzdGF0ZUlkLCAnY291bnR5JywgbGltaXQpKVxuICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICB9XG5cbiAgICBnZXREb21haW5zKCkge1xuXG4gICAgICAgIHJldHVybiBkMy5wcm9taXNlLmpzb24odGhpcy5kb21haW5zVXJsKVxuICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICB9XG5cbiAgICBnZXRQYXJlbnRTdGF0ZShyZWdpb24pIHtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHRoaXMucGFyZW50U3RhdGVVcmwuZm9ybWF0KHJlZ2lvbi5pZCkpXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgIH1cblxuICAgIGdldFBsYWNlc0FuZENvdW50aWVzSW5TdGF0ZShzdGF0ZUlkLCBsaW1pdCA9IDEwKSB7XG5cbiAgICAgICAgdmFyIHBsYWNlc1Byb21pc2UgPSBkMy5wcm9taXNlLmpzb24odGhpcy5tb3N0UG9wdWxvdXNSZWdpb25UeXBlVXJsLmZvcm1hdChzdGF0ZUlkLCAncGxhY2UnLCBsaW1pdCkpO1xuICAgICAgICB2YXIgY291bnRpZXNQcm9taXNlID0gZDMucHJvbWlzZS5qc29uKHRoaXMubW9zdFBvcHVsb3VzUmVnaW9uVHlwZVVybC5mb3JtYXQoc3RhdGVJZCwgJ2NvdW50eScsIGxpbWl0KSk7XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFtwbGFjZXNQcm9taXNlLCBjb3VudGllc1Byb21pc2VdKVxuICAgICAgICAgICAgLnRoZW4odmFsdWVzID0+IFByb21pc2UucmVzb2x2ZSh2YWx1ZXNbMF0uY29uY2F0KHZhbHVlc1sxXSkpKVxuICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICB9XG5cbiAgICBnZXRNZXRyb3NJblN0YXRlKHN0YXRlSWQsIGxpbWl0ID0gMTApIHtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHRoaXMubW9zdFBvcHVsb3VzUmVnaW9uVHlwZVVybC5mb3JtYXQoc3RhdGVJZCwgJ21zYScsIGxpbWl0KSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgfVxuXG4gICAgZ2V0UGxhY2VzSW5TdGF0ZShzdGF0ZUlkLCBsaW1pdCA9IDEwKSB7XG5cbiAgICAgICAgcmV0dXJuIGQzLnByb21pc2UuanNvbih0aGlzLm1vc3RQb3B1bG91c1JlZ2lvblR5cGVVcmwuZm9ybWF0KHN0YXRlSWQsICdwbGFjZScsIGxpbWl0KSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgfVxuXG4gICAgZ2V0U2ltaWxhclJlZ2lvbnMocmVnaW9uSWQpIHtcblxuICAgICAgICByZXR1cm4gZDMucHJvbWlzZS5qc29uKHRoaXMuc2ltaWxhclJlZ2lvbnNVcmwuZm9ybWF0KHJlZ2lvbklkKSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG4gICAgfVxuXG4gICAgLy8gQ2FsbGJhY2tzXG4gICAgLy9cbiAgICBnZXRBdXRvQ29tcGxldGVOYW1lU3VnZ2VzdGlvbnMoc2VhcmNoVGVybSwgY29tcGxldGlvbkhhbmRsZXIpIHtcblxuICAgICAgICAkLmdldEpTT04odGhpcy5hdXRvQ29tcGxldGVOYW1lU3VnZ2VzdFVybC5mb3JtYXQoZW5jb2RlVVJJQ29tcG9uZW50KHNlYXJjaFRlcm0pKSwgY29tcGxldGlvbkhhbmRsZXIpO1xuICAgIH1cblxuICAgIGdldENvc3RPZkxpdmluZ0RhdGEocmVnaW9uSWRzLCBjb21wbGV0aW9uSGFuZGxlcikge1xuXG4gICAgICAgIHRoaXMuZ2V0RGF0YSh0aGlzLmNvc3RPZkxpdmluZ1VybCwgcmVnaW9uSWRzLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gICAgfVxuXG4gICAgZ2V0RWFybmluZ3NEYXRhKHJlZ2lvbklkcywgY29tcGxldGlvbkhhbmRsZXIpIHtcblxuICAgICAgICB0aGlzLmdldERhdGEodGhpcy5lYXJuaW5nc1VybCwgcmVnaW9uSWRzLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gICAgfVxuXG4gICAgZ2V0RWR1Y2F0aW9uRGF0YShyZWdpb25JZHMsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG5cbiAgICAgICAgdGhpcy5nZXREYXRhKHRoaXMuZWR1Y2F0aW9uVXJsLCByZWdpb25JZHMsIGNvbXBsZXRpb25IYW5kbGVyKTtcbiAgICB9XG5cbiAgICBnZXRHZHBEYXRhKHJlZ2lvbklkcywgY29tcGxldGlvbkhhbmRsZXIpIHtcblxuICAgICAgICB0aGlzLmdldERhdGEodGhpcy5nZHBVcmwsIHJlZ2lvbklkcywgY29tcGxldGlvbkhhbmRsZXIpO1xuICAgIH1cblxuICAgIGdldE9jY3VwYXRpb25zRGF0YShyZWdpb25JZHMsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG5cbiAgICAgICAgdGhpcy5nZXREYXRhKHRoaXMub2NjdXBhdGlvbnNVcmwsIHJlZ2lvbklkcywgY29tcGxldGlvbkhhbmRsZXIpO1xuICAgIH1cblxuICAgIGdldFBvcHVsYXRpb25EYXRhKHJlZ2lvbklkcywgY29tcGxldGlvbkhhbmRsZXIpIHtcblxuICAgICAgICB0aGlzLmdldERhdGEodGhpcy5wb3B1bGF0aW9uVXJsLCByZWdpb25JZHMsIGNvbXBsZXRpb25IYW5kbGVyKTtcbiAgICB9XG5cbiAgICAvLyBoZWFsdGggZGF0YSByZXRyaWV2ZXJzXG4gICAgZ2V0SGVhbHRoUndqZkNockRhdGEocmVnaW9uSWRzLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgICAgICB0aGlzLmdldERhdGEodGhpcy5oZWFsdGhEYXRhVXJscy5yd2pmX2NvdW50eV9oZWFsdGhfcmFua2luZ3NfMjAxNSwgcmVnaW9uSWRzLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gICAgfVxuICAgIGdldEhlYWx0aENkY0JyZnNzUHJldmFsZW5jZURhdGEocmVnaW9uSWRzLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgICAgICB0aGlzLmdldERhdGEodGhpcy5oZWFsdGhEYXRhVXJscy5jZGMsIHJlZ2lvbklkcywgY29tcGxldGlvbkhhbmRsZXIsICdfZ2VvaWQnKTtcbiAgICB9XG5cbiAgICBnZXREYXRhKHVybCwgcmVnaW9uSWRzLCBjb21wbGV0aW9uSGFuZGxlciwgcmVnaW9uX2lkX2NvbHVtbiA9ICdpZCcpIHtcblxuICAgICAgICB2YXIgc2VnbWVudHMgPSByZWdpb25JZHMubWFwKGZ1bmN0aW9uKHJlZ2lvbklkKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVnaW9uX2lkX2NvbHVtbisnPVxcJycgKyByZWdpb25JZCArICdcXCcnOyBcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJC5nZXRKU09OKHVybCArIGVuY29kZVVSSShzZWdtZW50cy5qb2luKCcgT1IgJykpLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gICAgfVxufSJdfQ==
//# sourceMappingURL=v4-api-controller.js.map
