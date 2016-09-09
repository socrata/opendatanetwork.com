'use strict';

const DATASET_CONSTANTS = {

    CHART_OPTIONS: {
        chartArea: { left:80, width:'100%' },
        cssClassNames: {
            headerCell: 'header-cell',
            headerRow: 'header-row',
            tableCell: 'table-cell',
        },
        curveType: 'function',
        lineWidth: 2,
        legend : { position : 'top' },
        pointShape : 'square',
        pointSize : 8,
        colors: ['#2980b9', '#ee3b3b', '#3bdbee', '#ff9900', '#109618', '#0099c6', '#dd4477', '#66aa00', '#b82e2e', '#316395']
    },

    FORMAT_TYPES: {
        'number': google.visualization.NumberFormat,
        'date': google.visualization.DateFormat
    },
};

