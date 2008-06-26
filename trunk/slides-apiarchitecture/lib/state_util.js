/**
 * @author Steffen Meschkat (mesch@google.com)
 *
 * @fileoverview Utility functions used to manage application state.
 */


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

function urlQuery(window) {
  return window.location.search.substring(1);
}
