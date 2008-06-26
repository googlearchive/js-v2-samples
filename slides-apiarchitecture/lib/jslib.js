/**
 * @fileoverview A random collection of utility functions used in this
 * project.
 *
 * @author Steffen Meschkat (mesch@google.com)
 */


function bind(object, method) {
  return function() {
    return method.apply(object, arguments);
  }
}


function foreach(array, fn) {
  for (var i = 0; i < array.length; ++i) {
    try {
      fn(array[i]);
    } catch (e) {}
  }
}


function domTraverseElements(node, method) {
  method(node);
  for (var c = node.firstChild; c; c = c.nextSibling) {
    if (c.nodeType == 1) {
      arguments.callee(c, method);
    }
  }
}


function domTestClass(element, cls) {
  var classes = (element.className || '').split(/\s+/);
  for (var i = 0; i < classes.length; ++i) {
    if (classes[i] == cls) {
      return true;
    }
  }
  return false;
}


function domAddClass(element, cls) {
  var classes = (element.className || '').split(/\s+/);
  for (var i = 0; i < classes.length; ++i) {
    if (classes[i] == cls) {
      return;
    }
  }
  classes.push(cls);
  element.className = classes.join(' ');
}


function domRemoveClass(element, cls) {
  var classes = (element.className || '').split(/\s+/);
  for (var i = 0; i < classes.length; ++i) {
    if (classes[i] == cls) {
      classes.splice(i--, 1);
    }
  }
  element.className = classes.join(' ');
}


function xmlEscapeText(text) {
  return text.
    replace(/&/g, '&amp;').
    replace(/</g, '&lt;').
    replace(/>/g, '&gt;');
}


function d0(var_args) {
  foreach(arguments, function(id) {
    $(id).style.display = 'none';
  });
}


function d1(var_args) {
  foreach(arguments, function(id) {
    $(id).style.display = '';
  });
}


function v0(var_args) {
  foreach(arguments, function(id) {
    $(id).style.visibility = 'hidden';
  });
}


function v1(var_args) {
  foreach(arguments, function(id) {
    $(id).style.visibility = '';
  });
}


function $(id) {
  return document.getElementById(id);
}


function create(el) {
  return document.createElement(el);
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
