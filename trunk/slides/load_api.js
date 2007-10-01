// Copyright 2006 Google
//
// Author: Steffen Meschkat <mesch@google.com>
//
// Base testing javascript functionality.

// Key for steffen.meschkat@gmail.com for http://google.com/. Needed
// to make geocoding work.
var key =
 'ABQIAAAA-O3c-Om9OcvXMOJXreXHAxQGj0PqsCtxKvarsoS-iqLdqZSKfxS27kJqGZajBjvuzOBLizi931BUow';

function script(src) {
  var onerror =
    "alert('WARNING: script from '" +
    " + this.getAttribute('src')" +
    " + ' failed to load')";
  var s =
    '<script' +
    ' onerror="' + onerror + '"' +
    ' src="' + src + '"' +
    ' type="text/javascript"></script>';
  document.write(s);
}

function style(selector, property, value) {
  var s =
    '<style>' + selector +
    '{' + property + ':' + value + '}' +
    '</style>'
  document.write(s);
}

function fromUrlParams(q, pmap) {
  q = q.replace(/^\?/, '');
  var plist = q.split(/&+/);
  for (var i in plist) {
    var p = plist[i];
    var e = p.indexOf('=');
    if (e != -1) {
      var k = p.substring(0, e);
      var v = p.substring(e + 1);
      pmap[k] = v;
    }
  }
}

function toUrlParams(p) {
  var q = '';
  for (var i in p) {
    if (q) {
      q += '&';
    }
    q += i + '=' + p[i];
  }
  return q;
}


(function () {
  var pmap = {
    api: window.__api__ || 'http://maps.google.com/',
    file: window.__file__ || 'api',
    v: '2.x',
    key: key
  };
  fromUrlParams(window.location.search, pmap);
  var api = pmap.api;
  delete pmap.api;
  api += '?' + toUrlParams(pmap);
  script(api);
})();
