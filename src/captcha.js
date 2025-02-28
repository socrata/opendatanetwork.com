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
            
            // Instead of external images, use SVG directly to guarantee they load
            const img = document.createElement('div');
            img.className = 'captcha-svg-wrapper';
            img.setAttribute('role', 'img');
            img.setAttribute('aria-label', isTarget ? `${item} (select this)` : item);
            
            // Get SVG icon based on item name
            const svgContent = getSVGForItem(item);
            img.innerHTML = svgContent;
            
            // Add item name as visible text beneath the icon
            const itemLabel = document.createElement('div');
            itemLabel.className = 'captcha-item-label';
            itemLabel.textContent = item;
            img.appendChild(itemLabel);
            
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
     * Get SVG icon for a given item
     * @param {string} item - Item name
     * @returns {string} SVG markup
     */
    function getSVGForItem(item) {
        // Simple SVG icons with consistent style but different shapes for each item
        const icons = {
            // Vehicles
            car: '<svg viewBox="0 0 100 100"><rect x="10" y="50" width="80" height="30" rx="5" fill="#3498db"/><circle cx="25" cy="80" r="10" fill="#2c3e50"/><circle cx="75" cy="80" r="10" fill="#2c3e50"/><rect x="20" y="30" width="60" height="25" rx="5" fill="#3498db"/></svg>',
            truck: '<svg viewBox="0 0 100 100"><rect x="5" y="50" width="50" height="30" fill="#e74c3c"/><rect x="55" y="40" width="40" height="40" fill="#e74c3c"/><circle cx="20" cy="80" r="10" fill="#2c3e50"/><circle cx="80" cy="80" r="10" fill="#2c3e50"/></svg>',
            motorcycle: '<svg viewBox="0 0 100 100"><circle cx="30" cy="70" r="20" fill="#9b59b6"/><circle cx="70" cy="70" r="20" fill="#9b59b6"/><path d="M30,70 L70,70 L50,30 Z" fill="#9b59b6"/></svg>',
            bus: '<svg viewBox="0 0 100 100"><rect x="10" y="30" width="80" height="50" rx="5" fill="#2ecc71"/><rect x="20" y="40" width="15" height="10" fill="#ecf0f1"/><rect x="45" y="40" width="15" height="10" fill="#ecf0f1"/><rect x="70" y="40" width="15" height="10" fill="#ecf0f1"/><circle cx="25" cy="80" r="8" fill="#2c3e50"/><circle cx="75" cy="80" r="8" fill="#2c3e50"/></svg>',
            bicycle: '<svg viewBox="0 0 100 100"><circle cx="30" cy="70" r="20" fill="#f1c40f"/><circle cx="70" cy="70" r="20" fill="#f1c40f"/><path d="M30,70 L70,70 L50,30 Z" stroke="#f1c40f" stroke-width="3" fill="none"/></svg>',
            boat: '<svg viewBox="0 0 100 100"><path d="M10,60 C30,70 70,70 90,60 L80,80 C60,90 40,90 20,80 Z" fill="#3498db"/><path d="M50,20 L50,60" stroke="#95a5a6" stroke-width="5"/><path d="M50,30 C60,40 60,50 50,60" fill="#ecf0f1"/></svg>',
            train: '<svg viewBox="0 0 100 100"><rect x="20" y="20" width="60" height="60" fill="#9b59b6"/><rect x="30" y="30" width="40" height="15" fill="#ecf0f1"/><circle cx="35" cy="80" r="8" fill="#2c3e50"/><circle cx="65" cy="80" r="8" fill="#2c3e50"/></svg>',
            airplane: '<svg viewBox="0 0 100 100"><path d="M20,50 L80,50 L90,40 L80,30 L20,30 L10,40 Z" fill="#3498db"/><rect x="30" y="35" width="40" height="10" fill="#3498db"/><path d="M50,30 L50,10 L60,10 L60,30" fill="#3498db"/><path d="M30,50 L20,80 L40,80 L45,50" fill="#3498db"/><path d="M70,50 L80,80 L60,80 L55,50" fill="#3498db"/></svg>',
            
            // Animals
            dog: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="#f39c12"/><circle cx="35" cy="40" r="5" fill="#2c3e50"/><circle cx="65" cy="40" r="5" fill="#2c3e50"/><path d="M40,60 C45,65 55,65 60,60" stroke="#2c3e50" stroke-width="2" fill="none"/><circle cx="20" cy="30" r="10" fill="#f39c12"/><circle cx="80" cy="30" r="10" fill="#f39c12"/></svg>',
            cat: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="#95a5a6"/><path d="M35,40 L30,30 M65,40 L70,30" stroke="#2c3e50" stroke-width="2"/><circle cx="35" cy="40" r="5" fill="#2c3e50"/><circle cx="65" cy="40" r="5" fill="#2c3e50"/><path d="M40,60 C45,65 55,65 60,60" stroke="#2c3e50" stroke-width="2" fill="none"/><path d="M20,40 L30,20 M80,40 L70,20" fill="none" stroke="#95a5a6" stroke-width="5"/></svg>',
            horse: '<svg viewBox="0 0 100 100"><path d="M20,40 C20,60 30,80 50,80 C70,80 80,60 80,40 C80,20 70,20 50,20 C30,20 20,20 20,40 Z" fill="#d35400"/><path d="M50,20 L50,5" stroke="#d35400" stroke-width="10"/></svg>',
            elephant: '<svg viewBox="0 0 100 100"><circle cx="60" cy="60" r="30" fill="#95a5a6"/><path d="M60,60 C40,50 30,30 30,10" stroke="#95a5a6" stroke-width="10" fill="none"/><circle cx="70" cy="50" r="5" fill="#2c3e50"/><path d="M80,80 L90,90 M40,80 L30,90" stroke="#95a5a6" stroke-width="8" fill="none"/></svg>',
            lion: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="#f39c12"/><path d="M20,50 L10,40 M20,50 L10,50 M20,50 L10,60" stroke="#f39c12" stroke-width="3" fill="none"/><path d="M80,50 L90,40 M80,50 L90,50 M80,50 L90,60" stroke="#f39c12" stroke-width="3" fill="none"/><circle cx="35" cy="40" r="5" fill="#2c3e50"/><circle cx="65" cy="40" r="5" fill="#2c3e50"/><path d="M40,60 C45,65 55,65 60,60" stroke="#2c3e50" stroke-width="2" fill="none"/></svg>',
            bird: '<svg viewBox="0 0 100 100"><circle cx="50" cy="40" r="20" fill="#3498db"/><path d="M30,50 L10,60" stroke="#3498db" stroke-width="5"/><path d="M70,50 L90,60" stroke="#3498db" stroke-width="5"/><path d="M50,60 L50,80 L40,90 M50,80 L60,90" stroke="#e74c3c" stroke-width="3" fill="none"/><circle cx="45" cy="35" r="3" fill="#2c3e50"/><circle cx="55" cy="35" r="3" fill="#2c3e50"/></svg>',
            fish: '<svg viewBox="0 0 100 100"><path d="M20,50 C40,20 60,20 80,50 C60,80 40,80 20,50 Z" fill="#e74c3c"/><circle cx="70" cy="50" r="5" fill="#2c3e50"/><path d="M20,50 L5,40 M20,50 L5,60" stroke="#e74c3c" stroke-width="3"/></svg>',
            rabbit: '<svg viewBox="0 0 100 100"><circle cx="50" cy="60" r="20" fill="#ecf0f1"/><path d="M40,30 C40,10 30,10 30,30" stroke="#ecf0f1" stroke-width="8" fill="none"/><path d="M60,30 C60,10 70,10 70,30" stroke="#ecf0f1" stroke-width="8" fill="none"/><circle cx="45" cy="55" r="2" fill="#2c3e50"/><circle cx="55" cy="55" r="2" fill="#2c3e50"/><path d="M47,65 L53,65" stroke="#2c3e50" stroke-width="1" fill="none"/></svg>',
            
            // Food
            apple: '<svg viewBox="0 0 100 100"><circle cx="50" cy="60" r="30" fill="#e74c3c"/><path d="M50,30 C40,10 50,10 50,30" stroke="#27ae60" stroke-width="5" fill="none"/></svg>',
            pizza: '<svg viewBox="0 0 100 100"><path d="M10,80 L50,10 L90,80 Z" fill="#f39c12"/><circle cx="30" cy="40" r="5" fill="#e74c3c"/><circle cx="50" cy="60" r="5" fill="#e74c3c"/><circle cx="70" cy="40" r="5" fill="#e74c3c"/></svg>',
            burger: '<svg viewBox="0 0 100 100"><path d="M30,40 L70,40 C75,40 80,45 80,50 C80,55 75,60 70,60 L30,60 C25,60 20,55 20,50 C20,45 25,40 30,40 Z" fill="#d35400"/><path d="M30,60 L70,60 C75,60 80,65 80,70 C80,75 75,80 70,80 L30,80 C25,80 20,75 20,70 C20,65 25,60 30,60 Z" fill="#f39c12"/><path d="M30,20 L70,20 C75,20 80,25 80,30 C80,35 75,40 70,40 L30,40 C25,40 20,35 20,30 C20,25 25,20 30,20 Z" fill="#f1c40f"/><circle cx="40" cy="50" r="3" fill="#2ecc71"/><circle cx="60" cy="50" r="3" fill="#2ecc71"/><circle cx="50" cy="50" r="3" fill="#e74c3c"/></svg>',
            cake: '<svg viewBox="0 0 100 100"><path d="M20,50 L80,50 L80,80 L20,80 Z" fill="#e74c3c"/><path d="M30,40 L70,40 L70,50 L30,50 Z" fill="#f39c12"/><path d="M40,30 L60,30 L60,40 L40,40 Z" fill="#f1c40f"/><path d="M50,10 L50,30" stroke="#2c3e50" stroke-width="2"/><circle cx="50" cy="10" r="5" fill="#e74c3c"/></svg>',
            bread: '<svg viewBox="0 0 100 100"><path d="M10,40 C10,20 20,20 50,20 C80,20 90,20 90,40 L90,70 C90,90 80,90 50,90 C20,90 10,90 10,70 Z" fill="#d35400"/></svg>',
            banana: '<svg viewBox="0 0 100 100"><path d="M50,50 C70,30 80,20 90,10 C80,20 70,30 60,50 C50,70 40,80 20,90" stroke="#f1c40f" stroke-width="15" fill="none"/></svg>',
            sandwich: '<svg viewBox="0 0 100 100"><path d="M20,30 L80,30 L80,40 L20,40 Z" fill="#f1c40f"/><path d="M20,40 L80,40 L80,60 L20,60 Z" fill="#2ecc71"/><path d="M20,60 L80,60 L80,70 L20,70 Z" fill="#f1c40f"/></svg>',
            salad: '<svg viewBox="0 0 100 100"><path d="M20,60 C20,40 80,40 80,60 L75,80 L25,80 Z" fill="#2ecc71"/><circle cx="40" cy="55" r="5" fill="#e74c3c"/><circle cx="60" cy="55" r="5" fill="#e74c3c"/><circle cx="50" cy="65" r="5" fill="#f1c40f"/></svg>',
            
            // Tools
            hammer: '<svg viewBox="0 0 100 100"><rect x="45" y="20" width="10" height="50" fill="#95a5a6"/><path d="M20,30 L55,30 L55,20 L20,20 Z" fill="#2c3e50"/></svg>',
            screwdriver: '<svg viewBox="0 0 100 100"><path d="M40,10 L60,30 L30,60 L10,40 Z" fill="#2c3e50"/><rect x="45" y="35" transform="rotate(-45 50 50)" width="10" height="50" fill="#95a5a6"/></svg>',
            wrench: '<svg viewBox="0 0 100 100"><path d="M20,20 C10,10 20,0 30,10 L70,50 C80,40 90,50 80,60 L40,80 C30,90 20,80 30,70 Z" fill="#7f8c8d"/><path d="M30,30 C20,40 30,50 40,40 Z" fill="#ecf0f1"/></svg>',
            saw: '<svg viewBox="0 0 100 100"><rect x="10" y="40" width="80" height="20" fill="#95a5a6"/><path d="M90,40 L80,20 L70,40 L60,20 L50,40 L40,20 L30,40 L20,20 L10,40" fill="none" stroke="#2c3e50" stroke-width="3"/></svg>',
            drill: '<svg viewBox="0 0 100 100"><path d="M30,30 L80,30 L80,70 L30,70 L20,50 Z" fill="#2c3e50"/><path d="M80,40 L95,40 L95,60 L80,60" fill="#95a5a6"/><rect x="20" y="45" width="20" height="10" fill="#95a5a6"/></svg>',
            pliers: '<svg viewBox="0 0 100 100"><path d="M30,10 C20,10 20,20 30,20 L40,20 L40,40 L60,40 L60,20 L70,20 C80,20 80,10 70,10 Z" fill="#2c3e50"/><path d="M40,40 L30,90 M60,40 L70,90" stroke="#95a5a6" stroke-width="10" fill="none"/></svg>',
            shovel: '<svg viewBox="0 0 100 100"><path d="M50,10 L50,70" stroke="#95a5a6" stroke-width="5" fill="none"/><path d="M30,70 L70,70 L50,90 Z" fill="#2c3e50"/></svg>',
            axe: '<svg viewBox="0 0 100 100"><path d="M60,10 L40,80" stroke="#95a5a6" stroke-width="5" fill="none"/><path d="M20,30 C0,20 20,0 40,10 Z" fill="#2c3e50"/></svg>',
            
            // Distractors
            tree: '<svg viewBox="0 0 100 100"><rect x="45" y="60" width="10" height="30" fill="#795548"/><path d="M20,60 L50,20 L80,60 Z" fill="#2ecc71"/></svg>',
            house: '<svg viewBox="0 0 100 100"><path d="M20,50 L50,20 L80,50" fill="none" stroke="#e74c3c" stroke-width="5"/><rect x="30" y="50" width="40" height="30" fill="#3498db"/><rect x="45" y="60" width="10" height="20" fill="#2c3e50"/></svg>',
            person: '<svg viewBox="0 0 100 100"><circle cx="50" cy="30" r="15" fill="#3498db"/><line x1="50" y1="45" x2="50" y2="75" stroke="#3498db" stroke-width="10"/><line x1="30" y1="55" x2="70" y2="55" stroke="#3498db" stroke-width="10"/><line x1="50" y1="75" x2="30" y2="95" stroke="#3498db" stroke-width="10"/><line x1="50" y1="75" x2="70" y2="95" stroke="#3498db" stroke-width="10"/></svg>',
            building: '<svg viewBox="0 0 100 100"><rect x="20" y="30" width="60" height="60" fill="#95a5a6"/><rect x="30" y="10" width="40" height="20" fill="#95a5a6"/><rect x="30" y="40" width="10" height="10" fill="#2c3e50"/><rect x="60" y="40" width="10" height="10" fill="#2c3e50"/><rect x="30" y="60" width="10" height="10" fill="#2c3e50"/><rect x="60" y="60" width="10" height="10" fill="#2c3e50"/></svg>',
            flower: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="15" fill="#f1c40f"/><circle cx="30" cy="30" r="10" fill="#e74c3c"/><circle cx="70" cy="30" r="10" fill="#e74c3c"/><circle cx="30" cy="70" r="10" fill="#e74c3c"/><circle cx="70" cy="70" r="10" fill="#e74c3c"/><path d="M50,65 L50,95" stroke="#2ecc71" stroke-width="5" fill="none"/></svg>',
            mountain: '<svg viewBox="0 0 100 100"><path d="M10,80 L40,20 L70,60 L90,40 L90,80 Z" fill="#95a5a6"/><path d="M40,20 L42,18 L45,22 Z" fill="#ecf0f1"/></svg>',
            computer: '<svg viewBox="0 0 100 100"><rect x="20" y="20" width="60" height="40" fill="#2c3e50"/><rect x="30" y="30" width="40" height="20" fill="#3498db"/><rect x="35" y="60" width="30" height="20" fill="#95a5a6"/></svg>',
            book: '<svg viewBox="0 0 100 100"><path d="M30,20 L70,20 L70,80 L30,80 Z" fill="#e74c3c"/><path d="M30,20 L30,80" stroke="#2c3e50" stroke-width="2" fill="none"/><path d="M40,40 L60,40 M40,50 L60,50 M40,60 L60,60" stroke="#ecf0f1" stroke-width="2" fill="none"/></svg>',
            shoe: '<svg viewBox="0 0 100 100"><path d="M20,60 C20,40 30,40 40,40 L80,40 C90,40 90,60 80,60 Z" fill="#2c3e50"/></svg>',
            chair: '<svg viewBox="0 0 100 100"><path d="M30,30 L70,30 L70,60 L30,60 Z" fill="#d35400"/><path d="M30,60 L20,90 M70,60 L80,90" stroke="#d35400" stroke-width="5" fill="none"/><path d="M30,40 L70,40" stroke="#95a5a6" stroke-width="5"/></svg>',
            clock: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="#ecf0f1" stroke="#2c3e50" stroke-width="3"/><path d="M50,50 L50,30" stroke="#2c3e50" stroke-width="3" fill="none"/><path d="M50,50 L60,60" stroke="#2c3e50" stroke-width="3" fill="none"/><circle cx="50" cy="50" r="3" fill="#2c3e50"/></svg>',
            laptop: '<svg viewBox="0 0 100 100"><path d="M20,40 L80,40 L80,70 L20,70 Z" fill="#95a5a6"/><path d="M10,70 L90,70 L90,80 L10,80 Z" fill="#7f8c8d"/><rect x="30" y="50" width="40" height="10" fill="#3498db"/></svg>',
            phone: '<svg viewBox="0 0 100 100"><rect x="35" y="20" width="30" height="60" rx="5" fill="#2c3e50"/><rect x="40" y="30" width="20" height="30" fill="#3498db"/><circle cx="50" cy="70" r="5" fill="#95a5a6"/></svg>',
            pen: '<svg viewBox="0 0 100 100"><path d="M30,70 L70,30" stroke="#2c3e50" stroke-width="5" fill="none"/><path d="M70,30 L80,20 L70,10 L60,20 Z" fill="#f1c40f"/><path d="M30,70 L20,90 L40,80 Z" fill="#2c3e50"/></svg>'
        };
        
        // Return the SVG for the item, or a fallback if not found
        return icons[item] || `<svg viewBox="0 0 100 100"><text x="10" y="55" font-family="Arial" font-size="20">${item}</text></svg>`;
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