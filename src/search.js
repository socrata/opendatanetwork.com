
$(document).ready(function() {
    autosuggest();
    tooltip();
    attachMenuHandlers();
    attachMobileMenuHandlers('search-');
    showMoreQuestions();
    showMore('.refine-link #refine-menu-domains-view-more');
    showMore('.refine-link #refine-menu-categories-view-more');
    apiBadges();
    infiniteDatasetScroll();

    // Selected category (yellow box)
    $('.current-category-info-box .fa-close').click(() => {
        $('.current-category-info-box').slideUp();
    });

    $(window).resize(onResize);
    onResize();
});

function onResize() {
    renderEntities(_data.entities);
}

function autosuggest() {
    new Autosuggest('.region-list').listen('.search-bar-input');
}

function tooltip() {
    $('.info-icon').mouseenter(() => {
        $('.info-tooltip').fadeIn();
    });

    $('.info-icon').mouseleave(() => {
        $('.info-tooltip').fadeOut();
    });
}

function attachMenuHandlers() {
    $('.refine-link').mouseenter(function() {
        $(this).addClass('refine-link-selected');
        $(this).children('span').children('em').removeClass('fa-caret-down').addClass('fa-caret-up');
        $(this).children('ul').show();

    });

    $('.refine-link').mouseleave(function() {
        $(this).removeClass('refine-link-selected');
        $(this).children('span').children('em').removeClass('fa-caret-up').addClass('fa-caret-down');
        $(this).children('ul').hide();
    });
}

function refineControls() {
    new RefineControlsMobile();
    new SearchRefineControlsMobile();
}

function renderEntities(entities) {
    if (entities.length === 0) return;

    const container = d3.select('.search-results-regions');
    container.html('');

    const columns = getColumnCount(entities.length);
    _.chunk(entities, columns).forEach(dataRow => {
        const row = container
            .append('div')
            .attr('class', 'search-results-regions-row');

        dataRow.forEach(entity => {
            const cell = row.append('div');

            cell.append('h2')
                .append('a')
                .attr('href', new EntityNavigate().to(entity).ref('search-entity').url())
                .text(entity.name);

            if (columns == 3)
                cell.attr('class', 'search-results-regions-cell w33');
            else if (columns == 2)
                cell.attr('class', 'search-results-regions-cell w50');
            else
                cell.attr('class', 'search-results-regions-cell');

            cell.append('div')
                .attr('class', 'regionType')
                .text(GlobalConfig.regions.names[entity.type] || '');
        });
    });
}

function getColumnCount(count) {
    const width = $(document).width();
    const widthForThree = 1200;
    const widthForTwo = 800;

    if (count >= 3) {
        if (width >= widthForThree) return 3;
        if (width >= widthForTwo) return 2;
        return 1;
    }

    if (count >= 2) return width >= widthForTwo ? 2 : 1;

    return 1;
}

function apiBadges() {
    const query = _data.query;

    questionBadge(query);
    datasetBadge();
}

function questionBadge(query) {
    const url = odn.searchQuestionsURL(query);
    const apiaryURL = 'http://docs.odn.apiary.io/#reference/0/search-questions/get-questions';
    const description = `Questions for ${query}`;
    const popup = new APIPopup(description, '/search/question', url, apiaryURL, true);
    const badge = new APIBadge(popup);

    popup.appendTo(d3.select('#question-api-popup'));
    badge.appendTo(d3.select('#search-results-questions-bar'));
}

function datasetBadge() {
    const url = _data.ceteraURL;
    const apiaryURL = 'http://docs.socratadiscovery.apiary.io/#';
    const description = 'Search for datasets';
    const popup = new APIPopup(description, '/catalog', url, apiaryURL, true);
    const badge = new APIBadge(popup);

    popup.appendTo(d3.select('#catalog-info-box'));
    badge.insertAt(d3.select('.refine-bar.search-header-bar'));
}

function infiniteDatasetScroll() {
    const $datasets = $('.datasets');

    infiniteScroll(getDatasetPaginator(), datasets => {
        $datasets.append(datasets);
    });
}

function getDatasetPaginator() {
    return new Paginator((limit, offset) => {
        return buildURL('/search-results', {
            limit,
            offset,
            q: _data.query,
            categories: _data.categories,
            domains: _data.domains,
            tags: _data.tags
        });
    });
}

function showMore(selector) {
    const selection = d3.select(selector);

    selection.on('click', () => {
        d3.select(selection.node().parentNode)
            .selectAll('li')
            .style('display', 'list-item');
    });

    selection.attr('display', 'none');
}

