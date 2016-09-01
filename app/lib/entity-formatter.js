'use strict';

const _ = require('lodash');

class EntityFormatter {
    static asArray(parameter) {
        if (Array.isArray(parameter)) return parameter;
        if (parameter && parameter.length > 0) return [parameter];
        return [];
    }

    static capitalize(string) {
        return string.replace(/(?:^|\s)\S/g, start => start.toUpperCase());
    }

    static searchPageTitle(params, dataset, metric) {
        const categories = params.categories.map(this.capitalize);
        const tags = params.tags.map(this.capitalize);
        const dataTypes = _.flatten((metric && metric.name ? [metric.name] : []).concat(categories, tags));
        const dataDescription = dataTypes.length > 0 ? this.wordJoin(dataTypes) : 'Data';

        const locationDescription = params.regions.length > 0 ?
            `for ${this.wordJoin(params.regions.map(region => region.name))}` : '';

        if (dataset && dataset.name.length > 0)
            return `${dataDescription} ${locationDescription} - ${dataset.name} on the Open Data Network`;
        else if (dataDescription)
            return `${dataDescription} on the Open Data Network`;
        else
            return `Open Data Network`;
    }

    static entityPageTitle(entities, dataset, variable) {
        const dataDescription = `${variable.name} Data`;
        const locationDescription = entities.length > 0 ?
            `for ${this.wordJoin(entities.map(region => region.name))}` : '';

        return `${dataDescription} ${locationDescription} - ${dataset.name} on the Open Data Network`;
    }

    static wordJoin(list, separator) {
        if (list.length === 0) return '';
        if (list.length === 1) return list[0];
        separator = separator || 'and';
        return `${list.slice(0, list.length - 1).join(', ')} ${separator} ${list[list.length - 1]}`;
    }
}

module.exports = EntityFormatter;
