#OpenDataNetwork.com#

---

##Summary##

This document describes the data-driven aspects of the OpenDataNetwork.com website, details how and where the site is hosted and the lists location of the source tree.

##Getting Setup###

This is a Node.js web site.  [NPM](https://www.npmjs.org/) and [Grunt](http://gruntjs.com/) should be installed to build the site.  To deploy, the [Heroku Toolbelt](https://toolbelt.heroku.com/) is required.

The site uses SASS for CSS generation, and uses Uglify for JavaScript compression.  It uses Express and EJS for template rendering.

One page - /census - uses a PostgreSQL database.  You need to install [Postgres.app](http://postgresapp.com/) on your mac and pull down the census database from our instance on Heroku or create a database locally run the node script (/tasks/schema.js) to create the single table.

To get started, simply clone down the site and install all packages by typing the following from the source directory:

	$ git clone https://github.com/socrata/opendatanetwork.com.git
	$ npm install

I used nodemon to run this site locally.  Type the following to start the node listening:

	$ grunt nodemon

The site can now be browsed locally at:

	http://localhost:3000


##Source Files##

The Open Data Network web site source files are located in Github.

[https://github.com/socrata/opendatanetwork.com]()

All the JSON files which hold the data to be displayed in the slider, the tiles list, the decision tree on the /explore page and the list of data portals is stored in /data folder.  

[https://github.com/socrata/opendatanetwork.com/tree/master/data]()


###Compressing CSS###

After making a change to the CSS, you will want to compress the files to create the minified versions which the site uses.  Do this from the source directory.  Type:  

	$ grunt sass

Minified versions of the .css files will be written to the /styles/compressed and will have the extension .min.css.


###Compressing JavaScript###

Similarly, to compress the JavaScript, type:

	$ grunt uglify
	
Just like the CSS, minified versions of the .js files will be written to the /scripts/compressed and will have the extension .min.js.

To compress everything:

	$ grunt


##JSON Data Files##

###Category-Metadata.json###

Holds icon, description and showcase items for each category.


##Hosting##

The Open Data Network website is hosted on Heroku and is located here:

[https://dashboard.heroku.com/apps/opendatanetwork/resources]()

Paul Paradise can grant access to the dashboard.

Currently the site is hosted under the preview.opendatanetwork.com sub-domain.

[http://preview.opendatanetwork.com]()



##Deploying##

Once you have compressed your CSS and JS, committed and pushed to Github, and you want to push your changes to Heroku, issue to the following command:

	$ git push heroku master

The sources will be pushed into your dyno and the site will be running the lastest bits.  The Heroku toolbelt and dashboard support rollbacks in case of a buggy build.

More details about deploying with git to Heroku, including setting up the remote, can be found here:

[https://devcenter.heroku.com/articles/git]()


###Robots.txt###

***NOTE***:  The site currently has a robots.txt with disallow all in place.  When the site goes live, delete the robots.txt or the site won't show up in Google search results.


