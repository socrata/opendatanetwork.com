
class HomePageController {

    constructor() {

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

