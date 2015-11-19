
function mainAutocomplete(inputSelector, resultSelector) {
    function autocompleteURL(domain, fxf, column) {
        return query => `https://${domain}/views/${fxf}/columns/${column}/suggest/${query}?size=5`;
    }

    function navigate(path) {
        window.location.href = path;
    }

    const domain = 'odn.data.socrata.com';
    const inputSelection = d3.select(inputSelector);
    const resultSelection = d3.select(resultSelector);

    const datasetURL = autocompleteURL(domain, 'fpum-bjbr', 'name');
    const datasetSelect = dataset => navigate(`/search?q=${dataset}`);
    const datasetResults = new Results('Datasets', resultSelection, datasetSelect);
    const datasetComplete = new Complete(datasetURL, datasetResults);

    const regionURL = autocompleteURL(domain, '7g2b-8brv', 'autocomplete_name');
    const regionSelect = region => navigate(`/${region.replace(/ /g, '_')}`);
    const regionResults = new Results('Regions', resultSelection, regionSelect);
    const regionComplete = new Complete(regionURL, regionResults);

    const publisherURL = autocompleteURL(domain, '8ae5-ghum', 'domain');
    const publisherSelect = publisher => navigate(`/search?domains=${publisher}`);
    const publisherResults = new Results('Publishers', resultSelection, publisherSelect);
    const publisherComplete = new Complete(publisherURL, publisherResults);

    const categoryURL = autocompleteURL(domain, '864v-r7tf', 'category');
    const categorySelect = category => navigate(`/search?categories=${category}`);
    const categoryResults = new Results('Categories', resultSelection, categorySelect);
    const categoryComplete = new Complete(categoryURL, categoryResults);

    const completers = [datasetComplete, regionComplete,
                        publisherComplete, categoryComplete];

    return new AutoSuggestRegionController(inputSelection, resultSelection, completers);
}

$(document).ready(function() {

    // Search page controller
    //
    var searchPageController = new SearchPageController(_params);

    // Main search box
    //
    mainAutocomplete('#q', '.region-list');

    // Chart column
    //
    if (_params.regions.length > 0) {

        switch (_params.vector) {

            case 'population':
                searchPageController.drawPopulationData();
                break;

            case 'earnings':
                searchPageController.drawEarningsData();
                break;

            case 'education':
                searchPageController.drawEducationData();
                break;

            case 'occupations':
                searchPageController.drawOccupationsData();
                break;

            case 'cost_of_living':
                searchPageController.drawCostOfLivingData();
                break;

            case 'gdp':
                searchPageController.drawGdpData();
                break;

            default:
                searchPageController.drawPopulationData();
                break;
        }
   }
});
