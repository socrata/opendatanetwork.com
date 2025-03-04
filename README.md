
[![Build Status](https://travis-ci.org/socrata/opendatanetwork.com.svg?branch=staging)](https://travis-ci.org/socrata/opendatanetwork.com)

# OpenDataNetwork.com

## Summary

This document describes the data-driven aspects of the OpenDataNetwork.com website,
details how and where the site is hosted and the lists location of the source tree.

## Datasets

[Submit a dataset recommendation! &raquo;](https://github.com/socrata/opendatanetwork.com/issues/new?labels=data&body=Source%20Agency%3A%20Department%20of%20Redundancy%20Department%0ASource%20URL%3A%20https%3A%2F%2Fagency.gov%2Fawesome%2Fdataset%0A%0AWhy%20do%20you%20think%20this%20dataset%20would%20be%20valuable%20in%20the%20ODN%3F%3A%0A%0ALorem%20ipsum%20dolor%20sit%20amet%2C%20consectetur%20adipiscing%20elit.%20Pellentesque%20dictum%20augue%20ac%20lorem%20malesuada%20at%20rhoncus%20turpis%20condimentum.%20Maecenas%20commodo%20sem%20ac%20magna%20posuere%20ultrices.%20Proin%20ut%20felis%20ac%20odio%20consectetur%20rutrum%20vel%20quis%20sem.%0A)

## Development

The ODN is built using [Node.js](https://nodejs.org/).
After cloning the repository and downloading node,
simply run `npm install` from within the project directory
to install all dependencies.

Make sure that you use the Node version specified in `package.json` (currently `10.18.0`).
You can check your node version using `node --version`.

### Memcached

The ODN uses [memcached](https://memcached.org/)
to cache responses to the [ODN Backend](https://github.com/socrata/odn-backend)
as well as other external resources.
While a cache is not necessary for development, it is recommended
because it drastically improves site performance.

#### Installation with Homebrew

Memcached is available over [homebrew](http://brew.sh/).
To install it, use `brew install memcached`.
There are many options for running `memcached`.
To see them all, use `brew info memcached`.

#### Flushing the Cache

Run `./flush-memcache.sh` to flush the development cache.

### Build

The build process is automated using `gulp` and configured with `gulpfile.js`.

Verify gulp is installed with `gulp --version`. If it's not installed, run
`npm install --global gulp-cli`.

To build the application, simply run `gulp`. This will automatically
build all javascript and css assets and package them for deployment.
It will automatically rebuild when changes are detected in the source.
Note that some syntax errors will require restarting the build process.

To run the webserver, use `gulp start`, and then open [locahost:3000](http://localhost:3000).
The webserver will restart when changes are detected in the source.

It can be useful to open two separate terminals: one to build the application,
and another to run the webserver.

### Testing

The ODN uses [casperjs](http://casperjs.org/) for functional testing.
To install `casperjs` globally, run `npm install -g casperjs`.
Tests are stored in the [/tests](/tests) directory
and can be run using `npm test`.

Sometimes, running tests will trigger a webserver restart which
will then cause many tests to fail.
If this happens, start the server using `node app.js`.

#### Integration Tests

Integration tests are run to check each deployment using
[Travis CI](https://travis-ci.org/socrata/opendatanetwork.com).
These tests must pass for the deployment to succeed.

#### Running Tests before Committing

Since all tests must pass for a deployment to succeed,
it is a good idea to run unit tests locally before pushing to GitHub.
The `pre-commit.sh` script will make sure that all unit tests succeed before
every commit. To install it, run:

```sh
ln -s -f ../../scripts/pre-commit.sh .git/hooks/pre-commit
```

### Official deployment

For community users, pushing the app to Heroku with a Memcachier add-on should be sufficient.

For Tyler Technologies employees, refer to [troubleshooting](https://socrata.atlassian.net/wiki/spaces/ONCALL/pages/2158625000/OpsDoc+-+opendatanetwork.com)
for further help in administering the official instance.


#### MemJS

The ODN uses the Heroku [MemJS](https://github.com/alevy/memjs) add-on
for memcached.

#### Troubleshooting

For Tyler Technologies employees, refer to [troubleshooting](https://socrata.atlassian.net/wiki/spaces/ONCALL/pages/2158625000/OpsDoc+-+opendatanetwork.com)
for further help.

## reCAPTCHA Configuration

This application uses Google reCAPTCHA v3 to protect data access routes from abusive robots.

### Setup Instructions

1. **Get reCAPTCHA Keys**:
   - Go to the [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
   - Register a new site
   - Choose reCAPTCHA v3
   - Add your domains (and localhost for development)
   - Get your Site Key and Secret Key

2. **Configuration**:
   - Add your keys to the environment:
     ```shell
     export RECAPTCHA_SITE_KEY="your_site_key"
     export RECAPTCHA_SECRET_KEY="your_secret_key"
     ```
   - Or update `config.yml` directly (not recommended for production)

3. **Enable reCAPTCHA**:
   - reCAPTCHA is automatically enabled in staging and production environments
   - For manual control, use the environment variable:
     ```shell
     export RECAPTCHA_ENABLED=true
     ```
   - For development, it's disabled by default

4. **Adjust Score Threshold**:
   - The default score threshold is 0.5 (range 0.0 to 1.0)
   - Lower values are more permissive, higher values more restrictive
   - Adjust using:
     ```shell
     export RECAPTCHA_SCORE_THRESHOLD=0.7
     ```

### How It Works

- reCAPTCHA v3 is applied to all data access routes
- When a user accesses protected data without verification, a modal appears
- The modal contains an invisible reCAPTCHA challenge
- After verification, the user is redirected to the requested data
- Verification persists in the user's session for 24 hours

### Protected Routes

- `/dataset/*` - Dataset pages
- `/entity/*` - Entity data pages
- `/region/*` - Region data pages
- `/search*` - Search results
- `/categories.json` - Categories data

### Testing

The reCAPTCHA tests are included in the standard test suite:

```shell
npm test
```
