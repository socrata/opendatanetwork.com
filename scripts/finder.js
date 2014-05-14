var _finder = new function() {

    this.yourAnswer = "your answer.";
    this.choices = null;
    this.firstChoiceIndex = 0;
    this.secondChoiceIndex = 0;
    this.thirdChoiceIndex = 0;

    this.init = function(choices) {

        this.choices = choices
        this.showTip();
    };

    this.reset = function() {

        this.firstChoiceIndex = 0;
        this.secondChoiceIndex = 0;

        $('#question-1-link').text(this.yourAnswer) 
        $('#question-2').hide(300);
        $('#question-2-link').text(this.yourAnswer) 
        $('#question-3').hide(300);
        $('#question-3-link').text(this.yourAnswer) 

        this.setActiveCircle(1);
        this.showHideAnswers(false);
    }

    this.showFirstQuestionMenu =  function() {

        // Hide tip
        //
        $('#question-tip').hide(300);

        // Init menu 
        //
        var items = [];

        $.each(this.choices, function(i, item) {
            items.push('<li><a href="javascript:_finder.didMakeFirstChoice(' + i + ');">' + item.title + '</a></li>');
        }); 

        $('#menu').empty().append(items.join('')).show(300);

        // Hide the second and third questions if already open.
        //
        $('#question-2').hide(300);
        $('#question-2-link').text(this.yourAnswer) 

        $('#question-3').hide(300);
        $('#question-3-link').text(this.yourAnswer) 

        this.setActiveCircle(1);
        this.showHideAnswers(false);
    };

    this.showSecondQuestionMenu =  function() {

        // Hide tip
        //
        $('#question-tip').hide(300);

        // Init menu 
        //
        var items = [];

        $.each(this.choices[this.firstChoiceIndex].choices, function(i, item) {
            items.push('<li><a href="javascript:_finder.didMakeSecondChoice(' + i + ');">' + item.title + '</a></li>');
        }); 

        $('#menu').empty().append(items.join('')).show(300);

        // Hide the third questions if already open.
        //
        $('#question-3').hide(300);
        $('#question-3-link').text(this.yourAnswer) 

        this.setActiveCircle(2);
        this.showHideAnswers(false);
    };

    this.showThirdQuestionMenu =  function() {

        // Hide tip
        //
        $('#question-tip').hide(300);

        // Init menu 
        //
        var items = [];

        $.each(this.choices[this.firstChoiceIndex].choices[this.secondChoiceIndex].choices, function(i, item) {
            items.push('<li><a href="javascript:_finder.didMakeThirdChoice(' + i + ');">' + item.title + '</a></li>');
        }); 

        $('#menu').empty().append(items.join('')).show(300);

        this.setActiveCircle(3);
        this.showHideAnswers(false);
    };

    this.didMakeFirstChoice = function(index) {

        this.firstChoiceIndex = index;
        this.secondChoiceIndex = 0;
        this.thirdChoiceIndex = 0;

        var s = this.choices[index].title;
        console.log(s);

        $('#question-1-link').text(s);
 
        $('#question-2').show(300);
        $('#menu').hide(300);

        this.setActiveCircle(2);
        this.showHideAnswers(false);
    };

    this.didMakeSecondChoice = function(index) {

        this.secondChoiceIndex = index;
        this.thirdChoiceIndex = 0;

        var s = this.choices[this.firstChoiceIndex].choices[this.secondChoiceIndex].title;
        console.log(s);

        $('#question-2-link').text(s);
 
        $('#question-3').show(300);
        $('#menu').hide(300);

        this.setActiveCircle(3);
        this.showHideAnswers(false);
    };

    this.didMakeThirdChoice = function(index) {

        this.thirdChoiceIndex = index;

        var s = this.choices[this.firstChoiceIndex].choices[this.secondChoiceIndex].choices[this.thirdChoiceIndex].title;
        console.log(s);

        $('#question-3-link').text(s);
        $('#menu').hide(300);

        // Show results
        //
        var items = [];

        console.log(this.choices[this.firstChoiceIndex].choices[this.secondChoiceIndex].choices[this.thirdChoiceIndex].choices);

        $.each(
            this.choices[this.firstChoiceIndex].choices[this.secondChoiceIndex].choices[this.thirdChoiceIndex].choices, 
            function(i, item) {
                items.push('<li><a href="' + item.url + '" target="_blank"><div class="answers-container">' +
                    '<img class="answers-result-image" src="' + (item.image || '/images/articles-placeholder.png') + '">' + 
                    '<div class="answers-result-text">' + 
                    item.title + 
                    '</div></div></a></li>');
            }); 

        items.push('<li><a href="javascript:_finder.reset()"><div class="answers-container">' +
            '<img id="answers-start-over-image" src="/images/finder-start-over.png">' +
            '<div class="answers-start-over-text">Start Over</div></div></a></li>');

        $('#answers-list').empty().append(items.join('')).show(300);

        this.showHideAnswers(true);
    };

    this.showHideAnswers = function(show) {

        if (show)
        {
            $('#answers').show(300, function() {
                $('#supplemental').show();
            });
        }
        else
        {
            $('#answers').hide(300);
            $('#supplemental').hide();
        }
    };

    this.setActiveCircle = function(index) {

        switch (index)
        {
            case 1: 
                $('#circle-1').addClass('circle-active');
                $('#circle-2').removeClass('circle-active');
                $('#circle-3').removeClass('circle-active');
                break;

            case 2:
                $('#circle-1').removeClass('circle-active');
                $('#circle-2').addClass('circle-active');
                $('#circle-3').removeClass('circle-active');
                break;

            case 3:
                $('#circle-1').removeClass('circle-active');
                $('#circle-2').removeClass('circle-active');
                $('#circle-3').addClass('circle-active');
                break;
        }
    }

    this.showTip =  function() {

        var viewPortWidth = $(window).width();
        var tipWidth = $('#question-tip').width();
        var posLeft;

        if (viewPortWidth > 768)
        {
            var linkPosition = $('#question-1-link').offset(); 
            var linkWidth = $('#question-1-link').width();
            
            posLeft = linkPosition.left + ((linkWidth - tipWidth) / 2);
        }
        else 
        {
            posLeft = (viewPortWidth - tipWidth) / 2;
        }

        $('#question-tip').css({ left: posLeft });
        $('#question-tip').show(300);
    };

};

$(document).ready(function() {
    $.ajax({
        url: "/data/finder-choices.json",
        dataType: "text",
        success: function(data) {
            _finder.init($.parseJSON(data));
        }
    });
});
