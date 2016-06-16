
class HomePageController {

    constructor() {

        // Sample questions appearing in the textbox
        //
        this.samples = [
            'Alameda County Sheriff Crime Reports',
            'Baltimore City Employee Salaries FY2015',
            'Finance',
            'Public Safety',
            'Crime',
            'Health',
            'Seattle, WA',
            'San Francisco, CA',
            'New York, NY',
            'Miami, FL',
            'What is the population rate of change of Detroit, MI?',
            'What is the population of Boston, MA?',
            'What is the college graduation rate of Seattle?',
            'What is the high school graduation rate in Washington?',
            'What is the GDP per capita of New York Metro Area (NY-NJ-PA)?',
            'What is the annual change in GDP of San Francisco Metro Area (CA)?',
            'What is the overall cost of living of Los Angeles Metro Area (CA)?',
            'What is the median earnings of New York?',
            'What is the median female earnings of Dallas, TX?',
            'What is the median male earnings of 90210?',
            'What is the mean jobs proximity index of King County, WA?',
            'What is the adult obesity rate of Suffolk County, MA?',
            'What is the physical inactivity rate of Marin County, CA?',
            'What is the computers and math employment rate of Palo Alto, CA?',
            'What is the engineering employment rate of Portland, OR?'];

        this.sampleIndex = this.getRandomSampleIndex(this.samples.length);
        this.sampleCharacterIndex = 0;
        this.beginSampleQuestions();

        // Questions section
        //
        $('.questions-dropdown').click(() => {

            if ($('.questions-list-container').is(':visible'))
                $('.questions-dropdown .fa').removeClass('fa-caret-up').addClass('fa-caret-down');
            else
                $('.questions-dropdown .fa').removeClass('fa-caret-down').addClass('fa-caret-up');

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
        $('.categories-dropdown-mobile').click(() => {

            if ($('.categories-list-mobile').is(':visible'))
                $('.categories-dropdown-mobile .fa').removeClass('fa-caret-up').addClass('fa-caret-down');
            else
                $('.categories-dropdown-mobile .fa').removeClass('fa-caret-down').addClass('fa-caret-up');

            $('.categories-list-mobile').slideToggle();
        });

        // Mobile regions
        //
        $('.state-expand-mobile').click(function() {

            const regionId = $(this).attr('region-id');

            if ($('.sub-regions-container-' + regionId + '-mobile').is(':visible'))
                $(this).removeClass('fa-minus').addClass('fa-plus');
            else
                $(this).removeClass('fa-plus').addClass('fa-minus');

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

        // Autocomplete
        //
        const headerAutoSuggest = multiComplete('#q', '.region-list');
        headerAutoSuggest.listen();

        const heroAutoSuggest = multiComplete('.home-search-bar-controls #q', '.home-search-bar-controls .region-list');
        heroAutoSuggest.listen();

        // QuickLinks
        //
        const quickLinks = new QuickLinks();

        quickLinks.onShow = () => {
            headerAutoSuggest.results.hide();
            heroAutoSuggest.results.hide();
        };

        // Search button
        //
        $('#search-button').click(() => {
            window.location.href = '/search?q=' + encodeURIComponent($('#q').val());
        });

        // Locations by state
        //
        $('.more-subregions-link').click(function() {

            $(this).parent().removeClass('state-collapsed');
            $(this).hide();
        });

        $('.more-regions-link').click(function() {

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
        $('.home-search-bar-controls [name="q"]').attr('placeholder', placeholder);

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

