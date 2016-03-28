[![Build Status](https://travis-ci.org/socrata/opendatanetwork.com.svg?branch=master)](https://travis-ci.org/socrata/opendatanetwork.com)

#OpenDataNetwork.com

##Summary

This document describes the data-driven aspects of the OpenDataNetwork.com website, details how and where the site is hosted and the lists location of the source tree.

## Development

The ODN is a [Node.js](https://nodejs.org/) application.

### Dependencies

First, install `node` with `npm`.
Then, install `memcached`.

All other dependencies can be installed by running
`npm install` from within the project directory.

### Build

The build process is automated using `gulp` and configured with `gulpfile.js`.
 - `gulp js`: build javascript
 - `gulp css`: build css
 - `gulp build`: build javascript and css
 - `gulp watch` (or `gulp`): rebuild source on change
 - `gulp start`: run local webserver at [localhost:3000](http://localhost:3000)
 - `gulp test`: run [casperjs](http://casperjs.org/) tests

### Testing

A suite of [casperjs](http://casperjs.org/) tests has been made available in `tests/*`. To create a new test suite, copy one of the files in that directory and add tests for your own page. To run the tests, run `gulp test` from the command line.

Casperjs must be in the path so install with -g:

	npm install -g casperjs

Also needed:

	npm install -g phantomjs

Continuous integration tests are run for each push and pull request on [Travis CI](https://travis-ci.org/socrata/opendatanetwork.com).

##Source Files

The Open Data Network web site source files are located in Github.

[https://github.com/socrata/opendatanetwork.com](https://github.com/socrata/opendatanetwork.com)

All the JSON files which hold the data to be displayed in the slider, the tiles list, the decision tree on the /explore page and the list of data portals is stored in /data folder.

[https://github.com/socrata/opendatanetwork.com/tree/master/data](https://github.com/socrata/opendatanetwork.com/tree/master/data)

##JSON Data Files

###Category-Metadata.json

Holds icon, description and showcase items for each category.


##Hosting

The Open Data Network website is hosted on Heroku and is located here:

[https://dashboard.heroku.com/apps/opendatanetwork/resources](https://dashboard.heroku.com/apps/opendatanetwork/resources)

Paul Paradise can grant access to the dashboard.

Currently the site is hosted under the preview.opendatanetwork.com sub-domain.

[http://preview.opendatanetwork.com](http://preview.opendatanetwork.com)



##Deploying

Once you have compressed your CSS and JS, committed and pushed to Github, and you want to push your changes to Heroku, issue to the following command:

	$ git push heroku master

The sources will be pushed into your dyno and the site will be running the lastest bits.  The Heroku toolbelt and dashboard support rollbacks in case of a buggy build.

More details about deploying with git to Heroku, including setting up the remote, can be found here:

[https://devcenter.heroku.com/articles/git](https://devcenter.heroku.com/articles/git)


###Robots.txt

***NOTE***:  The site currently has a robots.txt with disallow all in place.  When the site goes live, delete the robots.txt or the site won't show up in Google search results.


