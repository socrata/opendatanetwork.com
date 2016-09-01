
/**
 * Function for retrieving JSON data that can be shared between server and client.
 */

if (typeof require !== 'undefined') {
    module.exports = require('../../app/lib/request').getJSON;
} else if (typeof d3 !== 'undefined') {
    var getJSON = d3.promise.json;
} else {
    throw new Error('no library found for retrieving JSON data');
}

