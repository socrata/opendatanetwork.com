'use strict';

$(document).ready(function() {
    autosuggest();
    tooltip();
    refineMenus();
//    refineControls();

    // Selected category (yellow box)
    $('.current-category-info-box .fa-close').click(() => {
        $('.current-category-info-box').slideUp();
    });

    $(window).resize(() => {
        renderEntities(entities);
    });
});

function autosuggest() {
    new Autosuggest('.entity-list').listen('.search-bar-input');
}

function tooltip() {
    $('.info-icon').mouseenter(() => {
        $('.info-tooltip').fadeIn();
    });

    $('.info-icon').mouseleave(() => {
        $('.info-tooltip').fadeOut();
    });
}

function refineMenus() {
    $('.refine-link').mouseenter(function() {
        $(this).addClass('refine-link-selected');
        $(this).children('span').children('i').removeClass('fa-caret-down').addClass('fa-caret-up');
        $(this).children('ul').show();

    });

    $('.refine-link').mouseleave(function() {
        $(this).removeClass('refine-link-selected');
        $(this).children('span').children('i').removeClass('fa-caret-up').addClass('fa-caret-down');
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
                .attr('href', navigate.to(entity).url())
                .text(entity.name);

            if (columns == 3)
                cell.attr('class', 'search-results-regions-cell w33');
            else if (columns == 2)
                cell.attr('class', 'search-results-regions-cell w50');
            else
                cell.attr('class', 'search-results-regions-cell');

            cell.append('div')
                .attr('class', 'regionType')
                .text(GlobalConstants.REGION_NAMES[entity.type] || '');
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

