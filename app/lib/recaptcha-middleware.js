'use strict';

const reCAPTCHA = require('google-recaptcha');

class RecaptchaMiddleware {
    constructor() {
        this.siteKey = process.env.RECAPTCHA_SITE_KEY || '';
        this.secretKey = process.env.RECAPTCHA_SECRET_KEY || '';
        this.enabled = !!(this.siteKey && this.secretKey);
        
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

            const recaptchaResponse = req.body['g-recaptcha-response'] || 
                                     req.query['g-recaptcha-response'] || 
                                     req.headers['x-recaptcha-response'];

            if (!recaptchaResponse) {
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
                    return res.status(400).json({
                        error: 'reCAPTCHA verification failed',
                        message: 'Invalid reCAPTCHA response. Please try again.'
                    });
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