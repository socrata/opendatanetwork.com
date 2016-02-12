
const ChartConstants = {
    CHART_TYPES: {
        'line': google.visualization.LineChart,
        'bar': google.visualization.BarChart,
        'column': google.visualization.ColumnChart,
        'table': google.visualization.Table,
        'stepped-area': google.visualization.SteppedAreaChart
    },
    CHART_OPTIONS: {
        curveType: 'function',
        lineWidth: 2,
        legend : { position : 'top' },
        pointShape : 'square',
        pointSize : 8,
        colors: ['#2980b9', '#ee3b3b', '#3bdbee', '#ff9900', '#109618', '#0099c6', '#dd4477', '#66aa00', '#b82e2e', '#316395']
    }
};

