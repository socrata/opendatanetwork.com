
class QuestionsMobile {

    constructor() {

        $('.question-list-header-mobile').click(function() {

            if ($('.questions-mobile ul').is(':visible'))
                $(this).find('.odn-caret').removeClass('fa-caret-up').addClass('fa-caret-down');
            else
                $(this).find('.odn-caret').removeClass('fa-caret-down').addClass('fa-caret-up');

            $('.questions-mobile ul').slideToggle();
        });
    }
}
