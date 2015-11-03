var ApiController = require('./api-controller');
var CategoryController = require('./category-controller');
var TagController = require('./tag-controller');

var path = require('path');

var apiController = new ApiController();
var categoryController = new CategoryController();
var tagController = new TagController();
var defaultSearchResultCount = 60;

module.exports = RenderController;

function RenderController() {
}

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
            RenderController.prototype.getSearchParameters(req, function(params) {

                // Render page
                //
                res.render(
                    'v4-home.ejs', 
                    {
                        css : ['/styles/v4-home.min.css', '//cdn.jsdelivr.net/jquery.slick/1.5.0/slick.css'],
                        scripts : [
                            '/scripts/v4-api-controller.js', // TODO: min
                            '/scripts/v4-auto-suggest-region-controller.js', // TODO: min
                            '/scripts/v4-search-menu-controller.js', // TODO: min
                            '/scripts/v4-home.js', // TODO: min
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

// Search
//
RenderController.prototype.renderSearchWithVectorPage = function(req, res) {

    if ((req.params.vector == 'population') ||
        (req.params.vector == 'earnings') ||
        (req.params.vector == 'education') ||
        (req.params.vector == 'occupations') ||
        (req.params.vector == 'gdp') ||
        (req.params.vector == 'cost_of_living')) {

        RenderController.prototype.getSearchParameters(req, function(params) {

            RenderController.prototype._renderSearchPage(req, res, params);
        });
    }
    else {

        RenderController.prototype.renderErrorPage(req, res); 
    }
};

RenderController.prototype.renderSearchPage = function(req, res) {

    RenderController.prototype.getSearchParameters(req, function(params) {

        RenderController.prototype._renderSearchPage(req, res, params);
    });
};

RenderController.prototype._renderSearchPage = function(req, res, params) {

    apiController.getCategoriesAll(function(allCategoryResults) {

        apiController.getDatasetsForRegions(
            params, 
            function(results) {

                res.render(
                    'v4-search.ejs', 
                    {
                        css : ['/styles/v4-search.min.css'],
                        scripts : [
                            '//cdnjs.cloudflare.com/ajax/libs/numeral.js/1.4.5/numeral.min.js',
                            '/scripts/v4-api-controller.js', // TODO: min
                            '/scripts/v4-auto-suggest-region-controller.js', // TODO: min
                            '/scripts/v4-search-page-controller.js', // TODO: min
                            '/scripts/v4-search.js', // TODO: min
                            ],
                        params : params,
                        allCategoryResults : allCategoryResults,
                        searchResults : results,
                        tooltips : false
                    });
            }, 
            function() {

                RenderController.prototype.renderErrorPage(req, res); 
            });
    });
};

RenderController.prototype.renderSearchResults = function(req, res) {

    var params = RenderController.prototype.getSearchParameters(req.query);

    apiController.search(params, function(searchResults) {

        if (searchResults.results.length == 0) {

            res.status(204);
            res.end();
            return;
        }

        res.render(
            'v4-search-results.ejs',
            {
                css : [],
                scripts : [],
                params : params,
                searchResults : searchResults,
            });
    });
};

RenderController.prototype.getSearchParameters = function(req, completionHandler) {

    var query = req.query;
    var categories = RenderController.prototype.getNormalizedArrayFromDelimitedString(query.categories);
    var domains = RenderController.prototype.getNormalizedArrayFromDelimitedString(query.domains);
    var tags = RenderController.prototype.getNormalizedArrayFromDelimitedString(query.tags);
    var page = isNaN(query.page) ? 1 : parseInt(query.page);
    var ec = RenderController.prototype.getExpandedFiltersSetting(query.ec);
    var ed = RenderController.prototype.getExpandedFiltersSetting(query.ed);
    var et = RenderController.prototype.getExpandedFiltersSetting(query.et);

    var params = {

        categories : categories,
        domains : domains,
        limit : defaultSearchResultCount,
        offset : (page - 1) * defaultSearchResultCount,
        only : 'datasets',
        page : page,
        q : query.q || '',
        regions: [],
        tags : tags,
        ec : ec,
        ed : ed,
        et : et,
        vector : req.params.vector || 'population',
    };

    // Regions are in the URL path segment, not a query parameter
    //
    if ((req.params.region == null) || (req.params.region.length == 0)) {

        if (completionHandler) completionHandler(params);
        return;
    }

    var parts = req.params.region.split2('_vs_');
    var regions = parts.map(function(region) { return region.replace(/_/g, ' ') });

    apiController.getAutoCompleteName(regions, function(results) {

        if (results.length > 0) {

            params.regions = results.map(function(result) {
                return { id : result.id, name : result.name, type : result.type };
            });
        }

        if (completionHandler) completionHandler(params);
    });
};

RenderController.prototype.getExpandedFiltersSetting = function(queryValue) {

    return isNaN(queryValue) ? false : (parseInt(queryValue) == 1);
};

RenderController.prototype.getNormalizedArrayFromDelimitedString = function(s) {

    if (s == null) 
        return [];

    var parts = s.split(',');

    if ((parts.length == 1) && (parts[0] == ''))
        parts = [];

    for (var i in parts) {
        parts[i] = parts[i].toLowerCase();
    }

    return parts;
};

// Extensions
//
String.prototype.split2 = function(s) {

    var rg = this.split(s);

    if ((rg.length == 1) && (rg[0] == ''))
        return [];

    return rg;
};
