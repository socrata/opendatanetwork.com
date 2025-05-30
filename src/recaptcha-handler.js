'use strict';

/**
 * reCAPTCHA handler for the search form
 */

if (typeof window !== 'undefined' && window.jQuery) {
    $(document).ready(function() {
        // For visible reCAPTCHA, we don't need to handle form submission
        // The callback will be triggered when user completes the challenge
        
        // Global callback for reCAPTCHA success
        window.onRecaptchaSubmit = function(token) {
            // Find the search form and submit it
            const form = $('.search-bar-form')[0];
            if (form) {
                // The token is already added by reCAPTCHA widget
                form.submit();
            }
        };
        
        // Add reCAPTCHA token to AJAX requests
        if (typeof window.XMLHttpRequest !== 'undefined') {
            const originalOpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function(method, url) {
                this._url = url;
                this._method = method;
                return originalOpen.apply(this, arguments);
            };
            
            const originalSend = XMLHttpRequest.prototype.send;
            XMLHttpRequest.prototype.send = function(data) {
                // Only add reCAPTCHA to API calls
                if (this._url && this._url.startsWith('/api/')) {
                    const self = this;
                    
                    if (typeof grecaptcha !== 'undefined' && window.recaptchaSiteKey) {
                        grecaptcha.ready(function() {
                            grecaptcha.execute(window.recaptchaSiteKey, {action: 'api_request'})
                                .then(function(token) {
                                    // Add token to request headers
                                    self.setRequestHeader('X-Recaptcha-Response', token);
                                    originalSend.call(self, data);
                                })
                                .catch(function() {
                                    // Continue without token on error
                                    originalSend.call(self, data);
                                });
                        });
                        return;
                    }
                }
                
                return originalSend.call(this, data);
            };
        }
    });
}