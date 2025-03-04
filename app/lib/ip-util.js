'use strict';

/**
 * Get client IP address securely
 * This handles trusted proxies and extracts the correct client IP
 * 
 * @param {Object} req - Express request object
 * @returns {String} Client IP address
 */
function getClientIp(req) {
  // If X-Forwarded-For exists and we're behind a trusted proxy
  if (req.headers['x-forwarded-for']) {
    // Get the first IP in the X-Forwarded-For header (client's real IP)
    const ips = req.headers['x-forwarded-for'].split(',');
    return ips[0].trim();
  }
  
  // Fall back to standard req.ip
  return req.ip;
}

/**
 * Check if request is from a trusted proxy
 * 
 * @param {Object} req - Express request object
 * @returns {Boolean} Whether the request is from a trusted proxy
 */
function trustProxy(req) {
  // List of trusted proxy IPs or CIDRs
  const trustedProxies = process.env.TRUSTED_PROXIES ? 
    process.env.TRUSTED_PROXIES.split(',') : 
    ['127.0.0.1', '::1'];
  
  return trustedProxies.includes(req.ip);
}

module.exports = {
  getClientIp,
  trustProxy
};