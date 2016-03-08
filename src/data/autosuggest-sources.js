
function regionsWithData(vector, select) {
    const column = vector;
    return [_.extend({
        name: 'Regions with Data',
        domain: 'odn.data.socrata.com',
        fxf: '29pm-gr6s',
        encoded: ['id', 'type', 'population'],
        sort: option => -parseFloat(option.population)
    },  {select, column})];
}

