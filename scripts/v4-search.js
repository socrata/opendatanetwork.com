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

//        apiController.getOccupationsData(regionId);
//        apiController.getGdpData();
//        apiController.getCostOfLivingData();

    // Charts
    //
    if (_params.regions.length > 0) {

        switch (_params.vector) {

            case 'all':
                searchPageController.drawPopulationData();
                searchPageController.drawEarningsData();
                searchPageController.drawEducationData();
                break;

            case 'population':
                searchPageController.drawPopulationData();
                break;
                
            case 'earnings':
                searchPageController.drawEarningsData();
                break;
                
            case 'education':
                searchPageController.drawEducationData();
                break;
        }
   }
});
