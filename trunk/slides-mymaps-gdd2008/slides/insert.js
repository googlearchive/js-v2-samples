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

var numPoints = 6;
var delta = 4 * Math.PI / 5;
var delta2 = 4 * Math.PI / 14;

function borderPoint(centerPoint, scale, 
                     delta, index) {
  var x = Math.cos(index * delta);
  var y = Math.sin(index * delta);
  return new GLatLng(
               centerPoint.lat() + scale * x,
	       centerPoint.lng() + scale * y);
}

var polyNum = 0;
var center = new GLatLng(40.0, 116.47); 
map.setCenter(center , 11);

function draw(scale, centerPoint, index, star) {
    var point = borderPoint(centerPoint, scale, 
			    delta, index);
  if (!star) {
    star = new GPolyline([point], "#ffff00",4,1);
    map.addOverlay(star);
  }
  star.insertVertex(index, point);
  if (index >= numPoints && scale > .005) {
    scale -= .005;
    index = 1;
  }
  if (index++ < numPoints) 
    setTimeout(GEvent.callbackArgs(
      null, draw, scale, centerPoint, 
      index, star), 100);
  else if (polyNum < 4) 
    draw(.007, borderPoint(center, .05, delta2, 
                           polyNum++ + .5), 0);
} 

draw(.04, new GLatLng(40.01, 116.4), 0); 



