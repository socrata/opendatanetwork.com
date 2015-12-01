
class AutosuggestSource {
    constructor(name, domain, fxf, column, encoded, select, show, sort) {
        this.name = name;
        this.domain = domain;
        this.fxf = fxf;
        this.column = column;
        this.encoded = encoded;
        this.select = select;
        this.show = show;
        this.sort = sort;
    }

    static fromJSON(json) {
        const encoded = json.encoded || [];
        const show = json.show || ((selection, option) => {
            selection.append('span').text(option.text);
        });

        return new AutosuggestSource(json.name, json.domain, json.fxf, json.column,
                                     encoded, json.select, show, json.sort);
    }

    get(term) {
        return new Promise((resolve, reject) => {
            if (term === '') {
                resolve([]);
            } else {
                const url = Constants.AUTOCOMPLETE_URL(this.domain, this.fxf, this.column, term);
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
        if (options.length === 0)
            return [];

        if (this.sort)
            options = _.sortBy(options, this.sort);

        const category = container
            .append('div')
            .attr('class', 'autocomplete-category');

        const name = category
            .append('p')
            .attr('class', 'autocomplete-title')
            .text(this.name);

        const results = category
            .append('div')
            .attr('class', 'autocomplete-options');

        const self = this;
        return results
            .selectAll('li')
            .data(options)
            .enter()
            .append('li')
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

