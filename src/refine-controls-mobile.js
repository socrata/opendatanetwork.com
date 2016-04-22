
class RefineControlsMobile {
    
    constructor() {

        const mobileSubMenus = [
            '#data-source-menu-list-item-sources-mobile',
            '#data-source-menu-list-item-vectors-mobile',
            '#data-source-menu-list-item-metrics-mobile',
            '#data-source-menu-list-item-years-mobile',
        ];

        $('.refine-results-link-mobile').click(function(){

            $(this).slideUp();
            $('.refine-popup-mobile').slideDown();
        });

        $('.refine-go-to-results-mobile').click(function(){
            
            $('.refine-results-link-mobile').slideDown();
            $('.refine-popup-mobile').slideUp();
        });

        $('.data-source-menu-header-mobile').click(function() {

            const selectedMenu = '#' + $(this).parent().parent().attr('id');
            const menusToClose = _.filter(mobileSubMenus, s => s != selectedMenu);
            const menuToToggle = $(selectedMenu + '>ul');

            // Close others
            //
            const carets = menusToClose.map(s => (s + ' .data-source-menu-header-caret-mobile'));
            $(carets.join(', ')).removeClass('fa-caret-up').addClass('fa-caret-down');
            
            const subLists = menusToClose.map(s => (s + '>ul')); 
            $(subLists.join(', ')).slideUp();

            // Open selected
            //
            if ($(selectedMenu + '>ul').is(':visible'))
                $(this).find('.data-source-menu-header-caret-mobile').removeClass('fa-caret-up').addClass('fa-caret-down');
            else
                $(this).find('.data-source-menu-header-caret-mobile').removeClass('fa-caret-down').addClass('fa-caret-up');

            $(menuToToggle).slideToggle(); 
        });
    }
}