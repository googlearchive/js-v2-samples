/*
* Copyright 2008 Google
* Licensed under the Apache License, Version 2.0;
*       http://www.apache.org/licenses/LICENSE-2.0
*/

polygon = polygon || new GPolygon([new GLatLng(37.7829, -122.4050), new GLatLng(37.7838, -122.4038), new GLatLng(37.7833, -122.4030), new GLatLng(37.7823, -122.4043), new GLatLng(37.7829,-122.4050)], "#f00", 2, 0.7, "#f00", 0.2);
map.addOverlay(polygon);
map.setCenter(new GLatLng(37.783159, -122.40392), 18);

GEvent.addListener(polygon, "lineupdated", function (latlng, index, blah) {
    alert(": " + latlng + ", " + index + ", " + blah);
});

