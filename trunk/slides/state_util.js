/**
 * @author Steffen Meschkat (mesch@google.com)
 *
 * @fileoverview Utility functions used to manage application state.
 */


/**
 * Decodes URL-encoded application state into name value pairs stored
 * as poprerties on an Object.
 *
 * @param {String} encoded The State encoded in URL parameters.
 *
 * @return {Object} The decoded state as properties of an Object.
 */
function decode(encoded) {
  var params = encoded.split("&");
  var state = {};
  for (var i = 0; i < params.length; i++) {
    var nameValue = params[i].split("=");
    if (nameValue[0]) {
      state[decodeURIComponent(nameValue[0])] =
          decodeURIComponent(nameValue[1]);
    }
  }
  return state;
}


/**
 * Encodes the state given as proeprties of an Object into URL
 * parameters.
 *
 * @param {Object} state The state object.
 *
 * @return {String} URL parameter encoded state object.
 */
function encode(state) {
  var params = [];
  for (var name in state) {
    if (state.hasOwnProperty(name)) {
      var value = state[name];
      if (value != null) {
        params.push(encodeURIComponent(name) + "=" +
                    encodeURIComponent(value));
      }
    }
  }
  return params.join("&");
}

/**
 * Elegant wrapper function for document.getElementById().
 *
 * @param {String} id The id of the element.
 * @return {Element} The DOM element with the given id.
 */
function $(id) {
  return document.getElementById(id);
}

/**
 * Merges two states. The source state overrides the destination
 * state.
 *
 * @param {Object} destination
 * @param {Object} source
 */
function mergeState(destination, source) {
  for (var i in source) {
    if (source.hasOwnProperty(i)) {
      destination[i] = source[i];
    }
  }
}

/**
 * Merges two states. The source state does not override the
 * destination state.
 *
 * @param {Object} destination
 * @param {Object} source
 */
function mergeStateUnder(destination, source) {
  for (var i in source) {
    if (source.hasOwnProperty(i) && !destination.hasOwnProperty(i)) {
      destination[i] = source[i];
    }
  }
}

function recordExternalState(name, value) {
  document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);
  currentExternalState[name] = value;
}

function getExternalState(name) {
  var re = new RegExp("\\b" + encodeURIComponent(name) + "=([^;]*)");
  var values = re.exec(document.cookie);
  return values ? decodeURIComponent(values[1]) : null;
}

function detectExternalStateChange(name, load) {
  var currentValue = null;
  window.setInterval(function() {
    var externalValue = getExternalState(name);
    if (currentValue !== externalValue) {
      currentValue = externalValue;
      load(currentValue);
    }
  }, 100);
}

function $(id) {
  return document.getElementById(id);
}

function urlQuery(window) {
  return window.location.search.substring(1);
}
