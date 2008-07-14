/*
* Copyright 2008 Google
* Licensed under the Apache License, Version 2.0;
*       http://www.apache.org/licenses/LICENSE-2.0
*/

var url = "http://ditu.google.com/maps/" + 
  "ms?msa=0&msid=";

var mapid = "105498083399349668294" +
  ".00044d0490f73e7f5c173";
var format = "&output=kml";

var geoXml = new GGeoXml(url + mapid + format);
map.clearOverlays();
map.setCenter(new GLatLng(30.6, 104.24), 5);
map.addOverlay(geoXml);

