
var _ = require('lodash');

/**
 * Factory for creating a function that will test whether links
 * with the given name and href exist in the selection.
 */
function assertLinksTo(test, linkSelector) {
    test.assertExists(linkSelector);
    var links = getLinks(linkSelector);

    return function(name, href) {
        var description = 'Find link named "' + name + '" with href "' + href + '" in "' + linkSelector + '"';
        test.assert(contains(links, {name: name, href: href}), description);
    };
}

function contains(objects, object) {
    return _.any(objects, function(other) {
        return _.all(_.keys(object), function(key) {
            return key in other && roughlyEqual(object[key], other[key]);
        });
    });
}

function roughlyEqual(a, b) {
    return a === b || a == b || clean(a) === clean(b);
}

function clean(string) {
    return _.trim(string.toString().toLowerCase());
}

function getLinks(selector) {
    return casper.getElementsInfo(selector).map(function(link) {
        return {
            href: link.attributes.href,
            name: link.text
        };
    });
}

module.exports = assertLinksTo;

