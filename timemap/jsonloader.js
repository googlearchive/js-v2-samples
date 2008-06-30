/*----------------------------------------------------------------------------
 * JSON Loader 
 *
 * @author Nick Rabinowitz (www.nickrabinowitz.com)
 * This is a simple, generalized way to load JSON data. It assumes that the 
 * JSON can be loaded from a url to which a callback function name can be
 * appended, e.g. "http://www.test.com/getsomejson.php?callback="
 * The loader then appends a nonce function name which the JSON should include.
 * This works for services like GData.
 *
 * Usage:
 *      JSONLoader.read(jsonUrl, function(result) {
 *          // do something with the JSON data, e.g.:
 *          dataset.loadItems(result);
 *      });
 *
 *---------------------------------------------------------------------------*/

var JSONLoader = {};
JSONLoader.counter = 0;

/**
 * Reads JSON from a URL, assuming that the service is set up to applied
 * a callback function specified in the URL parameters.
 *
 * @param {String}      jsonUrl     URL to load, missing the callback function name
 * @param {function}    f           Callback function to apply to returned data
 */
JSONLoader.read = function(jsonUrl, f) {
    // Define a unique function name
    var callbackName = "_" + JSONLoader.counter++;

    JSONLoader[callbackName] = function(result) {
        f(result);                           // Pass result to user function
    };

    // Create a script tag, set its src attribute and add it to the document
    // This triggers the HTTP request and submits the query
    var script = document.createElement("script");
    script.src = jsonUrl + "JSONLoader." + callbackName;
    document.body.appendChild(script);
};