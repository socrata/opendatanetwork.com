'use strict';

const fs = require('fs');
const readline = require('readline');
const request = require('request');

const classroomStatisticsUrl = 'https://odn.data.socrata.com/resource/kx62-ayme.json?$where=id=\'{0}\'';
const inputPath = __dirname + '/output/urls-datasets-classroom-statistics-to-check.txt';
const outputPath = __dirname + '/output/urls-datasets-classroom-statistics-ok.txt';
const regions = [];

var regionIndex = 0;

// Create the output file
//
const outputStream = fs.createWriteStream(outputPath);

// Generate the sitemap
//
populateRegions(() => {

//    regions.length = 100;

    next();
});

function next() {

    if (regionIndex < regions.length) {

        getClassroomStatistics();
        return;
    }

    console.log('Done');
}

function getClassroomStatistics() {

    const region = regions[regionIndex];
    const url = classroomStatisticsUrl.format(region.id);

    console.log(regionIndex + ' ' + region.url);

    getFromApi(
        url, 
        data => {

            if (data.length > 0) {
                generateUrl(region);
            }

            regionIndex++;
            next();
        },
        () => {

            outputStream.end();
            console.log('Error');
        });
}

function generateUrl(region) {

    outputStream.write(region.url);
    outputStream.write('\t');
    outputStream.write(region.population);
    outputStream.write('\n');
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

function populateRegions(successHandler) {

    // Read the roster input file
    //
    const rd = readline.createInterface({ 
        input : fs.createReadStream(inputPath) 
    });

    // Output each region URL
    //
    rd.on('line', line => {

        const parts = line.split('\t');

        if (parts.length == 0)
            return;

        const url = parts[0];
        const regionId = parts[1];
        const population = parts[2];

        regions.push({
            url: url,
            id: regionId,
            population: population
        });
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
