

$(document).ready(function() {
    menuMouseHandlers();
    autosuggest();
    drawMap();
    drawCharts();
    apiBadges();

    window.entityNavigate =
        new EntityNavigate(_data.entities, _data.variable.id, _data.constraints);
});

function autosuggest() {
    // Main search bar autosuggest
    new Autosuggest('.region-list')
        .listen('.search-bar-input');

    // Compare this data autosuggest
    // TODO this is using the same autosuggest as the main search bar
    new Autosuggest('.add-region-results')
        .listen('.add-region-input');

    // Mobile autosuggest
    new Autosuggest('.add-region-results-mobile')
        .listen('.add-region-input-mobile');
}

function drawMap() {
    MapView.create(_data.entities, _data.variable, _data.constraints, {})
        .then(map => map.show('div#map'))
        .catch(error => {
            throw error;
        });
}

function drawCharts() {
    _data.chartConfig.charts.forEach(config => {
        const chart = new DatasetChart(config);
        chart.getData().then(data => chart.render(data)).catch(error => {
            throw error;
        });
    });

    const container = d3.select('#google-charts-container');
}

function menuMouseHandlers() {
    d3.select('ul.chart-sub-nav')
        .selectAll('li')
        .on('mouseenter', function() {
            if ($(this).children('ul').length) {
                $(this).addClass('selected');
                $(this).children('span').children('i').removeClass('fa-caret-down').addClass('fa-caret-up');
                $(this).children('ul').show();
            }
        })
        .on('mouseleave', function() {
            if ($(this).children('ul').length) {
                $(this).removeClass('selected');
                $(this).children('span').children('i').removeClass('fa-caret-up').addClass('fa-caret-down');
                $(this).children('ul').hide();
            }
        });
}

function apiBadges() {
    const entityIDs = _data.entities.map(_.property('id'));
    const variableID = _data.variable.id;
    const constraint = _.first(_data.dataset.constraints);
    const constraints = _data.fixedConstraints;

    availableDataBadge(entityIDs);
    constraintBadge(entityIDs, variableID, constraint);
    newMapBadge(entityIDs, variableID, constraints);
}

function availableDataBadge(entityIDs) {
    const url = odn.availableDataURL(entityIDs);
    const apiaryURL = 'http://docs.odn.apiary.io/#reference/0/data-availability/find-all-available-data-for-some-entities';
    const popup = new APIPopup('Available data', '/data/availability', url, apiaryURL);
    const badge = new APIBadge(popup);

    const selection = d3.select('div.chart-tabs-container');
    popup.appendTo(selection);
    badge.insertAt(selection);
}

function constraintBadge(entityIDs, variableID, constraint) {
    const url = odn.constraintsURL(entityIDs, variableID, constraint);
    const apiaryURL = 'http://docs.odn.apiary.io/#reference/0/data-constraints/get-constraint-permutations-for-entities';
    const popup = new APIPopup('Constraint permutations', '/data/constraint', url, apiaryURL);
    const badge = new APIBadge(popup);

    const selection = d3.select('div.chart-sub-nav-container');
    popup.appendTo(selection);
    badge.insertAt(selection);
}

function newMapBadge(entityIDs, variableID, constraints) {
    const url = odn.newMapURL(entityIDs, variableID, constraints);
    const apiaryURL = 'http://docs.odn.apiary.io/#reference/0/map-creation';
    const popup = new APIPopup('Create a new map', '/data/map/new', url, apiaryURL);
    const badge = new APIBadge(popup);

    const selection = d3.select('div.map-container');
    popup.insertAt(selection, ':nth-last-child(1)');
    badge.insertAt(d3.select('p#map-summary'));
}

