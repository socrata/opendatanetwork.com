
class RefineControlsMobile {

    constructor() {

        this.mobileSubMenus = [
            '.refine-menu-list-item-topics-mobile',
            '.refine-menu-list-item-datasets-mobile',
            '.map-variable-container',
            '.map-variable-year-container',
        ];

        // Open button
        //
        $('.refine-results-link-container-mobile').click(function() {

            $(this).slideUp();
            $('.refine-popup-mobile').slideDown();

            Cookies.set('refinePopupCollapsed', '0');
        });

        // Close button
        //
        $('#refine-close-mobile').click(function() {

            $('.refine-results-link-container-mobile').slideDown();
            $('.refine-popup-mobile').slideUp();

            Cookies.set('refinePopupCollapsed', '1');
        });
        
        this.bindHeaderClickHandlers();
    }

    bindHeaderClickHandlers() {

        const self = this;
        
        $('.refine-menu-list-mobile .refine-menu-header-mobile').unbind('click').click(function() {

            const selectedMenu = '.' + $(this).parent().attr('class');
            const menusToClose = _.filter(self.mobileSubMenus, s => s != selectedMenu);

            // Close others
            //
            const carets = menusToClose.map(s => (s + ' .odn-caret'));
            $(carets.join(', ')).removeClass('fa-caret-up').addClass('fa-caret-down');

            const subLists = menusToClose.map(s => ('.refine-menu-list-mobile ' + s + ' > ul')); 
            $(subLists.join(', ')).slideUp();

            // Caret to toggle
            //
            if ($(selectedMenu + ' > ul').is(':visible'))
                $(this).find('.odn-caret').removeClass('fa-caret-up').addClass('fa-caret-down');
            else
                $(this).find('.odn-caret').removeClass('fa-caret-down').addClass('fa-caret-up');

            // Menu to toggle
            //
            $('.refine-menu-list-mobile ' + selectedMenu + ' > ul').slideToggle(); 
        });
    }
}