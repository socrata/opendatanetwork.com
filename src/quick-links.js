
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
        $('.quick-links-menu-header-mobile').click(function (event) {
            event.preventDefault();
            event.stopPropagation();

            const selectedMenu = '#' + $(this).parent().attr('id');
            const menusToClose = _.filter(mobileSubMenus, s => s != selectedMenu);
            const menuToToggle = $(selectedMenu + '>ul');

            // Close others
            //
            const carets = menusToClose.map(s => (s + ' .quick-links-expand-caret-mobile'));
            $(carets.join(', ')).removeClass('fa-caret-up').addClass('fa-caret-down');

            const subLists = menusToClose.map(s => (s + '>ul'));
            $(subLists.join(', ')).slideUp();

            // Open selected
            //
            if ($(selectedMenu + '>ul').is(':visible')) {
                $(this).attr('aria-expanded', 'false');
                $(this).find('.quick-links-expand-caret-mobile').removeClass('fa-caret-up').addClass('fa-caret-down');
            } else {
                $(this).attr('aria-expanded', 'true');
                $(this).find('.quick-links-expand-caret-mobile').removeClass('fa-caret-down').addClass('fa-caret-up');
            }

            $(menuToToggle).slideToggle();
        });

        // Desktop
        //
        $('.quick-links-more').click(function (event) {
            event.preventDefault();
            $('.quick-links-more').hide();
            $('.quick-links-sub-menu li').removeClass('quick-links-hidden');
        });

        // Mobile
        //
        $('header .quick-links-container').on('click', '.quick-links-button-narrow', function (event) {
            event.preventDefault();

            var $this = $(this),
            $quickLinksContainer = $this.parent('.quick-links-container');

            if (self.onShow) self.onShow();

            if ($this.hasClass('active')) {
                $this.removeClass('active');
                $this.attr('aria-expanded', 'false');

                $quickLinksContainer.removeClass('quick-links-container-selected');
                $quickLinksContainer.children('.quick-links-menu-container-mobile').hide();

                // Collapse all sub lists
                //
                const carets = mobileSubMenus.map(s => (s + ' .quick-links-expand-caret-mobile'));
                $(carets.join(', ')).removeClass('fa-caret-up').addClass('fa-caret-down');

                const subLists = mobileSubMenus.map(s => (s + ' .quick-links-menu-sub-list-mobile'));
                $(subLists.join(', ')).hide();
            } else {
                if (self.onShow) self.onShow();

                $this.addClass('active');
                $this.attr('aria-expanded', 'true');

                $quickLinksContainer.addClass('quick-links-container-selected');
                $quickLinksContainer.children('.quick-links-menu-container-mobile').show();
            }
        });

        // Desktop
        //
        $('.home-search-bar-controls').on('click', '.quick-links-button-wide', function (event) {
            event.preventDefault();

            var $this = $(this),
                $quickLinksContainer = $this.parent('.quick-links-container');

            if ($this.hasClass('active')) {
                $this.removeClass('active');
                $this.attr('aria-expanded', 'false');
                $quickLinksContainer.removeClass('quick-links-container-selected');
                $quickLinksContainer.children('.quick-links-button-wide').children('i').removeClass('fa-caret-up').addClass('fa-caret-down');
                $quickLinksContainer.children('.quick-links-menu-container').hide();
                $quickLinksContainer.children('.quick-links-menu-container-mobile').hide();
            } else {
                if (self.onShow) self.onShow();

                $this.addClass('active');
                $this.attr('aria-expanded', 'true');
                $quickLinksContainer.addClass('quick-links-container-selected');
                $quickLinksContainer.children('.quick-links-button-wide').children('i').removeClass('fa-caret-down').addClass('fa-caret-up');
                $quickLinksContainer.children('.quick-links-menu-container').show();
                $quickLinksContainer.children('.quick-links-menu-container-mobile').show();
            }
        });

        // Hiding quick links pop when click outside
        //
        $(document).on('click touch', function (event) {
          if (!$(event.target).parents().addBack().is('.quick-links-container')) {
            $('.home-search-bar-controls .quick-links-button-wide.active').click();
          }
        });
    }
}
