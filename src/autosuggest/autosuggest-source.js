
class AutosuggestSource {
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

    /**
     * Searches for the given term using the autosuggest API.
     */
    get(term) {
        return new Promise((resolve, reject) => {
            if (term === '') {
                resolve([]);
            } else {
                term = Stopwords.strip(term);
                const path = Constants.AUTOCOMPLETE_URL(this.domain, this.fxf, this.column, term);

                AutosuggestSource.request(path, {size: this.size}).then(response => {
                    resolve(response.options.map(option => this.decode(option.text)));
                }, reject);
            }
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
                const path = `https://${this.domain}/resource/${this.fxf}`;
                const params = {'$q': `'${term}'`, '$limit': this.size};

                AutosuggestSource.request(path, params).then(response => {
                    resolve(response.map(option => this.decode(option[this.column])));
                }, reject);
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

    display(container, options) {
        if (options.length === 0) return [];

        if (this.sort) options = _.sortBy(options, this.sort).slice(0, Constants.AUTOCOMPLETE_SHOWN_OPTIONS);
        if (this.filter) options = options.filter(this.filter);

        const category = container
            .append('li')
            .attr('class', 'autocomplete-category');

        if (this.image) {
            const name = category
                .append('label')
                .attr('class', 'autocomplete-title')
                .text(this.name);

            if (options.length > 1) {
                const image = category
                    .append('div')
                    .append('i')
                    .attr('class', `fa ${this.image}`);
            }
        }

        const results = category
            .append('ul')
            .attr('class', 'autocomplete-options sub-list');

        const self = this;
        return results
            .selectAll('li')
            .data(options)
            .enter()
            .append('li')
            .attr('class', 'autocomplete-option')
            .each(function(option) {
                self.show(d3.select(this), option);
            })
            .on('click', option => this.select(option))
            .on('mouseover.source', function() {
                d3.select(this).classed('selected hovered', true);
            })
            .on('mouseout.source', function() {
                d3.select(this).classed('selected hovered', false);
            })[0];
    }

    static url(path, params) {
        return `${path}?${$.param(params)}`;
    }

    static request(path, params) {
        return $.getJSON(AutosuggestSource.url(path, params));
    }
}

