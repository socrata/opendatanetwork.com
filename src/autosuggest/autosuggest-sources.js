'use strict';

const AUTOSUGGEST_SOURCES = [
    {
        suggestType: 'entity',
        image: 'fa-globe',
        name: 'Regions',
        select: option => new EntityNavigate([option]).url()
    },
    {
        suggestType: 'category',
        image: 'fa-tags',
        name: 'Categories',
        select: option => new SearchNavigate(null, [option.name]).url()
    },
    {
        suggestType: 'publisher',
        image: 'fa-newspaper-o',
        name: 'Publishers',
        select: option => new SearchNavigate(null, null, [option.name]).url()
    },
    {
        suggestType: 'dataset',
        image: 'fa-bar-chart',
        name: 'Datasets',
        select: option => `/dataset/${option.domain}/${option.fxf}`
    },
    {
        suggestType: 'question',
        image: 'fa-question-circle',
        name: 'Questions',
        select: option => {
            const entityURL = new EntityNavigate([option.entity]).url();
            const baseRegionURL = entityURL.replace(/entity/, 'region').replace(/\?/, '');
            return `${baseRegionURL}/${option.vector}/${option.metric}`;
        }
    },
    {
        options: [
            {
                text: 'Suggestions API Documentation',
                url: 'http://docs.odn.apiary.io/#reference/0/suggestions/get-suggestions',
            }
        ],
        suggestType: 'api',
        name: 'API',
        select: option => 'http://docs.odn.apiary.io/#reference/0/suggestions/get-suggestions',
        onCategorySelection: category => {
            category.classed('autocomplete-category-api', true);
            category.append('a')
                .attr('class', 'small-api-link')
                .text('API');
        }
    }
];

