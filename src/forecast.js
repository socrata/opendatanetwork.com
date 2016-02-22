
class Forecast {
    static repeat(value, n) {
        if (n < 1) return [];
        return _.range(n).map(__ => value);
    }

    static linear(steps, series) {
        series = series.map(parseFloat).filter(_.negate(isNaN));
        if (steps < 1) return [];
        if (series.length === 0) return [];
        if (series.length === 1) return Forecast.repeat(series[0], steps);

        const first = series[0];
        const last = series[series.length - 1];
        const slope = (last - first) / (series.length - 1);
        return _.range(steps).map(index => last + slope * (index + 1));
    }
}

