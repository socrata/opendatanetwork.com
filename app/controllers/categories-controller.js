'use strict';

const _ = require('lodash');
const htmlencode = require('htmlencode').htmlEncode;
const moment = require('moment');
const numeral = require('numeral');

const Category = require('../models/category');

class CategoriesController {
    static categories(req, res) {
        Category.categories().then(categories => {
            res.send(JSON.stringify(categories));
        });
    }
}

module.exports = CategoriesController;
