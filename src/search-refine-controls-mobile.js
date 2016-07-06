
class SearchRefineControlsMobile {

    constructor() {

        this.mobileSubMenus = [
            '.search-refine-menu-list-item-categories-mobile',
            '.search-refine-menu-list-item-domains-mobile',
        ];

        // Open button
        //
        $('.search-refine-results-link-container-mobile').click(function() {

            $(this).slideUp();
            $('.search-refine-popup-mobile').slideDown();

            Cookies.set('refinePopupCollapsed', '0');
        });

        // Close button
        //
        $('#search-refine-close-mobile').click(function() {

            $('.search-refine-results-link-container-mobile').slideDown();
            $('.search-refine-popup-mobile').slideUp();

            Cookies.set('refinePopupCollapsed', '1');
        });
        
        this.bindHeaderClickHandlers();
    }

    bindHeaderClickHandlers() {

        const self = this;

        $('.search-refine-menu-list-mobile .refine-menu-header-mobile').unbind('click').click(function() {

            const selectedMenu = '.' + $(this).parent().attr('class');
            const menusToClose = _.filter(self.mobileSubMenus, s => s != selectedMenu);

            // Close others
            //
            const carets = menusToClose.map(s => (s + ' .odn-caret'));
            $(carets.join(', ')).removeClass('fa-caret-up').addClass('fa-caret-down');

            const subLists = menusToClose.map(s => ('.search-refine-menu-list-mobile ' + s + ' > ul')); 
            $(subLists.join(', ')).slideUp();

            // Caret to toggle
            //
            if ($(selectedMenu + ' > ul').is(':visible'))
                $(this).find('.odn-caret').removeClass('fa-caret-up').addClass('fa-caret-down');
            else
                $(this).find('.odn-caret').removeClass('fa-caret-down').addClass('fa-caret-up');

            // Menu to toggle
            //
            $('.search-refine-menu-list-mobile ' + selectedMenu + ' > ul').slideToggle(); 
        });
    }
}