
const _ = require('lodash');
const sitemap = require('sitemap');
const fs = require('fs-promise');
const mkdirp = require('mkdirp');

const odn = require('../../src/odn-client/odn-client');
const EntityNavigate = require('../../src/navigate/entity');

const entityTypes = require('./entity-types.json');
const variableIDs = require('./variables.json');

const baseDirectory = 'views/static/';
const sitemapDirectory = baseDirectory + 'sitemap/';
mkdirp(sitemapDirectory);
const hostname = 'https://www.opendatanetwork.com';

return Promise.all(entityTypes.map(entityType => {
    return odn.entitiesByType(entityType).then(entities => {
        const sitemaps = variableIDs.map(variableID => {
            return {
                entityType,
                variableID,
                sitemap: generateSitemap(entities, variableID)
            };
        });

        return Promise.resolve(sitemaps);
    });
})).then(allSitemaps => {
    allSitemaps = _.flatten(allSitemaps);

    return Promise.all(allSitemaps.map(writeSitemap)).then(filenames => {
        const index = sitemap.buildSitemapIndex({
            urls: filenames.map(filename => `${hostname}/sitemap/${filename}`)
        });

        const path = baseDirectory + 'sitemap.xml';
        return fs.writeFile(path, oneLine(index)).then(() => Promise.resolve(path));
    });
}).then(indexPath => {
    console.log(`sitemap index written to ${indexPath}`);
    console.log(`sitemaps written to ${sitemapDirectory}`);
    process.exit();
}).catch(error => {
    console.log(error);
});

function dump(object) {
    console.log(require('util').inspect(object));
}

function generateSitemap(entities, variableID) {
    const urls = entities.map(entity => new EntityNavigate([entity], variableID).url());
    return createSitemap(urls);
}

function createSitemap(urls) {
    return sitemap.createSitemap({
        hostname,
        urls: urls.map(formatSitemapURL)
    });
}

function formatSitemapURL(url) {
    return {
        url,
        changefreq: 'monthly'
    };
}

function writeSitemap(sitemap) {
    const path = sitemapPath(sitemap);
    return fs.writeFile(sitemapDirectory + path, oneLine(sitemap.sitemap.toString()))
        .then(() => Promise.resolve(path));
}

function sitemapPath(sitemap) {
    return `${clean(sitemap.entityType)}-${clean(sitemap.variableID)}.xml`;
}

function clean(string) {
    return string.replace(/\W+/g, '_');
}

function oneLine(string) {
    return string.replace(/\n/g, '');
}

