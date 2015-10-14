var ApiController = require('./api-controller');
var CategoryController = require('./category-controller');
var TagController = require('./tag-controller');

var path = require('path');

var apiController = new ApiController();
var categoryController = new CategoryController();
var tagController = new TagController();

module.exports = RenderController;

function RenderController() {
};

// Error
//
RenderController.prototype.renderErrorPage = function(req, res) {

    res.status(503);
    res.sendFile(path.resolve(__dirname + '/../views/static/error.html'));
};

// Home
//
RenderController.prototype.renderHomePage = function (req, res) {

    apiController.getCategoriesAll(function(allCategoryResults) {

        categoryController.attachCategoryMetadata(allCategoryResults, function(allCategoryResults) {

            // Set the tooltips shown cookie
            //
            res.cookie('tooltips-shown', '1', { expires: new Date(Date.now() + (1 * 24 * 60 * 60 * 1000)), httpOnly: true }); // one day

            // Get params
            //
            var params = apiController.getSearchParameters(req.query);

            // Render page
            //
            res.render(
                'v3-home.ejs', 
                {
                    css : ['/styles/v3-home.min.css', '//cdn.jsdelivr.net/jquery.slick/1.5.0/slick.css'],
                    scripts : [
                        '/scripts/v3-home.min.js', 
                        '//cdn.jsdelivr.net/jquery.slick/1.5.0/slick.min.js', 
                        {
                            'url' : '//fast.wistia.net/static/popover-v1.js',
                            'charset' : 'ISO-8859-1'
                        }],
                    params : params,
                    allCategoryResults : allCategoryResults,
                    tooltips : (req.cookies['tooltips-shown'] != '1'),
                });
        });
    }, function() { RenderController.prototype.renderErrorPage(req, res); });
};

// Join
//
RenderController.prototype.renderJoinOpenDataNetwork = function(req, res) {

    res.locals.css = 'join.min.css';
    res.locals.title = 'Join the Open Data Network.';
    res.render('join.ejs');
};

RenderController.prototype.renderJoinOpenDataNetworkComplete = function(req, res) {

    res.locals.css = 'join-complete.min.css';
    res.locals.title = 'Thanks for joining the Open Data Network.';
    res.render('join-complete.ejs');
};

// Region
//
RenderController.prototype.renderRegionPopulationChangePage = function(req, res) {

    var params = apiController.getSearchParameters(req.query);
    params.vector = 'population_change';
    RenderController.prototype.renderRegionPage(req, res, params);
};

RenderController.prototype.renderRegionCostsPage = function(req, res) {

    var params = apiController.getSearchParameters(req.query);
    params.vector = 'costs'; // ???
    RenderController.prototype.renderRegionPage(req, res, params);
};

RenderController.prototype.renderRegionPopulationPage = function(req, res) {

    var params = apiController.getSearchParameters(req.query);
    params.vector = 'population';
    RenderController.prototype.renderRegionPage(req, res, params);
};

RenderController.prototype.renderRegionEarningsPage = function(req, res) {

    var params = apiController.getSearchParameters(req.query);
    params.vector = 'earnings';
    RenderController.prototype.renderRegionPage(req, res, params);
};

RenderController.prototype.renderRegionEducationPage = function(req, res) {

    var params = apiController.getSearchParameters(req.query);
    params.vector = 'education';
    RenderController.prototype.renderRegionPage(req, res, params);
};

RenderController.prototype.renderRegionPage = function(req, res, params) {

    var regions = req.params.region.split2('_vs_');
    regions = regions.map(function(region) { return region.replace(/_/g, ' ') });

    console.log('Regions: ' + JSON.stringify(regions));

    apiController.getAutoCompleteName(
        regions, 
        function(results) {

            if (results.length > 0) {

                params.regions = results.map(function(result) {
                    return { id : result.id, name : result.name };
                });

                RenderController.prototype.doRenderSearchPage(req, res, params);
            }
            else {

                res.redirect(302, '/v4-search');
            }
        },
        function() { RenderController.prototype.renderErrorPage(req, res); });
};

// Search
//
RenderController.prototype.renderSearchPage = function(req, res) {

    var region = req.query.region;

    if (region != undefined) {
        
        res.redirect(302, '/v4-search/' + region);
        return;
    }

    var params = apiController.getSearchParameters(req.query);

    RenderController.prototype.doRenderSearchPage(req, res, params);
};

RenderController.prototype.doRenderSearchPage = function(req, res, params) {

    var defaultFilterCount = 10;

    // Get all categories for the header menus
    //
    apiController.getCategoriesAll(function(allCategoryResults) {

        categoryController.attachCategoryMetadata(allCategoryResults, function(categoryResults) {

            // Get the current category
            //
            var currentCategory = categoryController.getCurrentCategory(params, allCategoryResults);

            // Get all tags
            //
            apiController.getTagsAll(function(allTagResults) {

                tagController.attachTagMetadata(allTagResults, function(tagResults) {

                    // Get the current tag
                    //
                    var currentTag = tagController.getCurrentTag(params, allTagResults);

                    // Get the categories for the filter menus
                    //
                    var filterCategoryCount = params.ec ? null : defaultFilterCount;
                    apiController.getCategories(filterCategoryCount, function(filterCategoryResults) {
        
                        // Get the domains for the filter menus
                        //
                        var domainCount = params.ed ? null : defaultFilterCount;
                        apiController.getDomains(domainCount, function(filterDomainResults) {
        
                            // Get the tags for the filter menus
                            //
                            var tagCount = params.et ? null : defaultFilterCount;
                            apiController.getTags(tagCount, function(filterTagResults) {
        
                                // Do the search
                                //
                                apiController.search(params, function(searchResults) {
        
                                    res.render(
                                        'v4-search.ejs', 
                                        { 
                                            css : ['/styles/v3-search.min.css'],
                                            scripts : ['/scripts/v3-search.min.js'],
                                            params : params,
                                            currentCategory : currentCategory,
                                            currentTag : currentTag,
                                            allCategoryResults : allCategoryResults,
                                            filterCategoryResults : filterCategoryResults,
                                            filterDomainResults : filterDomainResults,
                                            filterTagResults : filterTagResults,
                                            searchResults : searchResults,
                                            showcaseResults : [],
                                            tooltips : false,
                                        });
                                }, function() { RenderController.prototype.renderErrorPage(req, res) }); // apiController.search
                            }, function() { RenderController.prototype.renderErrorPage(req, res) }); // apiController.getTags
                        }, function() { RenderController.prototype.renderErrorPage(req, res) }); // apiController.getDomains
                    }, function() { RenderController.prototype.renderErrorPage(req, res) }); // apiController.getCategories
                }); // tagController.attachTagMetadata
            }, function() { RenderController.prototype.renderErrorPage(req, res); }); // apiController.getTagsAll
        }); // categoryController.attachCategoryMetadata
    }, function() { RenderController.prototype.renderErrorPage(req, res); }); // apiController.getCategoriesAll
};

RenderController.prototype.renderSearchResults = function(req, res) {

    var params = apiController.getSearchParameters(req.query);

    apiController.search(params, function(searchResults) {

        if (searchResults.results.length == 0) {

            res.status(204);
            res.end();
            return;
        }

        res.render(
            'v3-search-results.ejs',
            {
                css : [],
                scripts : [],
                params : params,
                searchResults : searchResults,
            });
    });
};

// Extensions
//
String.prototype.split2 = function(s) {

    var rg = this.split(s);

    if ((rg.length == 1) && (rg[0] == ''))
        return [];

    return rg;
};
