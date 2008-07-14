/*
* Copyright 2008 Google
* Licensed under the Apache License, Version 2.0;
*       http://www.apache.org/licenses/LICENSE-2.0
*/

function spy(e) {
  GEvent.addListener(polyline, e, function() {
    document.getElementById("ispy").innerHTML = e;
  });
}

spy("mouseoverpoint");
spy("mouseoutpoint");
spy("endline"); 
spy("cancelline");
spy("lineupdated");
