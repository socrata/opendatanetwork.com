
const format = {
    integer: d3.format(',.0f'),
    percent: n => `${d3.format('.2f')(n)}%`,
    ratio: d3.format('.1%'),
    dollar: d3.format('$,.0f'),
    millionDollar: n => `${d3.format('$,.0f')(n)}M`
};

