
$(() => {
    const navigate = new EntityNavigate(_data.entities, _data.variable.id, _data.constraints);
    window.entityNavigate = navigate;

    menuMouseHandlers();
    autosuggest();
    compareAutosuggest(navigate);
    drawMap();
    drawCharts();
    apiBadges();
    showMoreQuestions();
    infiniteDatasetScroll();
    attachMobileMenuHandlers();
    expandMobileQuestions();
    citationTooltip();
    attachChartResizeHandler();
});

// Main search bar autosuggest.
function autosuggest() {
    new Autosuggest('.region-list')
        .listen('.search-bar-input');

    new Autosuggest('.add-region-results-mobile')
        .listen('.add-region-input-mobile');
}

// Compare this data autosuggest that shows only entities
// with data for the current variable.
function compareAutosuggest(navigate) {
    const entitySource = _.find(AUTOSUGGEST_SOURCES, {suggestType: 'entity'});
    const entityIDSet = new Set(_data.entities.map(_.property('id')));
    const source = _.extend({}, entitySource, {
        select: entity => navigate.add(entity).ref('compare-entity').url(),
        params: {variable_id: _data.variable.id},
        filter: entity => !entityIDSet.has(entity.id)
    });

    new Autosuggest('.add-region-results', [source])
        .listen('.add-region-input');
}

function drawMap() {
    MapView.create(_data.entities, _data.variable, _data.constraints, {})
        .then(map => map.show('div#map'))
        .catch(error => {
            throw error;
        });
}

function drawCharts() {
    loadGoogleCharts(['corechart', 'table']).then(() => {
        _data.chartConfig.charts.forEach(config => {
            const chart = new DatasetChart(config);

            chartBadge(chart);

            chart.getData().then(data => chart.render(data)).catch(error => {
                throw error;
            });
        });
    });
}

function loadGoogleCharts(packages) {
    return new Promise(resolve => {
        google.charts.load('current', {packages});
        google.charts.setOnLoadCallback(resolve);
    });
}

function menuMouseHandlers() {
    d3.select('ul.chart-sub-nav')
        .selectAll('li')
        .on('mouseenter', function() {
            if ($(this).children('ul').length) {
                $(this).addClass('selected');
                $(this).children('span').children('em').removeClass('fa-caret-down').addClass('fa-caret-up');
                $(this).children('ul').show();
            }
        })
        .on('mouseleave', function() {
            if ($(this).children('ul').length) {
                $(this).removeClass('selected');
                $(this).children('span').children('em').removeClass('fa-caret-up').addClass('fa-caret-down');
                $(this).children('ul').hide();
            }
        });
}

function apiBadges() {
    const entityIDs = _data.entities.map(_.property('id'));
    const entityID = _.first(entityIDs);
    const variableID = _data.variable.id;
    const datasetID = _data.dataset.id;
    const constraint = _.first(_data.dataset.constraints);
    const constraints = _data.fixedConstraints;

    availableDataBadge(entityIDs);
    constraintBadge(entityIDs, variableID, constraint);
    newMapBadge(entityIDs, variableID, constraints);
    peerBadge(entityID);
    siblingBadge(entityID);
    childBadge(entityID);
    datasetSearchBadge(entityIDs, datasetID);
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

function chartBadge(chart) {
    const url = chart.getDataURL();
    const apiaryURL = 'http://docs.odn.apiary.io/#reference/0/data-values/get-values-for-variables';
    const popup = new APIPopup('Get chart data', '/data/values', url, apiaryURL);
    const badge = new APIBadge(popup);

    const selection = d3.select(`div#${chart.config.id}`);
    popup.insertAt(selection, ':nth-child(2)');
    badge.appendTo(selection.select('h1'));
}

function peerBadge(entityID) {
    const url = odn.relatedURL(entityID, 'peer');
    const apiaryURL = 'http://docs.odn.apiary.io/#reference/0/entity-relationships';
    const popup = new APIPopup('Get peers', '/entity/peer', url, apiaryURL);
    const badge = new APIBadge(popup);

    const selection = d3.select('div#peers');
    popup.insertAt(selection, ':nth-child(2)');
    badge.insertAt(selection.select('h2'));
}

function siblingBadge(entityID) {
    const url = odn.relatedURL(entityID, 'sibling');
    const apiaryURL = 'http://docs.odn.apiary.io/#reference/0/entity-relationships';
    const popup = new APIPopup('Get siblings', '/entity/sibling', url, apiaryURL);
    const badge = new APIBadge(popup);

    const selection = d3.select('div#siblings');
    popup.insertAt(selection, ':nth-child(2)');
    badge.insertAt(selection.select('h2'));
}

function childBadge(entityID) {
    const url = odn.relatedURL(entityID, 'child');
    const apiaryURL = 'http://docs.odn.apiary.io/#reference/0/entity-relationships';

    d3.selectAll('div.children').each(function() {
        const popup = new APIPopup('Get children', '/entity/child', url, apiaryURL);
        const badge = new APIBadge(popup);

        const selection = d3.select(this);
        popup.insertAt(selection, ':nth-child(2)');
        badge.insertAt(selection.select('h2'));
    });
}

function datasetSearchBadge(entityIDs, datasetID) {
    const url = odn.searchDatasetsURL(entityIDs, datasetID);
    const apiaryURL = 'http://docs.odn.apiary.io/#reference/0/search-datasets/get-datasets';
    const popup = new APIPopup('Search for datasets', '/search/dataset', url, apiaryURL);
    const badge = new APIBadge(popup);

    const selection = d3.select('div.search-results-header');
    popup.appendTo(selection);
    badge.appendTo(selection.select('h2'));
}

function infiniteDatasetScroll() {
    const $datasets = $('.search-results');

    infiniteScroll(getDatasetPaginator(), datasets => {
        $datasets.append(datasets);
    });
}

function getDatasetPaginator() {
    return new Paginator((limit, offset) => {
        return buildURL('/search-results/entity', {
            limit,
            offset,
            entity_id: _data.entities.map(_.property('id')).join('-'),
            dataset_id: _data.dataset.id
        });
    });
}

function expandMobileQuestions() {
    d3.select('.questions-mobile')
        .selectAll('.question.collapsed')
        .classed('collapsed', false);
}

function citationTooltip() {
    $('.info-icon').mouseenter(() => {
        $('.info-tooltip').fadeIn();
    });

    $('.info-icon').mouseleave(() => {
        $('.info-tooltip').fadeOut();
    });
}

var resizeTimeout;

function attachChartResizeHandler() {
    $(window).resize(() => {

        if (resizeTimeout) 
            clearTimeout(resizeTimeout);

        resizeTimeout = setTimeout(() => {
            d3.selectAll('.chart h1 a').remove();
            d3.selectAll('.chart-container').selectAll('*').remove();
            drawCharts();
        }, 300);
    });
}
