
function regionsWithData(vector, regions, select) {
    const column = vector || 'population';
    const selectedIDs = regions.map(region => region.id);
    return [_.extend({
        name: 'Regions with Data',
        domain: 'odn.data.socrata.com',
        fxf: '29pm-gr6s',
        encoded: ['id', 'type', 'population'],
        sort: option => -parseFloat(option.population),
        filter: option => !_.contains(selectedIDs, option.id)
    },  {select, column})];
}

