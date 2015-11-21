
class Scales {
    static quantile(values, range) {
        values.sort();

        const step = 1.0 / range.length;
        const domain = _.map(range.slice(1), (value, index) => {
            return d3.quantile(values, (index + 1) * step);
        });

        return d3.scale.quantile()
            .domain(domain)
            .range(range);
    }
}

