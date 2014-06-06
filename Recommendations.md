#Developer Recommendations for Open Data Network#

---

A goal of OpenDataNetwork.com is to be a developer portal for the purpose of accessing data aggregated from various government portals hosted by Socrata.  The inital effort concentrated on aggregating data in the "housing" category and providing a website for developers to find the data and government officials to discover how to make their data open.  

The following are a list of ideas for future versions of the Open Data Network.


##Aggregation of More Data Categories##

Having aggregated housing data was a great first step.  We should extend this to other data categories like parks, crime, restaurant inspections, health, permits, etc.  The data becomes more interesting as more and more cities' data is included in the system.  

Freshness of data is also interesting to developers for certain categories like restaurant inspections and crime.  Having an automated injestion system to aggregate data from portals would be valuable.

Pre-aggregation is valuable and worth paying for.  No developer wants to write code to pull data for every city data portal in the US or even the major cities.


##How to Get Started Page##

While all the data catalogs exist and there are pages on dev.socrata.com that talk about the REST APIs and the API token, there is no page on OpenDataNetwork.com that describes what a new developer needs to do to get started.  We should create a page that describes what to do in clear simple steps.


##SDKs##

While it may be valuable to have SDKs in various languages to handle making REST requests to various datasets.  What I think would be more valuable would be to have ***category specific APIs*** - i.e. a housing data API, a crime data API or restaurant inspections API.  

For example, to get inspections for a particular region:

	var inspections = await RestaurantInspections.GetInspectionsForRegionAsync(
		Region.Seattle | Region.Redmond);
    
	foreach (var inspection in inspections)
	{
		 //...	}

To get crime reports for a particular region:
	
	var reports = await Crime.GetReportsForRegionAsync(Region.Seattle);
	
	foreach (var report in reports)
	{
		// ...	}

In this way, a developer doesn't need to know anything about the JSON fields returned by the endpoint or what the particular endpoint URL is.  If they want crime data, they use the crime API.  If they want housing data, they use the housing API.

We should provide the SDKs in a variety of popular languages and platforms - Java, Objective-C, Swift, C#, Python, JavaScript, PHP, etc.


##API Playground Page##

It would nice to have a page on the the developer portal where a developer can try out APIs or REST endpoints and see the data in JSON that is returned.


##Code Samples##

Currently the Open Data Network website does not include any code examples.  Code examples can be found on the dev.socrata.com website, but that might be a step too far.  It should be clear on the opendatanetwork.com domain what the steps are to obtain an API key before the user clicks to the separate Socrata domain.


##Data Census Additions##

Having a data census page, where a developer can go to see at a glance how many documents there are for a particular category for a particular city is useful.  However, while currently a developer can see that there are N housing documents for a particular city, they still need to navigate and dig into the particular city portal to find the data catalog they are interested in.  

Furthermore, the aggregated data catalogs are not easily found either.  There is no list of all aggregated data catalogs anywhere on the site.  The user is forced to use the explore page questions to try to find what they want or discover by chance the catalog they want from a tile on the homepage.  I recommend having a simple list of the aggregated data catalogs for each category so that a developer can scan the list and search bots can easily index the catalog pages.  


##Open Data Consumer Profiles##

We have a few articles about companies who are using government data for interesting projects or to power their businesses like Zillow or Trulia.  These developers or companies for the most part are not using the Socrata open data APIs to get their data however.  I think it would be more useful to showcase a developer who is using the Socarat open data API and describe what APIs they used and what catalogs.  Hearing their experience and opinion of how easy it was to get going could be inspiring to others.


