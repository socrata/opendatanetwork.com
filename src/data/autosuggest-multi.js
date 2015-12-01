
// Autocomplete on datasets, regions, publishers, and categories.
function multiComplete(inputSelector, resultSelector) {
    function navigate(path) {
        window.location.href = path;
    }

    const domain = 'odn.data.socrata.com';

    const sources = [
        {
            name: 'Datasets',
            domain: domain,
            fxf: 'fpum-bjbr',
            column: 'encoded',
            encoded: ['domain', 'fxf'],
            select: option => {
                const name = option.text;
                const domain = option.domain;

                DatasetPopup.show({name, domain});
                // navigate(`http://${option.domain}/dataset/${option.fxf}`)
            },
            show: (selection, option) => {
                selection.append('span')
                    .attr('class', 'dataset-name')
                    .text(option.text);

                selection.append('span')
                    .attr('class', 'dataset-domain')
                    .text(option.domain);
            }
        },
        {
            name: 'Regions',
            domain: domain,
            fxf: '68ht-6puw',
            column: 'all',
            encoded: ['id', 'type', 'population'],
            select: option => {
                navigate(`/${option.text.replace(/ /g, '_')}`);
            },
            show: (selection, option) => {
                selection.append('span')
                    .attr('class', 'region-name')
                    .text(option.text)
                    .append('span')
                    .attr('class', 'region-type')
                    .text(option.population);
            },
            sort: option => -parseFloat(option.population)
        },
        {
            name: 'Publishers',
            domain: domain,
            fxf: '8ae5-ghum',
            column: 'domain',
            select: option => navigate(`/search?domains=${option.text}`)
        },
        {
            name: 'Categories',
            domain: domain,
            fxf: '864v-r7tf',
            column: 'category',
            select: option => navigate(`/search?categories=${option.text}`),
            show: (selection, option) => {
                selection.append('span')
                    .attr('class', 'capitalize')
                    .text(option.text);
            }
        }
    ];

    const autosuggest = new Autosuggest(resultSelector, sources);
    autosuggest.listen(inputSelector);

    return autosuggest;
}

