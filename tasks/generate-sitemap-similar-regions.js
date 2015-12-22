'use strict';

const fs = require('fs');
const readline = require('readline');
const request = require('request');

const similarRegionsUrl = 'https://socrata-peers.herokuapp.com/peers.json?id={0}&vectors=occupation,education,earnings,population,population_change&n=3';
const regionsPath = __dirname + '/us-roster-sorted-10000.txt';
const outputPath = __dirname + '/../views/static/sitemap-similar-regions.txt';
const regions = [];

var regionIndex = 0;

// Create the output file
//
const outputStream = fs.createWriteStream(outputPath);

outputStream.write('<?xml version="1.0" encoding="UTF-8"?>\n');
outputStream.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n');

// Generate the sitemap
//
generateSimilarRegionUrls(() => {

//    regions.length = 100;
    next();
});

function next() {

    if (regionIndex < regions.length) {

        getSimilarRegions();
        return;
    }

    closeSitemap();
}

function getSimilarRegions() {

    const region = regions[regionIndex];
    const url = similarRegionsUrl.format(region[0], similarRegionsUrl);

    getFromApi(
        url, 
        data => {

            const firstRegion = { id : region[0], name : region[1] };

            data.most_similar.forEach(similarRegion => {

                const secondRegion = { id : similarRegion.id, name : similarRegion.name };
                generateUrl(firstRegion, secondRegion);
            })

            regionIndex++;
            next();
        },
        () => {

            outputStream.end();
            console.log('Error');
        });
}

function generateUrl(firstRegion, secondRegion) {

    const url = 'http://www.opendatanetwork.com/region/{0}-{1}/{2}-{3}'.format(
        firstRegion.id,
        secondRegion.id,
        firstRegion.name.replace(/ /g, '_').replace(/,/g, '').replace(/"/g, ''),
        secondRegion.name.replace(/ /g, '_').replace(/,/g, '').replace(/"/g, '')
    );

    console.log(regionIndex + ' ' + url);

    outputStream.write('<url><loc>');
    outputStream.write(url);
    outputStream.write('</loc><changefreq>weekly</changefreq></url>\n');
}

function closeSitemap() {

    outputStream.end('</urlset>');
    console.log('Done');
}

function getFromApi(url, successHandler, errorHandler) {

    request(
        {
            url: url,
            headers: { 'User-Agent' : 'ODN generate-sitemap-similar-region.js' }
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

function generateSimilarRegionUrls(successHandler) {

    // Read the roster input file
    //
    const rd = readline.createInterface({ 
        input : fs.createReadStream(regionsPath) 
    });

    // Output each region URL
    //
    rd.on('line', line => {

        const parts = line.split('\t');
        const regionId = parts[0];
        const regionName = parts[1];
        const regionType = parts[2];

        regions.push([regionId, regionName, regionType])

    }).on('close', successHandler);
}

// Extensions
//
String.prototype.format = function() {

    var args = arguments;

    return this.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
};
