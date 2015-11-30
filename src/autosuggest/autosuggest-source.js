
class AutosuggestSource {
    constructor(name, domain, fxf, column, encoded, select, show) {
        this.name = name;
        this.domain = domain;
        this.fxf = fxf;
        this.column = column;
        this.encoded = encoded;
        this.select = select;
        this.show = show;
    }

    static fromJSON(json) {
        const encoded = json.encoded || [];
        const show = json.show || (option => option.text);

        return new AutosuggestSource(json.name, json.domain, json.fxf, json.column,
                                     encoded, json.select, show);
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
            const base64 = allText.substring(index);
            const ascii = atob(base64);
            const attributes = ascii.split(Constants.AUTOCOMPLETE_SEPARATOR);

            return _.extend({text}, _.object(this.encoded, attributes));
        } else {
            return {text: option.text};
        }
    }

    display(container, options) {
        if (options.length === 0)
            return [];

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

        return results
            .selectAll('li')
            .data(options)
            .enter()
            .append('li')
            .html(option => this.show(option))
            .on('click', option => this.select(option))
            .on('mouseover.source', function() {
                d3.select(this).classed('selected hovered', true);
            })
            .on('mouseout.source', function() {
                d3.select(this).classed('selected hovered', false);
            })[0];
    }
}

