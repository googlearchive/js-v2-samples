/*
*
* Copyright 2008 Google
* 
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* 
*       http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
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
