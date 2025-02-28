'use strict';

/**
 * Enhanced captcha system to prevent bots from scraping data
 * Presents a mathematical challenge that needs to be solved before data access
 * Includes accessibility features and improved security
 */
(function() {
    // Cache DOM elements
    const captchaModal = document.getElementById('captcha-modal');
    const captchaChallenge = document.getElementById('captcha-challenge');
    const captchaForm = document.getElementById('captcha-form');
    const captchaInput = document.getElementById('captcha-input');
    const captchaError = document.getElementById('captcha-error');
    const captchaClose = document.getElementById('captcha-close');
    const captchaAudioBtn = document.getElementById('captcha-audio-btn');
    const captchaLoading = document.getElementById('captcha-loading');
    
    // Track state for each captcha instance
    const CaptchaState = function() {
        this.correctAnswer = '';
        this.destination = null;
        this.callback = null;
        this.triggerElement = null;
        this.attemptCount = 0;
        this.maxAttempts = 5;
        // Add a random salt to make answers unique for each session
        this.salt = Math.random().toString(36).substring(2, 15);
    };
    
    // Current captcha state
    let currentCaptcha = new CaptchaState();
    
    // Queue for multiple captcha requests
    const captchaQueue = [];
    let isProcessingCaptcha = false;
    
    // Simple math problems as captcha with increased complexity
    const challenges = [
        { 
            question: 'What is {a} + {b}?', 
            generate: () => {
                const a = Math.floor(Math.random() * 20) + 1;
                const b = Math.floor(Math.random() * 20) + 1;
                return { 
                    question: `What is ${a} + ${b}?`, 
                    answer: (a + b).toString(),
                    audio: `Calculate ${a} plus ${b}`
                };
            }
        },
        { 
            question: 'What is {a} × {b}?', 
            generate: () => {
                const a = Math.floor(Math.random() * 10) + 1;
                const b = Math.floor(Math.random() * 10) + 1;
                return { 
                    question: `What is ${a} × ${b}?`, 
                    answer: (a * b).toString(),
                    audio: `Calculate ${a} multiplied by ${b}`
                };
            }
        },
        { 
            question: 'What is {a} - {b}?', 
            generate: () => {
                const b = Math.floor(Math.random() * 10) + 1;
                const a = b + Math.floor(Math.random() * 10) + 1; // Ensure a > b
                return { 
                    question: `What is ${a} - ${b}?`, 
                    answer: (a - b).toString(),
                    audio: `Calculate ${a} minus ${b}`
                };
            }
        },
        {
            question: 'What is the next number: {a}, {b}, {c}, ...?',
            generate: () => {
                // Simple sequence with a pattern
                const start = Math.floor(Math.random() * 5) + 1;
                const step = Math.floor(Math.random() * 3) + 1;
                const a = start;
                const b = start + step;
                const c = start + (2 * step);
                const answer = start + (3 * step);
                return {
                    question: `What is the next number: ${a}, ${b}, ${c}, ...?`,
                    answer: answer.toString(),
                    audio: `What is the next number in this sequence: ${a}, ${b}, ${c}, and what?`
                };
            }
        }
    ];
    
    /**
     * Generate a random captcha challenge
     * @returns {Object} Challenge details
     */
    function generateChallenge() {
        const challenge = challenges[Math.floor(Math.random() * challenges.length)];
        const result = challenge.generate();
        
        captchaChallenge.textContent = result.question;
        currentCaptcha.correctAnswer = result.answer;
        
        // Store audio description for accessibility
        captchaChallenge.dataset.audio = result.audio;
        
        return result;
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
        
        // Reset captcha state
        currentCaptcha = new CaptchaState();
        
        // Generate a new challenge
        generateChallenge();
        
        // Store the destination and trigger element
        if (typeof request.destination === 'function') {
            currentCaptcha.callback = request.destination;
        } else {
            currentCaptcha.destination = request.destination;
        }
        
        currentCaptcha.triggerElement = request.triggerElement;
        
        // Clear previous input and error
        captchaInput.value = '';
        captchaError.textContent = '';
        captchaInput.classList.remove('error');
        captchaLoading.style.display = 'none';
        
        // Show the modal
        captchaModal.style.display = 'flex';
        
        // Announce the modal for screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'assertive');
        announcement.setAttribute('class', 'sr-only');
        announcement.textContent = 'Verification required. Please solve the math problem to continue.';
        document.body.appendChild(announcement);
        
        // Set focus to the input after a small delay (for screen readers)
        setTimeout(() => {
            captchaInput.focus();
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
        if (currentCaptcha.triggerElement) {
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
     * Handle successful captcha completion
     */
    function handleSuccess() {
        captchaLoading.style.display = 'block';
        captchaForm.style.display = 'none';
        captchaChallenge.style.display = 'none';
        
        // Set the verification cookie - valid for 30 minutes
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
            captchaChallenge.style.display = 'block';
            captchaLoading.style.display = 'none';
        }, 500);
    }
    
    /**
     * Handle form submission
     * @param {Event} e - Form submit event
     */
    function handleSubmit(e) {
        e.preventDefault();
        
        const userAnswer = captchaInput.value.trim();
        
        // Reset error style
        captchaInput.classList.remove('error');
        captchaError.textContent = '';
        
        if (!userAnswer) {
            captchaInput.classList.add('error');
            captchaError.textContent = 'Please enter an answer';
            captchaInput.focus();
            return;
        }
        
        // Check if the answer is correct
        if (userAnswer === currentCaptcha.correctAnswer) {
            handleSuccess();
        } else {
            // Increment attempt counter
            currentCaptcha.attemptCount++;
            
            // Show error and generate new challenge
            captchaInput.classList.add('error');
            
            if (currentCaptcha.attemptCount >= currentCaptcha.maxAttempts) {
                captchaError.textContent = 'Too many failed attempts. Please try again later.';
                
                // Close captcha after 2 seconds
                setTimeout(() => {
                    closeCaptcha();
                }, 2000);
                
                return;
            }
            
            captchaError.textContent = 'Incorrect answer. Please try again.';
            generateChallenge();
            captchaInput.value = '';
            captchaInput.focus();
        }
    }
    
    /**
     * Read captcha challenge aloud for accessibility
     */
    function readChallengeAloud() {
        if ('speechSynthesis' in window) {
            const audioText = captchaChallenge.dataset.audio || captchaChallenge.textContent;
            const speech = new SpeechSynthesisUtterance(audioText);
            speechSynthesis.speak(speech);
        }
    }
    
    // Set up event listeners
    if (captchaForm) {
        captchaForm.addEventListener('submit', handleSubmit);
    }
    
    if (captchaClose) {
        captchaClose.addEventListener('click', closeCaptcha);
    }
    
    if (captchaAudioBtn) {
        captchaAudioBtn.addEventListener('click', readChallengeAloud);
    }
    
    // Expose functions to global scope
    window.ODNCaptcha = {
        show: showCaptcha,
        close: closeCaptcha
    };
})();