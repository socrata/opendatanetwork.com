
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

const autosuggestSources = {
    regions: {
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
    questions: {
        name: 'Questions',
        image: 'fa-question-circle',
        domain: domain,
        fxf: '234x-8y9w',
        column: 'question',
        encoded: ['regionName', 'regionID', 'regionPopulation',
                  'vector', 'source', 'variable', 'metric', 'index'],
        select: option => {
            navigate(path(['region', option.regionID, option.regionName, option.vector, option.metric]),
                {question: 1});
        },
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
    datasets: {
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
    publishers: {
        name: 'Publishers',
        image: 'fa-newspaper-o',
        domain: domain,
        fxf: '8ae5-ghum',
        column: 'domain',
        select: option => navigate('/search', {domains: option.text})
    },
    categories: {
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
};

// Autocomplete on datasets, regions, publishers, and categories.
function multiComplete(inputSelector, resultSelector) {
    const sources = ['regions', 'categories', 'questions', 'datasets', 'publishers']
        .map(name => autosuggestSources[name]);
    const autosuggest = new Autosuggest(resultSelector, sources);
    autosuggest.listen(inputSelector);

    return autosuggest;
}

