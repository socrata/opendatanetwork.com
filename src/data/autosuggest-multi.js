
// Autocomplete on datasets, regions, publishers, and categories.
function multiComplete(inputSelector, resultSelector) {
    function urlEscape(string) {
        return string
            .replace(/,/g, '')
            .replace(/[ \/]/g, '_');
    }

    function navigate(path, params) {
        params = params || {};
        const url = `${path}?${$.param(params)}`;
        window.location.href = url;
    }

    function path(elements) {
        return `/${elements.map(urlEscape).join('/')}`;

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
            select: option => navigate(path(['region', option.id, option.text])),
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
            name: 'Questions',
            image: 'fa-question-circle',
            domain: domain,
            fxf: 'd6be-a5xs',
            column: 'question',
            encoded: ['regionName', 'regionID', 'regionPopulation',
                      'source', 'variable', 'metric', 'index'],
            select: option => navigate(path(
                ['region', option.regionID, option.regionName, option.source, option.metric])),
            sort: option => {
                const population = parseFloat(option.regionPopulation);
                const index = parseFloat(option.index);
                return -(population - index);
            },
            show: (selection, option) => {
                selection.append('span')
                    .text(`What is the ${option.variable} of ${option.regionName}?`);
            }
        },
        {
            name: 'Datasets',
            image: 'fa-bar-chart',
            domain: domain,
            fxf: 'fpum-bjbr',
            column: 'encoded',
            encoded: ['domain', 'fxf'],
            select: option => navigate(path(['dataset', option.domain, option.fxf])),
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
        }
    ];

    const autosuggest = new Autosuggest(resultSelector, sources);
    autosuggest.listen(inputSelector);

    return autosuggest;
}

