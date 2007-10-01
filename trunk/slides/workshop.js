function wsClear() {
  $('wsedit').innerHTML = '';
  $('wscode').innerHTML = '';
  d0('wsedit', 'wscode');
}


function wsLoad(name) {
  xget('workshop/' + name + '.js', function(text) {
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


