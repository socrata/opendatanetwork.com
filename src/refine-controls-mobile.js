
class RefineControlsMobile {
    
    constructor() {

        this.self = this;

        self.mobileSubMenus = [
            '.data-source-menu-list-item-groups-mobile',
            '.data-source-menu-list-item-sources-mobile',
            '.map-variable-container',
            '.map-variable-year-container',
        ];

        $('.refine-results-link-mobile').click(function() {

            $(this).slideUp();
            $('.refine-popup-mobile').slideDown();
        });

        $('.refine-go-to-results-mobile').click(function() {
            
            $('.refine-results-link-mobile').slideDown();
            $('.refine-popup-mobile').slideUp();
        });
        
        this.bindHeaderClickEvents();
    }

    bindHeaderClickEvents() {

        $('.data-source-menu-header-mobile').unbind('click');
        $('.data-source-menu-header-mobile').click(function() {

            const selectedMenu = '.' + $(this).parent().attr('class');
            const menusToClose = _.filter(self.mobileSubMenus, s => s != selectedMenu);
            const menuToToggle = $(selectedMenu + '>ul');

            // Close others
            //
            const carets = menusToClose.map(s => (s + ' .odn-caret'));
            $(carets.join(', ')).removeClass('fa-caret-up').addClass('fa-caret-down');

            const subLists = menusToClose.map(s => (s + '>ul')); 
            $(subLists.join(', ')).slideUp();

            // Open selected
            //
            if ($(selectedMenu + '>ul').is(':visible'))
                $(this).find('.odn-caret').removeClass('fa-caret-up').addClass('fa-caret-down');
            else
                $(this).find('.odn-caret').removeClass('fa-caret-down').addClass('fa-caret-up');

            $(menuToToggle).slideToggle(); 
        });
    }
}