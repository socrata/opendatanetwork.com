
// Autocomplete to regions with data for the given source.
const sourceComplete = (() => {
    const domain = 'odn.data.socrata.com';
    const fxf = 'pfgp-ifph';

    const nameToColumn = new Map();
    nameToColumn.set('population', 'population');
    nameToColumn.set('earnings', 'earnings');
    nameToColumn.set('education', 'education');
    nameToColumn.set('occupations', 'occupations');
    nameToColumn.set('cost_of_living', 'rpp');
    nameToColumn.set('gdp', 'gdp');

    const defaultColumn = 'population';

    function urlFor(column) {
        return query => `https://${domain}/views/${fxf}/columns/${column}/suggest/${query}?size=5`;
    }

    function navigate(path) {
        window.location.href = path;
    }

    return (inputSelector, resultSelector, name, select) => {
        const inputSelection = d3.select(inputSelector);
        const resultSelection = d3.select(resultSelector);

        const column = nameToColumn.has(name) ? nameToColumn.get(name) : defaultColumn;
        const url = urlFor(column);
        const results = new Results('Regions with Data', resultSelection, select);
        const complete = new Complete(url, results);

        return new AutoSuggestRegionController(inputSelection, resultSelection, [complete]);
    };
})();

