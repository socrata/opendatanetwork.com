
function attachMobileMenuHandlers(prefix) {
    prefix = prefix || '';

    const $refineLink = $(`.${prefix}refine-results-link-mobile`);
    const $refineLinkContainer = $(`.${prefix}refine-results-link-container-mobile`);
    const $refinePopup = $(`.${prefix}refine-popup-mobile`);
    const $refinePopupClose = $(`#${prefix}refine-close-mobile`);

    function toggle() {
        $toggle($refineLinkContainer);
        $toggle($refinePopup);
    }

    $refineLink.click(toggle);
    $refinePopupClose.click(toggle);

    d3.selectAll('.refine-menu-header-mobile, .question-list-header-mobile').on('click', function() {
        $toggle($(this.nextElementSibling));
    });
}

function $toggle($selection) {
    $selection.slideToggle();
}

