
const domain = 'odn.data.socrata.com';

const _nameToColumn = new Map();
_nameToColumn.set('population', 'population');
_nameToColumn.set('earnings', 'earnings');
_nameToColumn.set('education', 'education');
_nameToColumn.set('occupations', 'occupations');
_nameToColumn.set('cost_of_living', 'rpp');
_nameToColumn.set('gdp', 'gdp');
_nameToColumn.set('health', 'health');
const defaultColumn = 'all';

const _withDataSource = {
    name: 'Regions with Data',
    domain: domain,
    fxf: '68ht-6puw',
    encoded: ['id', 'type', 'population'],
    sort: option => -parseFloat(option.population)
};

function regionsWithData(name, select) {
    const column = _nameToColumn.has(name) ? _nameToColumn.get(name) : defaultColumn;

    return [_.extend({}, _withDataSource, {select, column})];
}

