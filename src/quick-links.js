
class QuickLinks {

    constructor() {

        const self = this;

        const mobileSubMenus = [
            '#quick-link-menu-list-item-categories-mobile',
            '#quick-link-menu-list-item-regions-mobile',
            '#quick-link-menu-list-item-publishers-mobile',
            '#quick-link-menu-list-item-standards-mobile',
        ];

        // Mobile
        //
        $('.quick-links-menu-header-mobile').click(function(event) {

            event.stopPropagation();

            const selectedMenu = '#' + $(this).parent().parent().attr('id');
            const menusToClose = _.filter(mobileSubMenus, s => s != selectedMenu);
            const menuToToggle = $(selectedMenu + ' .quick-links-menu-sub-list-mobile');

            // Close others
            //
            const carets = menusToClose.map(s => (s + ' .quick-links-expand-caret-mobile'));
            $(carets.join(', ')).removeClass('fa-caret-up').addClass('fa-caret-down');
            
            const subLists = menusToClose.map(s => (s + ' .quick-links-menu-sub-list-mobile')); 
            $(subLists.join(', ')).slideUp();

            // Open selected
            //
            if ($(selectedMenu + ' .quick-links-menu-sub-list-mobile').is(':visible'))
                $(this).find('.quick-links-expand-caret-mobile').removeClass('fa-caret-up').addClass('fa-caret-down');
            else
                $(this).find('.quick-links-expand-caret-mobile').removeClass('fa-caret-down').addClass('fa-caret-up');

            $(menuToToggle).slideToggle(); 
        });

        // Desktop
        //
        $('.quick-links-more').click(function() {

            $('.quick-links-more').hide();
            $('.quick-links-sub-menu li').removeClass('quick-links-hidden');
        });

        // Common
        //
        $('.quick-links-container').click(function() {

            if ($(this).hasClass('quick-links-container-selected'))
                $(this).removeClass('quick-links-container-selected');
            else
                $(this).addClass('quick-links-container-selected');

            $(this).children('.quick-links-menu-container-mobile').toggle();
        });

        // Do not bind mouse events on mobile
        //
        if (!$('.quick-links-button-narrow').is(':visible')) {

            $('.quick-links-container').mouseover(function() {

                if (self.onShow) self.onShow();

                $(this).addClass('quick-links-container-selected');
                $(this).children('.quick-links-button-wide').children('i').removeClass('fa-caret-down').addClass('fa-caret-up');
                $(this).children('.quick-links-menu-container').show();
                $(this).children('.quick-links-menu-container-mobile').show();
            });

            $('.quick-links-container').mouseout(function() {

                $(this).removeClass('quick-links-container-selected');
                $(this).children('.quick-links-button-wide').children('i').removeClass('fa-caret-up').addClass('fa-caret-down');
                $(this).children('.quick-links-menu-container').hide();
                $(this).children('.quick-links-menu-container-mobile').hide();
            });
        }
    }
}
