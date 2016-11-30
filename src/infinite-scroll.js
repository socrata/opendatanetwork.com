'use strict';

function infiniteScroll(paginator, onScroll) {
    let working = false;
    let done = false;

    $(window).on('scroll', () => {
        if (!done && shouldScroll() && !working) {
            working = true;

            paginator.next().then(results => {
                onScroll(results);
                working = false;
            }).catch(error => {
                done = true;
            });
        }
    }).scroll();
}

function shouldScroll() {
    return ($(window).scrollTop() >=
            $(document).height() - $(window).height() - GlobalConfig.scroll_threshold);
}

class Paginator {
    constructor(nextURL) {
        this.nextURL = nextURL;
        this.page = 0;
        this.limit = 10;
    }

    next() {
        this.page++;
        const url = this.nextURL(this.limit, this.page * this.limit);
        return d3.promise.text(url).then(response => {
            if (_.isEmpty(response)) return Promise.reject();
            return Promise.resolve(response);
        });
    }
}

