
class AutosuggestResults {
    constructor(resultSelector) {
        this.results = d3.select(resultSelector);

        this.options = [];
        this.index = -1;

        this.autohide();
    }

    autohide() {
        d3.select('html')
            .on('click.results', () => this.hide());

        this.results
            .on('click.results', () => d3.event.stopPropagation());
    }

    hide() {
        this.results.style('display', 'none');
    }

    unhide() {
        this.results.style('display', 'block');
    }

    empty() {
        this.results.html('');
    }

    display(term) {
        return new Promise((resolve, reject) => {
            this.source.get(term).then(options => {
                this.empty();

                if (options.length === 0) {
                    this.hide();
                    resolve([]);
                } else {
                    this.unhide();
                    resolve(this.source.display(this.results, options));
                }
            }, error => { throw error; });
        });
    }

    show(sources, allOptions) {
        this.empty();

        const nestedSelections = sources.map((source, index) => {
            const options = allOptions[index];
            return source.display(this.results, options);
        });

        this.updateOptions(_.flatten(nestedSelections));
        this.unhide();
    }

    updateOptions(options) {
        this.options = options.map(option => d3.select(option));

        this.options.forEach((option, index) => {
            option.on('mouseover.results', () => {
                this.index = index;
                this.updateSelected();
            }).on('mouseout.results', () => {
                this.index = -1;
                this.updateSelected();
            });
        });
    }

    updateSelected() {
        this.options.forEach((option, index) => {
            option.classed('selected', index === this.index);
        });
    }

    keydown(keyCode) {
        if (keyCode == 38) {
            this.up();
        } else if (keyCode == 40) {
            this.down();
        }

        this.updateSelected();
    }

    up() {
        if (this.index >= 0) {
            this.index -= 1;
        }
    }

    down() {
        if (this.index < this.options.length - 1) {
            this.index += 1;
        } else if(this.index == -1) {
            this.index = this.options.length - 1
        }
    }

    enter() {
        const selection = this.options[this.index];
        selection.on('click')(selection.datum());
    }
}

