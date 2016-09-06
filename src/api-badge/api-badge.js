
class APIBadge {
    constructor(popup) {
        this.popup = popup;
    }

    insertAt(selection) {
        selection
            .insert('a', ':first-child')
            .attr('class', 'small-api-link')
            .text('API')
            .on('click', () => this.popup.toggle());
    }
}
