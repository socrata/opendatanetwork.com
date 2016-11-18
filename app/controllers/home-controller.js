'use strict';

const _ = require('lodash');
const htmlencode = require('htmlencode').htmlEncode;
const moment = require('moment');
const numeral = require('numeral');

const Category = require('../models/category');
const Place = require('../models/place');

const HomeHelper = require('../lib/home-helper');
const ParamsHelper = require('../lib/params-helper');
const ErrorHandler = require('../lib/error-handler');
const ODNClient = require('../../src/odn-client/odn-client');
const Navigate = require('../../src/navigate/entity');

const GlobalConfig = require('../../src/config');

//TODO: Same var in dataset controller as well. Extract it out.
const quickLinksCount = 15;
const defaultMetaSummary = 'Find the data you need to power your business, app, or analysis from across the open data ecosystem.';

class HomeController {
    static index(req, res) {
        const categoriesPromise = Category.categories();
        const domainsPromise = Category.domains(quickLinksCount);
        const locationsPromise = Place.locations();
        const paramsPromise = ParamsHelper.parameters(req, res);
        const allPromise = Promise.all([categoriesPromise, locationsPromise, paramsPromise, domainsPromise]);

        allPromise.then(data => {
            try {
                const categories = data[0];
                const locations = data[1];
                const params = data[2];

                const randomRegions = HomeHelper.getRandomMostPopulousRegionsFromEachState(locations, 100);
                const questionsPromises = _.map(randomRegions, region => {
                    return ODNClient.searchQuestions(region.name, 15);
                });

                Promise.all(questionsPromises).then(questionsData => {
                    const randomQuestions = HomeHelper.getRandomQuestions(questionsData);

                    const templateParams = {
                        GlobalConfig,
                        Navigate,
                        categories,
                        locations,
                        params,
                        title : 'Open Data Network',
                        metaSummary : defaultMetaSummary,
                        questions : randomQuestions,
                        quickLinks : {
                            categories : categories.slice(0, quickLinksCount),
                            domains : data[3].results,
                            ref : 'hp',
                            regions : locations.slice(0, quickLinksCount),
                        },
                        css : [
                            '//cdn.jsdelivr.net/jquery.slick/1.5.0/slick.css',
                            '/styles/home.css',
                            '/styles/main.css'
                        ],
                        scripts : [
                            '//cdn.jsdelivr.net/jquery.slick/1.5.0/slick.min.js',
                            {
                                'url' : '//fast.wistia.net/static/popover-v1.js',
                                'charset' : 'ISO-8859-1'
                            },
                            '/lib/third-party/d3.min.js',
                            '/lib/third-party/d3.promise.min.js',
                            '/lib/third-party/lodash.min.js',
                            '/lib/home.min.js'
                        ]
                    };

                    res.render('home.ejs', templateParams);
                });
            } catch (error) {
                ErrorHandler.error(req, res)(error);
            }
        }, ErrorHandler.error(req, res));
    }
}

module.exports = HomeController;
