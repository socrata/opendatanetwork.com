# CLAUDE.md - OpenDataNetwork.com Developer Guide

## Build Commands
- Build: `gulp build` - Compiles JS and SASS
- Start dev server: `npm run develop` - Builds and runs server
- Watch for changes: `gulp watch` - Auto-rebuilds on file changes
- Start server with file watching: `gulp start`

## Test Commands
- Run all tests: `npm test` or `casperjs test tests/*.js`
- Run single test: `casperjs test tests/filename.js` (e.g., `casperjs test tests/home.js`)

## Code Style Guidelines
- Use 4-space indentation
- Include 'use strict' at the top of files
- Use CommonJS module pattern (require/module.exports)
- Group dependencies at the top of files
- Use descriptive variable and function names
- Use ES6 class syntax with static methods when appropriate
- Write clear docstring comments for functions
- Follow Promise-based async patterns

## Error Handling
- Use centralized error handling with ErrorHandler and Exception classes
- Use try/catch with appropriate error callbacks
- Always handle Promise rejections
- Include meaningful error messages and log appropriate context

## Project Structure
- Controllers: `app/controllers/` - Route handling logic
- Models: `app/models/` - Data structures
- Views: `views/` - EJS templates
- Client JS: `src/` - Frontend JavaScript
- Styles: `styles/` - SASS files