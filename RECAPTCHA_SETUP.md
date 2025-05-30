# reCAPTCHA Setup Guide

This site is now protected by Google reCAPTCHA v2 to prevent bot abuse.

## Configuration

To enable reCAPTCHA, you need to set the following environment variables:

```bash
export RECAPTCHA_SITE_KEY="your_site_key_here"
export RECAPTCHA_SECRET_KEY="your_secret_key_here"
```

## Getting reCAPTCHA Keys

1. Go to https://www.google.com/recaptcha/admin/
2. Register a new site with reCAPTCHA v2 (Invisible reCAPTCHA badge)
3. Add your domain(s) to the allowed domains list
4. Copy the Site Key and Secret Key

## Protected Endpoints

The following endpoints are now protected by reCAPTCHA:

- `/search` (POST requests)
- `/categories.json`
- `/dataset/:domain/:id`
- `/entity/*` (all entity endpoints)
- `/search-results`
- `/search-results/entity`
- `/api/*` (all API proxy endpoints)

## How it Works

1. **Search Form**: Uses invisible reCAPTCHA that triggers on form submission
2. **API Requests**: Client-side JavaScript automatically adds reCAPTCHA tokens to API requests
3. **Direct Access**: All data endpoints require valid reCAPTCHA verification

## Testing

When reCAPTCHA is not configured (environment variables not set), the site will work normally without protection.

## Troubleshooting

- If you see "reCAPTCHA verification required" errors, make sure the environment variables are set correctly
- Check browser console for any JavaScript errors related to reCAPTCHA
- Ensure your domain is added to the allowed domains in reCAPTCHA admin panel