$(document).ready(function() {

    // Search page controller
    //
    var searchPageController = new SearchPageController(_params);

    // Region controller
    //
    new RegionController(function(region) {

        searchPageController.setAutoCompletedRegion(region);
        searchPageController.navigate();
    });

    // Charts
    //
    if (_params.regions.length > 0) {

        var apiController = new ApiController();
        var regionId = _params.regions[0].id;

//        apiController.getPopulationData(regionId);
//        apiController.getPopulationChangeData(regionId);
        apiController.getEducationData(regionId);
        apiController.getEarningsData(regionId);
        apiController.getOccupationsData(regionId);
        apiController.getGdpData();
        apiController.getCostOfLivingData();
        
        google.setOnLoadCallback(drawCharts);
        
        function drawCharts() {
     
            apiController.getPopulationData(regionId, function(data) {

                var rg = data.map(function(item) {
                    return [item.year, parseInt(item.population)];
                });
                
                rg.reverse();
                rg.unshift(['Year', 'Seattle Population']);

                var dataTable = google.visualization.arrayToDataTable(rg);
            
                var options = {
                    title: 'Population',
                    curveType: 'function',
                    legend: { position: 'bottom' }
                };
            
                var chart = new google.visualization.LineChart(document.getElementById('population-chart'));
            
                chart.draw(dataTable, options);
            });
            
            apiController.getPopulationChangeData(regionId, function(data) {

                var rg = data.map(function(item) {
                    return [item.year, parseFloat(item.population_percent_change)];
                });
                
                rg.reverse();
                rg.unshift(['Year', 'Population Change']);

                var dataTable = google.visualization.arrayToDataTable(rg);
            
                var options = {
                    title: 'Seattle Population Change',
                    curveType: 'function',
                    legend: { position: 'bottom' }
                };
            
                var chart = new google.visualization.LineChart(document.getElementById('population-change-chart'));
            
                chart.draw(dataTable, options);
            });
        }
    }
});
