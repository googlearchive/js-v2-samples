/*
* Copyright 2008 Google
* Licensed under the Apache License, Version 2.0;
*       http://www.apache.org/licenses/LICENSE-2.0
*/
map.setCenter(new GLatLng(40.01, 116.4), 12);
polygon = new GPolygon([], "#ff0000", 2, 0.7, 
		       "#ff0000", 0.2);
map.addOverlay(polygon);
polygon.enableDrawing();
