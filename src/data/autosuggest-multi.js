
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
            show: option => {
                return `<span class='dataset-name'>${option.text}</span> \
                        <span class='dataset-domain'>${option.domain}</span>`;
            }
        },
        {
            name: 'Regions',
            domain: domain,
            fxf: '68ht-6puw',
            column: 'all',
            encoded: ['id', 'type', 'population'],
            select: option => {
                console.log(option);
                navigate(`/${option.text.replace(/ /g, '_')}`);
            },
            show: option => {
                return option.population
            }
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
            show: option => `<span class='capitalize'>${option.text}</span`
        }
    ];

    const autosuggest = new Autosuggest(resultSelector, sources);
    autosuggest.listen(inputSelector);

    return autosuggest;
}

