const _ = require('lodash');
const moment = require('moment');
const numeral = require('numeral');
const Category = require('./category');
const Constants = require('../controllers/constants');
const FileCache = require('../lib/fileCache');

class Tag {
  static tags(n) {
    return new Promise((resolve, reject) => {
      Category.catalog('tags', n).then(response => {
        Tag.tagMetadata().then(metadata => {
          const tags = response.results.map(result => {
            result.metadata = metadata[result.tag] || Constants.DEFAULT_METADATA;
            return result;
          });

          resolve(tags);
        }, reject);
      }, reject);
    });
  }

  static currentTag(params, tags) {
    if (params.tags.length != 1) return null;
    return _.find(tags, tag => tag.tag === params.tags[0].toLowerCase());
  }

  static tagMetadata() {
    return FileCache.get('data/tag-metadata.json');
  }
}
module.exports = Tag;