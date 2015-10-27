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

//        apiController.getPopulationData(regionId);
//        apiController.getPopulationChangeData(regionId);
//        apiController.getEducationData(regionId);
//        apiController.getEarningsData(regionId);
//        apiController.getOccupationsData(regionId);
//        apiController.getGdpData();
//        apiController.getCostOfLivingData();
        


    // Charts
    //
    if (_params.regions.length > 0) {

        switch (_params.vector) {
            
            case 'population':
                searchPageController.drawPopulationCharts();
                break;
        }
   }
});
