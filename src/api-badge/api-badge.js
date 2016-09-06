
class APIBadge {
    constructor(popup) {
        this.popup = popup;
    }

    insertAt(selection, before) {
        before = before || ':first-child';
        this.container = selection.insert('a', before);
        this.render();
    }

    appendTo(selection) {
        this.container = selection.append('a');
        this.render();
    }

    render() {
        this.container
            .attr('class', 'small-api-link')
            .text('API')
            .on('click', () => this.popup.toggle());
    }
}
