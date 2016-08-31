'use strict';

const fs = require('fs');
const _ = require('lodash');
const moment = require('moment');
const numeral = require('numeral');

const _fileCache = {};

class FileCache {
    static get(path) {
        return new Promise((resolve, reject) => {
            if (path in _fileCache) {
                resolve(_fileCache[path]);
            } else {
                fs.readFile(`${__dirname}/../${path}`, (error, data) => {
                    if (error) {
                        reject(error);
                    } else {
                        const json = JSON.parse(data);
                        _fileCache[path] = json;
                        resolve(json);
                    }
                });
            }
        });
    }
}
module.exports = FileCache;
