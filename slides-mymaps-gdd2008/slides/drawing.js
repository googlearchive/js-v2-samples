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
