'use strict';

function infiniteScroll(paginator, onScroll) {
    let working = false;

    $(window).on('scroll', () => {
        if (shouldScroll() && !working) {
            working = true;

            paginator.next().then(results => {
                console.log(results);
                onScroll(results);
                working = false;
            });
        }
    }).scroll();
}

function shouldScroll() {
    return ($(window).scrollTop() >=
            $(document).height() - $(window).height() - GlobalConstants.SCROLL_THRESHOLD);
}

class Paginator {
    constructor(nextURL) {
        this.nextURL = nextURL;
        this.page = 0;
        this.limit = 10;
    }

    next() {
        this.page++;
        return d3.promise.html(this.nextURL(this.limit, this.page * this.limit));
    }
}

