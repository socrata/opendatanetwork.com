'use strict';

/**
 * reCAPTCHA integration for preventing bots from scraping data
 * Uses Google's reCAPTCHA v2 for more reliable bot detection
 */
(function() {
    // DOM elements - will be initialized when document is ready
    let captchaModal;
    let captchaClose;
    let recaptchaContainer;
    let captchaLoading;
    
    // reCAPTCHA related variables
    let recaptchaWidget;
    
    // Get reCAPTCHA site key from environment variable or use demo key as fallback
    const RECAPTCHA_SITE_KEY = (typeof window !== 'undefined' && 
                               window.GlobalConfig && 
                               window.GlobalConfig.recaptcha && 
                               window.GlobalConfig.recaptcha.site_key) 
                               ? window.GlobalConfig.recaptcha.site_key 
                               : '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Demo key
    
    // Flag to track initialization status
    let isInitialized = false;
    
    /**
     * Initialize captcha elements once DOM is ready
     * @returns {boolean} Whether initialization was successful
     */
    function initCaptchaElements() {
        if (isInitialized) return true;
        
        try {
            captchaModal = document.getElementById('captcha-modal');
            if (!captchaModal) {
                console.error('Captcha modal element not found. Verify _captcha-modal.ejs is included in the page.');
                return false;
            }
            
            // Get modal elements
            recaptchaContainer = document.getElementById('recaptcha-container');
            captchaClose = document.getElementById('captcha-close');
            captchaLoading = document.getElementById('captcha-loading');
            
            // Set up event listeners
            if (captchaClose) {
                captchaClose.addEventListener('click', closeCaptcha);
            }
            
            // Wait for reCAPTCHA API to load
            waitForRecaptchaAPI();
            
            isInitialized = true;
            console.log('reCAPTCHA integration initialized successfully');
            return true;
        } catch (e) {
            console.error('Failed to initialize reCAPTCHA system:', e);
            return false;
        }
    }
    
    /**
     * Wait for Google reCAPTCHA API to load
     */
    function waitForRecaptchaAPI() {
        if (typeof window.grecaptcha === 'undefined') {
            setTimeout(waitForRecaptchaAPI, 100);
        } else {
            console.log('reCAPTCHA API loaded');
            // Add global callback for reCAPTCHA
            window.onRecaptchaSuccess = handleRecaptchaSuccess;
            window.onRecaptchaExpired = handleRecaptchaExpired;
            window.onRecaptchaError = handleRecaptchaError;
        }
    }
    
    // Track captcha request state
    const CaptchaRequest = function() {
        this.destination = null;
        this.callback = null;
        this.triggerElement = null;
        this.token = '';
    };
    
    // Current captcha request
    let currentRequest = null;
    
    // Queue for multiple captcha requests
    const captchaQueue = [];
    let isProcessingCaptcha = false;
    
    /**
     * reCAPTCHA callbacks
     */
    
    /**
     * Handle successful reCAPTCHA verification
     * @param {string} token - The reCAPTCHA response token
     */
    function handleRecaptchaSuccess(token) {
        if (!currentRequest) {
            console.warn('reCAPTCHA succeeded but no current request found');
            return;
        }
        
        // Store the token
        currentRequest.token = token;
        
        // Show loading indicator
        if (captchaLoading) {
            captchaLoading.style.display = 'block';
        }
        
        // Set the verification cookie - valid for 30 minutes
        setCookie('odn_captcha_verified', token, 30);
        
        // Small delay to show loading indicator
        setTimeout(() => {
            // Hide the modal
            closeCaptcha();
            
            // Navigate to destination or execute callback
            if (currentRequest.destination) {
                window.location.href = currentRequest.destination;
            } else if (currentRequest.callback && typeof currentRequest.callback === 'function') {
                try {
                    currentRequest.callback(token);
                } catch (e) {
                    console.error('Error executing captcha callback:', e);
                }
            }
            
            // Reset loading state
            if (captchaLoading) {
                captchaLoading.style.display = 'none';
            }
        }, 500);
    }
    
    /**
     * Handle expired reCAPTCHA
     */
    function handleRecaptchaExpired() {
        if (recaptchaWidget !== null && typeof grecaptcha !== 'undefined') {
            grecaptcha.reset(recaptchaWidget);
        }
    }
    
    /**
     * Handle reCAPTCHA error
     */
    function handleRecaptchaError() {
        console.error('reCAPTCHA error occurred');
        // Reset the captcha
        if (recaptchaWidget !== null && typeof grecaptcha !== 'undefined') {
            grecaptcha.reset(recaptchaWidget);
        }
    }
    
    /**
     * Show the reCAPTCHA challenge
     */
    function renderRecaptcha() {
        // The reCAPTCHA widget is now rendered automatically using data-sitekey attribute
        // We need to set up the callbacks
        try {
            if (typeof window.grecaptcha === 'undefined') {
                console.log('reCAPTCHA API not loaded yet - will be handled automatically when loaded');
                return;
            }
            
            // Set up callbacks for the reCAPTCHA
            window.onRecaptchaSuccess = handleRecaptchaSuccess;
            window.onRecaptchaExpired = handleRecaptchaExpired;
            window.onRecaptchaError = handleRecaptchaError;
            
            // Reset if needed
            if (recaptchaWidget !== undefined && typeof window.grecaptcha.reset === 'function') {
                window.grecaptcha.reset();
            }
        } catch (e) {
            console.error('Error with reCAPTCHA:', e);
        }
    }
    
    /**
     * Set a cookie with expiration
     * @param {string} name - Cookie name
     * @param {string} value - Cookie value
     * @param {number} minutes - Expiration time in minutes
     */
    function setCookie(name, value, minutes) {
        let expires = '';
        if (minutes) {
            const date = new Date();
            date.setTime(date.getTime() + (minutes * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + (value || '') + expires + '; path=/';
    }
    
    /**
     * Get a cookie by name
     * @param {string} name - Cookie name
     * @returns {string|null} Cookie value or null if not found
     */
    function getCookie(name) {
        const nameEQ = name + '=';
        const ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
    
    /**
     * Show the captcha modal
     * @param {string|Function} destination - URL to navigate to or callback to execute after success
     */
    function showCaptcha(destination) {
        try {
            // Initialize elements if not already done
            if (!isInitialized && !initCaptchaElements()) {
                console.warn('Captcha system not initialized. Proceeding without verification.');
                // Fall back to direct execution/navigation if captcha can't be shown
                if (typeof destination === 'function') {
                    destination();
                } else if (typeof destination === 'string') {
                    window.location.href = destination;
                }
                return;
            }
            
            // Check if user has recently passed a captcha
            if (getCookie('odn_captcha_verified')) {
                // Skip captcha if verified within the last 30 minutes
                if (typeof destination === 'function') {
                    try {
                        destination();
                    } catch (e) {
                        console.error('Error executing captcha callback:', e);
                    }
                } else if (typeof destination === 'string') {
                    window.location.href = destination;
                }
                return;
            }
            
            const captchaRequest = {
                destination: destination,
                triggerElement: document.activeElement
            };
            
            // Add to queue
            captchaQueue.push(captchaRequest);
            
            // Process if not already processing
            if (!isProcessingCaptcha) {
                processNextCaptcha();
            }
        } catch (e) {
            console.error('Error showing captcha:', e);
            // Fall back to direct execution/navigation on error
            if (typeof destination === 'function') {
                try {
                    destination();
                } catch (err) {
                    console.error('Error executing captcha fallback callback:', err);
                }
            } else if (typeof destination === 'string') {
                window.location.href = destination;
            }
        }
    }
    
    /**
     * Process the next captcha in queue
     */
    function processNextCaptcha() {
        if (captchaQueue.length === 0) {
            isProcessingCaptcha = false;
            return;
        }
        
        isProcessingCaptcha = true;
        const request = captchaQueue.shift();
        
        // Create a new request object
        currentRequest = new CaptchaRequest();
        
        // Store the destination and trigger element
        if (typeof request.destination === 'function') {
            currentRequest.callback = request.destination;
        } else {
            currentRequest.destination = request.destination;
        }
        
        currentRequest.triggerElement = request.triggerElement;
        
        // Hide loading indicator
        if (captchaLoading) {
            captchaLoading.style.display = 'none';
        }
        
        // Show the modal
        captchaModal.style.display = 'flex';
        
        // Announce the modal for screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'assertive');
        announcement.setAttribute('class', 'sr-only');
        announcement.textContent = 'Verification required. Please complete the captcha to continue.';
        document.body.appendChild(announcement);
        
        // Render the reCAPTCHA
        renderRecaptcha();
        
        // Set focus after a small delay (for screen readers)
        setTimeout(() => {
            // Try to focus on the first focusable element in the modal
            const firstFocusable = captchaModal.querySelector('button, [href], input, iframe, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
            
            // Remove the announcement after it's been read
            document.body.removeChild(announcement);
        }, 1000);
        
        // Trap focus in modal
        trapFocus();
    }
    
    /**
     * Trap keyboard focus inside the modal
     */
    function trapFocus() {
        // List of all focusable elements in the modal
        const focusableElements = captchaModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        // Handle tab key 
        captchaModal.addEventListener('keydown', function(e) {
            if (e.key === 'Tab' || e.keyCode === 9) {
                // If shift + tab and on first element, go to last
                if (e.shiftKey && document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                } 
                // If tab and on last element, go to first
                else if (!e.shiftKey && document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
            
            // Close on escape
            if (e.key === 'Escape' || e.keyCode === 27) {
                closeCaptcha();
            }
        });
    }
    
    /**
     * Close the captcha modal
     */
    function closeCaptcha() {
        captchaModal.style.display = 'none';
        
        // Return focus to the trigger element
        if (currentRequest && currentRequest.triggerElement) {
            currentRequest.triggerElement.focus();
        }
        
        // Process next captcha if any
        if (captchaQueue.length > 0) {
            processNextCaptcha();
        } else {
            isProcessingCaptcha = false;
        }
    }
    
    // Initialize on document ready
    function initOnDOMReady() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initCaptchaElements);
        } else {
            // DOMContentLoaded already fired
            initCaptchaElements();
        }
    }
    
    // Initialize immediately if possible, otherwise wait for document ready
    initOnDOMReady();
    
    // Try again after a delay in case the modal is added to the DOM later
    setTimeout(initCaptchaElements, 1000);
    
    // Expose functions to global scope - with error handling
    window.ODNCaptcha = {
        show: function(destination) {
            // Double-check initialization before showing
            if (!isInitialized) {
                initCaptchaElements();
            }
            showCaptcha(destination);
        },
        close: function() {
            if (isInitialized) {
                closeCaptcha();
            }
        },
        // Add debug method for troubleshooting
        debug: function() {
            console.log('Captcha initialized:', isInitialized);
            console.log('Captcha modal found:', !!document.getElementById('captcha-modal'));
            return {
                isInitialized: isInitialized,
                modalExists: !!document.getElementById('captcha-modal'),
                cookieExists: !!getCookie('odn_captcha_verified')
            };
        }
    };
})();