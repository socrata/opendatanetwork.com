
// Autocomplete on datasets, regions, publishers, and categories.
function multiComplete(inputSelector, resultSelector) {
    function autocompleteURL(domain, fxf, column) {
        return query => `https://${domain}/views/${fxf}/columns/${column}/suggest/${query}?size=5`;
    }

    function navigate(path) {
        window.location.href = path;
    }

    const domain = 'odn.data.socrata.com';
    const inputSelection = d3.select(inputSelector);
    const resultSelection = d3.select(resultSelector);

    const datasetURL = autocompleteURL(domain, 'fpum-bjbr', 'encoded');
    const datasetSelect = option => {
        const [domain, fxf] = option.attributes;
        navigate(`http://${domain}/dataset/${fxf}`);
    };
    const showOption = option => {
        return `<span class='dataset-name'>${option.text}</span> \
                <span class='dataset-domain'>${option.attributes[0]}</span>`;

    };
    const datasetResults = new Results('Datasets', resultSelection, datasetSelect,
                                       true, showOption);
    const datasetComplete = new Complete(datasetURL, datasetResults);

    const regionURL = autocompleteURL(domain, '7g2b-8brv', 'autocomplete_name');
    const regionSelect = region => navigate(`/${region.text.replace(/ /g, '_')}`);
    const regionResults = new Results('Regions', resultSelection, regionSelect);
    const regionComplete = new Complete(regionURL, regionResults);

    const publisherURL = autocompleteURL(domain, '8ae5-ghum', 'domain');
    const publisherSelect = publisher => navigate(`/search?domains=${publisher.text}`);
    const publisherResults = new Results('Publishers', resultSelection, publisherSelect);
    const publisherComplete = new Complete(publisherURL, publisherResults);

    const categoryURL = autocompleteURL(domain, '864v-r7tf', 'category');
    const categorySelect = category => navigate(`/search?categories=${category.text}`);
    const categoryResults = new Results('Categories', resultSelection, categorySelect);
    const categoryComplete = new Complete(categoryURL, categoryResults);

    const completers = [datasetComplete, regionComplete,
                        publisherComplete, categoryComplete];

    return new AutoSuggestRegionController(inputSelection, resultSelection, completers);
}

