/*
* Copyright 2008 Google
* Licensed under the Apache License, Version 2.0;
*       http://www.apache.org/licenses/LICENSE-2.0
*/

polyline = new GPolyline([]);
map.addOverlay(polyline);
polyline.enableDrawing();
GEvent.bind(polyline, "mouseover", polyline, 
            polyline.enableEditing);
GEvent.bind(polyline, "mouseout", polyline, 
            polyline.disableEditing);
GEvent.addListener(polyline, "click", 
                   function (latlng, index) {
  if (index === 0) {
    polyline.enableDrawing({"fromStart": true});
  } else if (index == polyline.getVertexCount() - 1) {
    polyline.enableDrawing({"fromStart": false});
  }
});
