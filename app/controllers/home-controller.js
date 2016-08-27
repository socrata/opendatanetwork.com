'use strict';
const API = require('./api');
const HomeHelper = require('../lib/home-helper');

class HomeController {
    static index(req, res) {
        const categoriesPromise = API.categories();
        const domainsPromise = API.domains(quickLinksCount);
        const locationsPromise = API.locations();
        const paramsPromise = RenderController._parameters(req, res);
        const allPromise = Promise.all([categoriesPromise, locationsPromise, paramsPromise, domainsPromise]);

        allPromise.then(data => {
            try {
                const categories = data[0];
                const locations = data[1];
                const params = data[2];

                const randomRegions = HomeHelper.getRandomMostPopulousRegionsFromEachState(locations, 100);
                const questionsPromises = _.map(randomRegions, region => Questions.getQuestionsForRegions([region]));

                Promise.all(questionsPromises).then(questionsData => {
                    const randomQuestions = HomeHelper.getRandomQuestions(questionsData);

                    const templateParams = {
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
                            '/lib/third-party/js.cookie-2.1.1.min.js',
                            '/lib/third-party/lodash.min.js',
                            '/lib/home.min.js'
                        ]
                    };

                    res.render('home.ejs', templateParams);
                });
            } catch (error) {
                RenderController.error(req, res)(error);
            }
        }, RenderController.error(req, res));
    }
}

module.exports = HomeController;
