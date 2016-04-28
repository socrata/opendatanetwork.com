
// Autocomplete on datasets, regions, publishers, and categories.
function multiComplete(inputSelector, resultSelector) {
    function navigate(path, params) {
        params = params || {};
        const url = `${path}?${$.param(params)}`;
        window.location.href = url;
    }

    const domain = 'odn.data.socrata.com';

    const sources = [
        {
            name: 'Regions',
            image: 'fa-globe',
            domain: domain,
            fxf: '68ht-6puw',
            column: 'all',
            encoded: ['id', 'type', 'population'],
            select: option => {
                navigate(`/region/${option.id}/${option.text.replace(/ /g, '_').replace(/\//g, '_').replace(/,/g, '')}`);
            },
            sort: option => -parseFloat(option.population),
            show: (selection, option) => {
                selection.append('span')
                    .attr('class', 'name')
                    .text(option.text)
                    .append('span')
                    .attr('id', 'tag')
                    .text(Constants.REGION_NAMES[option.type] || '');
            }
        },
        {
            name: 'Datasets',
            image: 'fa-bar-chart',
            domain: domain,
            fxf: 'fpum-bjbr',
            column: 'encoded',
            encoded: ['domain', 'fxf'],
            select: option => navigate(`/dataset/${option.domain}/${option.fxf}`),
            show: (selection, option) => {
                selection.append('span')
                    .attr('class', 'name')
                    .text(option.text)
                    .append('span')
                    .attr('id', 'tag')
                    .text(option.domain);
            }
        },
        {
            name: 'Publishers',
            image: 'fa-newspaper-o',
            domain: domain,
            fxf: '8ae5-ghum',
            column: 'domain',
            select: option => navigate('/search', {domains: option.text})
        },
        {
            name: 'Categories',
            image: 'fa-fighter-jet',
            domain: domain,
            fxf: '864v-r7tf',
            column: 'category',
            select: option => navigate('/search', {categories: option.text}),
            show: (selection, option) => {
                selection.append('span')
                    .attr('class', 'capitalize')
                    .text(option.text);
            }
        },
        {
            name: 'Questions',
            image: 'fa-question-circle',
            domain: domain,
            fxf: 'c5nk-kv4n',
            column: 'question',
            encoded: ['regionName', 'variableName', 'url'],
            select: option => {
                navigate(option.url);
            },
            show: (selection, option) => {
                selection.append('span')
                    .text(`What is the ${option.variableName} of ${option.regionName}?`);
            }
        }
    ];

    const autosuggest = new Autosuggest(resultSelector, sources);
    autosuggest.listen(inputSelector);

    return autosuggest;
}

