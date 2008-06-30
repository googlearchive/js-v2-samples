/*
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

function wsClear() {
  $('wsedit').innerHTML = '';
  $('wscode').innerHTML = '';
  d0('wsedit', 'wscode');
}


function wsLoad(name) {
  xget('mapsapi/workshop/' + name + '.js', function(text) {
    $('wsedit').value = text;
    $('wscode').innerHTML = '<pre class="prettyprint">' + 
      xmlEscapeText(text) + '</pre>';
    prettyPrintRun([ $('wscode').firstChild ]);
    d1('wscode');
  });
}


function wsEdit() {
  d0('wscode');
  d1('wsedit');
  $('wsedit').focus();
}


function wsEditEnd() {
  $('wscode').innerHTML = '<pre class="prettyprint">' +
    xmlEscapeText($('wsedit').value) + '</pre>';
  prettyPrintRun([ $('wscode').firstChild ]);
  d1('wscode');
  d0('wsedit');
  window.setTimeout(function() {
    $('navigator').focus();
  });
}


function wsRun() {
  eval($('wsedit').value);
}


function xget(url, callback) {
  setTimeout(function() {
    if (typeof GDownloadUrl != 'undefined') {
      GDownloadUrl(url, callback);
    } else {
      var xhr = new XMLHttpRequest;
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          callback(xhr.responseText);
        }
      };
      xhr.open("GET", url);
      xhr.send(null);
    }
  }, 0);
}
