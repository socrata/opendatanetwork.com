
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
            $(this).children('.quick-links-button-wide').children('i').removeClass('fa-caret-down').addClass('fa-caret-up');
            $(this).children('.quick-links-menu-container').show();
        });

        $('.quick-links-container').mouseout(function() {

            $(this).removeClass('quick-links-container-selected');
            $(this).children('.quick-links-button-wide').children('i').removeClass('fa-caret-up').addClass('fa-caret-down');
            $(this).children('.quick-links-menu-container').hide();
        });
    }
}
