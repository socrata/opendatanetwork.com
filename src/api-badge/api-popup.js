
class APIPopup {
    constructor(description, endpoint, backendURL, apiaryURL, hideEntities) {
        this.description = description;
        this.endpoint = endpoint;
        this.backendURL = backendURL;
        this.apiaryURL = apiaryURL;
        this.entities = hideEntities ? [] : _data.entities || [];
        this.entityNames = this.entities.map(_.property('name'));
    }

    appendTo(selection) {
        this.container = selection.append('div');
        this.render();
    }

    insertAt(selection, before) {
        this.container = selection.insert('div', before);
        this.render();
    }

    render() {
        this.container
            .attr('class', 'api-info-box');

        this.container
            .append('a')
            .attr('class', 'fa fa-close')
            .on('click', () => this.close());

        this.container
            .append('strong')
            .append('a')
            .attr('href', this.apiaryURL)
            .attr('target', '_blank')
            .text(this.endpoint);

        this.container
            .append('p')
            .append('a')
            .attr('href', this.backendURL)
            .text(this.entityNames.length ?
                `${this.description} for ${this.entityNames.join(', ')}` :
                this.description);

        this.docsContainer = this.container
            .append('dl');

        this.docsContainer
            .append('dt')
            .text('API Docs:');

        this.docsContainer
            .append('dd')
            .append('a')
            .attr('href', this.apiaryURL)
            .text(this.description);

        this.close();
    }

    open() {
        this.shown = true;
        this.container
            .style('display', 'block');
    }

    close() {
        this.shown = false;
        this.container
            .style('display', 'none');
    }

    toggle() {
        if (this.shown) this.close();
        else this.open();
    }
}

