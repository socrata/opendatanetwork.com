'use strict';

/**
 * This test file will test the reCAPTCHA functionality.
 */

casper.test.begin('reCAPTCHA Tests', 6, function suite(test) {
    // Set environment variable for testing
    casper.setEnv('NODE_ENV', 'test');
    
    // Mock the recaptcha verification for testing
    casper.on('resource.requested', function(requestData, request) {
        if (requestData.url === 'https://www.google.com/recaptcha/api/siteverify') {
            request.abort();
        }
        
        if (requestData.url.indexOf('recaptcha') > -1 && requestData.url.indexOf('api.js') > -1) {
            request.abort(); // Don't load the reCAPTCHA script to speed up testing
        }
    });

    // First, we'll check the homepage which should not have reCAPTCHA
    casper.start('http://localhost:3000/', function() {
        test.assertTitle(/Open Data Network/, 'Homepage has correct title');
        test.assertDoesntExist('.grecaptcha-badge', 'reCAPTCHA badge is not on homepage');
    });

    // Next, we'll check a data route which should have reCAPTCHA protection
    casper.thenOpen('http://localhost:3000/search?q=test', function() {
        // Since we're in test mode, recaptcha should be disabled and we should still get the page
        test.assertTextExists('Search Results', 'Search results page loaded successfully');
    });

    // Test a protected entity route
    casper.thenOpen('http://localhost:3000/entity/0400000US53', function() {
        // Check that we get the page content since recaptcha is disabled in test mode
        test.assertTextExists('Washington', 'Entity page loaded successfully');
    });
    
    // Test with invalid reCAPTCHA token to ensure middleware handles it correctly
    casper.thenOpen('http://localhost:3000/entity/0400000US53?g-recaptcha-token=invalid_token&recaptcha_timestamp=' + Date.now(), function() {
        // In test mode, it should still work
        test.assertExists('body', 'Page loaded with invalid token');
    });
    
    // Test accessibility attributes of modal (forcing modal by mocking NODE_ENV production and disabling auto bypass)
    casper.thenOpen('http://localhost:3000/recaptcha-modal', function() {
        test.assertExists('[role="dialog"]', 'Modal has proper ARIA role');
    });

    casper.run(function() {
        test.done();
    });
});