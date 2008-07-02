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

var points = [
  new GLatLng(13.734508, 100.495892),
  new GLatLng(13.730922, 100.494776),
  new GLatLng(13.728463, 100.501814),
  new GLatLng(13.730089,100.508659)
];

map.setCenter(new GLatLng(13.732, 100.5), 16);
map.clearOverlays();
map.setMapType(G_NORMAL_MAP);
var polyline = new GPolyline(points);
map.addOverlay(polyline);
GEvent.addListener(polyline, "mouseover", function(location) {
  polyline.edit();
});
GEvent.addListener(polyline, "mouseout", function(location) {
  polyline.stopEdit();
});

