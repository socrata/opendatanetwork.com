var casper = require('casper').create();

/**
 * Tests if the captcha modal appears on specified pages
 * and if it can be bypassed to access data
 */
module.exports = function(test, scenario) {
    // Test if captcha shows up
    test.assertExists('#captcha-modal', 'Captcha modal is present');
    test.assertVisible('#captcha-modal', 'Captcha modal is visible');
    
    // Test modal visual elements
    test.assertExists('#captcha-modal .captcha-title', 'Captcha title is present');
    test.assertExists('#captcha-modal .captcha-challenge', 'Captcha challenge is present');
    test.assertExists('#captcha-modal .captcha-input', 'Captcha input field is present');
    test.assertExists('#captcha-modal .captcha-submit', 'Captcha submit button is present');
    test.assertExists('#captcha-modal .captcha-close', 'Captcha close button is present');
    test.assertExists('#captcha-modal .captcha-audio-btn', 'Captcha audio button is present');
    test.assertExists('#captcha-modal .captcha-error', 'Captcha error messaging area is present');
    test.assertExists('#captcha-modal .captcha-loading', 'Captcha loading indicator is present');
    
    // Test ARIA attributes
    test.assertExists('#captcha-modal[role="dialog"]', 'Captcha has dialog role');
    test.assertExists('#captcha-modal[aria-labelledby="captcha-title"]', 'Captcha has aria-labelledby');
    test.assertExists('#captcha-modal[aria-describedby="captcha-description"]', 'Captcha has aria-describedby');
    
    // Get the correct answer from the challenge
    var captchaQuestion = casper.evaluate(function() {
        return document.getElementById('captcha-challenge').textContent;
    });
    
    // Parse and solve the challenge
    var correctAnswer = solveCaptchaChallenge(captchaQuestion);
    
    // Test successful captcha completion
    casper.fill('#captcha-form', {
        'captcha-input': correctAnswer
    }, false);
    
    casper.click('#captcha-modal .captcha-submit');
    
    // Validate loading indicator appears
    casper.waitForSelector('#captcha-loading[style*="display: block"]', function() {
        test.pass('Loading indicator displayed after submission');
    }, function() {
        test.fail('Loading indicator did not appear');
    }, 1000);
    
    // Validate captcha is gone after successful submission
    casper.waitWhileVisible('#captcha-modal', function() {
        test.pass('Captcha modal disappeared after successful completion');
        
        // Run the provided scenario callback if one was provided
        if (typeof scenario === 'function') {
            scenario();
        }
    }, function() {
        test.fail('Captcha modal did not disappear after submission');
    }, 5000);
    
    // Test close button functionality in a separate test
    casper.thenOpen(casper.getCurrentUrl(), function() {
        // Wait for captcha to appear again
        casper.waitForSelector('#captcha-modal[style*="display: flex"]', function() {
            test.pass('Captcha reappeared for close button test');
            
            // Click the close button
            casper.click('#captcha-modal .captcha-close');
            
            // Verify modal closes
            casper.waitWhileVisible('#captcha-modal', function() {
                test.pass('Captcha modal closed when clicking close button');
            }, function() {
                test.fail('Captcha modal did not close when clicking close button');
            }, 2000);
        });
    });
};

/**
 * Solve the captcha challenge based on the question text
 */
function solveCaptchaChallenge(question) {
    var answer;
    
    // Handle addition questions
    var addMatch = question.match(/What is (\d+) \+ (\d+)\?/);
    if (addMatch) {
        answer = parseInt(addMatch[1]) + parseInt(addMatch[2]);
        return answer.toString();
    }
    
    // Handle subtraction questions
    var subMatch = question.match(/What is (\d+) - (\d+)\?/);
    if (subMatch) {
        answer = parseInt(subMatch[1]) - parseInt(subMatch[2]);
        return answer.toString();
    }
    
    // Handle multiplication questions
    var multMatch = question.match(/What is (\d+) × (\d+)\?/);
    if (multMatch) {
        answer = parseInt(multMatch[1]) * parseInt(multMatch[2]);
        return answer.toString();
    }
    
    // Handle sequence questions
    var seqMatch = question.match(/What is the next number: (\d+), (\d+), (\d+)/);
    if (seqMatch) {
        var a = parseInt(seqMatch[1]);
        var b = parseInt(seqMatch[2]);
        var c = parseInt(seqMatch[3]);
        var step = b - a;
        answer = c + step;
        return answer.toString();
    }
    
    // Default to an empty string if we can't parse the question
    return "";
}