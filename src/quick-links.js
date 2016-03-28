
class QuickLinks {

    constructor() {

        const self = this;

        $('.quick-links-more').click(function() {

            $('.quick-links-more').hide();
            $('.quick-links-sub-menu li').removeClass('quick-links-hidden');
        });

        $('.quick-links-container').mouseover(function() {

            if (self.onShow) self.onShow();

            $(this).addClass('quick-links-container-selected');
            $(this).children('span').children('i').removeClass('fa-caret-down').addClass('fa-caret-up');
            $(this).children('div').show();
        });

        $('.quick-links-container').mouseout(function() {

            $(this).removeClass('quick-links-container-selected');
            $(this).children('span').children('i').removeClass('fa-caret-up').addClass('fa-caret-down');
            $(this).children('div').hide();
        });
    }
}
