'use strict';

const fs = require('fs');
const readline = require('readline');
const inputPath = __dirname + '/output/urls-combined-ok.txt';
const outputPath = __dirname + '/../views/static/sitemap.xml';
const maxUrls = 50000;
const outputStream = fs.createWriteStream(outputPath);

var urlCount = 0;

openUrlset(() => {
    writeUrls(() => {
        closeUrlset(() => {
            console.log('Done');
        });
    });
});

function openUrlset(successHandler) {

    outputStream.write('<?xml version="1.0" encoding="UTF-8"?>\n');
    outputStream.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n');
    successHandler();
}

function writeUrls(successHandler) {

    const rd = readline.createInterface({ 
        input : fs.createReadStream(inputPath) 
    });

    // Output each URL from the source file
    //
    rd.on('line', line => {

        if (urlCount >= maxUrls)
            return;

        const parts = line.split('\t');

        if (parts.length == 0)
            return;

        writeUrl(parts[0]);
        urlCount++;

    }).on('close', successHandler);
}

function writeUrl(url) {

    outputStream.write('<url><loc>');
    outputStream.write(url);
    outputStream.write('</loc><changefreq>weekly</changefreq></url>\n');
}

function closeUrlset(successHandler) {

    outputStream.end('</urlset>');
    successHandler();
}
