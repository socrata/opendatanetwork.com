'use strict';

class HomePageController {

    constructor() {

        // Sample questions appearing in the textbox
        //
        this.samples = [
            'What is the population rate of change of St. Louis Metro Area (MO-IL)?',
            'What is the college graduation rate of Wayne County, MI?',
            'What is the business and finance employment rate of King County, WA?',
            'What is the median earnings of Marion County, IN?',
            'What is the food service employment rate of Chicago, IL?',
            'What is the mean jobs proximity index of Fairfax County, VA?',
            'What is the population count of Las Vegas, NV?',
            'What is the computers and math employment rate of Manchester, NH?',
            'What is the annual change in gdp of Washington Metro Area (DC-VA-MD-WV)?',
            'What is the farming, fishing, foresty employment rate of Anchorage, AK?',
            'median jobs proximity index',
            'environmental health hazard index',
            'median female earnings',
            'high school graduation rate',
            'construction and extraction employment rate',
            'college graduation rate',
            'population count',
            'business and finance employment rate',
            'median male earnings',
            'median earnings',
            'median jobs proximity index Douglas County, NE',
            'median male earnings Harris County, TX',
            'median earnings Seattle?',
            'physical inactivity rate Cuyahoga County, OH',
            'population count Charlotte Metro Area',
            'fire fighting employment rate Des Moines, IA',
            'construction and extraction employment rate Albuquerque',
            'education employment rate Boston, MA',
            'engineering employment rate Jackson, MS?',
            'population count Kings County, NY?',
            'Alameda County Sheriff Crime Reports',
            'Baltimore City Employee Salaries FY2015',
            'Finance',
            'Public Safety',
            'Crime',
            'Health',
            'Seattle, WA',
            'San Francisco, CA',
            'New York, NY',
            'Miami, FL'];

        this.sampleIndex = this.getRandomSampleIndex(this.samples.length);
        this.sampleCharacterIndex = 0;
        this.beginSampleQuestions();

        // API boxes
        //
        $('.small-api-link').click(function (event) {
            event.preventDefault();
            var $infobox = $(this).parent().parent().find('.api-info-box');
            $infobox.toggleClass('open').slideToggle();
            $(this).attr('aria-expanded', $infobox.hasClass('open'));
        });

        $('.api-info-box .fa-close').click(function (event) {
            event.preventDefault();
            $(this).parent().parent().find('.api-info-box').slideUp();
        });

        // Search link
        //
        $('.home-search-bar-controls .search-link').click(() => {

            var text = $('.home-search-bar-controls .search-bar-input').val().trim();

            if (text.length === 0)
                $('.home-search-bar-controls .search-bar-input').focus();
            else
                $('.home-search-bar-controls .search-bar-form').submit();
        });

        // Questions section
        //
        $('.questions-dropdown').click((event) => {
            event.preventDefault();
            if ($('.questions-list-container').is(':visible')) {
                $('.questions-dropdown').attr('aria-expanded', false)
                                        .find('.fa').removeClass('fa-caret-up')
                                        .addClass('fa-caret-down');
            } else {
                $('.questions-dropdown').attr('aria-expanded', true)
                                        .find('.fa').removeClass('fa-caret-down')
                                        .addClass('fa-caret-up');
            }

            $('.questions-list-container').slideToggle();
        });

        $('.more-questions-link').click(() => {

            if ($('.more-questions-link').text() == 'Show More') {
                $('.questions-section li.hidable').removeClass('hidden');
                $('.more-questions-link').text('Show Fewer');
            }
            else {
                $('.questions-section li.hidable').addClass('hidden');
                $('.more-questions-link').text('Show More');
            }
        });

        // Mobile categories
        //
        $('.categories-dropdown-mobile').click((event) => {
            event.preventDefault();
            if ($('.categories-list-mobile').is(':visible')) {
                $('.categories-dropdown-mobile').attr('aria-expanded', false)
                                                .find('.fa').removeClass('fa-caret-up')
                                                .addClass('fa-caret-down');
            } else {
                $('.categories-dropdown-mobile').attr('aria-expanded', true)
                                                .find('.fa').removeClass('fa-caret-down')
                                                .addClass('fa-caret-up');
            }

            $('.categories-list-mobile').slideToggle();
        });

        // Mobile regions
        //
        $('.state-expand-mobile').click(function(event) {
            event.preventDefault();
            const regionId = $(this).attr('region-id');

            if ($('.sub-regions-container-' + regionId + '-mobile').is(':visible')) {
                $(this).attr('aria-expanded', false)
                       .find('.fa').removeClass('fa-minus')
                       .addClass('fa-plus');

            } else {
                $(this).attr('aria-expanded', true)
                       .find('.fa').removeClass('fa-plus')
                       .addClass('fa-minus');
            }

            $('.sub-regions-container-' + regionId + '-mobile').slideToggle();
        });

        // Slider
        //
        $('.slider').slick({
            arrows: false,
            autoplay: true,
            autoplaySpeed: 2000,
            slidesToScroll: 1,
            slidesToShow: 5,
        });

        // Autosuggest
        //
        const headerAutoSuggest = new Autosuggest('.region-list');
        headerAutoSuggest.listen('.search-bar-input');

        const heroAutoSuggest = new Autosuggest('.home-search-bar-controls .region-list');
        heroAutoSuggest.listen('.home-search-bar-controls .search-bar-input');

        // Search button
        //
        $('#search-button').click(() => {
            window.location.href = '/search?q=' + encodeURIComponent($('.search-bar-input').val());
        });

        // Locations by state
        //
        $('.more-subregions-link').click(function (event) {
            event.preventDefault();
            $(this).parent().removeClass('state-collapsed');
            $(this).hide();
        });

        $('.more-regions-link').click(function (event) {
            event.preventDefault();
            $('.states-list').removeClass('states-list-collapsed');
            $(this).hide();
        });
    }

    beginSampleQuestions() {

        window.setTimeout(this.printNextSampleQuestionCharacter, this.getRandomInt(), this);
    }

    printNextSampleQuestionCharacter(self) {

        var sample = self.samples[self.sampleIndex];

        if (self.sampleCharacterIndex > sample.length) {

            self.sampleCharacterIndex = 0;
            var previousSampleIndex = self.sampleIndex;

            while (self.sampleIndex == previousSampleIndex) {
                self.sampleIndex = self.getRandomSampleIndex(self.samples.length);
            }

            window.setTimeout(self.printNextSampleQuestionCharacter, 1200, self);
            return;
        }

        const placeholder = sample.substring(0, self.sampleCharacterIndex);
        $('.home-search-bar-controls [name="q"], .home-search-bar .search-bar-input').attr('placeholder', placeholder);
        $('.home-search-bar-controls label, .home-search-bar .search-bar-label').attr('aria-label', 'Search Open Data Network');

        window.setTimeout(self.printNextSampleQuestionCharacter, self.getRandomInt(), self);
        self.sampleCharacterIndex++;
    }

    getRandomSampleIndex(max) {
        return Math.floor(Math.random() * max);
    }

    getRandomInt() {
        const max = 150;
        const min = 50;
        return Math.floor(Math.random() * (max - min)) + min;
    }
}

