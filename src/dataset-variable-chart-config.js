
const DatasetVariableChartConfig = {

    'demographics.population.change' : {
        chartType: 'line',
        options: {
            hAxis: { format:'####' },
            height: 300,
            vAxis: { format: '#.##%' }
        },
        x: {
            formatter: 'number',
            format: { pattern: '####'}
        },
        y: {
            formatter: 'number',
            format: { pattern: '#.##\'%\''}
        },
    },

    'demographics.population.count' : {
        chartType: 'line',
        options: {
            hAxis: { format:'####' },
            height: 300,
            vAxis: { format: '#,###' }
        },
        x: {
            formatter: 'number',
            format: { pattern: '####'}
        },
        y: {
            formatter: 'number',
            format: { pattern: '#,###'}
        },
    }
};