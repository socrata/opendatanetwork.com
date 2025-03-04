'use strict';

const request = require('request-promise');
const GlobalConfig = require('../../src/config');
const { getClientIp } = require('./ip-util');

/**
 * Middleware to verify reCAPTCHA token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function verifyRecaptcha(req, res, next) {
  // Skip verification if reCAPTCHA is disabled
  if (!GlobalConfig.recaptcha.enabled) {
    return next();
  }
  
  // Check if user is already verified in session
  if (req.session && req.session.recaptchaVerified) {
    // Check if verification is still valid (24 hours)
    const verificationTime = req.session.recaptchaVerificationTime || 0;
    const currentTime = Date.now();
    const verificationAgeMs = currentTime - verificationTime;
    
    // If verification is less than 24 hours old, proceed
    if (verificationAgeMs < 24 * 60 * 60 * 1000) {
      return next();
    }
  }

  // Extract token from body, query, or headers (to support multiple submission methods)
  const token = req.body && req.body['g-recaptcha-token'] || 
                req.query && req.query['g-recaptcha-token'] || 
                req.headers && req.headers['x-recaptcha-token'];
  
  // Check for CSRF timestamp to prevent token replay attacks
  const timestamp = req.body && req.body.recaptcha_timestamp || 
                    req.query && req.query.recaptcha_timestamp || 
                    req.headers && req.headers['x-recaptcha-timestamp'];
                    
  // If timestamp exists, validate it's not too old (5 minutes max)
  if (timestamp) {
    const currentTime = Date.now();
    const timestampAge = currentTime - parseInt(timestamp);
    if (timestampAge > 5 * 60 * 1000) { // 5 minutes in milliseconds
      console.warn(`reCAPTCHA token timestamp too old: ${timestampAge}ms`);
      return res.status(403).render('recaptcha-modal', { 
        title: 'Verification Expired',
        siteKey: GlobalConfig.recaptcha.site_key,
        redirectUrl: req.originalUrl,
        error: true,
        errorMessage: 'Verification expired. Please try again.'
      });
    }
  }
  
  // If token is missing, show modal
  if (!token) {
    return res.status(403).render('recaptcha-modal', { 
      title: 'Verification Required',
      siteKey: GlobalConfig.recaptcha.site_key,
      redirectUrl: req.originalUrl
    });
  }

  try {
    // Verify token with Google
    const response = await request({
      uri: 'https://www.google.com/recaptcha/api/siteverify',
      method: 'POST',
      form: {
        secret: GlobalConfig.recaptcha.secret_key,
        response: token,
        remoteip: getClientIp(req)
      },
      json: true
    });

    // Check if verification was successful and score is above threshold
    if (response.success && response.score >= GlobalConfig.recaptcha.score_threshold) {
      // Store verification in session to prevent repeated verification
      if (req.session) {
        req.session.recaptchaVerified = true;
        req.session.recaptchaScore = response.score;
        req.session.recaptchaVerificationTime = Date.now();
        req.session.recaptchaAction = response.action;
      }
      
      // Log suspicious activity for scores close to threshold for further analysis
      if (response.score < GlobalConfig.recaptcha.score_threshold + 0.1) {
        console.warn(`Suspicious reCAPTCHA score: ${response.score} from IP: ${getClientIp(req)}, action: ${response.action}, path: ${req.path}`);
      }
      
      return next();
    } else {
      console.log('reCAPTCHA verification failed:', response);
      return res.status(403).render('recaptcha-modal', { 
        title: 'Verification Failed',
        siteKey: GlobalConfig.recaptcha.site_key,
        redirectUrl: req.originalUrl,
        error: true
      });
    }
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    
    // If it's a network/timeout error, let the user through but log the incident
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
      console.warn(`reCAPTCHA service unavailable: ${error.message}. Allowing request from ${req.ip}`);
      return next();
    }
    
    // For other errors, show a friendly error page
    return res.status(403).render('recaptcha-modal', {
      title: 'Verification Error',
      siteKey: GlobalConfig.recaptcha.site_key,
      redirectUrl: req.originalUrl,
      error: true,
      errorMessage: 'We encountered a problem with our verification service. Please try again.'
    });
  }
}

module.exports = verifyRecaptcha;