
class AutosuggestSource {
    constructor(name, image, domain, fxf, column, encoded, select, show, sort, filter) {
        this.name = name;
        this.image = image;
        this.domain = domain;
        this.fxf = fxf;
        this.column = column;
        this.encoded = encoded;
        this.select = select;
        this.show = show;
        this.sort = sort;
        this.filter = filter;
    }

    static fromJSON(json) {
        const encoded = json.encoded || [];
        const show = json.show || ((selection, option) => {
            selection.append('span').text(option.text);
        });

        return new AutosuggestSource(json.name, json.image, json.domain, json.fxf, json.column,
                                     encoded, json.select, show, json.sort, json.filter);
    }

    get(term) {
        return new Promise((resolve, reject) => {
            if (term === '') {
                resolve([]);
            } else {
                const baseURL = Constants.AUTOCOMPLETE_URL(this.domain, this.fxf, this.column, term);
                const size = this.sort ?
                    Constants.AUTOCOMPLETE_MAX_OPTIONS :
                    Constants.AUTOCOMPLETE_SHOWN_OPTIONS;
                const params = {size};
                const url = `${baseURL}?${$.param(params)}`;

                $.getJSON(url).then(response => {
                    resolve(response.options.map(option => this.decode(option)));
                }, reject);
            }
        });
    }

    decode(option) {
        if (this.encoded.length > 0) {
            const allText = option.text;
            const index = allText.lastIndexOf(' ');
            const text = allText.substring(0, index);
            const base64 = allText.substring(index + 1);
            const decoded = Base64.decode(base64);
            const attributes = decoded.split(Constants.AUTOCOMPLETE_SEPARATOR);

            return _.extend({text}, _.object(this.encoded, attributes));
        } else {
            return {text: option.text};
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
}

