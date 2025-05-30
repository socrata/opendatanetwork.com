# reCAPTCHA Setup Guide

This site is now protected by Google reCAPTCHA v2 to prevent bot abuse.

## Configuration

To enable reCAPTCHA, you need to set the following environment variables:

```bash
export RECAPTCHA_SITE_KEY="your_site_key_here"
export RECAPTCHA_SECRET_KEY="your_secret_key_here"
export SESSION_SECRET="your-session-secret-here"  # For session management
```

## Getting reCAPTCHA Keys

1. Go to https://www.google.com/recaptcha/admin/
2. Register a new site with reCAPTCHA v2 ("I'm not a robot" Checkbox)
3. Add your domain(s) to the allowed domains list
4. Copy the Site Key and Secret Key

## Protected Endpoints

The following endpoints are now protected by reCAPTCHA:

- `/dataset/:domain/:id` - Dataset pages
- `/entity/*` - All entity/region data pages
- `/api/*` - All API proxy endpoints

## How it Works

1. **Verification Page**: When users access protected content, they see a verification page with visible reCAPTCHA
2. **Session Management**: Once verified, users can browse for 1 hour without re-verification
3. **API Protection**: The `/api/*` endpoints require reCAPTCHA tokens in headers

## User Experience

1. User visits a protected page (e.g., dataset or entity page)
2. They see a "Security Verification" page with reCAPTCHA checkbox
3. After completing reCAPTCHA, they click "Continue"
4. They can browse freely for 1 hour without seeing reCAPTCHA again

## Testing

For development/testing, you can use Google's test keys (available from Google's reCAPTCHA documentation). These test keys will always show a visible reCAPTCHA and always pass validation.

## Troubleshooting

- If reCAPTCHA doesn't appear, check that environment variables are set
- Ensure your domain is in the allowed domains list in reCAPTCHA admin
- Check browser console for JavaScript errors
- The "Continue" button remains disabled until reCAPTCHA is completed