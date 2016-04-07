Our current sitemap includes the following:

- Root
- Join
- All search results by categories
- All search results by tags
- All search results by domains
- All regions * each supported vector

To generate this, we run some scripts on the us-roster-sorted.txt file which has all the regions sorted by population.

To generate the basic URLs (root, join, all categories, tags, domains), run:

- $node tasks/generate-sitemap-urls-basic.js 

This emits the basic URLs in - tasks/output/urls-basic-ok.txt

Now run generate-sitemap-urls-vectors.js

- $node tasks/generate-sitemap-urls-vectors.js

This emits two files - tasks/output/urls-datasets-ok.txt and tasks/output/urls/datasets-classroom-statistics-to-check.txt

Now, check each of the URLs in the classroom_statistics file to see if the source dataset actually data for the region.

- $node tasks/generate-sitemap-urls-classroom-statistics.js 

This emits - tasks/output/urls-datasets-classroom-statistics-ok.txt

So now we have three files that we care about:

- urls-basic-ok.txt
- urls-datasets-ok.txt
- urls-datasets-classroom-statistics-ok.txt

Open the two urls-datasets-* files in Excel, sort by population desc.
Open a new worksheet and paste in the urls-basic-ok.txt, making these first.
Now it as a tab delimited file called - tasks/output/urls-combined-ok.txt

Finally, run the generate-sitemap-from-urls.js to create the final sitemap.txt from the urls-combined-ok.txt

- $node tasks/generate-sitemap-from-urls.js

This emits the views/static/sitemap.txt with 50,000 URLs.
 

