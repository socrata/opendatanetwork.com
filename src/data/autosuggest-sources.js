
function regionsWithData(vector, regions, select) {
    vector = vector || 'population';
    const source = Sources.get(vector);
    const hasAutosuggest = source.hasAutosuggest === undefined ? true : source.hasAutosuggest;
    const column = hasAutosuggest ? vector : 'population';
    const selectedIDs = regions.map(region => region.id);
    return [_.extend({
        name: 'Regions with Data',
        domain: 'odn.data.socrata.com',
        fxf: '27r2-geim',
        encoded: ['id', 'type', 'population'],
        sort: option => -parseFloat(option.population),
        filter: option => !_.contains(selectedIDs, option.id)
    },  {select, column})];
}

