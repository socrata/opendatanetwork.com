'use strict';
const Category = require('../models/category');

class CategoriesController {
    static categories(req, res) {
        Category.categories().then(categories => {
            res.send(JSON.stringify(categories));
        });
    }
}

module.exports = CategoriesController;
