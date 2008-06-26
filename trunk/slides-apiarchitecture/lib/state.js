/**
 * @author Steffen Meschkat (mesch@google.com)
 *
 * @fileoverview Core functions that are used to manage Ajax
 * application state with the URL fragment identifier method.
 */


/**
 * Manager for application state stored in the fragment identifier
 * part of the page URL. Obtains the initial state of the application
 * based on the current page URL.
 *
 * @constructor
 */
function State() {
  /**
   * Map that says which state elements dominate which other. The keys
   * are the dominant elements, the values are arrays of properties
   * that are recessive against that element. If an element changes,
   * all state elements that are dominated by it are deleted.
   *
   * @type {Object}
   */
  this.dominatedElements_ = {};

  /**
   * This variable contains the current state of the application in
   * its external representation, i.e.  as URL parameters. It is used
   * by the history detection function to detect history navigation:
   * If the fragment identifier of the URL of the page is different
   * that the value stored in this object, then a history navigation
   * event occurred and the application is notified. It is global in
   * order to share it with the function that updates the page URL to
   * reflect changed application state: this must not be mistaken for
   * history navigation.
   *
   * @type {Object}
   */
  this.currentHash_ = document.location.hash;
}


/**
 * Adds an entry to the dominance hierarchy of state elements.
 */
State.prototype.dominate = function(dominantElement, dominatedElement) {
  if (this.dominatedElements_[dominantElement] == null) {
    this.dominatedElements_[dominantElement] = [];
  }
  this.dominatedElements_[dominantElement].push(dominatedElement);
};


/**
 * Binds the State manager to its application and initializes the
 * application from the current encoded state.
 *
 * @param {Function} loader A function that takes a state Object as
 * argument and resets the applications into the state represented by
 * that object.
 */
State.prototype.init = function(loader) {
  var state = State.decode(this.currentHash_.substring(1));
  loader(state);
  this.detectHistoryNavigation_(loader);
};


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
State.prototype.recordState = function(name, value, hard) {
  var me = this;
  window.setTimeout(function() {
    me.recordStateImpl_(name, value, hard);
  }, 10);
};


State.prototype.recordStateImpl_ = function(name, value, hard) {
  if (typeof console != 'undefined') {
    console.log(name + ' ' + value);
  }
  var state = State.decode(location.hash.substring(1));
  state[name] = value;

  var dominated = this.dominatedElements_[name] || [];
  for (var i = 0; i < dominated.length; ++i) {
    delete state[dominated[i]];
  }

  var stateUrl = State.encode(state);
  this.currentHash_ = "#" + stateUrl;

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
    location.href = this.currentHash_;
  } else {
    location.replace(this.currentHash_);
  }
  document.body.removeChild(a);
};


/**
 * Initializes history navigation detection. Sets up a function that
 * polls the current URL and detects if it changes. If it does,
 * invokes a callback with the new application state decoded from the
 * new URL.
 *
 * This function uses the proprty currentHash. The last seen encode
 * state is stored in this string. This allows to share the current
 * value with recordState(), so that the load() callback is not
 * invoked when the application updates the state.
 *
 * @param {Function} load A function that is invoked when the page URL
 * chnages. Receives the new application state decoded from the new
 * page URL as argument.
 */
State.prototype.detectHistoryNavigation_ = function(load) {
  var me = this;
  window.setInterval(function() {
    if (location.hash != me.currentHash_) {
      if (typeof console != 'undefined') {
        console.log(location.hash + ' <- ' + me.currentHash_);
      }
      me.currentHash_ = location.hash;
      var state = State.decode(location.hash.substr(1));
      load(state);
    }
  }, 50);
};


/**
 * Decodes URL-encoded application state into name value pairs stored
 * as poprerties on an Object.
 *
 * @param {String} encoded The State encoded in URL parameters.
 *
 * @return {Object} The decoded state as properties of an Object.
 */
State.decode = function(encoded) {
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
};


/**
 * Encodes the state given as proeprties of an Object into URL
 * parameters.
 *
 * @param {Object} state The state object.
 *
 * @return {String} URL parameter encoded state object.
 */
State.encode = function(state) {
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
};


/**
 * Merges two states. The source state overrides the destination
 * state.
 *
 * @param {Object} destination
 * @param {Object} source
 */
State.merge = function(destination, source) {
  for (var i in source) {
    if (source.hasOwnProperty(i)) {
      destination[i] = source[i];
    }
  }
};


/**
 * Merges two states. The source state does not override the
 * destination state.
 *
 * @param {Object} destination
 * @param {Object} source
 */
State.mergeUnder = function(destination, source) {
  for (var i in source) {
    if (source.hasOwnProperty(i) && !destination.hasOwnProperty(i)) {
      destination[i] = source[i];
    }
  }
};
