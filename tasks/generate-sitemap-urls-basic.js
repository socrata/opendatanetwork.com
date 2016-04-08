'use strict';

const fs = require('fs');
const readline = require('readline');
const request = require('request');

const categoriesUrl = 'http://api.us.socrata.com/api/catalog/v1/categories';
const domainsUrl = 'http://api.us.socrata.com/api/catalog/v1/domains';
const tagsUrl = 'http://api.us.socrata.com/api/catalog/v1/tags';
const outputPath = __dirname + '/output/urls-basic-ok.txt';

// Create the output file
//
const outputStream = fs.createWriteStream(outputPath);

// Write the first few URLs
//
outputStream.write('http://www.opendatanetwork.com/\n');
outputStream.write('http://www.opendatanetwork.com/join-open-data-network\n');

// Begin the chain
//
generateCategoryUrls(() => {
    generateTagUrls(() => {
        generateDomainUrls(() => {
            console.log('Done');
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

function generateUrl(url) {

    outputStream.write(url);
    outputStream.write('\n');
}

// Extensions
//
String.prototype.format = function() {

    var args = arguments;

    return this.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
};
