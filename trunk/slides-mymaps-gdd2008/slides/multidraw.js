/*
* Copyright 2008 Google
* Licensed under the Apache License, Version 2.0;
*       http://www.apache.org/licenses/LICENSE-2.0
*/

function startPoly() {
  poly = new GPolyline([]);
  map.addOverlay(poly);
  poly.enableDrawing();
  GEvent.addListener(poly, "endline", function() {
    var list = document.getElementById("linelist");
    if (list) {
      list.innerHTML += "<li> " + 
	poly.getVertexCount() + " vertices";
      startPoly();
    }
  });
  GEvent.addListener(poly, "cancelline", function () {
    map.removeOverlay(poly);
    startPoly();
  });
}

startPoly();
