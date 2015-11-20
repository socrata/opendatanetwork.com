
maps.scales = (() => {
    function quantile(values, range) {
        const domain = (() => {
            const step = 1.0 / range.length;
            function quantile(value, index, list) {
                return d3.quantile(values, (index + 1) * step);
            }

            return _.map(range.slice(1), quantile);
        })();

        return d3.scale.quantile()
            .domain(domain)
            .range(range);
    }

    return {quantile};
})();
