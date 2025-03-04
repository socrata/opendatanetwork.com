'use strict';

/**
 * Simple math-based captcha implementation for preventing bots from scraping data
 * Uses basic arithmetic challenges that are easy for humans but harder for bots
 */
(function() {
    // DOM elements - will be initialized when document is ready
    let captchaModal;
    let captchaClose;
    let captchaChallenge;
    let captchaForm;
    let captchaInput;
    let captchaError;
    let captchaLoading;
    
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
            captchaChallenge = document.getElementById('captcha-challenge');
            captchaForm = document.getElementById('captcha-form');
            captchaInput = document.getElementById('captcha-input');
            captchaError = document.getElementById('captcha-error');
            captchaClose = document.getElementById('captcha-close');
            captchaLoading = document.getElementById('captcha-loading');
            
            // Set up event listeners
            if (captchaClose) {
                captchaClose.addEventListener('click', closeCaptcha);
            }
            
            if (captchaForm) {
                captchaForm.addEventListener('submit', handleSubmit);
            }
            
            isInitialized = true;
            console.log('Captcha system initialized successfully');
            return true;
        } catch (e) {
            console.error('Failed to initialize captcha system:', e);
            return false;
        }
    }
    
    // Track captcha state
    const CaptchaState = function() {
        this.challenge = null;
        this.answer = null;
        this.attemptCount = 0;
        this.maxAttempts = 5;
        this.destination = null;
        this.callback = null;
        this.triggerElement = null;
    };
    
    // Current captcha state
    let currentCaptcha = null;
    
    // Queue for multiple captcha requests
    const captchaQueue = [];
    let isProcessingCaptcha = false;
    
    /**
     * Generate a math challenge
     * @returns {Object} Challenge details with question and answer
     */
    function generateMathChallenge() {
        // Create a simple arithmetic problem
        const operations = [
            {
                name: 'addition',
                symbol: '+',
                operation: (a, b) => a + b,
                format: (a, b) => `What is ${a} + ${b}?`
            },
            {
                name: 'subtraction',
                symbol: '-',
                operation: (a, b) => a - b,
                format: (a, b) => `What is ${a} - ${b}?`
            },
            {
                name: 'multiplication',
                symbol: '×',
                operation: (a, b) => a * b,
                format: (a, b) => `What is ${a} × ${b}?`
            }
        ];
        
        // Select a random operation
        const op = operations[Math.floor(Math.random() * operations.length)];
        
        // Generate two random numbers 1-20 for addition/subtraction, 1-10 for multiplication
        const maxVal = op.name === 'multiplication' ? 10 : 20;
        const a = Math.floor(Math.random() * maxVal) + 1;
        const b = Math.floor(Math.random() * maxVal) + 1;
        
        // For subtraction, ensure a >= b to avoid negative results
        const x = op.name === 'subtraction' ? Math.max(a, b) : a;
        const y = op.name === 'subtraction' ? Math.min(a, b) : b;
        
        // Calculate the answer
        const answer = op.operation(x, y).toString();
        
        // Create the challenge text
        const question = op.format(x, y);
        
        return {
            question: question,
            answer: answer
        };
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
        
        // Create a new captcha state
        currentCaptcha = new CaptchaState();
        
        // Store the destination and trigger element
        if (typeof request.destination === 'function') {
            currentCaptcha.callback = request.destination;
        } else {
            currentCaptcha.destination = request.destination;
        }
        
        currentCaptcha.triggerElement = request.triggerElement;
        
        // Hide loading indicator
        if (captchaLoading) {
            captchaLoading.style.display = 'none';
        }
        
        // Generate a math challenge
        const challenge = generateMathChallenge();
        currentCaptcha.challenge = challenge.question;
        currentCaptcha.answer = challenge.answer;
        
        // Set the challenge text
        if (captchaChallenge) {
            captchaChallenge.textContent = challenge.question;
        }
        
        // Reset input field and error message
        if (captchaInput) {
            captchaInput.value = '';
        }
        
        if (captchaError) {
            captchaError.textContent = '';
        }
        
        // Show the modal
        captchaModal.style.display = 'flex';
        
        // Announce the modal for screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'assertive');
        announcement.setAttribute('class', 'sr-only');
        announcement.textContent = 'Verification required. Please solve a simple math problem to continue.';
        document.body.appendChild(announcement);
        
        // Set focus after a small delay (for screen readers)
        setTimeout(() => {
            // Try to focus on the input field
            if (captchaInput) {
                captchaInput.focus();
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
        if (currentCaptcha && currentCaptcha.triggerElement) {
            currentCaptcha.triggerElement.focus();
        }
        
        // Process next captcha if any
        if (captchaQueue.length > 0) {
            processNextCaptcha();
        } else {
            isProcessingCaptcha = false;
        }
    }
    
    /**
     * Handle form submission
     * @param {Event} e - Form submit event
     */
    function handleSubmit(e) {
        e.preventDefault();
        
        if (!currentCaptcha) {
            console.error('No active captcha challenge');
            return;
        }
        
        // Get user's answer
        const userAnswer = captchaInput.value.trim();
        
        // Reset error style
        captchaInput.classList.remove('error');
        captchaError.textContent = '';
        
        // Check if answer is empty
        if (!userAnswer) {
            captchaInput.classList.add('error');
            captchaError.textContent = 'Please enter an answer';
            captchaInput.focus();
            return;
        }
        
        // Check if answer is correct
        if (userAnswer === currentCaptcha.answer) {
            // Success!
            handleSuccess();
        } else {
            // Wrong answer
            currentCaptcha.attemptCount++;
            
            captchaInput.classList.add('error');
            
            if (currentCaptcha.attemptCount >= currentCaptcha.maxAttempts) {
                // Too many attempts
                captchaError.textContent = 'Too many failed attempts. Please try again later.';
                
                setTimeout(() => {
                    closeCaptcha();
                }, 2000);
            } else {
                // Generate new challenge
                captchaError.textContent = 'Incorrect answer. Please try again.';
                
                const challenge = generateMathChallenge();
                currentCaptcha.challenge = challenge.question;
                currentCaptcha.answer = challenge.answer;
                
                // Update challenge text
                captchaChallenge.textContent = challenge.question;
                
                // Clear input
                captchaInput.value = '';
                captchaInput.focus();
            }
        }
    }
    
    /**
     * Handle successful captcha completion
     */
    function handleSuccess() {
        // Show loading indicator
        captchaLoading.style.display = 'block';
        captchaForm.style.display = 'none';
        
        // Set verification cookie (valid for 30 minutes)
        setCookie('odn_captcha_verified', 'true', 30);
        
        // Small delay to show loading indicator
        setTimeout(() => {
            // Hide the modal
            closeCaptcha();
            
            // Navigate to destination or execute callback
            if (currentCaptcha.destination) {
                window.location.href = currentCaptcha.destination;
            } else if (currentCaptcha.callback && typeof currentCaptcha.callback === 'function') {
                try {
                    currentCaptcha.callback();
                } catch (e) {
                    console.error('Error executing captcha callback:', e);
                }
            }
            
            // Reset form display for next captcha
            captchaForm.style.display = 'block';
            captchaLoading.style.display = 'none';
        }, 500);
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