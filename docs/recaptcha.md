# Google reCAPTCHA v3 Implementation

This document provides details on how Google reCAPTCHA v3 is implemented in the Open Data Network application to protect data access from abusive robots.

## Overview

The implementation uses Google's reCAPTCHA v3, which provides an invisible CAPTCHA solution that assigns a risk score to users based on their interactions with the site. This allows us to protect the site from automated abuse while providing a seamless user experience for legitimate users.

## Architecture

1. **Configuration**: Settings for reCAPTCHA are stored in `config.yml` and can be overridden with environment variables.

2. **Middleware**: A custom middleware (`app/lib/recaptcha.js`) validates requests to protected routes.

3. **Session Storage**: Verification results are stored in the user's session to prevent repeated challenges.

4. **Modal Interface**: When verification is needed, a modal is displayed with an invisible reCAPTCHA challenge.

## Protected Routes

All data access endpoints are protected:

- `/dataset/*` - Dataset pages
- `/entity/*` - Entity data pages 
- `/region/*` - Regional data
- `/search*` - Search results
- `/categories.json` - Categories API

## Security Features

1. **Adaptive Scoring**: Uses Google's risk score (0.0 to 1.0) to determine if a request is legitimate.

2. **Session-Based Verification**: Once verified, users are not repeatedly challenged for 24 hours.

3. **IP Address Verification**: Uses secure IP address extraction to prevent spoofing.

4. **CSRF Protection**: Implements timestamp-based prevention of token replay attacks.

5. **Accessibility**: Modal is fully accessible with proper ARIA attributes and keyboard navigation.

6. **Logging**: Suspicious activity is logged for further analysis and review.

## Configuration Options

| Option | Environment Variable | Default | Description |
|--------|---------------------|---------|-------------|
| Site Key | RECAPTCHA_SITE_KEY | N/A | Google reCAPTCHA v3 site key |
| Secret Key | RECAPTCHA_SECRET_KEY | N/A | Google reCAPTCHA v3 secret key |
| Score Threshold | RECAPTCHA_SCORE_THRESHOLD | 0.5 | Minimum score to accept (0.0-1.0) |
| Enabled | RECAPTCHA_ENABLED | Auto | Whether reCAPTCHA is enabled (true in staging/production) |

## Error Handling

1. **Network Issues**: If reCAPTCHA service is unavailable, requests are allowed through but logged.

2. **Verification Failures**: Users below threshold score are shown an error message with retry option.

3. **Token Expiration**: Tokens older than 5 minutes are rejected to prevent replay attacks.

## Performance Considerations

1. reCAPTCHA JS is loaded only when needed (not on homepage or other public pages)

2. Session caching reduces verification requests to Google's API

3. Timeouts are implemented for slow responses

## Testing

Tests for the reCAPTCHA implementation are included in the standard test suite:

```
npm test
```

## Debugging

For debugging issues with reCAPTCHA:

1. Set `RECAPTCHA_ENABLED=false` to bypass verification

2. Check logs for "reCAPTCHA verification error" messages

3. Monitor score distribution logs to tune the threshold appropriately

## Browser Support

The implementation works with all modern browsers and includes:
- Keyboard accessibility
- Dark mode support
- Focus management
- Responsive design

## Future Improvements

1. Implement rate limiting on verification attempts

2. Add approval cache to reduce API calls to Google

3. Fine-tune score threshold based on real-world data