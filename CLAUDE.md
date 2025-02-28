# OpenDataNetwork.com Development Guide

## Build & Test Commands
- Build: `gulp build` (compiles JS and SASS)
- Start development server: `npm run develop`
- Start with file watching: `gulp start`
- Run all tests: `npm test`
- Run single test: `casperjs test tests/[filename].js` (e.g., `casperjs test tests/search.js`)
- Test captcha: `casperjs test tests/captcha.js`

## Code Style Guidelines
- Use 'use strict' in JS files
- Indentation: 4 spaces
- File naming: kebab-case for components, camelCase for utilities
- Variable naming: camelCase, descriptive names
- Error handling: Use try/catch for async operations
- JS structure: Follow module pattern with explicit exports
- SASS organization: Component-specific styles in separate files
- HTML templates: Use EJS templating with partials for reuse
- Dependencies: Add to package.json, avoid global installs

## Captcha System
The site includes a captcha system to prevent automated scraping.

### Key Files
- `src/captcha.js`: Core captcha functionality
- `views/_captcha-modal.ejs`: HTML structure
- `styles/_captcha-modal.sass`: Visual styling

### Configuration
- Session duration: 30 minutes (configurable in `handleSuccess()`)
- Max failed attempts: 5 (configurable in `CaptchaState` constructor)
- Protected pages: Search results, entity pages, dataset pages, data links

### Testing
When making changes to the captcha system, always test:
1. All protected pages show the captcha
2. Captcha properly validates answers
3. Accessibility features (keyboard navigation, screen reader compatibility)
4. Session cookies properly prevent repeated captchas