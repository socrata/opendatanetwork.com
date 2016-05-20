'use strict';

const _ = require('lodash');
const Constants = require('../src/constants');
const Stopwords = require('../src/autosuggest/stopwords');
const Request = require('./request');

class Base64 {
    static decode(encoded) {
        return new Buffer(encoded, 'base64').toString('ascii');
    }
}

/**
 * Server-side version of autosuggest.
 */
class Autosuggest {
    /**
     * Constructs an AutosuggestSource given a declaration object.
     *
     * Declaration object must have at least:
     *  name, domain, fxf, column, and select
     */
    constructor(json) {
        this.name = json.name; // required
        this.image = json.image;
        this.domain = json.domain; // required
        this.fxf = json.fxf; // required
        this.column = json.column; // required
        this.encoded = json.encoded || [];
        this.select = json.select; // required
        this.show = json.show || ((selection, option) => {
            selection.append('span').text(option.text);
        });
        this.sort = json.sort;
        this.filter = json.filter;

        // If we have to sort the results then pull down extra results,
        // sort them, and take the first few elements.
        this.size = this.sort ?
            Constants.AUTOCOMPLETE_MAX_OPTIONS :
            Constants.AUTOCOMPLETE_SHOWN_OPTIONS;
    }

    get(clientParams) {
        return new Promise((resolve, reject) => {
            const path = `https://${this.domain}/resource/${this.fxf}.json`;
            const params = _.extend({}, {
                '$limit': this.size
            }, clientParams);
            const url = Request.buildURL(path, params);
            console.log(url);

            Request.getJSON(url).then(response => {
                let options = response.map(option => this.decode(option[this.column]));
                if (this.sort) options = _.sortBy(options, this.sort)
                    .slice(0, Constants.AUTOCOMPLETE_SHOWN_OPTIONS);
                console.log(options);

                resolve(options);
            }, reject);
        });
    }

    /**
     * Searches for the given term using text search.
     */
    search(term) {
        return new Promise((resolve, reject) => {
            if (term === '') {
                resolve([]);
            } else {
                term = Stopwords.strip(term);
                this.get({'$q': `'${term}'`}).then(resolve, reject);
            }
        });
    }

    /**
     * Extracts hidden base64-encoded attributes from a string.
     * Returns an object with a field for each encoded attribute
     * as well as a text field with the original text minus the encoded blob.
     * Note that all fields will be strings and no float parsing is done.
     *
     * String in the form:
     *  United States MDEwMDAwMFVTOm5hdGlvbjozMTE1MzY1OTQ=
     * With the encoded fields:
     *  id, type, population
     * Will yield the following object:
     *
     * {
     *  text: 'United States',
     *  id: '0100000US1',
     *  type: 'nation',
     *  population: '314583290'
     * }
     */
    decode(allText) {
        if (this.encoded.length > 0) {
            const index = allText.lastIndexOf(' ');
            const text = allText.substring(0, index);
            const base64 = allText.substring(index + 1);
            const decoded = Base64.decode(base64);
            const attributes = decoded.split(Constants.AUTOCOMPLETE_SEPARATOR);

            return _.extend({text}, _.object(this.encoded, attributes));
        } else {
            return {text: allText};
        }
    }
}

module.exports = Autosuggest;

