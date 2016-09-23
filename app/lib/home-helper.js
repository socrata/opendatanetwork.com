'use strict';

const _ = require('lodash');

class HomeHelper {
    static getRandomQuestions(questionsSet) {
        return questionsSet
            .filter(_.negate(_.isEmpty))
            .map(_.sample);
    }

    static getRandomMostPopulousRegionsFromEachState(locations, count) {
        const mostPopulous = [];
        const selected = [];

        locations.forEach(location => {
            if (location.msas.length > 0) mostPopulous.push(location.msas[0]);
            if (location.counties.length > 0) mostPopulous.push(location.counties[0]);
            if (location.cities.length > 0) mostPopulous.push(location.cities[0]);
        });

        for (var i = 0; i < count; i++) {
            var index = Math.floor(Math.random() * mostPopulous.length);

            selected.push(mostPopulous[index]);
            mostPopulous.splice(index, 1);
        }
        return selected;
    }
}

module.exports = HomeHelper;
