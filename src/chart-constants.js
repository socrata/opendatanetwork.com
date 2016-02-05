
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
        height: 300,
        colors: ['#2ecc71', '#3498db', '#9b59b6', '#f1c40f', '#e67e22', '#e74c3c', '#34495e', '#1abc9c']
    }
};

