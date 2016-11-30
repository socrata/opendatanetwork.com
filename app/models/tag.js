'use strict';

const _ = require('lodash');
const moment = require('moment');
const numeral = require('numeral');
const Category = require('./category');
const GlobalConfig = require('../../src/config');
const FileCache = require('../lib/fileCache');

class Tag {
    static tags(n) {
        return new Promise((resolve, reject) => {
            Category.catalog('tags', n).then(response => {
                Tag.tagMetadata().then(metadata => {
                    const tags = response.results.map(result => {
                        result.metadata = metadata[result.tag] || GlobalConfig.catalog.default_metadata;
                        return result;
                    });

                    resolve(tags);
                }, reject);
            }, reject);
        });
    }

    static tagMetadata() {
        return FileCache.get('../data/tag-metadata.json');
    }
}
module.exports = Tag;
