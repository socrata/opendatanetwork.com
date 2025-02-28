'use strict';

/**
 * Enhanced captcha system to prevent bots from scraping data
 * Presents a mathematical challenge that needs to be solved before data access
 * Includes accessibility features and improved security
 */
(function() {
    // DOM elements - will be initialized when document is ready
    let captchaModal;
    let captchaChallenge;
    let captchaForm;
    let captchaInput;
    let captchaError;
    let captchaClose;
    let captchaAudioBtn;
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
            
            // Text challenge elements
            textChallengeElement = document.getElementById('captcha-text-challenge');
            
            // Visual challenge elements
            visualChallengeElement = document.getElementById('captcha-visual-challenge');
            captchaInstructionElement = document.getElementById('captcha-instruction');
            captchaImageGrid = document.getElementById('captcha-image-grid');
            
            // Form elements
            captchaForm = document.getElementById('captcha-form');
            textInputGroup = document.getElementById('captcha-text-input-group');
            captchaInput = document.getElementById('captcha-input');
            captchaError = document.getElementById('captcha-error');
            visualSelectionInput = document.getElementById('captcha-selection-input');
            
            // Control buttons
            captchaClose = document.getElementById('captcha-close');
            captchaAudioBtn = document.getElementById('captcha-audio-btn');
            captchaAltBtn = document.getElementById('captcha-alt-btn');
            captchaRefreshBtn = document.getElementById('captcha-refresh-btn');
            captchaLoading = document.getElementById('captcha-loading');
            
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
            
            if (captchaAltBtn) {
                captchaAltBtn.addEventListener('click', switchChallengeType);
            }
            
            if (captchaRefreshBtn) {
                captchaRefreshBtn.addEventListener('click', refreshChallenge);
            }
            
            isInitialized = true;
            console.log('Captcha system initialized successfully');
            return true;
        } catch (e) {
            console.error('Failed to initialize captcha system:', e);
            return false;
        }
    }
    
    // Track state for each captcha instance
    const CaptchaState = function() {
        this.correctAnswer = '';
        this.destination = null;
        this.callback = null;
        this.triggerElement = null;
        this.attemptCount = 0;
        this.maxAttempts = 5;
        this.challengeType = ''; // 'text', 'visual', 'distorted'
        this.visualSelections = []; // For tracking selected images in visual challenge
        this.visualCorrectIndices = []; // Indices of correct images to select
        // Add a random salt to make answers unique for each session
        this.salt = Math.random().toString(36).substring(2, 15);
    };
    
    // Current captcha state
    let currentCaptcha = new CaptchaState();
    
    // Queue for multiple captcha requests
    const captchaQueue = [];
    let isProcessingCaptcha = false;
    
    // Challenge element references for the different types
    let textChallengeElement;
    let visualChallengeElement;
    let textInputGroup;
    let visualSelectionInput;
    let captchaInstructionElement;
    let captchaImageGrid;
    let captchaAltBtn;
    let captchaRefreshBtn;

    // Available captcha types
    const CAPTCHA_TYPES = {
        TEXT: 'text',
        VISUAL: 'visual',
        DISTORTED: 'distorted'
    };
    
    // Base URL for captcha images
    const CAPTCHA_IMAGES_BASE_URL = '/images/captcha/';
    
    // Visual challenge categories - each category has objects to select
    const visualCategories = [
        {
            name: 'vehicles',
            instruction: 'Select all vehicles',
            targetItems: [
                'car', 'truck', 'motorcycle', 'bus', 'bicycle', 'boat', 'train', 'airplane'
            ],
            distractorItems: [
                'tree', 'house', 'person', 'dog', 'cat', 'building', 'flower', 'mountain'
            ]
        },
        {
            name: 'animals',
            instruction: 'Select all animals',
            targetItems: [
                'dog', 'cat', 'horse', 'elephant', 'lion', 'bird', 'fish', 'rabbit'
            ],
            distractorItems: [
                'apple', 'computer', 'house', 'car', 'book', 'shoe', 'chair', 'clock'
            ]
        },
        {
            name: 'food',
            instruction: 'Select all food items',
            targetItems: [
                'apple', 'pizza', 'burger', 'cake', 'bread', 'banana', 'sandwich', 'salad'
            ],
            distractorItems: [
                'dog', 'car', 'chair', 'laptop', 'phone', 'book', 'tree', 'shoe'
            ]
        },
        {
            name: 'tools',
            instruction: 'Select all tools',
            targetItems: [
                'hammer', 'screwdriver', 'wrench', 'saw', 'drill', 'pliers', 'shovel', 'axe'
            ],
            distractorItems: [
                'tree', 'dog', 'house', 'book', 'pen', 'car', 'flower', 'apple'
            ]
        }
    ];

    // Fallback text challenges for accessibility
    const textChallenges = [
        { 
            type: 'math',
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
            type: 'math',
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
            type: 'math',
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
            type: 'sequence',
            generate: () => {
                // More complex sequence with a pattern
                const patterns = [
                    // Simple addition
                    () => {
                        const start = Math.floor(Math.random() * 5) + 1;
                        const step = Math.floor(Math.random() * 3) + 2;
                        const a = start;
                        const b = start + step;
                        const c = start + (2 * step);
                        const answer = start + (3 * step);
                        return {
                            question: `What is the next number: ${a}, ${b}, ${c}, ...?`,
                            answer: answer.toString(),
                            audio: `What is the next number in this sequence: ${a}, ${b}, ${c}, and what?`
                        };
                    },
                    // Fibonacci-like (multiplication)
                    () => {
                        const multiplier = Math.floor(Math.random() * 3) + 2;
                        const a = Math.floor(Math.random() * 3) + 1;
                        const b = a * multiplier;
                        const c = b * multiplier;
                        const answer = c * multiplier;
                        return {
                            question: `What is the next number: ${a}, ${b}, ${c}, ...?`,
                            answer: answer.toString(),
                            audio: `What is the next number in this sequence: ${a}, ${b}, ${c}, and what?`
                        };
                    },
                    // Alternating addition
                    () => {
                        const step1 = Math.floor(Math.random() * 5) + 1;
                        const step2 = Math.floor(Math.random() * 3) + 1;
                        const a = Math.floor(Math.random() * 5) + 1;
                        const b = a + step1;
                        const c = b + step2;
                        const answer = c + step1;
                        return {
                            question: `What is the next number: ${a}, ${b}, ${c}, ...?`,
                            answer: answer.toString(),
                            audio: `What is the next number in this sequence: ${a}, ${b}, ${c}, and what?`
                        };
                    }
                ];
                
                // Select a random pattern
                const patternFn = patterns[Math.floor(Math.random() * patterns.length)];
                return patternFn();
            }
        }
    ];
    
    // Distorted text challenges
    const distortedTextChallenges = [
        {
            type: 'distorted',
            generate: () => {
                const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusable characters
                let text = '';
                for (let i = 0; i < 6; i++) {
                    text += characters.charAt(Math.floor(Math.random() * characters.length));
                }
                return {
                    distortedText: text,
                    answer: text,
                    audio: `Enter the characters: ${text.split('').join(' ')}`
                };
            }
        }
    ];
    
    /**
     * Generate a random captcha challenge based on type
     * @returns {Object} Challenge details
     */
    function generateChallenge() {
        // Default to visual challenge (most secure)
        if (!currentCaptcha.challengeType) {
            // Randomly choose between visual and distorted text
            currentCaptcha.challengeType = Math.random() > 0.3 ? 
                CAPTCHA_TYPES.VISUAL : CAPTCHA_TYPES.DISTORTED;
        }
        
        switch (currentCaptcha.challengeType) {
            case CAPTCHA_TYPES.TEXT:
                return generateTextChallenge();
            case CAPTCHA_TYPES.VISUAL:
                return generateVisualChallenge();
            case CAPTCHA_TYPES.DISTORTED:
                return generateDistortedChallenge();
            default:
                return generateTextChallenge(); // Fallback
        }
    }
    
    /**
     * Generate a text-based challenge (math or sequence)
     * @returns {Object} Challenge details
     */
    function generateTextChallenge() {
        // Hide visual challenge, show text challenge
        visualChallengeElement.style.display = 'none';
        textChallengeElement.style.display = 'block';
        textInputGroup.style.display = 'block';
        visualSelectionInput.style.display = 'none';
        
        // Select random text challenge
        const challenge = textChallenges[Math.floor(Math.random() * textChallenges.length)];
        const result = challenge.generate();
        
        // Set the challenge text
        textChallengeElement.textContent = result.question;
        currentCaptcha.correctAnswer = result.answer;
        
        // Store audio description for accessibility
        textChallengeElement.dataset.audio = result.audio;
        
        return result;
    }
    
    /**
     * Generate a distorted text challenge
     * @returns {Object} Challenge details
     */
    function generateDistortedChallenge() {
        // Hide visual challenge, show text challenge and input
        visualChallengeElement.style.display = 'none';
        textChallengeElement.style.display = 'block';
        textInputGroup.style.display = 'block';
        visualSelectionInput.style.display = 'none';
        
        // Generate distorted text
        const challenge = distortedTextChallenges[0]; // Only one type for now
        const result = challenge.generate();
        
        // Create distorted text display
        textChallengeElement.innerHTML = '';
        const distortedTextElement = document.createElement('div');
        distortedTextElement.className = 'captcha-distorted-text';
        distortedTextElement.textContent = result.distortedText;
        
        // Add visual noise/distortion
        for (let i = 0; i < 5; i++) {
            const line = document.createElement('div');
            line.className = 'captcha-distortion-line';
            line.style.top = `${Math.floor(Math.random() * 100)}%`;
            line.style.transform = `rotate(${Math.floor(Math.random() * 20) - 10}deg)`;
            line.style.opacity = `${Math.random() * 0.5 + 0.1}`;
            distortedTextElement.appendChild(line);
        }
        
        textChallengeElement.appendChild(distortedTextElement);
        currentCaptcha.correctAnswer = result.answer;
        
        // Store audio description for accessibility
        textChallengeElement.dataset.audio = result.audio;
        
        return result;
    }
    
    /**
     * Generate a visual challenge with image selection
     * @returns {Object} Challenge details
     */
    function generateVisualChallenge() {
        // Hide text challenge, show visual challenge
        textChallengeElement.style.display = 'none';
        visualChallengeElement.style.display = 'block';
        textInputGroup.style.display = 'none';
        visualSelectionInput.style.display = 'block';
        
        // Reset selections
        currentCaptcha.visualSelections = [];
        
        // Choose a random category
        const category = visualCategories[Math.floor(Math.random() * visualCategories.length)];
        
        // Set instruction
        captchaInstructionElement.textContent = category.instruction;
        
        // Create grid with randomly mixed target and distractor items
        captchaImageGrid.innerHTML = '';
        
        // Decide how many target items to include (2-4)
        const numTargets = Math.floor(Math.random() * 3) + 2;
        
        // Select random target items
        const selectedTargets = shuffleArray(category.targetItems)
            .slice(0, numTargets);
        
        // Select distractors to fill the grid (9 items total)
        const selectedDistractors = shuffleArray(category.distractorItems)
            .slice(0, 9 - numTargets);
        
        // Combine and shuffle all items
        const allItems = shuffleArray([...selectedTargets, ...selectedDistractors]);
        
        // Track indices of correct items
        currentCaptcha.visualCorrectIndices = [];
        
        // Create grid items
        allItems.forEach((item, index) => {
            const isTarget = selectedTargets.includes(item);
            
            // Create grid item
            const gridItem = document.createElement('div');
            gridItem.className = 'captcha-image-item';
            gridItem.dataset.index = index;
            
            // Use placeholder images (in production, you would use real images)
            const img = document.createElement('img');
            img.src = `${CAPTCHA_IMAGES_BASE_URL}${item}.jpg`;
            img.alt = isTarget ? `${item} (select this)` : item;
            img.onerror = function() {
                // Fallback for missing images
                this.src = 'https://via.placeholder.com/150?text=' + item;
            };
            
            // Create checkmark indicator
            const checkmark = document.createElement('div');
            checkmark.className = 'captcha-image-checkmark';
            checkmark.innerHTML = '✓';
            
            gridItem.appendChild(img);
            gridItem.appendChild(checkmark);
            
            // Add click handler
            gridItem.addEventListener('click', function() {
                toggleImageSelection(this, index);
            });
            
            // Add to grid
            captchaImageGrid.appendChild(gridItem);
            
            // If this is a target, add to correct indices
            if (isTarget) {
                currentCaptcha.visualCorrectIndices.push(index);
            }
        });
        
        // Set correct answer (used for verification)
        currentCaptcha.correctAnswer = JSON.stringify(currentCaptcha.visualCorrectIndices.sort());
        
        return {
            type: 'visual',
            category: category.name,
            instruction: category.instruction,
            correctIndices: currentCaptcha.visualCorrectIndices,
            audio: `${category.instruction}. This is a visual challenge. Select the ${numTargets} images that show ${category.name}.`
        };
    }
    
    /**
     * Toggle selection of an image in the visual challenge
     * @param {HTMLElement} element - The grid item element
     * @param {number} index - Index of the selected item
     */
    function toggleImageSelection(element, index) {
        const isSelected = element.classList.toggle('selected');
        
        if (isSelected) {
            // Add to selections if not already included
            if (!currentCaptcha.visualSelections.includes(index)) {
                currentCaptcha.visualSelections.push(index);
            }
        } else {
            // Remove from selections
            const indexPos = currentCaptcha.visualSelections.indexOf(index);
            if (indexPos !== -1) {
                currentCaptcha.visualSelections.splice(indexPos, 1);
            }
        }
    }
    
    /**
     * Switch between different challenge types
     */
    function switchChallengeType() {
        // Rotate through challenge types
        if (currentCaptcha.challengeType === CAPTCHA_TYPES.VISUAL) {
            currentCaptcha.challengeType = CAPTCHA_TYPES.TEXT;
        } else if (currentCaptcha.challengeType === CAPTCHA_TYPES.TEXT) {
            currentCaptcha.challengeType = CAPTCHA_TYPES.DISTORTED;
        } else {
            currentCaptcha.challengeType = CAPTCHA_TYPES.VISUAL;
        }
        
        // Generate new challenge of selected type
        generateChallenge();
        
        // Clear previous input
        captchaInput.value = '';
        captchaError.textContent = '';
    }
    
    /**
     * Refresh the current challenge type
     */
    function refreshChallenge() {
        generateChallenge();
        captchaInput.value = '';
        captchaError.textContent = '';
    }
    
    /**
     * Shuffle array elements randomly
     * @param {Array} array - Array to shuffle
     * @returns {Array} Shuffled array
     */
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
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
        
        // Different announcement based on challenge type
        if (currentCaptcha.challengeType === CAPTCHA_TYPES.VISUAL) {
            announcement.textContent = 'Verification required. Please solve the image selection challenge to continue.';
        } else if (currentCaptcha.challengeType === CAPTCHA_TYPES.DISTORTED) {
            announcement.textContent = 'Verification required. Please enter the distorted text to continue.';
        } else {
            announcement.textContent = 'Verification required. Please solve the math problem to continue.';
        }
        
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
        
        // Hide the appropriate challenge elements based on type
        if (currentCaptcha.challengeType === CAPTCHA_TYPES.VISUAL) {
            visualChallengeElement.style.display = 'none';
        } else {
            textChallengeElement.style.display = 'none';
        }
        
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
            textChallengeElement.style.display = 'none';
            visualChallengeElement.style.display = 'none';
            captchaLoading.style.display = 'none';
        }, 500);
    }
    
    /**
     * Handle form submission
     * @param {Event} e - Form submit event
     */
    function handleSubmit(e) {
        e.preventDefault();
        
        let isCorrect = false;
        
        // Reset error style
        if (captchaInput) {
            captchaInput.classList.remove('error');
        }
        if (captchaError) {
            captchaError.textContent = '';
        }
        
        // Handle different challenge types
        if (currentCaptcha.challengeType === CAPTCHA_TYPES.VISUAL) {
            // For visual challenges, verify selected images match expected targets
            if (currentCaptcha.visualSelections.length === 0) {
                captchaError.textContent = 'Please select at least one image';
                return;
            }
            
            // Sort selections for comparison
            const sortedSelections = [...currentCaptcha.visualSelections].sort();
            
            // Compare with correct indices (already JSON stringified in generateVisualChallenge)
            isCorrect = JSON.stringify(sortedSelections) === currentCaptcha.correctAnswer;
        } else {
            // For text challenges, verify entered text
            const userAnswer = captchaInput.value.trim();
            
            if (!userAnswer) {
                captchaInput.classList.add('error');
                captchaError.textContent = 'Please enter an answer';
                captchaInput.focus();
                return;
            }
            
            // Case insensitive match for distorted text
            if (currentCaptcha.challengeType === CAPTCHA_TYPES.DISTORTED) {
                isCorrect = userAnswer.toUpperCase() === currentCaptcha.correctAnswer;
            } else {
                // Exact match for math and sequence problems
                isCorrect = userAnswer === currentCaptcha.correctAnswer;
            }
        }
        
        // Process result
        if (isCorrect) {
            handleSuccess();
        } else {
            // Increment attempt counter
            currentCaptcha.attemptCount++;
            
            // Show error
            if (captchaInput) {
                captchaInput.classList.add('error');
            }
            
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
            
            // Reset input based on challenge type
            if (currentCaptcha.challengeType !== CAPTCHA_TYPES.VISUAL && captchaInput) {
                captchaInput.value = '';
                captchaInput.focus();
            }
        }
    }
    
    /**
     * Read captcha challenge aloud for accessibility
     */
    function readChallengeAloud() {
        if ('speechSynthesis' in window) {
            let audioText = '';
            
            // Get audio description based on challenge type
            if (currentCaptcha.challengeType === CAPTCHA_TYPES.VISUAL) {
                // For visual challenges, use image instruction
                audioText = captchaInstructionElement.textContent;
                
                // Add extra context for screen readers
                audioText += ". This is a visual captcha. Please request assistance if needed.";
            } else if (currentCaptcha.challengeType === CAPTCHA_TYPES.DISTORTED) {
                // For distorted text, spell out each character
                const distortedText = textChallengeElement.querySelector('.captcha-distorted-text').textContent;
                audioText = 'Please enter these characters: ' + distortedText.split('').join(' ');
            } else {
                // For text challenges, read the question
                audioText = textChallengeElement.textContent;
            }
            
            // Get dataset audio if available (fallback)
            if (textChallengeElement && textChallengeElement.dataset.audio) {
                audioText = textChallengeElement.dataset.audio;
            }
            
            const speech = new SpeechSynthesisUtterance(audioText);
            speechSynthesis.speak(speech);
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