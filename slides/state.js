/**
 * @author Steffen Meschkat (mesch@google.com)
 *
 * @fileoverview Core functions that are used to manage Ajax application
 * state with the URL fragment identifier method.
 *
 * These functions use functions defined in example.js.
 */


/**
 * This variable contains the current state of the application in its
 * external representation, i.e.  as URL parameters. It is used by the
 * history detection function to detect history navigation: If the
 * fragment identifier of the URL of the page is different that the
 * value stored in this object, then a history navigation event
 * occurred and the application is notified. It is global in order to
 * share it with the function that updates the page URL to reflect
 * changed application state: this must not be mistaken for history
 * navigation.
 */
var currentHash = null;


/**
 * Map that says which state elements dominate which other. The keys
 * are the dominant elements, the values are arrays of properties that
 * are recessive against that element. If an element changes, all
 * state elements that are dominated by it are deleted.
 */
var dominatedElements = null;


/**
 * Obtains the initial state of the application based on the URL it
 * was loaded from.
 *
 * @param {Function} loader A function that takes a state Object as
 * argument adnd resets the applications into the state represented by
 * that object.
 *
 * @param {Object} dominate Initializer for dominatedElements.
 */
function applyInitialState(loader, dominate) {
  dominatedElements = dominate;
  currentHash = document.location.hash;
  var state = decode(currentHash.substring(1));
  loader(state);
  detectHistoryNavigation(loader);
}


/**
 * Records the value of a state element in the hard or soft state part
 * of the application state.
 *
 * This uses the global variable currentHash. This function updates
 * the page URL, but we don't want the function that detects history
 * navigation to false consider this a history navigation
 * event. Therefore, we update the URL that the
 * detectHistoryNavigation() function expects to see as the current
 * URL of the page. This is accomplished by sharing the value through
 * this object.
 *
 * @param {String} name The name of the state element.
 *
 * @param {String} value The value of the state element.
 *
 * @param {Boolean} hard If true, the state change is hard, i.e. it
 * creates a new browser history step.
 */
function recordState(name, value, hard) {
  setTimeout(function() {
    recordStateImpl_(name, value, hard);
  }, 10);
}

function recordStateImpl_(name, value, hard) {
  if (typeof console != 'undefined') {
    console.log(name + ' ' + value);
  }
  var state = decode(location.hash.substring(1));
  state[name] = value;

  var dominated = dominatedElements[name] || [];
  for (var i = 0; i < dominated.length; ++i) {
    delete state[dominated[i]];
  }

  var stateUrl = encode(state);
  currentHash = "#" + stateUrl;

  // Internet Explorer will not create a history entry for a changed
  // fragment identifier if there is no anchor in the page that
  // corresponds to it. So we have to create one. Because the browser
  // will scroll to it, we also have to position it at the top of
  // screen.
  var a = document.createElement('A');
  a.style.position = 'absolute';
  a.style.top = getScrollTop(window) + 'px';
  a.name = stateUrl;

  document.body.appendChild(a);
  if (hard) {
    location.href = currentHash;
  } else {
    location.replace(currentHash);
  }
  document.body.removeChild(a);
}


/**
 * Computes the vertical position on the page of the top edge of the
 * browser window.
 *
 * @param {Window} win The window of which to compute the scroll
 * position.
 *
 * @return {Number} The vertical scroll position of the window in
 * pixels.
 */
function getScrollTop(win) {
  if (typeof win.scrollY != 'undefined') {
    return win.scrollY;
  } else if (typeof win.documentElement != 'undefined' &&
    typeof win.documentElement.scrollTop != 'undefined') {
    return win.documentElement.scrollTop + win.document.body.scrollTop;
  } else {
    return win.document.body.scrollTop;
  }
}


/**
 * Initializes history navigation detection. Sets up a function that
 * polls the current URL and detects if it changes. If it does,
 * invokes a callback with the new application state decoded from the
 * new URL.
 *
 * This function uses the global variable currentHash. The last seen
 * state is stored in the property hash of this object. This allows to
 * share the current value with recordState(), so that the load()
 * callback is not invoked when the application updates the state.
 *
 * @param {Function} load A function that is invoked when the page URL
 * chnages. Receives the new application state decoded from the new
 * page URL as argument.
 */
function detectHistoryNavigation(load) {
  window.setInterval(function() {
    if (location.hash != currentHash) {
      if (typeof console != 'undefined') {
        console.log(location.hash + ' <- ' + currentHash);
      }
      currentHash = location.hash;
      var state = decode(location.hash.substr(1));
      load(state);
    }
  }, 50);
}
