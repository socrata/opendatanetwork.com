'use strict';

const reCAPTCHA = require('google-recaptcha');

class RecaptchaMiddleware {
    constructor() {
        this.siteKey = process.env.RECAPTCHA_SITE_KEY || '';
        this.secretKey = process.env.RECAPTCHA_SECRET_KEY || '';
        this.enabled = !!(this.siteKey && this.secretKey);
        
        console.log('reCAPTCHA initialization:');
        console.log('- Site Key:', this.siteKey ? 'Set' : 'Not set');
        console.log('- Secret Key:', this.secretKey ? 'Set' : 'Not set');
        console.log('- Enabled:', this.enabled);
        
        if (this.enabled) {
            this.recaptcha = new reCAPTCHA({
                secret: this.secretKey
            });
        }
    }

    getSiteKey() {
        return this.siteKey;
    }

    isEnabled() {
        return this.enabled;
    }

    verify() {
        return (req, res, next) => {
            if (!this.enabled) {
                return next();
            }

            // Check if user has already verified recently
            if (req.session && req.session.recaptchaVerified) {
                const elapsed = Date.now() - (req.session.recaptchaTimestamp || 0);
                const oneHour = 60 * 60 * 1000;
                if (elapsed < oneHour) {
                    return next();
                }
            }

            const recaptchaResponse = req.body['g-recaptcha-response'] || 
                                     req.query['g-recaptcha-response'] || 
                                     req.headers['x-recaptcha-response'];

            console.log('reCAPTCHA check - Method:', req.method, 'URL:', req.originalUrl);
            console.log('reCAPTCHA response token:', recaptchaResponse ? 'Present' : 'Missing');

            if (!recaptchaResponse) {
                // For GET requests, show the verification page
                if (req.method === 'GET') {
                    return res.render('recaptcha-verify.ejs', {
                        originalUrl: req.originalUrl,
                        title: 'Security Verification - Open Data Network'
                    });
                }
                
                // For other requests, return JSON error
                return res.status(400).json({
                    error: 'reCAPTCHA verification required',
                    message: 'Please complete the reCAPTCHA challenge'
                });
            }

            this.recaptcha.verify({
                response: recaptchaResponse,
                remoteip: req.ip
            }, (error) => {
                if (error) {
                    console.error('reCAPTCHA verification error:', error);
                    
                    // For GET requests, show the verification page with error
                    if (req.method === 'GET') {
                        return res.render('recaptcha-verify.ejs', {
                            originalUrl: req.originalUrl,
                            title: 'Security Verification - Open Data Network',
                            error: 'Verification failed. Please try again.'
                        });
                    }
                    
                    return res.status(400).json({
                        error: 'reCAPTCHA verification failed',
                        message: 'Invalid reCAPTCHA response. Please try again.'
                    });
                }
                
                // Set a session flag to avoid repeated checks
                if (req.session) {
                    req.session.recaptchaVerified = true;
                    req.session.recaptchaTimestamp = Date.now();
                }
                
                next();
            });
        };
    }

    verifyOptional() {
        return (req, res, next) => {
            if (!this.enabled) {
                return next();
            }

            const recaptchaResponse = req.body['g-recaptcha-response'] || 
                                     req.query['g-recaptcha-response'] || 
                                     req.headers['x-recaptcha-response'];

            if (!recaptchaResponse) {
                req.recaptchaVerified = false;
                return next();
            }

            this.recaptcha.verify({
                response: recaptchaResponse,
                remoteip: req.ip
            }, (error) => {
                if (error) {
                    console.error('reCAPTCHA optional verification error:', error);
                }
                req.recaptchaVerified = !error;
                next();
            });
        };
    }

    addToLocals() {
        return (req, res, next) => {
            res.locals.recaptcha = {
                enabled: this.enabled,
                siteKey: this.siteKey
            };
            next();
        };
    }
}

module.exports = new RecaptchaMiddleware();