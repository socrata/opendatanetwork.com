
const ALL_REGIONS = ['nation', 'region', 'division', 'state', 'county', 'msa', 'place', 'zip_code'];

const SOURCES = ['population', 'education', 'earnings', 'occupations'].map(name => {
    return { name, regions: ALL_REGIONS };
}).concat(['gdp', 'cost_of_living'].map(name => {
    return { name, regions: ['msa', 'state'] };
})).concat(['health'].map(name => {
    return { name, regions: ['state', 'county'] };
}));

