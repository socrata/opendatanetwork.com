
$(document).ready(function() {

    $('.quick-links-more').click(function() {
        
        $('.quick-links-more').hide();
        $('.quick-links-sub-menu li').removeClass('quick-links-hidden');
    });

    $('.quick-links-container').mouseenter(function() {

        $(this).addClass('quick-links-container-selected');
        $(this).children('span').children('i').removeClass('fa-caret-down').addClass('fa-caret-up');
        $(this).children('div').show();
    });

    $('.quick-links-container').mouseleave(function() {

        $(this).removeClass('quick-links-container-selected');
        $(this).children('span').children('i').removeClass('fa-caret-up').addClass('fa-caret-down');
        $(this).children('div').hide();
    });
});