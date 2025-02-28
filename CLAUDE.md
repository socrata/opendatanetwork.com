# OpenDataNetwork.com Development Guide

## Build & Test Commands
- Build: `gulp build` (compiles JS and SASS)
- Start development server: `npm run develop`
- Start with file watching: `gulp start`
- Run all tests: `npm test`
- Run single test: `casperjs test tests/[filename].js` (e.g., `casperjs test tests/search.js`)

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