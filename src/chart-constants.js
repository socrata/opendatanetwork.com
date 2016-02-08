
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
        lineWidth: 4,
        legend : { position : 'top' },
        pointShape : 'circle',
        pointSize : 6,
        height: 300
    }
};

