'use strict';

const fs = require('fs');
const readline = require('readline');
const request = require('request');

const categoriesUrl = 'http://api.us.socrata.com/api/catalog/v1/categories';
const domainsUrl = 'http://api.us.socrata.com/api/catalog/v1/domains';
const tagsUrl = 'http://api.us.socrata.com/api/catalog/v1/tags';
const outputPath = __dirname + '/../views/static/sitemap.txt';

// Create the output file
//
const outputStream = fs.createWriteStream(outputPath);

// Write the first few URLs
//
outputStream.write('<?xml version="1.0" encoding="UTF-8"?>\n');
outputStream.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n');
outputStream.write('<url><loc>http://www.opendatanetwork.com/</loc><changefreq>weekly</changefreq></url>\n');
outputStream.write('<url><loc>http://www.opendatanetwork.com/join-open-data-network</loc><changefreq>weekly</changefreq></url>\n');

// Begin the chain
//
generateCategoryUrls(() => {
    generateTagUrls(() => {
        generateDomainUrls(() => {
            generateRegionUrls(() => {
                closeSitemap();
            });
        });
    });
});

function generateDomainUrls(successHandler) {

    console.log('generateDomainUrls');

    getFromApi(
        domainsUrl,
        data => {

            data.results.forEach(result => {
                generateUrl('http://www.opendatanetwork.com/search?domains=' + encodeURIComponent(result.domain));
            });

            successHandler();
        },
        () => {

            outputStream.end();
            console.log('Error');
        });
}

function generateTagUrls(successHandler) {

    console.log('generateTagUrls');

    getFromApi(
        tagsUrl,
        data => {

            data.results.forEach(result => {
                generateUrl('http://www.opendatanetwork.com/search?tags=' + encodeURIComponent(result.tag));
            });

            successHandler();
        },
        () => {

            outputStream.end();
            console.log('Error');
        });
}

function generateCategoryUrls(successHandler) {

    console.log('generateCategoryUrls');

    getFromApi(
        categoriesUrl,
        data => {

            data.results.forEach(result => {
                generateUrl('http://www.opendatanetwork.com/search?categories=' + encodeURIComponent(result.category));
            });

            successHandler();
        },
        () => {

            outputStream.end();
            console.log('Error');
        });
}

function closeSitemap() {

    outputStream.end('</urlset>');
    console.log('Done');
}

function getFromApi(url, successHandler, errorHandler) {

    request(
        {
            url: url,
            headers: { 'User-Agent' : 'ODN generate-sitemap.js' }
        },
        (err, resp) => {

            if (err) {
                if (errorHandler) errorHandler();
                return;
            }

            if (resp.statusCode != 200) {
                if (errorHandler) errorHandler();
                return;
            }

            if (successHandler) {

                const results = JSON.parse(resp.body);
                successHandler(results);
            }
        });
}

function generateRegionUrls(successHandler) {

    console.log('generateRegionUrls');

    // Read the roster input file
    //
    const rd = readline.createInterface({
        input: fs.createReadStream(__dirname + '/us-roster-sorted.txt')
    });
    
    // Output each region URL
    //
    rd.on('line', line => {

        const parts = line.split('\t');
        const regionId = parts[0];
        const regionName = parts[1];
        const url = 'http://www.opendatanetwork.com/region/{0}/{1}'.format(
            regionId,
            regionName.replace(/ /g, '_').replace(/,/g, '').replace(/"/g, ''));

        generateUrl(url);

    }).on('close', successHandler);
}

function generateUrl(url) {

    outputStream.write('<url><loc>');
    outputStream.write(url);
    outputStream.write('</loc><changefreq>weekly</changefreq></url>\n');
}

// Extensions
//
String.prototype.format = function() {

    var args = arguments;

    return this.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
};
