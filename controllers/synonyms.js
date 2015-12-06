'use strict';

const fs = require('fs');
const _ = require('lodash');

class Synonyms {
    constructor(json) {
        this.synonyms = json;
    }

    static fromFile(path) {
        const buffer = fs.readFileSync(path);
        const json = JSON.parse(buffer);
        return new Synonyms(json);
    }

    get(word) {
        const matches = this.synonyms.filter(words => _.contains(words, word));
        if (word.length > 0) matches.push([word]);
        return _.unique(_.flatten(matches));
    }
}

module.exports = Synonyms;

