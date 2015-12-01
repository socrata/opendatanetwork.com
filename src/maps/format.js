
const format = {
    integer: d3.format(',.0f'),
    percent: n => `${d3.format('.2f')(n)}%`,
    dollar: d3.format('$,.0f')
};

