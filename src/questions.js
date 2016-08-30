
class Questions {

    constructor() {

        this.expanded = false;

        $('a.more#questions').click(function (event) {
            event.preventDefault();

            var $this = $(this);
            var $container = $this.parent();
            var $list = $container.parent();

            if (!this.expanded) {
                $list
                    .children('li.question.collapsed')
                    .removeClass('collapsed');
            } else {
                $list
                    .children('li.question.collapsible')
                    .addClass('collapsed');
            }

            this.expanded = !this.expanded;

            $this
                .text(this.expanded ? 'show fewer' : 'show more');
        });
    }
}
